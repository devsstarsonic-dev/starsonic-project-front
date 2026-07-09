"use client";

import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { ReviewPanel } from "@/components/Compositor/ReviewPanel";
import { MOCK_LYRICS } from "@/lib/mocks/composition";
import {
  buildLyricsPrompt,
  buildMusicStyle,
  buildNegativeTags,
  hasAnswers,
} from "@/lib/compositor/lyricsPrompt";
import { useLyricsGeneration } from "@/lib/hooks/useLyricsGeneration";
import { useState, useEffect, useRef, useCallback } from "react";
import { REVIEW_CONFIGS, type ReviewMode } from "@/lib/data/reviewConfigs";

// Códigos de idioma (Etapa 3) → rótulo legível em "Suas escolhas" (só Studio).
const LANG_LABELS: Record<string, string> = {
  "pt-BR": "Português (Brasil)",
  "en-US": "Inglês",
  "es-ES": "Espanhol",
};

// Tela de revisão compartilhada pelos três modos. A rota decide o modo
// (studio/instrumental/jingle); daí saem a cópia, o roteamento de "editar" e
// se há letra. Os dados (respostas) vêm da composição semeada no sessionStorage.
export function RevisarView({ mode }: { mode: ReviewMode }) {
  const router = useRouter();
  const config = REVIEW_CONFIGS[mode];
  const instrumental = config.instrumental;

  const { state, markGenerated, reset } = useComposition();
  const [mounted, setMounted] = useState(false);
  const { lyrics, loading, error, generate } = useLyricsGeneration();
  const startedRef = useRef(false);
  // Título gerado pelo GPT quando o usuário deixa o STARSONIC escolher o nome.
  const [genTitle, setGenTitle] = useState<string | null>(null);
  const titleRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // "STARSONIC escolhe o nome": gera o título (GPT) a partir da letra, uma vez.
  useEffect(() => {
    if (titleRef.current) return;
    if (instrumental) return; // sem letra: título vem do nome/gênero informado
    const musicName = typeof state.formData.musicName === "string" ? state.formData.musicName.trim() : "";
    if (musicName) return; // o usuário definiu o nome
    if (!hasAnswers(state.formData)) return;
    const lyr = (lyrics || "").trim();
    if (!lyr || loading) return;
    titleRef.current = true;
    (async () => {
      try {
        const genre = typeof state.formData.genre === "string" ? state.formData.genre : "";
        const r = await fetch("/api/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lyrics: lyr, genre }),
        });
        const d = await r.json();
        if (r.ok && d.title) setGenTitle(d.title as string);
        else titleRef.current = false; // permite nova tentativa
      } catch {
        titleRef.current = false;
      }
    })();
  }, [lyrics, loading, state.formData, instrumental]);

  // Gera a letra automaticamente a partir das respostas, uma vez.
  // Instrumental não tem letra — pula a geração.
  useEffect(() => {
    if (!mounted || startedRef.current || instrumental) return;
    if (!hasAnswers(state.formData)) return;
    startedRef.current = true;
    generate(buildLyricsPrompt(state.formData));
  }, [mounted, state.formData, generate, instrumental]);

  const handleRegenerate = useCallback(() => {
    generate(buildLyricsPrompt(state.formData));
  }, [generate, state.formData]);

  if (!mounted) return null;

  // "editar respostas" / "criar nova música" voltam ao formulário do modo.
  const handleEdit = () => router.push(config.editHref);
  const handleNewSong = () => {
    reset();
    router.push(config.newSongHref);
  };

  // Estilo e restrições enviados à Suno (montados das respostas do wizard).
  const composeStyle = buildMusicStyle(state.formData);
  const negativeTags = buildNegativeTags(state.formData);

  const fd = state.formData;
  const txt = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const list = (v: unknown) => (Array.isArray(v) && v.length ? v.join(", ") : "");
  const langCode = txt(fd.language);

  // Instrumental/Jingle: "Suas escolhas" vem pronto da config do form de origem
  // (só as perguntas que o modo fez). Studio SEMPRE monta as perguntas do wizard
  // — nunca reusa displayAnswers (que pode ter sobrado de um fluxo simple anterior).
  const selectedAnswers: Record<string, string> = mode !== "studio" && state.displayAnswers
    ? Object.fromEntries(state.displayAnswers.map((a) => [a.label, a.value]))
    : {
        "Nome da Música": txt(fd.musicName) || "—",
        "Gênero": txt(fd.genre) || "—",
        "Tema": txt(fd.theme) || "—",
        "História": txt(fd.history) || "—",
        "Público": txt(fd.audience) || "—",
        "Emoções": list(fd.emotions) || "—",
        "Palavras obrigatórias": txt(fd.mandatoryPhrases) || "—",
        "Estilo de Voz": txt(fd.voiceStyle) || "—",
        "Tom da Voz": list(fd.voiceTone) || "—",
        "Referências": txt(fd.references) || "—",
        "Citar nomes": txt(fd.names) || "—",
        "Estrutura": txt(fd.songStructure) || "—",
        "Instrumentos": list(fd.instruments) || "—",
        "Idioma": LANG_LABELS[langCode] || langCode || "—",
        "Restrições": txt(fd.restrictions) || "—",
        "Versões": fd.quantity ? `${fd.quantity} música(s)` : "—",
      };

  // Sem respostas (ex.: acesso direto à URL) → letra de exemplo editável.
  // Instrumental não tem letra — nunca usa o mock.
  const answered = hasAnswers(state.formData);
  const lyricsForPanel = instrumental ? "" : answered ? lyrics : MOCK_LYRICS;

  return (
    <div className="page">
      <ReviewPanel
        title={txt(state.formData.musicName) || genTitle || txt(state.formData.theme) || config.ui.musicLabel}
        lyrics={lyricsForPanel}
        lyricsLoading={!instrumental && answered && loading}
        lyricsError={!instrumental && answered ? error : null}
        onRegenerateLyrics={!instrumental && answered ? handleRegenerate : undefined}
        instrumental={instrumental}
        style={composeStyle}
        negativeTags={negativeTags}
        selectedAnswers={selectedAnswers}
        answers={state.formData as Record<string, unknown>}
        autoTitle={!txt(state.formData.musicName) && !genTitle}
        quantity={typeof state.formData.quantity === "number" ? state.formData.quantity : 2}
        onGenerated={markGenerated}
        totalCost={75}
        saldo={300}
        onEdit={handleEdit}
        onNewSong={handleNewSong}
        ui={config.ui}
      />
    </div>
  );
}
