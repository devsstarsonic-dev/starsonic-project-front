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

export default function RevisarPage() {
  const router = useRouter();
  const { state, markGenerated } = useComposition();
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

  // Estilo enviado para a Suno: todas as especificações musicais do wizard
  // (gênero, emoções, estilo/tons de voz, instrumentos, referências, idioma).
  const composeStyle = buildMusicStyle(state.formData);
  // Restrições → estilos/conteúdos a evitar na geração.
  const negativeTags = buildNegativeTags(state.formData);

  const selectedAnswers = {
    "Nome da Música": state.formData.musicName || "—",
    "Gênero": state.formData.genre || "—",
    "Tema": state.formData.theme || "—",
    "Emoções": Array.isArray(state.formData.emotions)
      ? state.formData.emotions.join(", ")
      : "—",
    "Estilo de Voz": state.formData.voiceStyle || "—",
    "Idioma": state.formData.language || "—",
    "Instrumentos": Array.isArray(state.formData.instruments)
      ? state.formData.instruments.join(", ")
      : "—",
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
      />
    </div>
  );
}
