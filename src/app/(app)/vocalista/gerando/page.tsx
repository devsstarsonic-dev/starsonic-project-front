"use client";

/**
 * Etapa 02 do Vocalista — "Gerando amostra".
 *
 * O pipeline real (moderação → Suno → R2) ainda não existe: as etapas são
 * exibidas como pendentes e nenhuma chamada é feita. O botão de avanço mantém
 * o fluxo navegável até a integração entrar.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVocalista } from "@/lib/vocalista/VocalistaContext";
import { Icon, type IconName } from "@/components/Icon";

const PIPELINE: { icon: IconName; titulo: string; texto: string }[] = [
  { icon: "check", titulo: "Moderação da descrição", texto: "Verifica se nenhum artista real foi mencionado." },
  { icon: "send", titulo: "Envio pra geração", texto: "A descrição vira um prompt otimizado." },
  { icon: "music", titulo: "Compondo a amostra", texto: "Cerca de 20 segundos de música com a voz descrita." },
  { icon: "save", titulo: "Salvando a amostra", texto: "O áudio é guardado pra você ouvir." },
  { icon: "headphones", titulo: "Pronta pra você aprovar", texto: "Só viramos voz permanente se você gostar." },
];

export default function GerandoPage() {
  const router = useRouter();
  const { draft, hydrated } = useVocalista();

  // Sem rascunho não há o que gerar.
  useEffect(() => {
    if (hydrated && !draft.name.trim()) router.replace("/vocalista/criar");
  }, [hydrated, draft.name, router]);

  useEffect(() => {
    router.prefetch("/vocalista/amostra");
  }, [router]);

  return (
    <div className="e1-wrap">
      <div className="e1-stepper">
        <span className="e1-stepper-off">ETAPA 01</span>
        <span className="e1-stepper-sep">→</span>
        <span className="e1-stepper-on">ETAPA 02</span>
        <span className="e1-stepper-sep">→</span>
        <span className="e1-stepper-off">ETAPA 03</span>
      </div>

      <div className="e1-panel">
        <h1 className="e1-title">Gerando amostra</h1>
        <div className="e1-timeline">
          <span className="e1-timeline-dot" />
          <span className="e1-timeline-line" />
        </div>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, var(--purple), #ec4899)",
              boxShadow: "0 0 20px rgba(168,85,247,0.35), 0 0 40px rgba(236,72,153,0.15)",
            }}
          >
            <Icon name="mic" size={42} style={{ color: "#fff" }} />
          </div>
          <h2
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 900,
              fontSize: 26,
              color: "var(--white)",
              margin: "0 0 8px",
            }}
          >
            “{draft.name}”
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, margin: 0 }}>
            Uma amostra de 20s pra você aprovar antes de salvar.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {PIPELINE.map((p, i) => (
            <div
              key={p.titulo}
              className="card"
              style={{ padding: 16, display: "flex", alignItems: "center", gap: 16, opacity: 0.55 }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--bg-card-2)",
                  border: "1px solid var(--border-soft)",
                  color: "var(--text-3)",
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "var(--white)", fontSize: 14, fontWeight: 700, margin: 0 }}>{p.titulo}</p>
                <p style={{ color: "var(--text-3)", fontSize: 12, margin: "2px 0 0" }}>{p.texto}</p>
              </div>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: "var(--text-3)",
                  flexShrink: 0,
                }}
              >
                aguardando
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 10,
            background: "rgba(3,3,20,0.4)",
            border: "1px solid var(--border-soft)",
          }}
        >
          <p style={{ color: "var(--text-3)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
            A geração de voz ainda não está integrada. Nenhuma chamada é feita e nenhum crédito é cobrado nesta
            versão.
          </p>
        </div>

        <div className="e1-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="button" className="e1-next" onClick={() => router.push("/vocalista/amostra")}>
            Ver amostra →
          </button>
          <button type="button" className="btn-secondary" onClick={() => router.push("/vocalista")}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
