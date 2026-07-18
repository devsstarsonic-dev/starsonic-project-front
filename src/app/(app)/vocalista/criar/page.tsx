"use client";

/**
 * Etapa 01 do Vocalista — "Criar voz de artista".
 *
 * Mesma estrutura das etapas do Modo Studio (`.e1-*` em globals.css):
 * stepper flutuante + painel ciano + rótulos à esquerda.
 *
 * Duas portas de entrada, refletidas na URL (`?modo=inspire`) para que a aba
 * seja deep-linkável:
 *   Personalizado → preenche o formulário e vai direto pra /vocalista/gerando
 *   Inspire-se    → informa uma música de referência e vai pra /vocalista/dna
 */

import { Suspense, useState, useCallback, useEffect, useId, type FormEvent, type ReactNode, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVocalista } from "@/lib/vocalista/VocalistaContext";
import { GENRES } from "@/lib/data/genres";
import { VOICE_GENDERS, VOICE_TIMBRES, MAX_STYLES, SAMPLE_COST_CREDITS } from "@/lib/data/artistVoice";
import type { ArtistVoiceGender } from "@/lib/types";
import { RadioPill } from "@/components/RadioPill";
import { Icon } from "@/components/Icon";
import { analyzeVoiceFromLink } from "@/lib/vocalista/inspireVoice";

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
    touchAction: "manipulation",
    transition: "background .2s ease, border-color .2s ease, box-shadow .2s ease, color .2s ease",
    boxShadow: active
      ? "0 12px 34px rgba(124,58,237,0.38), inset 0 1px 0 rgba(255,255,255,0.07)"
      : "0 4px 16px rgba(0,0,0,0.28)",
  };
}

function TabIcon({ name, active }: { name: "pencil" | "sparkle"; active: boolean }) {
  return (
    <span
      aria-hidden="true"
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
        transition: "background .2s ease, box-shadow .2s ease",
      }}
    >
      <Icon name={name} size={20} />
    </span>
  );
}

/** Linha do formulário com rótulo associado a um único campo. */
function FieldRow({
  label,
  htmlFor,
  htmlId,
  children,
}: {
  label: string;
  htmlFor: string;
  htmlId?: string;
  children: ReactNode;
}) {
  return (
    <div className="e1-row" id={htmlId}>
      <label className="e1-label" htmlFor={htmlFor}>
        {label}
      </label>
      <div>{children}</div>
    </div>
  );
}

/** Linha do formulário para um grupo de opções (radiogroup / group). */
function GroupRow({
  label,
  labelId,
  htmlId,
  children,
}: {
  label: string;
  labelId: string;
  htmlId?: string;
  children: ReactNode;
}) {
  return (
    <div className="e1-row" id={htmlId}>
      <span className="e1-label" id={labelId}>
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <div className="e1-err" id={id} role="alert">
      <span aria-hidden="true">⚠</span> {message}
    </div>
  );
}

export default function CriarVozArtistaRoute() {
  // useSearchParams exige uma fronteira de Suspense na árvore do App Router.
  return (
    <Suspense fallback={null}>
      <CriarVozArtistaPage />
    </Suspense>
  );
}

function CriarVozArtistaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { draft, updateDraft } = useVocalista();
  const uid = useId();

  const tab = searchParams.get("modo") === "inspire" ? "inspire" : "personalizado";
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState(false);

  const ids = {
    name: `${uid}-name`,
    nameErr: `${uid}-name-err`,
    nameHelp: `${uid}-name-help`,
    desc: `${uid}-desc`,
    descErr: `${uid}-desc-err`,
    descWarn: `${uid}-desc-warn`,
    descCount: `${uid}-desc-count`,
    genderLbl: `${uid}-gender-lbl`,
    genderErr: `${uid}-gender-err`,
    timbre: `${uid}-timbre`,
    stylesLbl: `${uid}-styles-lbl`,
    stylesErr: `${uid}-styles-err`,
    stylesHint: `${uid}-styles-hint`,
  };

  useEffect(() => {
    router.prefetch("/vocalista/gerando");
    router.prefetch("/vocalista/dna");
  }, [router]);

  const setTab = useCallback(
    (next: "personalizado" | "inspire") => {
      router.replace(next === "inspire" ? "/vocalista/criar?modo=inspire" : "/vocalista/criar", { scroll: false });
    },
    [router],
  );

  const clearError = useCallback((key: string) => {
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  }, []);

  const limiteAtingido = draft.styles.length >= MAX_STYLES;

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

  const handleGerar = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
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
    },
    [draft, router],
  );

  // Inspire-se: só link + nome do vocalista. Analisa a música (mesmo pipeline do
  // compositor: MusicBrainz + /api/inspire com a RapidAPI do Spotify), grava o DNA
  // detectado no rascunho da voz e segue pra tela de DNA.
  const handleAnalisar = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (analyzing) return;
      const errs: Record<string, string> = {};
      if (!draft.referenceLink.trim()) errs.referenceLink = "Cole o link da música de referência.";
      if (!draft.name.trim()) errs.name = "Dê um nome ao vocalista.";
      if (Object.keys(errs).length) {
        setErrors(errs);
        return;
      }
      setErrors({});
      setAnalyzing(true);
      try {
        const patch = await analyzeVoiceFromLink(draft.referenceLink.trim());
        updateDraft(patch);
        router.push("/vocalista/dna");
      } catch (err) {
        setErrors({ inspire: err instanceof Error ? err.message : "Não foi possível analisar a música." });
      } finally {
        setAnalyzing(false);
      }
    },
    [analyzing, draft.referenceLink, draft.name, updateDraft, router],
  );

  return (
    <div className="e1-wrap voc-wrap">
      <div
        role="tablist"
        aria-label="Modo de criação da voz"
        style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}
      >
        <button
          type="button"
          role="tab"
          id={`${uid}-tab-personalizado`}
          aria-selected={tab === "personalizado"}
          aria-controls={`${uid}-panel`}
          onClick={() => setTab("personalizado")}
          style={tabCardStyle(tab === "personalizado")}
        >
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
        <button
          type="button"
          role="tab"
          id={`${uid}-tab-inspire`}
          aria-selected={tab === "inspire"}
          aria-controls={`${uid}-panel`}
          onClick={() => setTab("inspire")}
          style={tabCardStyle(tab === "inspire")}
        >
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
        <span className="e1-stepper-sep" aria-hidden="true">→</span>
        <span className="e1-stepper-off">ETAPA 02</span>
        <span className="e1-stepper-sep" aria-hidden="true">→</span>
        <span className="e1-stepper-off">ETAPA 03</span>
      </div>

      {tab === "inspire" ? (
        <InspirePanel
          panelId={`${uid}-panel`}
          tabId={`${uid}-tab-inspire`}
          uid={uid}
          link={draft.referenceLink}
          nome={draft.name}
          erroLink={errors.referenceLink}
          erroNome={errors.name}
          erroInspire={errors.inspire}
          analyzing={analyzing}
          onLink={(v) => {
            updateDraft({ referenceLink: v });
            clearError("referenceLink");
            clearError("inspire");
          }}
          onNome={(v) => {
            updateDraft({ name: v });
            clearError("name");
          }}
          onAnalisar={handleAnalisar}
        />
      ) : (
        <form
          className="e1-panel"
          id={`${uid}-panel`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-personalizado`}
          onSubmit={handleGerar}
          noValidate
        >
          <h1 className="e1-title">Descreva o artista fictício</h1>
          <div className="e1-timeline" aria-hidden="true">
            <span className="e1-timeline-dot" />
            <span className="e1-timeline-line" />
          </div>

          <FieldRow label="Nome do artista fictício:" htmlFor={ids.name} htmlId="field-name">
            <input
              className="e1-input"
              style={{ maxWidth: 380 }}
              id={ids.name}
              name="artistName"
              type="text"
              autoComplete="off"
              value={draft.name}
              onChange={(e) => {
                updateDraft({ name: e.target.value });
                clearError("name");
              }}
              placeholder="Ex: João Sertanejo Grave…"
              maxLength={80}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={`${ids.nameHelp}${errors.name ? ` ${ids.nameErr}` : ""}`}
            />
            <p className="voc-help" id={ids.nameHelp}>
              Esse é o nome que vai aparecer no Compositor. Use nomes descritivos e criativos.
            </p>
            <FieldError id={ids.nameErr} message={errors.name} />
          </FieldRow>

          <FieldRow label="Como você quer que a voz soe?" htmlFor={ids.desc} htmlId="field-description">
            <div className="e1-textarea-wrap">
              <textarea
                className="e1-textarea"
                id={ids.desc}
                name="voiceDescription"
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
                aria-invalid={Boolean(errors.description)}
                aria-describedby={`${ids.descCount} ${ids.descWarn}${errors.description ? ` ${ids.descErr}` : ""}`}
              />
              <span className="e1-hint" id={ids.descCount} aria-live="polite">
                {draft.description.length}/{MAX_DESC}
              </span>
            </div>
            
            <FieldError id={ids.descErr} message={errors.description} />
          </FieldRow>

          <GroupRow label="Qual o gênero da voz?" labelId={ids.genderLbl} htmlId="field-gender">
            <div
              role="radiogroup"
              aria-labelledby={ids.genderLbl}
              aria-invalid={Boolean(errors.gender)}
              aria-describedby={errors.gender ? ids.genderErr : undefined}
              style={{ display: "flex", gap: 28, flexWrap: "wrap" }}
            >
              {VOICE_GENDERS.map((g) => (
                <RadioPill
                  key={g.value}
                  role="radio"
                  label={g.label}
                  selected={draft.gender === g.value}
                  onClick={() => {
                    updateDraft({ gender: g.value as ArtistVoiceGender });
                    clearError("gender");
                  }}
                />
              ))}
            </div>
            <FieldError id={ids.genderErr} message={errors.gender} />
          </GroupRow>

          <FieldRow label="Timbre principal:" htmlFor={ids.timbre}>
            <select
              className="e1-input"
              style={{ maxWidth: 380, color: "#0a0a2e", backgroundColor: "#fff" }}
              id={ids.timbre}
              name="timbre"
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
          </FieldRow>

          <GroupRow label={`Estilos que essa voz combina (até ${MAX_STYLES}):`} labelId={ids.stylesLbl} htmlId="field-styles">
            <div
              role="group"
              aria-labelledby={ids.stylesLbl}
              aria-describedby={`${ids.stylesHint}${errors.styles ? ` ${ids.stylesErr}` : ""}`}
              className="e1-grid-3"
            >
              {GENRE_COLUMNS.map((col, ci) => (
                <div key={ci}>
                  {col.map((g) => {
                    const selected = draft.styles.includes(g);
                    return (
                      <RadioPill
                        key={g}
                        role="checkbox"
                        label={g}
                        selected={selected}
                        disabled={!selected && limiteAtingido}
                        disabledReason={`Limite de ${MAX_STYLES} estilos atingido. Desmarque um para escolher outro.`}
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
            <p className="voc-help" id={ids.stylesHint} role="status">
              {draft.styles.length} de {MAX_STYLES} selecionados.
              {limiteAtingido && " Limite atingido — desmarque um para escolher outro."}
            </p>
            <FieldError id={ids.stylesErr} message={errors.styles} />
          </GroupRow>

          

          <div className="e1-actions">
            <button type="submit" className="e1-next">
              Gerar amostra da voz →
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// "Inspire-se": só o LINK da música + o NOME do vocalista. Reaproveita o
// pipeline real do Inspire-se (/api/inspire com a RapidAPI do Spotify) — a
// análise roda ao enviar e o DNA vai pra tela de DNA já salvo no rascunho.
function InspirePanel({
  panelId,
  tabId,
  uid,
  link,
  nome,
  erroLink,
  erroNome,
  erroInspire,
  analyzing,
  onLink,
  onNome,
  onAnalisar,
}: {
  panelId: string;
  tabId: string;
  uid: string;
  link: string;
  nome: string;
  erroLink?: string;
  erroNome?: string;
  erroInspire?: string;
  analyzing: boolean;
  onLink: (v: string) => void;
  onNome: (v: string) => void;
  onAnalisar: (e: FormEvent) => void;
}) {
  const linkId = `${uid}-ref-link`;
  const linkErrId = `${uid}-ref-link-err`;
  const nomeId = `${uid}-voc-nome`;
  const nomeErrId = `${uid}-voc-nome-err`;
  const inspErrId = `${uid}-insp-err`;

  return (
    <form className="e1-panel" id={panelId} role="tabpanel" aria-labelledby={tabId} onSubmit={onAnalisar} noValidate>
      <h1 className="e1-title">Inspire-se numa música</h1>
      <div className="e1-timeline" aria-hidden="true">
        <span className="e1-timeline-dot" />
        <span className="e1-timeline-line" />
      </div>

      <p className="voc-ink-2" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
        Cole o link de uma música de referência e a IA detecta o estilo vocal pra criar uma voz de artista nova
        parecida. A IA analisa apenas o <strong className="voc-ink">estilo, vibe e emoção</strong> — ela{" "}
        <strong className="voc-ink">não clona</strong> a voz do artista original.
      </p>

      <FieldRow label="Link da música:" htmlFor={linkId} htmlId="field-referenceLink">
        <input
          className="e1-input"
          id={linkId}
          name="referenceLink"
          type="url"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          value={link}
          onChange={(e) => onLink(e.target.value)}
          placeholder="https://open.spotify.com/track/…  ou  https://youtu.be/…"
          aria-invalid={Boolean(erroLink)}
          aria-describedby={erroLink ? linkErrId : undefined}
          disabled={analyzing}
        />
        <FieldError id={linkErrId} message={erroLink} />
      </FieldRow>

      <FieldRow label="Nome do vocalista:" htmlFor={nomeId} htmlId="field-name">
        <input
          className="e1-input"
          id={nomeId}
          name="artistName"
          type="text"
          autoComplete="off"
          value={nome}
          onChange={(e) => onNome(e.target.value)}
          placeholder="Ex: João Sertanejo Grave…"
          maxLength={80}
          aria-invalid={Boolean(erroNome)}
          aria-describedby={erroNome ? nomeErrId : undefined}
          disabled={analyzing}
        />
        <FieldError id={nomeErrId} message={erroNome} />
      </FieldRow>

      {erroInspire && (
        <div className="voc-warn" style={{ marginTop: 4, marginBottom: 8 }}>
          <p className="voc-warn-text" id={inspErrId} role="alert">
            <span aria-hidden="true">⚠</span> {erroInspire}
          </p>
        </div>
      )}

      <div className="e1-actions">
        <button type="submit" className="e1-next" disabled={analyzing} aria-busy={analyzing}>
          {analyzing ? "Analisando…" : "Analisar e continuar →"}
        </button>
      </div>
    </form>
  );
}
