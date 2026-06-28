"use client";

/**
 * Etapa 2 do compositor — "Formulário para criação de música" (voz e estilo vocal).
 *
 * Reproduz fielmente a Etapa 02 do PDF de design (painel ciano, rótulos
 * pretos à esquerda, opções em cápsula branca, caixas brancas arredondadas
 * para os campos de texto e botão "Próxima Etapa" navy → roxo).
 *
 * - Estilos: classes `.e1-*` em `src/app/globals.css` (compartilhadas com a Etapa 1).
 * - Estado : `useComposition()` — contexto compartilhado entre as etapas.
 * - Campos :
 *     mandatoryPhrases → "Palavras ou frases obrigatórias"
 *     voiceStyle       → "Qual estilo de voz?"        (seleção única)
 *     references       → "Artistas de referência"
 *     voiceTone        → "Qual tom da voz?"           (seleção múltipla)
 *     names            → "Deseja citar nomes específicos?"
 *
 * Esta página é autossuficiente (não usa os antigos FormSection/PillSelector).
 */

import { useEffect, useCallback, memo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
// prevStep adicionado para o botão "Voltar" (volta à Etapa 1).
import { VOICE_STYLES, VOICE_TONES } from "@/lib/data/voice";

// "Qual estilo de voz?" em 2 colunas (PDF: 4 + 4).
const STYLE_COLUMNS = [VOICE_STYLES.slice(0, 4), VOICE_STYLES.slice(4, 8)];
// "Qual tom da voz?" em 3 colunas (PDF: 4 + 4 + 3).
const TONE_COLUMNS = [VOICE_TONES.slice(0, 4), VOICE_TONES.slice(4, 8), VOICE_TONES.slice(8, 11)];

// ──────────────────────────────────────────────────────────────
// Componentes de apresentação (mesmo padrão da Etapa 1)
// ──────────────────────────────────────────────────────────────

/** Cápsula branca de seleção (radio). */
const RadioPill = memo(function RadioPill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="e1-radio-row" onClick={onClick} aria-pressed={selected}>
      <span className={selected ? "e1-radio e1-radio--on" : "e1-radio"}>
        {selected && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span className="e1-radio-label">{label}</span>
    </button>
  );
});

/** Linha do formulário: rótulo preto à esquerda + conteúdo à direita. */
function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="e1-row">
      <div className="e1-label">{label}</div>
      <div>{children}</div>
    </div>
  );
}

// Campos de texto da Etapa 2 são caixas brancas curtas (2 linhas no PDF).
const SHORT_TEXTAREA: React.CSSProperties = { minHeight: 72, padding: "14px 18px" };

// ──────────────────────────────────────────────────────────────
// Página
// ──────────────────────────────────────────────────────────────

export default function Step2Page() {
  const router = useRouter();
  const { state, updateFormData, nextStep, prevStep } = useComposition();
  const formData = state.formData;

  const voiceStyle = (formData.voiceStyle as string) || "";
  const voiceTone = (formData.voiceTone as string[]) || [];

  // Prefetch da próxima etapa para navegação instantânea.
  useEffect(() => {
    router.prefetch("/compositor/step-3");
  }, [router]);

  const selectStyle = useCallback((s: string) => {
    updateFormData({ voiceStyle: s });
  }, [updateFormData]);

  const toggleTone = useCallback((t: string) => {
    const next = voiceTone.includes(t)
      ? voiceTone.filter((x) => x !== t)
      : [...voiceTone, t];
    updateFormData({ voiceTone: next });
  }, [voiceTone, updateFormData]);

  const handleNext = useCallback(() => {
    nextStep();
    router.push("/compositor/step-3");
  }, [nextStep, router]);

  const handlePrev = useCallback(() => {
    prevStep();
    router.push("/compositor");
  }, [prevStep, router]);

  return (
    <div className="e1-wrap">
      {/* Stepper escuro flutuante */}
      <div className="e1-stepper">
        <span className="e1-stepper-off">ETAPA 01</span>
        <span className="e1-stepper-sep">→</span>
        <span className="e1-stepper-on">ETAPA 02</span>
        <span className="e1-stepper-sep">→</span>
        <span className="e1-stepper-off">ETAPA 03</span>
      </div>

      <div className="e1-panel">
        <h1 className="e1-title">Formulário para criação de música</h1>
        <div className="e1-timeline">
          <span className="e1-timeline-dot" />
          <span className="e1-timeline-line" />
        </div>

        {/* Palavras ou frases obrigatórias */}
        <FormRow label="Palavras ou frases obrigatórias">
          <textarea
            className="e1-textarea"
            style={SHORT_TEXTAREA}
            value={(formData.mandatoryPhrases as string) || ""}
            onChange={(e) => updateFormData({ mandatoryPhrases: e.target.value })}
            placeholder={`Exemplo:\n"Nunca desistir", "Deus está no controle", "Vencer é uma decisão".`}
            maxLength={500}
            rows={2}
          />
        </FormRow>

        {/* Qual estilo de voz? */}
        <FormRow label="Qual estilo de voz?">
          <div className="e1-grid-2">
            {STYLE_COLUMNS.map((col, ci) => (
              <div key={ci}>
                {col.map((s) => (
                  <RadioPill key={s} label={s} selected={voiceStyle === s} onClick={() => selectStyle(s)} />
                ))}
              </div>
            ))}
          </div>
        </FormRow>

        {/* Artistas de referência */}
        <FormRow label="Artistas de referência">
          <textarea
            className="e1-textarea"
            style={SHORT_TEXTAREA}
            value={(formData.references as string) || ""}
            onChange={(e) => updateFormData({ references: e.target.value })}
            placeholder={`Exemplo:\nAlgo parecido com Jorge & Mateus, Isadora Pompeo, Coldplay, Imagine Dragons.`}
            maxLength={500}
            rows={2}
          />
        </FormRow>

        {/* Qual tom da voz? */}
        <FormRow label="Qual tom da voz?">
          <div className="e1-grid-3">
            {TONE_COLUMNS.map((col, ci) => (
              <div key={ci}>
                {col.map((t) => (
                  <RadioPill key={t} label={t} selected={voiceTone.includes(t)} onClick={() => toggleTone(t)} />
                ))}
              </div>
            ))}
          </div>
        </FormRow>

        {/* Deseja citar nomes específicos? */}
        <FormRow label="Deseja citar nomes específicos?">
          <textarea
            className="e1-textarea"
            style={SHORT_TEXTAREA}
            value={(formData.names as string) || ""}
            onChange={(e) => updateFormData({ names: e.target.value })}
            placeholder={`Exemplo:\nMaria, João, Empresa XYZ, Igreja ABC.`}
            maxLength={500}
            rows={2}
          />
        </FormRow>

        {/* Voltar + Próxima Etapa */}
        <div className="e1-actions" style={{ gap: 16 }}>
          <button type="button" className="e1-next" onClick={handlePrev}>
            ← Voltar
          </button>
          <button type="button" className="e1-next" onClick={handleNext}>
            Próxima Etapa →
          </button>
        </div>
      </div>
    </div>
  );
}
