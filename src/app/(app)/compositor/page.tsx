"use client";

/**
 * Etapa 1 do compositor — "Formulário para criação de música".
 *
 * Reproduz fielmente a Etapa 01 do PDF de design (painel ciano, rótulos
 * pretos à esquerda, opções em cápsula branca, botão "Próxima Etapa" navy→roxo).
 *
 * - Estilos: classes `.e1-*` em `src/app/globals.css`.
 * - Estado : `useComposition()` — contexto compartilhado entre as etapas,
 *            persistido em sessionStorage (ver CompositionContext).
 * - Validação: nome da música (salvo no modo automático) e gênero são
 *            obrigatórios antes de avançar para `/compositor/step-2`.
 *
 * As próximas etapas (step-2, step-3, revisar) continuam com seus próprios
 * componentes — esta página é autossuficiente e não usa os antigos
 * FormSection/GenreSelector/PillSelector.
 */

import { useState, useCallback, useEffect, memo, type ReactNode, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { GENRES } from "@/lib/data/genres";
import { EMOTIONS } from "@/lib/data/emotions";
import { InspireBox } from "@/components/Compositor/InspireBox";
import { Icon } from "@/components/Icon";

// Aba superior: "Personalizado" (formulário atual) x "Inspire-se" (referência).
// Cartões de escolha (não pílulas) — mais convidativos e claros.
function tabCardStyle(active: boolean): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 20px",
    borderRadius: 16,
    minWidth: 240,
    textAlign: "left",
    border: active ? "2px solid #00D6F7" : "1px solid rgba(255,255,255,0.14)",
    background: active
      ? "linear-gradient(135deg, rgba(0,214,247,0.18), rgba(168,85,247,0.14))"
      : "rgba(10,10,46,0.55)",
    color: active ? "#ffffff" : "#c9c9e6",
    cursor: "pointer",
    transition: "all .18s ease",
    boxShadow: active ? "0 10px 30px rgba(0,214,247,0.22)" : "none",
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
        color: active ? "#04130a" : "#00D6F7",
        background: active ? "linear-gradient(135deg, #00d4ff,rgb(169, 228, 255))" : "rgba(0,214,247,0.12)",
        transition: "all .18s ease",
      }}
    >
      <Icon name={name} size={20} />
    </span>
  );
}

// Máximo de emoções selecionáveis simultaneamente (regra do produto).
const MAX_EMOTIONS = 3;

// Gêneros distribuídos em 3 colunas, mantendo a leitura coluna-a-coluna do PDF.
const GENRE_COLUMNS = [GENRES.slice(0, 10), GENRES.slice(10, 19), GENRES.slice(19, 26)];

// ──────────────────────────────────────────────────────────────
// Componentes de apresentação
// ──────────────────────────────────────────────────────────────

/** Cápsula branca de seleção (radio). Usada por nome, gênero e emoção. */
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
function FormRow({ label, htmlId, children }: { label: string; htmlId?: string; children: ReactNode }) {
  return (
    <div className="e1-row" id={htmlId}>
      <div className="e1-label">{label}</div>
      <div>{children}</div>
    </div>
  );
}

/** Mensagem de erro de validação ("⚠ ..."). */
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="e1-err">⚠ {message}</div>;
}

// ──────────────────────────────────────────────────────────────
// Página
// ──────────────────────────────────────────────────────────────

