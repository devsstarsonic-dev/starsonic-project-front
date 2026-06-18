"use client";

import { useEffect, useCallback } from "react";
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

  const handleNext = useCallback(() => {
    nextStep();
    router.push("/compositor/step-3");
  }, [nextStep, router]);

  const handlePrev = useCallback(() => {
    prevStep();
    router.push("/compositor");
  }, [prevStep, router]);

  const handleVoiceStyleChange = useCallback((v: string | string[]) => {
    updateFormData({ voiceStyle: v as string });
  }, [updateFormData]);

  const handleVoiceToneChange = useCallback((v: string | string[]) => {
    updateFormData({ voiceTone: v as string[] });
  }, [updateFormData]);

  const handleMandatoryPhrasesChange = useCallback((v: string) => {
    updateFormData({ mandatoryPhrases: v });
  }, [updateFormData]);

  const handleReferencesChange = useCallback((v: string) => {
    updateFormData({ references: v });
  }, [updateFormData]);

  const handleNamesChange = useCallback((v: string) => {
    updateFormData({ names: v });
  }, [updateFormData]);

  // Prefetch step-3 page
  useEffect(() => {
    router.prefetch("/compositor/step-3");
  }, [router]);

  const formData = state.formData;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start", marginBottom: 24 }}>
        <div></div>
        <div style={{ paddingRight: 24 }}>
          <WizardStepper currentStep={2} totalSteps={3} />
        </div>
      </div>

      <div style={{ maxWidth: "100%", paddingLeft: 24, paddingRight: 24, paddingBottom: 16 }}>

        <FormSection
          icon="🎤"
          title="Etapa 2: Voz e Estilo Vocal"
          subtitle="Defina como quer que sua música soe"
        >
          {/* 1. Palavras ou frases obrigatórias */}
          <div style={{ marginBottom: 20 }}>
            <QuestionField
              label="Palavras ou frases obrigatórias"
              placeholder={`Exemplo:\n"Nunca desistir", "Deus está no controle", "Vencer é uma decisão".`}
              value={(formData.mandatoryPhrases as string) || ""}
              onChange={handleMandatoryPhrasesChange}
              rows={3}
              type="textarea"
              maxLength={500}
            />
          </div>

          {/* 2. Qual estilo de voz? */}
          <div style={{ marginBottom: 20 }}>
            <FormSection icon="🎤" title="Qual estilo de voz?" isChild>
              <PillSelector
                options={VOICE_STYLES}
                selected={(formData.voiceStyle as string) || ""}
                onChange={handleVoiceStyleChange}
                variant="flex"
              />
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10 }}>
                Escolha o tipo de voz desejado para sua música
              </div>
            </FormSection>
          </div>

          {/* 3. Artistas de referência */}
          <div style={{ marginBottom: 20 }}>
            <QuestionField
              label="Artistas de referência"
              placeholder={`Exemplo:\nAlgo parecido com Jorge & Mateus, Isadora Pompeo, Coldplay, Imagine Dragons.`}
              value={(formData.references as string) || ""}
              onChange={handleReferencesChange}
              rows={3}
              type="textarea"
              maxLength={500}
            />
          </div>

          {/* 4. Qual tom da voz? */}
          <div style={{ marginBottom: 20 }}>
            <FormSection icon="🎭" title="Qual tom da voz?" isChild>
              <PillSelector
                options={VOICE_TONES}
                selected={((formData.voiceTone as string[]) || [])}
                onChange={handleVoiceToneChange}
                multiSelect
                variant="flex"
              />
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10 }}>
                Selecione quantos tons você desejar que caracterizem a voz
              </div>
            </FormSection>
          </div>

          <QuestionField
            label="Palavras ou Frases Obrigatórias (Opcional)"
            placeholder="Ex: 'Que o mundo inteiro saiba'..."
            value={(formData.mandatoryPhrases as string) || ""}
            onChange={handleMandatoryPhrasesChange}
            rows={2}
            type="textarea"
            maxLength={500}
            helpText="Incluir expressões importantes em sua música"
          />

          <QuestionField
            label="Referências ou Inspirações (Opcional)"
            placeholder="Ex: Estilo de Giorgio Moroder, Tom Jobim..."
            value={(formData.references as string) || ""}
            onChange={handleReferencesChange}
            maxLength={500}
            helpText="Cite artistas ou estilos que inspiram sua visão"
          />

          <QuestionField
            label="Nomes Mencionados (Opcional)"
            placeholder="Ex: 'Maria', 'João', nomes da letra..."
            value={(formData.names as string) || ""}
            onChange={handleNamesChange}
            maxLength={500}
            helpText="Nomes para incluir na composição"
          />
        </FormSection>
      </div>

      {/* Nav sticky */}
      <div style={{
        position: "sticky",
        bottom: 0,
        padding: "12px 24px 16px 24px",
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        zIndex: 20,
      }}>
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
            padding: "12px 28px",
            background: "#00D6F7",
            border: "none",
            borderRadius: 10,
            color: "#0a0a2e",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s",
            boxShadow: "0 4px 20px rgba(0, 214, 247, 0.4)",
          }}
        >
          Próxima Etapa →
        </button>
      </div>
    </>
  );
}
