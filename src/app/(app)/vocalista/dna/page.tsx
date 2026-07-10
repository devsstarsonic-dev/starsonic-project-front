"use client";

/**
 * Etapa 01b do Vocalista — "DNA vocal detectado".
 *
 * Só é alcançada pelo modo "Inspire-se". Mostra o resultado da análise da
 * música de referência e deixa o usuário escolher entre gerar a voz no estilo
 * detectado ("Manter similar") ou abrir o formulário pré-preenchido
 * ("Personalizar").
 *
 * A análise real ainda não está ligada — o painel de DNA nasce vazio.
 */

import { useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { useVocalista } from "@/lib/vocalista/VocalistaContext";
import { EmptyState } from "@/components/Vocalista/EmptyState";
import { Icon } from "@/components/Icon";

export default function DnaPage() {
  const router = useRouter();
  const { draft, hydrated, updateDraft } = useVocalista();
  const uid = useId();

  const semReferencia = !draft.referenceName.trim();

  // Sem referência não há o que analisar: volta pra etapa 01.
  useEffect(() => {
    if (hydrated && semReferencia) router.replace("/vocalista/criar");
  }, [hydrated, semReferencia, router]);

  // Não pinta nada antes de saber se o rascunho existe — evita o lampejo de
  // uma tela vazia logo antes do redirecionamento.
  if (!hydrated || semReferencia) return null;

  const nomeId = `${uid}-nome`;
  const ajudaId = `${uid}-nome-help`;
  const motivoId = `${uid}-cta-motivo`;
  const semNome = !draft.name.trim();

  return (
    <div className="e1-wrap voc-wrap">
      <div className="e1-stepper">
        <span className="e1-stepper-on">ETAPA 01</span>
        <span className="e1-stepper-sep" aria-hidden="true">→</span>
        <span className="e1-stepper-off">ETAPA 02</span>
        <span className="e1-stepper-sep" aria-hidden="true">→</span>
        <span className="e1-stepper-off">ETAPA 03</span>
      </div>

      <div className="e1-panel">
        <h1 className="e1-title">DNA vocal detectado</h1>
        <div className="e1-timeline" aria-hidden="true">
          <span className="e1-timeline-dot" />
          <span className="e1-timeline-line" />
        </div>

        {/* Música de referência — informada pelo usuário na etapa anterior */}
        <div
          className="voc-surface-strong"
          style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, marginBottom: 24 }}
        >
          <div className="voc-hero-icon" style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 16 }} aria-hidden="true">
            <Icon name="music" size={24} style={{ color: "#fff" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                color: "#6d28d9",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "0 0 4px",
              }}
            >
              Música de referência
            </p>
            <p className="voc-ink" style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{draft.referenceName}</p>
            {draft.referenceLink && (
              <p
                className="voc-ink-3"
                style={{
                  fontSize: 11,
                  margin: "2px 0 0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {draft.referenceLink}
              </p>
            )}
          </div>
        </div>

        <EmptyState
          icon="sparkle"
          title="A análise ainda não está disponível"
          text="Aqui vão aparecer o gênero, o tipo de voz, o tom, as emoções, os instrumentos e o andamento extraídos da música de referência."
        />

        {/* Nome da voz vem ANTES dos CTAs: o usuário revisa antes de decidir. */}
        <div style={{ marginTop: 24 }}>
          <div className="e1-row">
            <label className="e1-label" htmlFor={nomeId}>
              Como quer chamar essa voz?
            </label>
            <div>
              <input
                className="e1-input"
                style={{ maxWidth: 380 }}
                id={nomeId}
                name="artistName"
                type="text"
                autoComplete="off"
                value={draft.name}
                onChange={(e) => updateDraft({ name: e.target.value })}
                placeholder="Nome do artista fictício…"
                maxLength={80}
                aria-describedby={ajudaId}
              />
              <p className="voc-help" id={ajudaId}>
                Você pode mudar depois, em Personalizar.
              </p>
            </div>
          </div>
        </div>

        <div className="voc-warn" style={{ marginTop: 8 }}>
          <p className="voc-warn-text">
            <span aria-hidden="true">⚠</span> A voz salva será <strong>sintética</strong>, seguindo o estilo detectado.
            O nome do artista original <strong>não vai</strong> pro prompt final nem pro metadata de distribuição.
          </p>
        </div>

        <div className="e1-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            className="e1-next"
            disabled={semNome}
            aria-describedby={semNome ? motivoId : undefined}
            onClick={() => router.push("/vocalista/gerando")}
          >
            Manter similar →
          </button>
          <button type="button" className="voc-btn-ghost" onClick={() => router.push("/vocalista/criar")}>
            Personalizar
          </button>
        </div>
        {semNome && (
          <p className="voc-ink-2" id={motivoId} role="status" style={{ fontSize: 12, marginTop: 12, textAlign: "center" }}>
            Dê um nome à voz para continuar.
          </p>
        )}
      </div>
    </div>
  );
}
