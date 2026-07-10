"use client";

/**
 * Etapa 03 do Vocalista — "Aprovar amostra".
 *
 * O usuário ouve a amostra e decide. Rejeitar volta pro formulário com o
 * rascunho intacto (o VocalistaContext preserva tudo). Aprovar exige o aceite
 * do termo de voz sintética — requisito de compliance, não é texto decorativo.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useVocalista } from "@/lib/vocalista/VocalistaContext";
import { EmptyState } from "@/components/Vocalista/EmptyState";
import { Icon } from "@/components/Icon";

export default function AmostraPage() {
  const router = useRouter();
  const { draft, hydrated } = useVocalista();
  const [aceito, setAceito] = useState(false);

  useEffect(() => {
    if (hydrated && !draft.name.trim()) router.replace("/vocalista/criar");
  }, [hydrated, draft.name, router]);

  return (
    <div className="e1-wrap">
      <div className="e1-stepper">
        <span className="e1-stepper-off">ETAPA 01</span>
        <span className="e1-stepper-sep">→</span>
        <span className="e1-stepper-off">ETAPA 02</span>
        <span className="e1-stepper-sep">→</span>
        <span className="e1-stepper-on">ETAPA 03</span>
      </div>

      <div className="e1-panel">
        <h1 className="e1-title">Ouça antes de salvar</h1>
        <div className="e1-timeline">
          <span className="e1-timeline-dot" />
          <span className="e1-timeline-line" />
        </div>

        {/* Identificação da voz — dados do próprio rascunho */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: 24,
            borderRadius: 14,
            marginBottom: 24,
            background: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.05))",
            border: "1px solid rgba(168,85,247,0.4)",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, var(--purple), #ec4899)",
              boxShadow: "0 0 20px rgba(168,85,247,0.35)",
            }}
          >
            <Icon name="mic" size={36} style={{ color: "#fff" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 900,
                fontSize: 24,
                color: "var(--white)",
                margin: "0 0 6px",
              }}
            >
              {draft.name}
            </h2>
            {draft.styles.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {draft.styles.map((s) => (
                  <span key={s} className="badge">
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
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginTop: 24,
            padding: 16,
            borderRadius: 12,
            cursor: "pointer",
            background: "rgba(245,158,11,0.03)",
            border: "1px solid rgba(245,158,11,0.25)",
          }}
        >
          <input
            type="checkbox"
            checked={aceito}
            onChange={(e) => setAceito(e.target.checked)}
            style={{ marginTop: 3, width: 16, height: 16, accentColor: "#a855f7", flexShrink: 0 }}
          />
          <span style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.6 }}>
            Entendo que essa é uma <strong style={{ color: "var(--white)" }}>voz sintética gerada por IA</strong>,
            não representa nenhuma pessoa real, e vou usá-la em conformidade com a legislação brasileira de
            conteúdo gerado por IA.
          </span>
        </label>

        <div className="e1-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            className="e1-next"
            disabled={!aceito}
            style={!aceito ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
            onClick={() => router.push("/vocalista/artista")}
          >
            Salvar como artista →
          </button>
          <button type="button" className="btn-secondary" onClick={() => router.push("/vocalista/criar")}>
            Não gostei, ajustar e regerar
          </button>
        </div>
        <p style={{ color: "var(--text-3)", fontSize: 12, margin: "12px 0 0", lineHeight: 1.6 }}>
          Regerar gera uma nova amostra e cobra os créditos de novo. Salvar e reutilizar a voz é grátis.
        </p>
      </div>
    </div>
  );
}
