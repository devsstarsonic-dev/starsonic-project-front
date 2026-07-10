"use client";

/**
 * Etapa 01 do Vocalista — "Criar voz de artista".
 *
 * Mesma estrutura das etapas do Modo Studio (`.e1-*` em globals.css):
 * stepper flutuante + painel ciano + rótulos à esquerda.
 *
 * Duas portas de entrada, como no Compositor:
 *   Personalizado → preenche o formulário e vai direto pra /vocalista/gerando
 *   Inspire-se    → informa uma música de referência e vai pra /vocalista/dna
 */

import { useState, useCallback, useEffect, type ReactNode, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useVocalista } from "@/lib/vocalista/VocalistaContext";
import { GENRES } from "@/lib/data/genres";
import { VOICE_GENDERS, VOICE_TIMBRES, MAX_STYLES, SAMPLE_COST_CREDITS } from "@/lib/data/artistVoice";
import type { ArtistVoiceGender } from "@/lib/types";
import { RadioPill } from "@/components/RadioPill";
import { Icon } from "@/components/Icon";

const MAX_DESC = 500;
const GENRE_COLUMNS = [GENRES.slice(0, 9), GENRES.slice(9, 18), GENRES.slice(18, 26)];

function tabCardStyle(active: boolean): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "15px 22px",
    borderRadius: 16,
    minWidth: 244,
    textAlign: "left",
    border: active ? "1.5px solid rgba(168,85,247,0.9)" : "1px solid rgba(255,255,255,0.08)",
    background: active ? "linear-gradient(135deg, #2a1758 0%, #17123f 100%)" : "rgba(12,12,42,0.72)",
    color: active ? "#ffffff" : "#b9bce0",
    cursor: "pointer",
    transition: "all .2s ease",
    boxShadow: active
      ? "0 12px 34px rgba(124,58,237,0.38), inset 0 1px 0 rgba(255,255,255,0.07)"
      : "0 4px 16px rgba(0,0,0,0.28)",
  };
}

function TabIcon({ name, active }: { name: "pencil" | "sparkle"; active: boolean }) {
  return (
    <span
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        background: active ? "linear-gradient(135deg, #a855f7, #ec4899)" : "rgba(255,255,255,0.08)",
        boxShadow: active ? "0 6px 18px rgba(168,85,247,0.5)" : "none",
        transition: "all .2s ease",
      }}
    >
      <Icon name={name} size={20} />
    </span>
  );
}

