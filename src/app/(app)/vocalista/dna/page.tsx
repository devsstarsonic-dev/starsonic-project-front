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

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVocalista } from "@/lib/vocalista/VocalistaContext";
import { EmptyState } from "@/components/Vocalista/EmptyState";
import { Icon } from "@/components/Icon";

export default function DnaPage() {
  const router = useRouter();
  const { draft, hydrated, updateDraft } = useVocalista();

  // Sem referência não há o que analisar: volta pra etapa 01.
  useEffect(() => {
    if (hydrated && !draft.referenceName.trim()) router.replace("/vocalista/criar");
  }, [hydrated, draft.referenceName, router]);

  return (
    <div className="e1-wrap">
      <div className="e1-stepper">
        <span className="e1-stepper-on">ETAPA 01</span>
        <span className="e1-stepper-sep">→</span>
        <span className="e1-stepper-off">ETAPA 02</span>
        <span className="e1-stepper-sep">→</span>
        <span className="e1-stepper-off">ETAPA 03</span>
      </div>

      <div className="e1-panel">
        <h1 className="e1-title">DNA vocal detectado</h1>
        <div className="e1-timeline">
          <span className="e1-timeline-dot" />
          <span className="e1-timeline-line" />
        </div>

        {/* Música de referência — informada pelo usuário na etapa anterior */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: 16,
            borderRadius: 14,
            marginBottom: 24,
            background: "rgba(3,3,20,0.5)",
            border: "1px solid rgba(168,85,247,0.4)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, var(--purple), #ec4899)",
            }}
          >
            <Icon name="music" size={24} style={{ color: "#fff" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                color: "#c084fc",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "0 0 4px",
              }}
            >
              Música de referência
            </p>
            <p style={{ color: "var(--white)", fontSize: 17, fontWeight: 700, margin: 0 }}>{draft.referenceName}</p>
            {draft.referenceLink && (
              <p
                style={{
                  color: "var(--text-3)",
                  fontSize: 11,
                  margin: "2px 0 0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 420,
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
            <div className="e1-label">Como quer chamar essa voz?</div>
            <div>
              <input
                className="e1-input"
                style={{ maxWidth: 380 }}
                type="text"
                value={draft.name}
                onChange={(e) => updateDraft({ name: e.target.value })}
                placeholder="Nome do artista fictício"
                maxLength={80}
              />
              <div className="e1-hint" style={{ position: "static", marginTop: 8 }}>
                Você pode mudar depois, em Personalizar.
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 8,
            padding: 12,
            borderRadius: 10,
            background: "rgba(245,158,11,0.05)",
            border: "1px solid rgba(245,158,11,0.3)",
          }}
        >
          <p style={{ color: "var(--text-2)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
            ⚠ A voz salva será <strong style={{ color: "var(--white)" }}>sintética</strong>, seguindo o estilo
            detectado. O nome do artista original <strong style={{ color: "var(--white)" }}>não vai</strong> pro
            prompt final nem pro metadata de distribuição.
          </p>
        </div>

        <div className="e1-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            className="e1-next"
            disabled={!draft.name.trim()}
            style={!draft.name.trim() ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
            onClick={() => router.push("/vocalista/gerando")}
          >
            Manter similar →
          </button>
          <button type="button" className="btn-secondary" onClick={() => router.push("/vocalista/criar")}>
            Personalizar
          </button>
        </div>
      </div>
    </div>
  );
}
