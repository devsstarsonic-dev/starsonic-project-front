"use client";

import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { WizardStepper } from "@/components/Compositor/WizardStepper";
import { FormSection } from "@/components/Compositor/FormSection";
import { QuestionField } from "@/components/Compositor/QuestionField";
import { PillSelector } from "@/components/Compositor/PillSelector";
import { useState, useEffect } from "react";

const VOCAL_GENDERS = ["Masculino", "Feminino", "Sem Vocal"];
const DURATIONS = ["1:00 - 2:00", "2:00 - 3:00", "3:00 - 4:00", "4:00 - 5:00"];

export default function ManualPage() {
  const router = useRouter();
  const { state, updateFormData, setMode } = useComposition();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (state.mode !== "manual") {
      setMode("manual");
    }
  }, []);

  if (!mounted) return null;

  const handleCompose = async () => {
    if (!state.formData.lyrics || !state.formData.stylePrompt) {
      alert("Por favor preencha letra e estilo");
      return;
    }

    setLoading(true);

    try {
      // Navega para loading da música direto
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

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <FormSection
          icon="✍️"
          title="Modo Manual"
          subtitle="Para compositores experientes. Controle total."
          required
        >
          <QuestionField
            label="Título da Música"
            placeholder="Ex: Minha Composição Especial..."
            value={(formData.title as string) || ""}
            onChange={(v) => updateFormData({ title: v })}
            required
            helpText="Como você quer chamar sua música?"
          />

          <QuestionField
            label="Estilo e Instruções (Prompt)"
            placeholder="Ex: Crie uma música estilo MPB com violão e percussão. Tom melancólico mas esperançoso..."
            value={(formData.stylePrompt as string) || ""}
            onChange={(v) => updateFormData({ stylePrompt: v })}
            rows={4}
            type="textarea"
            maxLength={1000}
            required
            helpText="Descreva em detalhes como quer que sua música soe"
          />

          <QuestionField
            label="Letra (Sua Composição)"
            placeholder={`[Verso 1]
Sua letra aqui...

[Refrão]
Seu refrão...`}
            value={(formData.lyrics as string) || ""}
            onChange={(v) => updateFormData({ lyrics: v })}
            rows={6}
            type="textarea"
            maxLength={2000}
            required
            helpText="Cole sua letra completa. Pode estar no formato de verso, refrão, bridge, etc"
          />

          <div style={{ marginBottom: 20 }}>
            <FormSection icon="🎤" title="Gênero Vocal">
              <PillSelector
                options={VOCAL_GENDERS}
                selected={(formData.vocalGender as string) || ""}
                onChange={(v) => updateFormData({ vocalGender: v })}
                variant="flex"
              />
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10 }}>
                Qual tipo de voz você quer para sua composição?
              </div>
            </FormSection>
          </div>

          <div style={{ marginBottom: 20 }}>
            <FormSection icon="⏱️" title="Duração Esperada">
              <PillSelector
                options={DURATIONS}
                selected={(formData.duration as string) || ""}
                onChange={(v) => updateFormData({ duration: v })}
                variant="flex"
              />
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10 }}>
                Quanto tempo deve durar sua música?
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
                ? "rgba(168, 85, 247, 0.4)"
                : "linear-gradient(135deg, #a855f7, #ec4899)",
              border: "none",
              borderRadius: 10,
              color: "var(--bg-deep)",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              boxShadow: "0 4px 20px rgba(168, 85, 247, 0.3)",
            }}
          >
            {loading ? "Compondo..." : "🎵 Gerar Música"}
          </button>
        </div>
      </div>
    </>
  );
}
