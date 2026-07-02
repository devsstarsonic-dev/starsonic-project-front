"use client";

/**
 * Etapa 3 do compositor — "Formulário para criação de música"
 * (estrutura, instrumentos, idioma, restrições, versão-base e quantidade).
 *
 * Reproduz fielmente a Etapa 03 do PDF de design (painel ciano, rótulos
 * pretos à esquerda, opções em cápsula branca, caixas brancas arredondadas
 * e botão final "Gerar Minha Música" navy → roxo).
 *
 * - Estilos: classes `.e1-*` em `src/app/globals.css` (compartilhadas com Etapas 1 e 2).
 * - Estado : `useComposition()` — contexto compartilhado entre as etapas.
 * - Campos :
 *     songStructure       → "Estrutura desejada"            (seleção única)
 *     instruments         → "Instrumentos desejados"        (seleção múltipla)
 *     language            → "Idioma"                        (seleção única; armazena code)
 *     restrictions        → "O que não pode aparecer na música?"
 *     quantity            → "Quantas músicas você deseja gerar"    (seleção única)
 *
 * "Criar a música em cima de outra versão" (cover/versão/tradução) aparece como
 * campo bloqueado com selo "Em breve" — recurso ainda não disponível no back-end.
 *
 * Esta página é autossuficiente (não usa os antigos FormSection/PillSelector).
 */

