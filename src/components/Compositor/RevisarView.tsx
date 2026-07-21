"use client";

import { useRouter, usePathname } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { useGeneration } from "@/lib/generation/GenerationContext";
import { ReviewPanel } from "@/components/Compositor/ReviewPanel";
import { MOCK_LYRICS } from "@/lib/mocks/composition";
import {
  buildMusicStyle,
  buildNegativeTags,
  hasAnswers,
  truncateLyrics,
  MAX_JINGLE_LYRICS_LENGTH,
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

// Tela de revisão compartilhada pelos três modos. A ROTA decide o modo
// (studio/instrumental/jingle) — fonte autoritativa, não o sessionStorage.
// Os três usam o mesmo ReviewPanel (letra + geração + 2 versões salvas
// como v1/v2) — Jingle só troca a cópia (config) e o kind salvo. Não corta
// áudio: a Suno já entrega curto por conta da letra curta + dica de estilo.
export function RevisarView({ mode }: { mode: ReviewMode }) {
  const router = useRouter();
  const config = REVIEW_CONFIGS[mode];
  const instrumental = mode === "instrumental";
  const jingle = mode === "jingle";

  const { state, markGenerated, reset, updateFormData } = useComposition();
  const pathname = usePathname();
  const gen = useGeneration();
  // Já há uma geração (ativa ou concluída) desta tela? Então não refaz letra/título
  // — evita chamada extra ao GPT e sobrescrever ao voltar para ver o resultado.
  const hasJob = !!gen?.job && gen.job.returnHref === pathname;
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
  // Instrumental não tem letra; jingle usa o nome da marca — nenhum gera título.
  useEffect(() => {
    if (titleRef.current || instrumental || jingle || hasJob) return;
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
  }, [lyrics, loading, state.formData, instrumental, jingle, hasJob]);

  // Gera a letra automaticamente a partir das respostas, uma vez.
  // Instrumental não tem letra — pula a geração. Jingle pede letra curta
  // (o prompt já reforça isso; o corte final acontece em lyricsForPanel).
  useEffect(() => {
    if (!mounted || startedRef.current || instrumental || hasJob) return;
    if (!hasAnswers(state.formData)) return;
    startedRef.current = true;
    generate({ formData: state.formData, jingle });
  }, [mounted, state.formData, generate, instrumental, jingle, hasJob]);

  const handleRegenerate = useCallback(() => {
    generate({ formData: state.formData, jingle });
  }, [generate, state.formData, jingle]);

  // "Gerar com outros estilos": grava o novo gênero no formData, então
  // "Suas escolhas" e o style da próxima geração já saem com ele.
  const handleGenreChange = useCallback(
    (g: string) => updateFormData({ genre: g }),
    [updateFormData],
  );

  if (!mounted || !state.hydrated) return null;

  // "editar respostas" / "criar nova música" voltam ao formulário do modo.
  const handleEdit = () => router.push(config.editHref);
  const handleNewSong = () => {
    reset();
    router.push(config.newSongHref);
  };

  // Estilo enviado à Suno: especificações do wizard + reforço do modo (a Suno
  // também lê essas dicas no style, além da flag instrumental na API).
  const composeStyle =
    buildMusicStyle(state.formData) +
    (instrumental ? ", instrumental, no vocals" : "") +
    (jingle ? ", commercial jingle, catchy, radio/tv ad, very short and punchy, under 30 seconds" : "");
  const negativeTags = buildNegativeTags(state.formData);

  const fd = state.formData;
  const txt = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const list = (v: unknown) => (Array.isArray(v) && v.length ? v.join(", ") : "");
  const langCode = txt(fd.language);

  // "Suas escolhas" — montado a partir do formData do próprio modo (a ROTA já
  // garante o modo certo, então não depende de displayAnswers/sessionStorage).
  const studioAnswers: Record<string, string> = {
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
    "Voz importada": fd.voiceRef?.name || "—",
    "Idioma": LANG_LABELS[langCode] || langCode || "—",
    "Restrições": txt(fd.restrictions) || "—",
    "Versões": fd.quantity ? `${fd.quantity} música(s)` : "—",
  };

  // Instrumental: as 6 perguntas reais do formulário (inclui Andamento/BPM).
  const instrumentalAnswers: Record<string, string> = {
    "Nome da trilha": txt(fd.musicName) || "—",
    "Gênero musical": txt(fd.genre) || "—",
    "Clima / emoção": list(fd.emotions) || "—",
    "Instrumentos principais": list(fd.instruments) || "—",
    "Andamento": typeof fd.bpm === "number" ? `${Math.round(fd.bpm)} BPM` : "—",
    "Onde vai usar": txt(fd.audience) || "—",
  };

  // Jingle: as 8 perguntas reais do formulário.
  const jingleAnswers: Record<string, string> = {
    "Nome da marca": txt(fd.musicName) || "—",
    "O que vende": txt(fd.theme) || "—",
    "Slogan": txt(fd.mandatoryPhrases) || "—",
    "Público-alvo": txt(fd.audience) || "—",
    "Estilo musical": txt(fd.genre) || "—",
    "Vibe": list(fd.emotions) || "—",
    "Duração desejada": txt(fd.duration) || "—",
    "Estilo de voz": txt(fd.voiceStyle) || "—",
  };

  // Sem respostas (ex.: acesso direto à URL) → letra de exemplo editável.
  // Instrumental não tem letra — nunca usa o mock. Jingle: corta em 500
  // caracteres (letra curta = áudio curto, já que não cortamos o áudio).
  const answered = hasAnswers(state.formData);
  const rawLyrics = answered ? lyrics : MOCK_LYRICS;
  const lyricsForPanel = instrumental ? "" : jingle ? truncateLyrics(rawLyrics) : rawLyrics;

  // Título por modo.
  const instrumentalTitle = txt(fd.genre) ? `${txt(fd.genre)} Instrumental` : "Instrumental";
  const title = instrumental
    ? txt(fd.musicName) || instrumentalTitle
    : jingle
      ? (txt(fd.musicName) ? `${txt(fd.musicName)} · Jingle` : "Jingle Comercial")
      : txt(fd.musicName) || genTitle || txt(fd.theme) || config.ui.musicLabel;

  return (
    <div className="page">
      <ReviewPanel
        title={title}
        lyrics={lyricsForPanel}
        lyricsLoading={!instrumental && answered && loading}
        lyricsError={!instrumental && answered ? error : null}
        onRegenerateLyrics={!instrumental && answered ? handleRegenerate : undefined}
        instrumental={instrumental}
        kind={jingle ? "jingle" : instrumental ? "instrumental" : "music"}
        maxLyricsLength={jingle ? MAX_JINGLE_LYRICS_LENGTH : undefined}
        style={composeStyle}
        negativeTags={negativeTags}
        selectedAnswers={jingle ? jingleAnswers : instrumental ? instrumentalAnswers : studioAnswers}
        answers={state.formData as Record<string, unknown>}
        autoTitle={!instrumental && !jingle && !txt(fd.musicName) && !genTitle}
        quantity={typeof state.formData.quantity === "number" ? state.formData.quantity : 2}
        onGenerated={markGenerated}
        onGenreChange={handleGenreChange}
        totalCost={75}
        saldo={300}
        onEdit={handleEdit}
        onNewSong={handleNewSong}
        ui={config.ui}
      />
    </div>
  );
}
