"use client";

import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { WizardStepper } from "@/components/Compositor/WizardStepper";
import { FormSection } from "@/components/Compositor/FormSection";
import { QuestionField } from "@/components/Compositor/QuestionField";
import { PillSelector } from "@/components/Compositor/PillSelector";
import { VOICE_STYLES, VOICE_TONES } from "@/lib/data/voice";

export default function Step2Page() {
  const router = useRouter();
  const { state, updateFormData, nextStep, prevStep } = useComposition();

  const handleNext = () => {
    nextStep();
    router.push("/compositor/step-3");
  };

  const handlePrev = () => {
    prevStep();
    router.push("/compositor");
  };

  const formData = state.formData;

  return (
    <>
      <WizardStepper currentStep={2} totalSteps={3} />

      <div style={{ maxWidth: "100%", paddingLeft: 24, paddingRight: 24 }}>
        {/* Step 2: Voz */}
        <FormSection
          icon="🎤"
          title="Etapa 2: Voz e Estilo Vocal"
          subtitle="Defina como quer que sua música soe"
        >
          <div style={{ marginBottom: 20 }}>
            <FormSection icon="🎵" title="Estilo Vocal">
              <PillSelector
                options={VOICE_STYLES}
                selected={(formData.voiceStyle as string) || ""}
                onChange={(v) => updateFormData({ voiceStyle: v })}
                variant="flex"
              />
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10 }}>
                Qual tipo de voz você quer que a música tenha?
              </div>
            </FormSection>
          </div>

          <div style={{ marginBottom: 20 }}>
            <FormSection icon="🎭" title="Tons de Voz">
              <PillSelector
                options={VOICE_TONES}
                selected={((formData.voiceTone as string[]) || [])}
                onChange={(v) => updateFormData({ voiceTone: v as string[] })}
                maxSelect={2}
                multiSelect
                variant="flex"
              />
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10 }}>
                Selecione até 2 tons que caracterizam melhor a voz
              </div>
            </FormSection>
          </div>

          <QuestionField
            label="Palavras ou Frases Obrigatórias (Opcional)"
            placeholder="Ex: 'Que o mundo inteiro saiba', 'Meu coração'..."
            value={(formData.mandatoryPhrases as string) || ""}
            onChange={(v) => updateFormData({ mandatoryPhrases: v })}
            rows={3}
            type="textarea"
            helpText="Incluir expressões importantes em sua música"
          />

          <QuestionField
            label="Referências ou Inspirações (Opcional)"
            placeholder="Ex: Estilo de Giorgio Moroder, Tom Jobim, Criolo..."
            value={(formData.references as string) || ""}
            onChange={(v) => updateFormData({ references: v })}
            helpText="Cite artistas ou estilos que inspiram sua visão"
          />

          <QuestionField
            label="Nomes Mencionados (Opcional)"
            placeholder="Ex: 'Maria', 'João', qualquer nome que apareça na letra..."
            value={(formData.names as string) || ""}
            onChange={(v) => updateFormData({ names: v })}
            helpText="Nomes para incluir na composição"
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
            onClick={handlePrev}
            style={{
              padding: "12px 24px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-soft)",
              borderRadius: 10,
              color: "var(--text-1)",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            ← Anterior
          </button>
          <button
            onClick={handleNext}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              border: "none",
              borderRadius: 10,
              color: "var(--bg-deep)",
              fontFamily: "var(--font-display)",
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
