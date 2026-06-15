"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { WizardStepper } from "@/components/Compositor/WizardStepper";
import { FormSection } from "@/components/Compositor/FormSection";
import { QuestionField } from "@/components/Compositor/QuestionField";
import { PillSelector } from "@/components/Compositor/PillSelector";
import { INSTRUMENTS } from "@/lib/data/instruments";
import { LANGUAGES } from "@/lib/data/languages";

export default function Step3Page() {
  const router = useRouter();
  const { state, updateFormData, nextStep, prevStep } = useComposition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = useCallback(() => {
    if (!state.formData.language) {
      setErrors({ language: "Selecione o idioma da letra." });
      document.getElementById("field-language")?.scrollIntoView({ block: "center" });
      return;
    }
    setErrors({});
    nextStep();
    router.push("/compositor/revisar");
  }, [state.formData.language, nextStep, router]);

  const handlePrev = useCallback(() => {
    prevStep();
    router.push("/compositor/step-2");
  }, [prevStep, router]);

  const handleInstrumentsChange = useCallback((v: string | string[]) => {
    updateFormData({ instruments: v as string[] });
  }, [updateFormData]);

  const handleLanguageChange = useCallback((code: string) => {
    updateFormData({ language: code });
    setErrors({});
  }, [updateFormData]);

  const handleRestrictionsChange = useCallback((v: string) => {
    updateFormData({ restrictions: v });
  }, [updateFormData]);

  // Prefetch revisar page
  useEffect(() => {
    router.prefetch("/compositor/revisar");
  }, [router]);

  const formData = state.formData;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start", marginBottom: 24 }}>
        <div></div>
        <div style={{ paddingRight: 24 }}>
          <WizardStepper currentStep={3} totalSteps={3} />
        </div>
      </div>

      <div style={{ maxWidth: "100%", paddingLeft: 24, paddingRight: 24, paddingBottom: 16 }}>

        <FormSection
          icon="🎸"
          title="Etapa 3: Conteúdo e Produção"
          subtitle="Defina instrumentos, estrutura e idioma"
        >
          <div style={{ marginBottom: 16 }}>
            <FormSection icon="🎹" title="Instrumentos Principais" isChild>
              <PillSelector
                options={INSTRUMENTS}
                selected={((formData.instruments as string[]) || [])}
                onChange={handleInstrumentsChange}
                maxSelect={4}
                multiSelect
                variant="flex"
                autoOption
              />
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10 }}>
                Selecione até 4 instrumentos. Star Sonic pode escolher o melhor para o gênero
              </div>
            </FormSection>
          </div>

          <div style={{ marginBottom: 16 }} id="field-language">
            <FormSection icon="🌍" title="Idioma da Letra" required isChild>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    style={{
                      padding: "10px 16px",
                      background: formData.language === lang.code
                        ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
                        : "var(--bg-card)",
                      color: formData.language === lang.code ? "var(--bg-deep)" : "var(--text-1)",
                      border: formData.language === lang.code ? "none" : "1px solid var(--border-soft)",
                      borderRadius: "100px",
                      fontFamily: "var(--font-editorial)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
              {errors.language && (
                <div style={{ color: "#f87171", fontSize: 12, marginTop: 8, fontFamily: "var(--font-editorial)" }}>
                  ⚠ {errors.language}
                </div>
              )}
            </FormSection>
          </div>

          <QuestionField
            label="Restrições ou Proibições (Opcional)"
            placeholder="Ex: 'Sem palavrões', 'Sem referências políticas'..."
            value={(formData.restrictions as string) || ""}
            onChange={handleRestrictionsChange}
            rows={2}
            type="textarea"
            maxLength={100}
            helpText="Há algo que a música não deve conter?"
          />

          <QuestionField
            label="Versão Base (Opcional)"
            placeholder="Descrever uma versão base para variações..."
            value={(formData.baseVersion as string) || ""}
            onChange={(v) => updateFormData({ baseVersion: v })}
            rows={2}
            type="textarea"
            maxLength={100}
            helpText="Serve de referência para variações"
          />

          <div style={{ marginBottom: 16 }}>
            <FormSection icon="🎯" title="Quantas versões diferentes?" isChild>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[1, 2, 3, 5].map((q) => (
                  <button
                    key={q}
                    onClick={() => updateFormData({ quantity: q })}
                    style={{
                      padding: "8px 20px",
                      background: formData.quantity === q
                        ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
                        : "var(--bg-card)",
                      color: formData.quantity === q ? "var(--bg-deep)" : "var(--text-1)",
                      border: formData.quantity === q ? "none" : "1px solid var(--border-soft)",
                      borderRadius: "100px",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {q} versão{q > 1 ? "es" : ""}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10 }}>
                Você receberá a versão principal + alternativas
              </div>
            </FormSection>
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
          Revisar Letra →
        </button>
      </div>
    </>
  );
}