function FormRow({ label, htmlId, children }: { label: string; htmlId?: string; children: ReactNode }) {
  return (
    <div className="e1-row" id={htmlId}>
      <div className="e1-label">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="e1-err">⚠ {message}</div>;
}

export default function CriarVozArtistaPage() {
  const router = useRouter();
  const { draft, updateDraft } = useVocalista();

  const [tab, setTab] = useState<"personalizado" | "inspire">("personalizado");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    router.prefetch("/vocalista/gerando");
    router.prefetch("/vocalista/dna");
  }, [router]);

  // Quem chega aqui pelo "Personalizar" da tela de DNA já tem uma referência
  // preenchida — abre direto no formulário.
  const clearError = useCallback((key: string) => {
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  }, []);

  const toggleStyle = useCallback(
    (g: string) => {
      const atual = draft.styles;
      const next = atual.includes(g)
        ? atual.filter((x) => x !== g)
        : atual.length < MAX_STYLES
          ? [...atual, g]
          : atual; // limite atingido: ignora
      updateDraft({ styles: next });
    },
    [draft.styles, updateDraft],
  );

  const handleGerar = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!draft.name.trim()) errs.name = "Dê um nome ao artista fictício.";
    if (!draft.description.trim()) errs.description = "Descreva como você quer que a voz soe.";
    if (!draft.gender) errs.gender = "Selecione o gênero da voz.";
    if (draft.styles.length === 0) errs.styles = "Escolha pelo menos um estilo musical.";

    if (Object.keys(errs).length) {
      setErrors(errs);
      document.getElementById(`field-${Object.keys(errs)[0]}`)?.scrollIntoView({ block: "center" });
      return;
    }
    setErrors({});
    router.push("/vocalista/gerando");
  }, [draft, router]);

  const handleAnalisar = useCallback(() => {
    if (!draft.referenceName.trim()) {
      setErrors({ referenceName: "Informe o nome da música de referência." });
      return;
    }
    setErrors({});
    router.push("/vocalista/dna");
  }, [draft.referenceName, router]);

  return (
    <div className="e1-wrap">
      <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
        <button type="button" onClick={() => setTab("personalizado")} style={tabCardStyle(tab === "personalizado")}>
          <TabIcon name="pencil" active={tab === "personalizado"} />
          <span>
            <span style={{ display: "block", fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 15 }}>
              Personalizado
            </span>
            <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
              Preencha cada detalhe da voz
            </span>
          </span>
        </button>
        <button type="button" onClick={() => setTab("inspire")} style={tabCardStyle(tab === "inspire")}>
          <TabIcon name="sparkle" active={tab === "inspire"} />
          <span>
            <span style={{ display: "block", fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 15 }}>
              Inspire-se
            </span>
            <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
              Baseie-se numa música que você curte
            </span>
          </span>
        </button>
      </div>

      <div className="e1-stepper">
        <span className="e1-stepper-on">ETAPA 01</span>
        <span className="e1-stepper-sep">→</span>
        <span className="e1-stepper-off">ETAPA 02</span>
        <span className="e1-stepper-sep">→</span>
        <span className="e1-stepper-off">ETAPA 03</span>
      </div>

      {tab === "inspire" ? (
        <InspirePanel
          link={draft.referenceLink}
          nome={draft.referenceName}
          erro={errors.referenceName}
          onLink={(v) => updateDraft({ referenceLink: v })}
          onNome={(v) => {
            updateDraft({ referenceName: v });
            clearError("referenceName");
          }}
          onAnalisar={handleAnalisar}
        />
      ) : (
        <div className="e1-panel">
          <h1 className="e1-title">Descreva o artista fictício</h1>
          <div className="e1-timeline">
            <span className="e1-timeline-dot" />
            <span className="e1-timeline-line" />
          </div>

          <FormRow label="Nome do artista fictício:" htmlId="field-name">
            <input
              className="e1-input"
              style={{ maxWidth: 380 }}
              type="text"
              value={draft.name}
              onChange={(e) => {
                updateDraft({ name: e.target.value });
                clearError("name");
              }}
              placeholder="Ex: João Sertanejo Grave"
              maxLength={80}
            />
            <div className="e1-hint" style={{ position: "static", marginTop: 8 }}>
              Esse é o nome que vai aparecer no Compositor. Use nomes descritivos e criativos.
            </div>
            <FieldError message={errors.name} />
          </FormRow>

          <FormRow label="Como você quer que a voz soe?" htmlId="field-description">
            <div className="e1-textarea-wrap">
              <textarea
                className="e1-textarea"
                value={draft.description}
                onChange={(e) => {
                  updateDraft({ description: e.target.value });
                  clearError("description");
                }}
                placeholder={
                  'Exemplo:\n"Voz masculina grave, tom romântico e melancólico. Timbre encorpado com um leve toque rouco. Sotaque sertanejo do interior. Boa pra baladas lentas."'
                }
                maxLength={MAX_DESC}
                rows={5}
              />
              <span className="e1-hint">
                {draft.description.length}/{MAX_DESC}
              </span>
            </div>
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 10,
                background: "rgba(245,158,11,0.05)",
                border: "1px solid rgba(245,158,11,0.25)",
              }}
            >
              <p style={{ color: "#fbbf24", fontSize: 12, fontWeight: 700, margin: "0 0 4px" }}>⚠ Importante</p>
              <p style={{ color: "var(--text-2)", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                Não use nomes de artistas famosos na descrição. A moderação vai bloquear.
              </p>
            </div>
            <FieldError message={errors.description} />
          </FormRow>

          <FormRow label="Qual o gênero da voz?" htmlId="field-gender">
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              {VOICE_GENDERS.map((g) => (
                <RadioPill
                  key={g.value}
                  label={g.label}
                  selected={draft.gender === g.value}
                  onClick={() => {
                    updateDraft({ gender: g.value as ArtistVoiceGender });
                    clearError("gender");
                  }}
                />
              ))}
            </div>
            <FieldError message={errors.gender} />
          </FormRow>

          <FormRow label="Timbre principal:">
            <select
              className="e1-input"
              style={{ maxWidth: 380 }}
              value={draft.timbre}
              onChange={(e) => updateDraft({ timbre: e.target.value })}
            >
              <option value="">A STARSONIC escolhe</option>
              {VOICE_TIMBRES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label={`Estilos que essa voz combina (até ${MAX_STYLES}):`} htmlId="field-styles">
            <div className="e1-grid-3">
              {GENRE_COLUMNS.map((col, ci) => (
                <div key={ci}>
                  {col.map((g) => {
                    const selected = draft.styles.includes(g);
                    return (
                      <RadioPill
                        key={g}
                        label={g}
                        selected={selected}
                        disabled={!selected && draft.styles.length >= MAX_STYLES}
                        onClick={() => {
                          toggleStyle(g);
                          clearError("styles");
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <FieldError message={errors.styles} />
          </FormRow>

          <div
            className="wiz-subcard"
            style={{
              marginTop: 24,
              padding: 20,
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.05))",
              border: "1px solid rgba(168,85,247,0.45)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ color: "var(--text-3)", fontSize: 12, margin: 0 }}>Custo da geração</p>
                <p style={{ color: "var(--white)", fontFamily: "'Orbitron', sans-serif", fontSize: 28, fontWeight: 900, margin: 0 }}>
                  {SAMPLE_COST_CREDITS} <span style={{ color: "var(--text-3)", fontSize: 14, fontWeight: 400 }}>créditos</span>
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: "var(--text-3)", fontSize: 12, margin: 0 }}>Tempo estimado</p>
                <p style={{ color: "#c084fc", fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 700, margin: 0 }}>
                  ~60s
                </p>
              </div>
            </div>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: "12px 0 0", lineHeight: 1.5 }}>
              Os {SAMPLE_COST_CREDITS} créditos são cobrados ao gerar a amostra. Aprovar a voz e reutilizá-la nas
              suas músicas é grátis.
            </p>
          </div>

          <div className="e1-actions">
            <button type="button" className="e1-next" onClick={handleGerar}>
              Gerar amostra da voz →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// "Inspire-se": link + nome de uma música de referência.
// ponytail: a análise real do DNA já existe em /api/inspire (usada pelo
// InspireBox do Compositor). Ligar aqui quando a tela de DNA sair do vazio.
function InspirePanel({
  link,
  nome,
  erro,
  onLink,
  onNome,
  onAnalisar,
}: {
  link: string;
  nome: string;
  erro?: string;
  onLink: (v: string) => void;
  onNome: (v: string) => void;
  onAnalisar: () => void;
}) {
  return (
    <div className="e1-panel">
      <h1 className="e1-title">Inspire-se numa música</h1>
      <div className="e1-timeline">
        <span className="e1-timeline-dot" />
        <span className="e1-timeline-line" />
      </div>

      <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
        Informe uma música de referência e a IA detecta o estilo vocal pra criar uma voz de artista nova parecida.
        A IA analisa apenas o <strong style={{ color: "var(--white)" }}>estilo, vibe e emoção</strong> — ela{" "}
        <strong style={{ color: "var(--white)" }}>não clona</strong> a voz do artista original.
      </p>

      <FormRow label="Link da música:">
        <input
          className="e1-input"
          type="url"
          value={link}
          onChange={(e) => onLink(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </FormRow>

      <FormRow label="Nome da música:" htmlId="field-referenceName">
        <input
          className="e1-input"
          type="text"
          value={nome}
          onChange={(e) => onNome(e.target.value)}
          placeholder="Ex: Zé Ramalho - Chão de Giz"
          maxLength={120}
        />
        <FieldError message={erro} />
      </FormRow>

      <div className="e1-actions">
        <button type="button" className="e1-next" onClick={onAnalisar}>
          Analisar e continuar →
        </button>
      </div>
    </div>
  );
}