export default function CompositorPage() {
  const router = useRouter();
  const { state, updateFormData, nextStep, resetIfGenerated } = useComposition();
  const formData = state.formData;

  const [tab, setTab] = useState<"personalizado" | "inspire">("personalizado");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoName, setAutoName] = useState(false); // STARSONIC escolhe o nome
  const [outroActive, setOutroActive] = useState(false); // gênero "Outro" ativo
  const [customGenre, setCustomGenre] = useState("");

  const genre = (formData.genre as string) || "";
  const emotions = (formData.emotions as string[]) || [];

  // Ao abrir a etapa 1: se já houve geração antes, limpa o formulário.
  useEffect(() => {
    resetIfGenerated();
  }, [resetIfGenerated]);

  // Prefetch da próxima etapa para navegação instantânea.
  useEffect(() => {
    router.prefetch("/compositor/step-2");
  }, [router]);

  const clearError = useCallback((key: string) => {
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  }, []);

  // ── Nome da música ──
  const handleMusicNameChange = useCallback((v: string) => {
    updateFormData({ musicName: v });
    clearError("musicName");
  }, [updateFormData, clearError]);

  const handleAutoNameToggle = useCallback((isAuto: boolean) => {
    setAutoName(isAuto);
    if (isAuto) {
      updateFormData({ musicName: "" });
      clearError("musicName");
    }
  }, [updateFormData, clearError]);

  // ── Gênero (seleção única; "Outro" libera campo livre) ──
  const selectGenre = useCallback((g: string) => {
    setOutroActive(false);
    updateFormData({ genre: g });
    clearError("genre");
  }, [updateFormData, clearError]);

  const selectOutro = useCallback(() => {
    setOutroActive(true);
    updateFormData({ genre: customGenre });
    if (customGenre) clearError("genre");
  }, [updateFormData, customGenre, clearError]);

  const handleCustomGenreChange = useCallback((v: string) => {
    setCustomGenre(v);
    setOutroActive(true);
    updateFormData({ genre: v });
    if (v) clearError("genre");
  }, [updateFormData, clearError]);

  // ── Emoções (múltipla, até MAX_EMOTIONS) ──
  const toggleEmotion = useCallback((emo: string) => {
    const current = (formData.emotions as string[]) || [];
    const next = current.includes(emo)
      ? current.filter((x) => x !== emo)
      : current.length < MAX_EMOTIONS
        ? [...current, emo]
        : current; // limite atingido: ignora
    updateFormData({ emotions: next });
  }, [formData.emotions, updateFormData]);

  // ── Avançar ──
  const handleNext = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!autoName && !formData.musicName) errs.musicName = "O nome da música é obrigatório.";
    if (!formData.genre) errs.genre = "Selecione um gênero musical.";

    if (Object.keys(errs).length) {
      setErrors(errs);
      document.getElementById(`field-${Object.keys(errs)[0]}`)?.scrollIntoView({ block: "center" });
      return;
    }
    setErrors({});
    nextStep();
    router.push("/compositor/step-2");
  }, [autoName, formData, nextStep, router]);

  return (
    <div className="e1-wrap">
      {/* Abas: Personalizado x Inspire-se (acima do título) */}
      <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
        <button type="button" onClick={() => setTab("personalizado")} style={tabCardStyle(tab === "personalizado")}>
          <TabIcon name="pencil" active={tab === "personalizado"} />
          <span>
            <span style={{ display: "block", fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 15 }}>
              Personalizado
            </span>
            <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
              Preencha cada detalhe da música
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
              Baseie-se em uma música que você curte
            </span>
          </span>
        </button>
      </div>

      {/* Área com flip 3D ao trocar de aba */}
      <style>{`
        @keyframes comp-flip-in {
          0%   { opacity: 0; transform: rotateY(-90deg) scale(0.96); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: rotateY(0deg) scale(1); }
        }
        .comp-flip { animation: comp-flip-in .55s cubic-bezier(.2,.8,.25,1) both; transform-origin: center; will-change: transform, opacity; }
      `}</style>
      <div style={{ perspective: 1600 }}>
        <div key={tab} className="comp-flip">
      {tab === "inspire" ? (
        <InspireBox onPersonalize={() => setTab("personalizado")} />
      ) : (
      <>
      {/* Stepper escuro flutuante */}
      <div className="e1-stepper">
        <span className="e1-stepper-on">ETAPA 01</span>
        <span className="e1-stepper-sep">→</span>
        <span className="e1-stepper-off">ETAPA 02</span>
        <span className="e1-stepper-sep">→</span>
        <span className="e1-stepper-off">ETAPA 03</span>
      </div>

      <div className="e1-panel">
        <h1 className="e1-title">Crie sua música</h1>
        <div className="e1-timeline">
          <span className="e1-timeline-dot" />
          <span className="e1-timeline-line" />
        </div>

        {/* Nome da música */}
        <FormRow label="Nome da música:" htmlId="field-musicName">
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 12 }}>
            <RadioPill label="Você escolhe o nome" selected={!autoName} onClick={() => handleAutoNameToggle(false)} />
            <RadioPill label="STARSONIC cria o nome pra você" selected={autoName} onClick={() => handleAutoNameToggle(true)} />
          </div>
          {!autoName && (
            <input
              className="e1-input"
              style={{ maxWidth: 340 }}
              type="text"
              value={(formData.musicName as string) || ""}
              onChange={(e) => handleMusicNameChange(e.target.value)}
              placeholder="Nome da sua música"
              maxLength={500}
            />
          )}
          <FieldError message={errors.musicName} />
        </FormRow>

        {/* Descreva sua História */}
        <FormRow label="Descreva sua História:">
          <div className="e1-textarea-wrap">
            <textarea
              className="e1-textarea"
              value={(formData.history as string) || ""}
              onChange={(e) => updateFormData({ history: e.target.value })}
              placeholder={`Exemplo:\n"Comecei vendendo picolés na rua, fui desacreditado por todos, enfrentei dificuldades financeiras, mas perseverei e construí empresas que transformaram minha vida."`}
              maxLength={1000}
              rows={5}
            />
            <span className="e1-hint">Max. 1000 caracteres</span>
          </div>
        </FormRow>

        {/* Gênero musical */}
        <FormRow label="Qual gênero musical?" htmlId="field-genre">
          <div className="e1-grid-3">
            {GENRE_COLUMNS.map((col, ci) => (
              <div key={ci}>
                {col.map((g) => (
                  <RadioPill key={g} label={g} selected={!outroActive && genre === g} onClick={() => selectGenre(g)} />
                ))}
                {ci === 2 && (
                  <>
                    <RadioPill label="Outro:" selected={outroActive} onClick={selectOutro} />
                    <input
                      className="e1-input"
                      style={{ fontSize: 13, padding: "11px 16px", marginTop: 6 }}
                      type="text"
                      value={customGenre}
                      onChange={(e) => handleCustomGenreChange(e.target.value)}
                      placeholder="Descreva o Gênero"
                      maxLength={60}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
          <FieldError message={errors.genre} />
        </FormRow>

        {/* Sobre o que será a música */}
        <FormRow label="Sobre o que será a música?">
          <input
            className="e1-input"
            type="text"
            value={(formData.theme as string) || ""}
            onChange={(e) => updateFormData({ theme: e.target.value })}
            placeholder="Exemplo: Superação, fé, empreendedorismo, amor, amizade, academia, vendas, motivação etc...."
            maxLength={500}
          />
        </FormRow>

        {/* Emoção */}
        <FormRow label="Qual emoção deseja transmitir?">
          <div className="e1-grid-3">
            {EMOTIONS.map((emo) => (
              <RadioPill key={emo} label={emo} selected={emotions.includes(emo)} onClick={() => toggleEmotion(emo)} />
            ))}
          </div>
        </FormRow>

        {/* Público */}
        <FormRow label="Quem vai ouvir essa música?">
          <input
            className="e1-input"
            type="text"
            value={(formData.audience as string) || ""}
            onChange={(e) => updateFormData({ audience: e.target.value })}
            placeholder="Exemplo: Jovens, Empresários, Cristãos, Casais, Crianças ou Público geral"
            maxLength={500}
          />
        </FormRow>

        {/* Próxima Etapa */}
        <div className="e1-actions">
          <button type="button" className="e1-next" onClick={handleNext}>
            Próxima Etapa →
          </button>
        </div>
      </div>
      </>
      )}
        </div>
      </div>
    </div>
  );
}
