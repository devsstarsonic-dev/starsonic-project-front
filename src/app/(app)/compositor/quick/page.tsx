"use client";

import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { WizardStepper } from "@/components/Compositor/WizardStepper";
import { FormSection } from "@/components/Compositor/FormSection";
import { QuestionField } from "@/components/Compositor/QuestionField";
import { PillSelector } from "@/components/Compositor/PillSelector";
import { GenreSelector } from "@/components/Compositor/GenreSelector";
import { EMOTIONS } from "@/lib/data/emotions";
import { useState, useEffect } from "react";

export default function QuickPage() {
  const router = useRouter();
  const { state, updateFormData, setMode, startComposition } = useComposition();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (state.mode !== "quick") {
      setMode("quick");
    }
  }, []);

  if (!mounted) return null;

  const handleCompose = async () => {
    if (!state.formData.genre) {
      alert("Por favor selecione um gênero");
      return;
    }

    setLoading(true);

    try {
      // Navega para loading da letra
      router.push("/compositor/loading-lyrics");

      // Simula delay de 2 seg
      await new Promise((r) => setTimeout(r, 2000));

      // Depois navega para loading da música
      router.push("/compositor/loading-music");

      // Simula delay de 3 seg (demo)
      await new Promise((r) => setTimeout(r, 3000));

      // Finaliza com resultado
      router.push("/compositor/resultado");
    } finally {
      setLoading(false);
    }
  };

  const formData = state.formData;

  return (
    <>
      <WizardStepper currentStep={1} totalSteps={2} />

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <FormSection
          icon="⚡"
          title="Modo Rápido - 3 Perguntas"
          subtitle="Crie sua música em 30 segundos"
          required
        >
          <div style={{ marginBottom: 20 }}>
            <FormSection icon="💭" title="Tema">
              <QuestionField
                label="Qual é o tema principal?"
                placeholder="Ex: Superação, Amor, Esperança..."
                value={(formData.theme as string) || ""}
                onChange={(v) => updateFormData({ theme: v })}
                required
                helpText="Sobre o que fala sua música?"
              />
            </FormSection>
          </div>

          <div style={{ marginBottom: 20 }}>
            <FormSection icon="🎸" title="Gênero Musical" required>
              <GenreSelector
                selected={(formData.genre as string) || ""}
                onChange={(v) => updateFormData({ genre: v })}
              />
            </FormSection>
          </div>

          <div style={{ marginBottom: 20 }}>
            <FormSection icon="❤️" title="Emoção Predominante">
              <PillSelector
                options={EMOTIONS}
                selected={((formData.emotions as string[]) || [])}
                onChange={(v) => updateFormData({ emotions: v as string[] })}
                maxSelect={1}
                multiSelect
                variant="flex"
              />
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10 }}>
                Qual emoção mais descreve sua música?
              </div>
            </FormSection>
          </div>
        </FormSection>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 40,
            gap: 16,
          }}
        >
          <button
            onClick={() => router.push("/criar-musica")}
            style={{
              padding: "12px 24px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-soft)",
              borderRadius: 10,
              color: "var(--text-1)",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            ← Voltar
          </button>
          <button
            onClick={handleCompose}
            disabled={loading}
            style={{
              padding: "12px 24px",
              background: loading
                ? "rgba(0, 212, 255, 0.4)"
                : "linear-gradient(135deg, #00d4ff, #3b9eff)",
              border: "none",
              borderRadius: 10,
              color: "var(--bg-deep)",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              boxShadow: "0 4px 20px rgba(0, 212, 255, 0.3)",
            }}
          >
            {loading ? "Compondo..." : "🎵 Compor Música"}
          </button>
        </div>
      </div>
    </>
  );
}
