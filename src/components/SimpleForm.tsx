"use client";

/**
 * SimpleForm — render config-driven das telas de página única do Sonic Lab
 * (Instrumental e Jingle Comercial). Reproduz fielmente os HTMLs de design:
 * pill de título, card ciano, campos numerados em 2 colunas, opções em
 * radio circular, cards de seleção (andamento/duração) e botão navy.
 *
 * Ao enviar, converte as respostas em `formData` compatível com o compositor
 * e navega para a tela de revisão do próprio modo (/instrumental/revisar ou
 * /jingle/revisar), que reusa o motor do ReviewPanel com a cópia do modo.
 */

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { DetailedFormData, SimpleMode } from "@/lib/types";
import { seedCompositionStorage } from "@/lib/compositor/CompositionContext";

export type SFField =
  | { kind: "text"; num: number; label: ReactNode; labelText: string; formKey: keyof DetailedFormData; placeholder: string }
  | { kind: "single"; num: number; label: ReactNode; labelText: string; formKey: keyof DetailedFormData; cols: 2 | 3; options: string[]; note?: string; asArray?: boolean }
  | { kind: "multi"; num: number; label: ReactNode; labelText: string; formKey: keyof DetailedFormData; cols: 2 | 3; options: string[]; note?: string }
  | { kind: "cards"; num: number; label: ReactNode; labelText: string; formKey: keyof DetailedFormData; options: { title: string; sub: ReactNode; featured?: boolean }[]; defaultIndex?: number; map?: Record<string, unknown> };

export type SFConfig = {
  pill: { emoji: string; title: string; sub: string };
  title: string;
  desc: string;
  features: string[];
  fields: SFField[];
  submitLabel: string;
  /** Identifica a origem simplificada (Instrumental/Jingle) na tela de revisão. */
  simpleMode: SimpleMode;
};

// Respostas coletadas → formData do compositor. Cards com `map` traduzem o
// rótulo escolhido (ex.: "Médio" → 95 BPM); single-select com `asArray`
// vira lista (emoções). O downstream (buildLyricsPrompt/buildMusicStyle)
// aceita string ou array, então o resto passa direto.
function normalize(fields: SFField[], answers: Record<string, string | string[]>): Partial<DetailedFormData> {
  const fd: Record<string, unknown> = {};
  for (const f of fields) {
    const v = answers[f.formKey as string];
    if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) continue;
    if (f.kind === "cards" && f.map) fd[f.formKey as string] = f.map[v as string] ?? v;
    else if (f.kind === "single" && f.asArray) fd[f.formKey as string] = [v];
    else fd[f.formKey as string] = v;
  }
  return fd as Partial<DetailedFormData>;
}

// Lista de "Suas escolhas" para a tela de revisão, na ORDEM das perguntas do
// próprio form — cada modo (Instrumental/Jingle) mostra só o que perguntou.
function buildDisplayAnswers(fields: SFField[], answers: Record<string, string | string[]>) {
  return fields
    .map((f) => {
      const v = answers[f.formKey as string];
      if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) return null;
      const value = Array.isArray(v) ? v.join(", ") : v;
      return { label: f.labelText, value };
    })
    .filter((e): e is { label: string; value: string } => e !== null);
}

export function SimpleForm({ config }: { config: SFConfig }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(() => {
    const init: Record<string, string | string[]> = {};
    for (const f of config.fields) {
      if (f.kind === "cards" && f.defaultIndex != null) init[f.formKey as string] = f.options[f.defaultIndex].title;
    }
    return init;
  });

  const setSingle = (key: string, val: string) => setAnswers((a) => ({ ...a, [key]: val }));
  const toggleMulti = (key: string, val: string) =>
    setAnswers((a) => {
      const cur = Array.isArray(a[key]) ? (a[key] as string[]) : [];
      return { ...a, [key]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] };
    });

  const handleSubmit = () => {
    seedCompositionStorage(normalize(config.fields, answers), {
      simpleMode: config.simpleMode,
      displayAnswers: buildDisplayAnswers(config.fields, answers),
    });
    // Cada modo tem sua própria tela de revisão (/instrumental/revisar, /jingle/revisar).
    router.push(`/${config.simpleMode}/revisar`);
  };

  return (
    <div className="sf-wrap">
      <div className="sf-pill">
        <div className="sf-pill-title">{config.pill.emoji} {config.pill.title}</div>
        <div className="sf-pill-sub">{config.pill.sub}</div>
      </div>

      <div className="sf-card">
        <h1 className="sf-title">{config.title}</h1>
        <p className="sf-desc">{config.desc}</p>

        <div className="sf-features">
          {config.features.map((f) => (
            <div key={f} className="sf-tag">{f}</div>
          ))}
        </div>

        <div className="sf-divider" />

        {config.fields.map((f) => {
          const value = answers[f.formKey as string];
          return (
            <div className="sf-field" key={f.num}>
              <div className="sf-label"><span className="sf-num">{f.num}</span>{f.label}</div>
              <div className="sf-content">
                {f.kind === "text" && (
                  <input
                    className="sf-input"
                    type="text"
                    placeholder={f.placeholder}
                    value={(value as string) || ""}
                    onChange={(e) => setSingle(f.formKey as string, e.target.value)}
                  />
                )}

                {(f.kind === "single" || f.kind === "multi") && (
                  <>
                    {f.note && <p className="sf-note">{f.note}</p>}
                    {/* Mesmo seletor do Modo Studio (.e1-radio): toggle branco que
                        vira navy com check ao selecionar — padrão de todos os modos. */}
                    <div className={f.cols === 3 ? "e1-grid-3" : "e1-grid-2"}>
                      {f.options.map((opt) => {
                        const selected =
                          f.kind === "single"
                            ? value === opt
                            : Array.isArray(value) && value.includes(opt);
                        return (
                          <button
                            type="button"
                            key={opt}
                            className="e1-radio-row"
                            aria-pressed={selected}
                            onClick={() => (f.kind === "single" ? setSingle(f.formKey as string, opt) : toggleMulti(f.formKey as string, opt))}
                          >
                            <span className={selected ? "e1-radio e1-radio--on" : "e1-radio"}>
                              {selected && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </span>
                            <span className="e1-radio-label">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {f.kind === "cards" && (
                  <div className="sf-cards">
                    {f.options.map((c) => {
                      const selected = value === c.title;
                      return (
                        <button
                          type="button"
                          key={c.title}
                          className={`sf-cardopt${c.featured ? " sf-cardopt--featured" : ""}${selected ? " sf-cardopt--on" : ""}`}
                          aria-pressed={selected}
                          onClick={() => setSingle(f.formKey as string, c.title)}
                        >
                          <div className="sf-cardopt-title">{c.title}</div>
                          <div className="sf-cardopt-sub">{c.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <button type="button" className="sf-btn" onClick={handleSubmit}>
          {config.submitLabel}
        </button>
      </div>
    </div>
  );
}