import { useState, useCallback, useEffect, memo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { INSTRUMENTS } from "@/lib/data/instruments";
import { SONG_STRUCTURES } from "@/lib/data/structures";

// Idiomas exibidos no PDF (rótulo do PDF → code consumido pelo lyricsPrompt).
const LANGUAGE_OPTIONS = [
  { label: "Português Brasil", code: "pt-BR" },
  { label: "Inglês", code: "en-US" },
  { label: "Espanhol", code: "es-ES" },
] as const;

// "Instrumentação livre" (1º item) é a opção que exclui as demais.
const INSTRUMENT_FREE = INSTRUMENTS[0];
// Instrumentos restantes em 2 colunas (PDF: 5 + 5).
const INSTRUMENT_COLUMNS = [INSTRUMENTS.slice(1, 6), INSTRUMENTS.slice(6, 11)];

// "Quantas músicas você deseja gerar" — seleção única.
const QUANTITY_OPTIONS = [
  { label: "Gerar 2 Músicas", value: 2 },
  { label: "Gerar 4 Músicas em ritmos diferentes", value: 4 },
  { label: "Gerar 6 Músicas em ritmos diferentes", value: 6 },
] as const;

// Campos de texto curtos (caixas brancas) da Etapa 3.
const SHORT_TEXTAREA: React.CSSProperties = { minHeight: 84, padding: "14px 18px" };

// ──────────────────────────────────────────────────────────────
// Componentes de apresentação (mesmo padrão das Etapas 1 e 2)
// ──────────────────────────────────────────────────────────────

/** Cápsula branca de seleção (radio/checkbox). */
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

// ──────────────────────────────────────────────────────────────
// Página
// ──────────────────────────────────────────────────────────────

export default function Step3Page() {
  const router = useRouter();
  const { state, updateFormData, nextStep, prevStep } = useComposition();
  const formData = state.formData;

  const instruments = (formData.instruments as string[]) || [];
  const language = (formData.language as string) || "";

  // "Outro" do idioma e da versão liberam campos de texto livre.
  const [langOther, setLangOther] = useState(false);
  const [customLang, setCustomLang] = useState("");

  // Prefetch da próxima tela.
  useEffect(() => {
    router.prefetch("/compositor/revisar");
  }, [router]);

  // ── Estrutura (seleção única) ──
  const selectStructure = useCallback((v: string) => {
    updateFormData({ songStructure: v });
  }, [updateFormData]);

  // ── Instrumentos (múltipla; "livre" exclui os demais) ──
  const toggleInstrument = useCallback((inst: string) => {
    if (inst === INSTRUMENT_FREE) {
      updateFormData({ instruments: instruments.includes(INSTRUMENT_FREE) ? [] : [INSTRUMENT_FREE] });
      return;
    }
    const base = instruments.filter((x) => x !== INSTRUMENT_FREE);
    const next = base.includes(inst) ? base.filter((x) => x !== inst) : [...base, inst];
    updateFormData({ instruments: next });
  }, [instruments, updateFormData]);

  // ── Idioma (seleção única; armazena code) ──
  const selectLanguage = useCallback((code: string) => {
    setLangOther(false);
    updateFormData({ language: code });
  }, [updateFormData]);

  const selectLangOther = useCallback(() => {
    setLangOther(true);
    updateFormData({ language: customLang });
  }, [updateFormData, customLang]);

  const handleCustomLangChange = useCallback((v: string) => {
    setCustomLang(v);
    setLangOther(true);
    updateFormData({ language: v });
  }, [updateFormData]);

  // ── Quantidade (seleção única) ──
  const selectQuantity = useCallback((q: number) => {
    updateFormData({ quantity: q });
  }, [updateFormData]);

  // ── Voltar ──
  const handlePrev = useCallback(() => {
    prevStep();
    router.push("/compositor/step-2");
  }, [prevStep, router]);

  // ── Gerar ──
  const handleGenerate = useCallback(() => {
    nextStep();
    router.push("/compositor/revisar");
  }, [nextStep, router]);

  return (
    <div className="e1-wrap">
      {/* Stepper escuro flutuante */}
      <div className="e1-stepper">
        <span className="e1-stepper-off">ETAPA 01</span>
        <span className="e1-stepper-sep">→</span>
        <span className="e1-stepper-off">ETAPA 02</span>
        <span className="e1-stepper-sep">→</span>
        <span className="e1-stepper-on">ETAPA 03</span>
      </div>

      <div className="e1-panel">
        <h1 className="e1-title">Crie sua música</h1>
        <div className="e1-timeline">
          <span className="e1-timeline-dot" />
          <span className="e1-timeline-line" />
        </div>

        {/* Estrutura desejada */}
        <FormRow label="Estrutura desejada">
          {SONG_STRUCTURES.map((s) => (
            <RadioPill
              key={s.value}
              label={s.label}
              selected={(formData.songStructure as string) === s.value}
              onClick={() => selectStructure(s.value)}
            />
          ))}
        </FormRow>

        {/* Instrumentos desejados */}
        <FormRow label="Instrumentos desejados">
          <RadioPill
            label={INSTRUMENT_FREE}
            selected={instruments.includes(INSTRUMENT_FREE)}
            onClick={() => toggleInstrument(INSTRUMENT_FREE)}
          />
          <div className="e1-grid-2">
            {INSTRUMENT_COLUMNS.map((col, ci) => (
              <div key={ci}>
                {col.map((inst) => (
                  <RadioPill
                    key={inst}
                    label={inst}
                    selected={instruments.includes(inst)}
                    onClick={() => toggleInstrument(inst)}
                  />
                ))}
              </div>
            ))}
          </div>
        </FormRow>

        {/* Idioma */}
        <FormRow label="Idioma">
          <div className="e1-grid-2">
            <div>
              {LANGUAGE_OPTIONS.map((l) => (
                <RadioPill
                  key={l.code}
                  label={l.label}
                  selected={!langOther && language === l.code}
                  onClick={() => selectLanguage(l.code)}
                />
              ))}
            </div>
            <div>
              <RadioPill label="Outro" selected={langOther} onClick={selectLangOther} />
              {langOther && (
                <input
                  className="e1-input"
                  style={{ fontSize: 13, padding: "11px 16px", marginTop: 6, maxWidth: 280 }}
                  type="text"
                  value={customLang}
                  onChange={(e) => handleCustomLangChange(e.target.value)}
                  placeholder="Descreva o idioma"
                  maxLength={60}
                />
              )}
            </div>
          </div>
        </FormRow>

        {/* O que não pode aparecer na música? */}
        <FormRow label="O que não pode aparecer na música?">
          <textarea
            className="e1-textarea"
            style={SHORT_TEXTAREA}
            value={(formData.restrictions as string) || ""}
            onChange={(e) => updateFormData({ restrictions: e.target.value })}
            placeholder={`Não usar gírias.\nNão mencionar bebida alcoólica.\nNão usar linguagem agressiva.`}
            maxLength={500}
            rows={3}
          />
        </FormRow>

        {/* Criar a música em cima de outra versão — recurso bloqueado (em breve) */}
        <FormRow label="Criar a música em cima de outra versão">
          <div className="e1-locked" aria-disabled="true" title="Funcionalidade em breve">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="e1-locked-text">
              Recriar uma música existente (cover, versão ou tradução).
            </span>
            <span className="e1-locked-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Em breve
            </span>
          </div>
        </FormRow>

        {/* Quantas músicas você deseja gerar */}
        <FormRow label="Quantas músicas você deseja gerar">
          {QUANTITY_OPTIONS.map((q) => (
            <RadioPill
              key={q.value}
              label={q.label}
              selected={formData.quantity === q.value}
              onClick={() => selectQuantity(q.value)}
            />
          ))}
        </FormRow>

        {/* Voltar + Gerar Minha Música */}
        <div className="e1-actions" style={{ gap: 16 }}>
          <button type="button" className="e1-next" onClick={handlePrev}>
            ← Voltar
          </button>
          <button type="button" className="e1-next" onClick={handleGenerate}>
            Gerar Minha Música
          </button>
        </div>
      </div>
    </div>
  );
}
