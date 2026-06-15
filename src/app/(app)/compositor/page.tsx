"use client";

import { useState, useCallback, useEffect } from "react";
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!state.formData.musicName) errs.musicName = "O nome da música é obrigatório.";
    if (!state.formData.genre) errs.genre = "Selecione um gênero musical.";
    return errs;
  }, [state.formData]);

  const handleNext = useCallback(() => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ block: "center" });
      return;
    }
    setErrors({});
    nextStep();
    router.push("/compositor/step-2");
  }, [validate, nextStep, router]);

  const handleMusicNameChange = useCallback((v: string) => {
    updateFormData({ musicName: v });
    setErrors((e) => ({ ...e, musicName: "" }));
  }, [updateFormData]);

  const handleHistoryChange = useCallback((v: string) => {
    updateFormData({ history: v });
  }, [updateFormData]);

  const handleGenreChange = useCallback((v: string) => {
    updateFormData({ genre: v });
    setErrors((e) => ({ ...e, genre: "" }));
  }, [updateFormData]);

  const handleThemeChange = useCallback((v: string) => {
    updateFormData({ theme: v });
  }, [updateFormData]);

  const handleEmotionsChange = useCallback((v: string | string[]) => {
    updateFormData({ emotions: v as string[] });
  }, [updateFormData]);

  const handleAudienceChange = useCallback((v: string) => {
    updateFormData({ audience: v });
  }, [updateFormData]);

  const handleBackClick = useCallback(() => {
    router.push("/criar-musica");
  }, [router]);

  // Prefetch step-2 page
  useEffect(() => {
    router.prefetch("/compositor/step-2");
  }, [router]);

  const formData = state.formData;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start", marginBottom: 24 }}>
        <div></div>
        <div style={{ paddingRight: 24 }}>
          <WizardStepper currentStep={1} totalSteps={3} />
        </div>
      </div>

      <div style={{ maxWidth: "100%", paddingLeft: 24, paddingRight: 24, paddingBottom: 16 }}>

        <FormSection
          icon="🎵"
          title="Etapa 1: Identidade da Música"
          subtitle="Conte-nos sobre sua visão musical"
          required
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div id="field-musicName">
              <QuestionField
                label="Nome da Música"
                placeholder="Ex: Caminho da Fé, Noites de Verão..."
                value={(formData.musicName as string) || ""}
                onChange={handleMusicNameChange}
                required
                maxLength={100}
                helpText="Como você quer chamar sua composição?"
              />
              {errors.musicName && (
                <div style={{ color: "#f87171", fontSize: 12, marginTop: 4, marginBottom: 12, fontFamily: "var(--font-editorial)" }}>
                  ⚠ {errors.musicName}
                </div>
              )}
            </div>

            <QuestionField
              label="História ou Contexto"
              placeholder="Descreva o contexto, situação ou história..."
              value={(formData.history as string) || ""}
              onChange={handleHistoryChange}
              rows={2}
              type="textarea"
              required
              maxLength={100}
              helpText="Ajuda nosso IA a entender melhor sua visão"
            />
          </div>

          <div style={{ marginBottom: 20 }} id="field-genre">
            <FormSection icon="🎸" title="Gênero Musical" required isChild>
              <GenreSelector
                selected={(formData.genre as string) || ""}
                onChange={handleGenreChange}
              />
              {errors.genre && (
                <div style={{ color: "#f87171", fontSize: 12, marginTop: 8, fontFamily: "var(--font-editorial)" }}>
                  ⚠ {errors.genre}
                </div>
              )}
            </FormSection>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <FormSection icon="💭" title="Tema Geral" required isChild>
                <QuestionField
                  label="Qual é o tema principal?"
                  placeholder="Ex: Superação, Amor, Esperança..."
                  value={(formData.theme as string) || ""}
                  onChange={handleThemeChange}
                  required
                  maxLength={100}
                />
              </FormSection>
            </div>

            <div>
              <FormSection icon="❤️" title="Emoções Predominantes" isChild>
                <PillSelector
                  options={EMOTIONS}
                  selected={((formData.emotions as string[]) || [])}
                  onChange={handleEmotionsChange}
                  maxSelect={3}
                  multiSelect
                />
                <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10 }}>
                  Selecione até 3 emoções que melhor descrevem sua música
                </div>
              </FormSection>
            </div>

            <div>
              <FormSection icon="👥" title="Público-Alvo" required isChild>
                <QuestionField
                  label="Quem você quer que escute sua música?"
                  placeholder="Ex: Adultos de 25-40 anos, Crianças..."
                  value={(formData.audience as string) || ""}
                  onChange={handleAudienceChange}
                  required={false}
                  maxLength={100}
                />
              </FormSection>
            </div>
          </div>
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
          onClick={handleBackClick}
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
          ← Voltar
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
