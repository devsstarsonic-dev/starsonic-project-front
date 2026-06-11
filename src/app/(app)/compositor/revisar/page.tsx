"use client";

import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { ReviewPanel } from "@/components/Compositor/ReviewPanel";
import { MOCK_LYRICS } from "@/lib/mocks/composition";
import { useState, useEffect } from "react";

export default function RevisarPage() {
  const router = useRouter();
  const { state, startComposition } = useComposition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleCompose = async () => {
    // Inicia a composição
    await startComposition();

    // Navega para loading da letra
    router.push("/compositor/loading-lyrics");

    // Simula delay de 2 seg
    await new Promise((r) => setTimeout(r, 2000));

    // Depois navega para loading da música
    router.push("/compositor/loading-music");

    // Simula delay de 3 seg (demo)
    await new Promise((r) => setTimeout(r, 3000));

    // Finalmente navega para resultado
    router.push("/compositor/resultado");
  };

  const handleEdit = () => {
    router.push("/compositor/step-3");
  };

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
        selectedAnswers={selectedAnswers}
        totalCost={75}
        saldo={300}
        onEdit={handleEdit}
        onCompose={handleCompose}
      />
    </div>
  );
}
