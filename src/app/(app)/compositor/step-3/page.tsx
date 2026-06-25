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
import { SONG_STRUCTURES } from "@/lib/data/structures";
import { VERSION_TRANSLATIONS } from "@/lib/data/translations";

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

  const handleSongStructureChange = useCallback((value: string) => {
    updateFormData({ songStructure: value });
  }, [updateFormData]);

  const handleDurationChange = useCallback((value: string) => {
    updateFormData({ duration: value });
  }, [updateFormData]);

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

  const handleVersionTranslationChange = useCallback((v: string) => {
    updateFormData({ versionTranslation: v });
  }, [updateFormData]);

  // Prefetch revisar page
  useEffect(() => {
    router.prefetch("/compositor/revisar");
  }, [router]);

  const formData = state.formData;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <WizardStepper currentStep={3} totalSteps={3} />
      </div>

      <div style={{ maxWidth: "100%", paddingBottom: 12 }}>

        <FormSection
          icon="🎸"
          title="Etapa 3: Conteúdo e Produção"
          subtitle="Defina instrumentos, estrutura e idioma"
        >
          {/* 1. Estrutura desejada */}
          <div style={{ marginBottom: 16 }}>
            <FormSection icon="⏱️" title="Estrutura desejada" isChild>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SONG_STRUCTURES.map((struct) => (
                  <button
                    key={struct.value}
                    onClick={() => handleSongStructureChange(struct.value)}
                    style={{
                      padding: "10px 16px",
                      background: formData.songStructure === struct.value
                        ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
                        : "var(--bg-card)",
                      color: formData.songStructure === struct.value ? "var(--bg-deep)" : "var(--text-1)",
                      border: formData.songStructure === struct.value ? "none" : "1px solid var(--border-soft)",
                      borderRadius: "100px",
                      fontFamily: "var(--font-editorial)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {struct.label}
                  </button>
                ))}
              </div>
            </FormSection>
          </div>

          {/* Duração desejada */}
          <div style={{ marginBottom: 16 }}>
            <FormSection icon="⏳" title="Duração desejada" isChild>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { value: "1min", label: "Curta · ~1 min" },
                  { value: "2min", label: "Média · ~2 min" },
                  { value: "3min", label: "Longa · ~3 min" },
                  { value: "4min", label: "Estendida · ~4 min" },
                ].map((d) => (
                  <button
                    key={d.value}
                    onClick={() => handleDurationChange(d.value)}
                    style={{
                      padding: "10px 16px",
                      background: formData.duration === d.value
                        ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
                        : "var(--bg-card)",
                      color: formData.duration === d.value ? "var(--bg-deep)" : "var(--text-1)",
                      border: formData.duration === d.value ? "none" : "1px solid var(--border-soft)",
                      borderRadius: "100px",
                      fontFamily: "var(--font-editorial)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10 }}>
                Referência aproximada — a IA usa como guia para o tamanho da música.
              </div>
            </FormSection>
          </div>

          {/* 2. Instrumentos Desejados */}
          <div style={{ marginBottom: 16 }}>
            <FormSection icon="🎹" title="Instrumentos Desejados" isChild>
              <PillSelector
                options={INSTRUMENTS}
                selected={((formData.instruments as string[]) || [])}
                onChange={handleInstrumentsChange}
                multiSelect
                maxSelect={4}
                variant="flex"
              />
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10 }}>
                Escolha até 4 instrumentos que deseja na sua música
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

          {/* 4. O que não pode aparecer na música? */}
          <div style={{ marginBottom: 16 }}>
            <QuestionField
              label="O que não pode aparecer na música?"
              placeholder={`Exemplo:\nNão usar girias.\nNão mencionar bebida alcólica.\nNão usar linguagem agressiva.`}
              value={(formData.restrictions as string) || ""}
              onChange={handleRestrictionsChange}
              rows={3}
              type="textarea"
              maxLength={500}
            />
          </div>

          {/* 5. Criar a música em cima da versão Tal */}
          <div style={{ marginBottom: 16 }}>
            <FormSection icon="🔄" title="Criar a música em cima da versão Tal" isChild>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {VERSION_TRANSLATIONS.map((trans) => (
                  <button
                    key={trans}
                    onClick={() => handleVersionTranslationChange(trans)}
                    style={{
                      padding: "10px 16px",
                      background: formData.versionTranslation === trans
                        ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
                        : "var(--bg-card)",
                      color: formData.versionTranslation === trans ? "var(--bg-deep)" : "var(--text-1)",
                      border: formData.versionTranslation === trans ? "none" : "1px solid var(--border-soft)",
                      borderRadius: "100px",
                      fontFamily: "var(--font-editorial)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {trans}
                  </button>
                ))}
              </div>
              {formData.versionTranslation === "Outro" && (
                <div style={{ marginTop: 12 }}>
                  <QuestionField
                    label="Descreva o tipo de tradução"
                    placeholder="Especifique como deseja a tradução..."
                    value={(formData.translationDescription as string) || ""}
                    onChange={(v) => updateFormData({ translationDescription: v })}
                    rows={2}
                    type="textarea"
                    maxLength={200}
                  />
                </div>
              )}
            </FormSection>
          </div>

          {/* 6. Quantas versões deseja gerar */}
          <div style={{ marginBottom: 16 }}>
            <FormSection icon="🎯" title="Quantas versões deseja gerar?" isChild>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => updateFormData({ quantity: 2 })}
                  style={{
                    padding: "8px 20px",
                    background: formData.quantity === 2
                      ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
                      : "var(--bg-card)",
                    color: formData.quantity === 2 ? "var(--bg-deep)" : "var(--text-1)",
                    border: formData.quantity === 2 ? "none" : "1px solid var(--border-soft)",
                    borderRadius: "100px",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  2 versões
                </button>
                <button
                  onClick={() => updateFormData({ quantity: 3 })}
                  style={{
                    padding: "8px 20px",
                    background: formData.quantity === 3
                      ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
                      : "var(--bg-card)",
                    color: formData.quantity === 3 ? "var(--bg-deep)" : "var(--text-1)",
                    border: formData.quantity === 3 ? "none" : "1px solid var(--border-soft)",
                    borderRadius: "100px",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  3 versões
                </button>
                <button
                  onClick={() => updateFormData({ quantity: 4 })}
                  style={{
                    padding: "8px 20px",
                    background: formData.quantity === 4
                      ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
                      : "var(--bg-card)",
                    color: formData.quantity === 4 ? "var(--bg-deep)" : "var(--text-1)",
                    border: formData.quantity === 4 ? "none" : "1px solid var(--border-soft)",
                    borderRadius: "100px",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  4 versões
                </button>
              </div>
            </FormSection>
          </div>
        </FormSection>
      </div>

      {/* Nav sticky */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 16 }}>
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
          }}
        >
          ← Anterior
        </button>
        <button
          onClick={handleNext}
          style={{
            padding: "12px 28px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-soft)",
            borderRadius: 10,
            color: "var(--text-1)",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Revisar Letra →
        </button>
      </div>
    </>
  );
}
