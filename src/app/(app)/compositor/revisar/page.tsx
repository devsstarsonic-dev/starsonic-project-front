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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Gera a letra automaticamente a partir das respostas das 3 etapas
  // assim que houver respostas disponíveis. Roda uma única vez.
  useEffect(() => {
    if (!mounted || startedRef.current) return;
    if (!hasAnswers(state.formData)) return;
    startedRef.current = true;
    generate(buildLyricsPrompt(state.formData));
  }, [mounted, state.formData, generate]);

  const handleRegenerate = useCallback(() => {
    generate(buildLyricsPrompt(state.formData));
  }, [generate, state.formData]);

  if (!mounted) return null;

  const handleEdit = () => {
    router.push("/compositor/step-3");
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

  const selectedAnswers: Record<string, string> = {
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
  const answered = hasAnswers(state.formData);
  const lyricsForPanel = answered ? lyrics : MOCK_LYRICS;

  return (
    <div className="page">
      <ReviewPanel
        title={(state.formData.musicName as string) || "Sua Música"}
        lyrics={lyricsForPanel}
        lyricsLoading={answered && loading}
        lyricsError={answered ? error : null}
        onRegenerateLyrics={answered ? handleRegenerate : undefined}
        style={composeStyle}
        negativeTags={negativeTags}
        selectedAnswers={selectedAnswers}
        answers={state.formData as Record<string, unknown>}
        onGenerated={markGenerated}
        totalCost={75}
        saldo={300}
        onEdit={handleEdit}
        onNewSong={handleNewSong}
      />
    </div>
  );
}
