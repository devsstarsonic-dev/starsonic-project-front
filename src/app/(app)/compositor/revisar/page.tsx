"use client";

import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { ReviewPanel } from "@/components/Compositor/ReviewPanel";
import { MOCK_LYRICS } from "@/lib/mocks/composition";
import { useState, useEffect } from "react";

export default function RevisarPage() {
  const router = useRouter();
  const { state } = useComposition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleEdit = () => {
    router.push("/compositor/step-3");
  };

  // Estilo enviado para a Suno: gênero + estilo de voz + idioma escolhidos no wizard.
  const composeStyle = [
    state.formData.genre,
    state.formData.voiceStyle,
    state.formData.language,
  ]
    .filter(Boolean)
    .join(", ");

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

  return (
    <div className="page">
      <ReviewPanel
        title={(state.formData.musicName as string) || "Sua Música"}
        lyrics={MOCK_LYRICS}
        style={composeStyle}
        selectedAnswers={selectedAnswers}
        totalCost={75}
        saldo={300}
        onEdit={handleEdit}
      />
    </div>
  );
}
