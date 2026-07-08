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

// Códigos de idioma (Etapa 3) → rótulo legível em "Suas escolhas".
const LANG_LABELS: Record<string, string> = {
  "pt-BR": "Português (Brasil)",
  "en-US": "Inglês",
  "es-ES": "Espanhol",
};

export default function RevisarPage() {
  const router = useRouter();
  const { state, markGenerated, reset } = useComposition();
  const [mounted, setMounted] = useState(false);
  const { lyrics, loading, error, generate } = useLyricsGeneration();
  const startedRef = useRef(false);
  // Título gerado pelo GPT quando o usuário deixa o STARSONIC escolher o nome.
  const [genTitle, setGenTitle] = useState<string | null>(null);
  const titleRef = useRef(false);

  const instrumental = state.simpleMode === "instrumental";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Quando a opção é "STARSONIC escolhe o nome", gera o título (GPT) assim que
  // a letra estiver pronta — baseado na letra. Roda uma única vez.
  useEffect(() => {
    if (titleRef.current) return;
    if (instrumental) return; // sem letra: título vem do nome/gênero informado, não da IA
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

  // Gera a letra automaticamente a partir das respostas das 3 etapas
  // assim que houver respostas disponíveis. Roda uma única vez.
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

  const handleEdit = () => {
    if (state.simpleMode === "instrumental") router.push("/instrumental");
    else if (state.simpleMode === "jingle") router.push("/jingle");
    else router.push("/compositor/step-3");
  };

  // "Criar nova música": limpa toda a composição e volta ao início do formulário.
  const handleNewSong = () => {
    reset();
    router.push("/compositor");
  };

  // Estilo enviado para a Suno: todas as especificações musicais do wizard
  // (gênero, emoções, estilo/tons de voz, instrumentos, referências, idioma).
  const composeStyle = buildMusicStyle(state.formData);
  // Restrições → estilos/conteúdos a evitar na geração.
  const negativeTags = buildNegativeTags(state.formData);

  // Todas as respostas das 3 etapas, na ordem do wizard, com rótulos legíveis.
  const fd = state.formData;
  const txt = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const list = (v: unknown) => (Array.isArray(v) && v.length ? v.join(", ") : "");
  const langCode = txt(fd.language);

  // Instrumental/Jingle: "Suas escolhas" vem pronto da config do form de origem
  // (só as perguntas que o modo realmente fez). Studio: monta as 16 perguntas do wizard.
  const selectedAnswers: Record<string, string> = state.displayAnswers
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

  // Sem respostas (ex.: acesso direto à URL) → cai na letra de exemplo editável.
  // Instrumental não tem letra — nunca usa o mock.
  const answered = hasAnswers(state.formData);
  const lyricsForPanel = instrumental ? "" : answered ? lyrics : MOCK_LYRICS;

  return (
    <div className="page">
      <ReviewPanel
        title={txt(state.formData.musicName) || genTitle || txt(state.formData.theme) || "Sua Música"}
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
      />
    </div>
  );
}
