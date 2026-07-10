"use client";

/**
 * Etapa 03 do Vocalista — "Aprovar amostra".
 *
 * O usuário ouve a amostra e decide. Rejeitar volta pro formulário com o
 * rascunho intacto (o VocalistaContext preserva tudo). Aprovar exige o aceite
 * do termo de voz sintética — requisito de compliance, não é texto decorativo.
 */

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useVocalista } from "@/lib/vocalista/VocalistaContext";
import { EmptyState } from "@/components/Vocalista/EmptyState";
import { Icon } from "@/components/Icon";

export default function AmostraPage() {
  const router = useRouter();
  const { draft, hydrated } = useVocalista();
  const [aceito, setAceito] = useState(false);
  const uid = useId();

  const semRascunho = !draft.name.trim();

  useEffect(() => {
    if (hydrated && semRascunho) router.replace("/vocalista/criar");
  }, [hydrated, semRascunho, router]);

  // Evita o lampejo do painel vazio antes do redirecionamento.
  if (!hydrated || semRascunho) return null;

  const termoId = `${uid}-termo`;

  return (
    <div className="e1-wrap voc-wrap">
      <div className="e1-stepper">
        <span className="e1-stepper-off">ETAPA 01</span>
        <span className="e1-stepper-sep" aria-hidden="true">→</span>
        <span className="e1-stepper-off">ETAPA 02</span>
        <span className="e1-stepper-sep" aria-hidden="true">→</span>
        <span className="e1-stepper-on">ETAPA 03</span>
      </div>

      <div className="e1-panel">
        <h1 className="e1-title">Ouça antes de salvar</h1>
        <div className="e1-timeline" aria-hidden="true">
          <span className="e1-timeline-dot" />
          <span className="e1-timeline-line" />
        </div>

        {/* Identificação da voz — dados do próprio rascunho */}
        <div
          className="voc-surface-strong"
          style={{ display: "flex", alignItems: "center", gap: 20, padding: 24, marginBottom: 24, flexWrap: "wrap" }}
        >
          <div className="voc-hero-icon" style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 20 }} aria-hidden="true">
            <Icon name="mic" size={36} style={{ color: "#fff" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2
              className="voc-ink"
              style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 24, margin: "0 0 8px" }}
            >
              {draft.name}
            </h2>
            {draft.styles.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {draft.styles.map((s) => (
                  <span key={s} className="voc-tag">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <EmptyState
          icon="headphones"
          title="A amostra ainda não está disponível"
          text="Aqui vai tocar o trecho de 20 segundos gerado com a voz que você descreveu, com a forma de onda e a letra cantada."
        />

        {/* Termo de aceite — obrigatório antes de salvar */}
        <label
          className="voc-warn"
          id={termoId}
          style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 24, padding: 16, cursor: "pointer" }}
        >
          <input
            type="checkbox"
            checked={aceito}
            onChange={(e) => setAceito(e.target.checked)}
            style={{ width: 24, height: 24, accentColor: "#7c2d12", flexShrink: 0, touchAction: "manipulation" }}
          />
          <span className="voc-warn-text" style={{ fontSize: 13 }}>
            Entendo que essa é uma <strong>voz sintética gerada por IA</strong>, não representa nenhuma pessoa real,
            e vou usá-la em conformidade com a legislação brasileira de conteúdo gerado por IA.
          </span>
        </label>

        <div className="e1-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            className="e1-next"
            disabled={!aceito}
            aria-describedby={!aceito ? termoId : undefined}
            onClick={() => router.push("/vocalista/artista")}
          >
            Salvar como artista →
          </button>
          <button type="button" className="voc-btn-ghost" onClick={() => router.push("/vocalista/criar")}>
            Não gostei, ajustar e regerar
          </button>
        </div>
        {!aceito && (
          <p className="voc-ink-2" role="status" style={{ fontSize: 12, marginTop: 12, textAlign: "center" }}>
            Aceite o termo acima para salvar a voz.
          </p>
        )}
        <p className="voc-ink-2" style={{ fontSize: 12, margin: "12px 0 0", lineHeight: 1.6, textAlign: "center" }}>
          Regerar gera uma nova amostra e cobra os créditos de novo. Salvar e reutilizar a voz é grátis.
        </p>
      </div>
    </div>
  );
}
