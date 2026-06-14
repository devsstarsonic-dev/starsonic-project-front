"use client";

import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { WizardStepper } from "@/components/Compositor/WizardStepper";
import { FormSection } from "@/components/Compositor/FormSection";
import { QuestionField } from "@/components/Compositor/QuestionField";
import { PillSelector } from "@/components/Compositor/PillSelector";
import { INSTRUMENTS } from "@/lib/data/instruments";
import { LANGUAGES } from "@/lib/data/languages";
import { STRUCTURES } from "@/lib/data/structures";

export default function Step3Page() {
  const router = useRouter();
  const { state, updateFormData, nextStep, prevStep } = useComposition();

  const handleNext = () => {
    if (!state.formData.language) {
      alert("Por favor selecione o idioma");
      return;
    }

    nextStep();
    router.push("/compositor/revisar");
  };

  const handlePrev = () => {
    prevStep();
    router.push("/compositor/step-2");
  };

  const formData = state.formData;

  return (
    <>
      <WizardStepper currentStep={3} totalSteps={3} />

      <div style={{ maxWidth: "100%", paddingLeft: 24, paddingRight: 24 }}>
        {/* Step 3: Conteúdo */}
        <FormSection
          icon="🎸"
          title="Etapa 3: Conteúdo e Produção"
          subtitle="Defina instrumentos, estrutura e idioma"
        >
          <div style={{ marginBottom: 20 }}>
            <FormSection icon="🎼" title="Estrutura da Música">
              <PillSelector
                options={STRUCTURES}
                selected={(formData.structure as string) || ""}
                onChange={(v) => updateFormData({ structure: v })}
                variant="flex"
              />
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10 }}>
                Como você quer que a música seja organizada?
              </div>
            </FormSection>
          </div>

          <div style={{ marginBottom: 20 }}>
            <FormSection icon="🎹" title="Instrumentos Principais">
              <PillSelector
                options={INSTRUMENTS}
                selected={((formData.instruments as string[]) || [])}
                onChange={(v) => updateFormData({ instruments: v as string[] })}
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

          <div style={{ marginBottom: 20 }}>
            <FormSection icon="🌍" title="Idioma da Letra" required>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => updateFormData({ language: lang.code })}
                    style={{
                      padding: "10px 16px",
                      background:
                        formData.language === lang.code
                          ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
                          : "var(--bg-card)",
                      color:
                        formData.language === lang.code
                          ? "var(--bg-deep)"
                          : "var(--text-1)",
                      border:
                        formData.language === lang.code
                          ? "none"
                          : "1px solid var(--border-soft)",
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
            </FormSection>
          </div>

          <QuestionField
            label="Restrições ou Proibições (Opcional)"
            placeholder="Ex: 'Sem palavrões', 'Sem referências políticas'..."
            value={(formData.restrictions as string) || ""}
            onChange={(v) => updateFormData({ restrictions: v })}
            rows={2}
            type="textarea"
            helpText="Há algo que a música não deve conter?"
          />

          <QuestionField
            label="Versão Base (Opcional)"
            placeholder="Descrever uma versão base se quiser variar em relação a ela..."
            value={(formData.baseVersion as string) || ""}
            onChange={(v) => updateFormData({ baseVersion: v })}
            rows={2}
            type="textarea"
            helpText="Serve de referência para variações"
          />

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 13,
                color: "var(--white)",
                marginBottom: 10,
              }}
            >
              🎯 Quantas versões diferentes?
            </label>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {[1, 2, 3, 5].map((q) => (
                <button
                  key={q}
                  onClick={() => updateFormData({ quantity: q })}
                  style={{
                    padding: "8px 16px",
                    background:
                      formData.quantity === q
                        ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
                        : "var(--bg-card)",
                    color:
                      formData.quantity === q ? "var(--bg-deep)" : "var(--text-1)",
                    border:
                      formData.quantity === q
                        ? "none"
                        : "1px solid var(--border-soft)",
                    borderRadius: "100px",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 12,
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
            Revisar Letra →
          </button>
        </div>
      </div>
    </>
  );
}
