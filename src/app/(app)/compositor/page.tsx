"use client";

import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { WizardStepper } from "@/components/Compositor/WizardStepper";
import { FormSection } from "@/components/Compositor/FormSection";
import { QuestionField } from "@/components/Compositor/QuestionField";
import { PillSelector } from "@/components/Compositor/PillSelector";
import { GenreSelector } from "@/components/Compositor/GenreSelector";
import { EMOTIONS } from "@/lib/data/emotions";

export default function CompositorPage() {
  const router = useRouter();
  const { state, updateFormData, nextStep } = useComposition();

  const handleNext = () => {
    // Validações básicas
    if (!state.formData.musicName || !state.formData.genre) {
      alert("Por favor preencha os campos obrigatórios");
      return;
    }

    nextStep();
    router.push("/compositor/step-2");
  };

  const formData = state.formData;

  return (
    <>
      <WizardStepper currentStep={1} totalSteps={3} />

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Step 1: Identidade */}
        <FormSection
          icon="🎵"
          title="Etapa 1: Identidade da Música"
          subtitle="Conte-nos sobre sua visão musical"
          required
        >
          <QuestionField
            label="Nome da Música"
            placeholder="Ex: Caminho da Fé, Noites de Verão..."
            value={(formData.musicName as string) || ""}
            onChange={(v) => updateFormData({ musicName: v })}
            required
            helpText="Como você quer chamar sua composição?"
          />

          <QuestionField
            label="História ou Contexto"
            placeholder="Descreva o contexto, situação ou história que inspirou esta música..."
            value={(formData.history as string) || ""}
            onChange={(v) => updateFormData({ history: v })}
            rows={4}
            type="textarea"
            required
            helpText="Ajuda nosso IA a entender melhor sua visão"
          />

          <div style={{ marginBottom: 20 }}>
            <FormSection icon="🎸" title="Gênero Musical" required>
              <GenreSelector
                selected={(formData.genre as string) || ""}
                onChange={(v) => updateFormData({ genre: v })}
              />
            </FormSection>
          </div>

          <div style={{ marginBottom: 20 }}>
            <FormSection icon="💭" title="Tema Geral" required>
              <QuestionField
                label="Qual é o tema principal?"
                placeholder="Ex: Superação, Amor, Esperança, Protesto Social..."
                value={(formData.theme as string) || ""}
                onChange={(v) => updateFormData({ theme: v })}
                required
              />
            </FormSection>
          </div>

          <div style={{ marginBottom: 20 }}>
            <FormSection icon="❤️" title="Emoções Predominantes">
              <PillSelector
                options={EMOTIONS}
                selected={((formData.emotions as string[]) || [])}
                onChange={(v) => updateFormData({ emotions: v as string[] })}
                maxSelect={3}
                multiSelect
              />
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10 }}>
                Selecione até 3 emoções que melhor descrevem sua música
              </div>
            </FormSection>
          </div>

          <QuestionField
            label="Público-Alvo (Opcional)"
            placeholder="Ex: Adultos de 25-40 anos, Crianças, Universitários..."
            value={(formData.audience as string) || ""}
            onChange={(v) => updateFormData({ audience: v })}
            required={false}
            helpText="Quem você quer que escute sua música?"
          />
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
            onClick={handleNext}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              border: "none",
              borderRadius: 10,
              color: "var(--bg-deep)",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: "0 4px 20px rgba(168, 85, 247, 0.3)",
            }}
          >
            Próxima Etapa →
          </button>
        </div>
      </div>
    </>
  );
}
