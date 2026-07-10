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
import { Icon } from "@/components/Icon";

const PIPELINE: { titulo: string; texto: string }[] = [
  { titulo: "Moderação da descrição", texto: "Verifica se nenhum artista real foi mencionado." },
  { titulo: "Envio pra geração", texto: "A descrição vira um prompt otimizado." },
  { titulo: "Compondo a amostra", texto: "Cerca de 20 segundos de música com a voz descrita." },
  { titulo: "Salvando a amostra", texto: "O áudio é guardado pra você ouvir." },
  { titulo: "Pronta pra você aprovar", texto: "Só viramos voz permanente se você gostar." },
];

export default function GerandoPage() {
  const router = useRouter();
  const { draft, hydrated } = useVocalista();

  const semRascunho = !draft.name.trim();

  // Sem rascunho não há o que gerar.
  useEffect(() => {
    if (hydrated && semRascunho) router.replace("/vocalista/criar");
  }, [hydrated, semRascunho, router]);

  useEffect(() => {
    router.prefetch("/vocalista/amostra");
  }, [router]);

  // Evita o lampejo do painel vazio antes do redirecionamento.
  if (!hydrated || semRascunho) return null;

  return (
    <div className="e1-wrap voc-wrap">
      <div className="e1-stepper">
        <span className="e1-stepper-off">ETAPA 01</span>
        <span className="e1-stepper-sep" aria-hidden="true">→</span>
        <span className="e1-stepper-on">ETAPA 02</span>
        <span className="e1-stepper-sep" aria-hidden="true">→</span>
        <span className="e1-stepper-off">ETAPA 03</span>
      </div>

      <div className="e1-panel">
        <h1 className="e1-title">Gerando amostra</h1>
        <div className="e1-timeline" aria-hidden="true">
          <span className="e1-timeline-dot" />
          <span className="e1-timeline-line" />
        </div>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="voc-hero-icon" style={{ width: 96, height: 96, margin: "0 auto 20px" }} aria-hidden="true">
            <Icon name="mic" size={42} style={{ color: "#fff" }} />
          </div>
          <h2
            className="voc-ink"
            style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 26, margin: "0 0 8px" }}
          >
            “{draft.name}”
          </h2>
          <p className="voc-ink-2" style={{ fontSize: 14, margin: 0 }}>
            Uma amostra de 20s pra você aprovar antes de salvar.
          </p>
        </div>

        {/* Sequência ordenada: cada etapa anuncia sua mudança de status. */}
        <ol
          aria-live="polite"
          style={{ display: "flex", flexDirection: "column", gap: 12, listStyle: "none", margin: 0, padding: 0 }}
        >
          {PIPELINE.map((p, i) => (
            <li key={p.titulo} className="voc-surface voc-step-row">
              <span className="voc-step-num" aria-hidden="true">{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="voc-ink" style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{p.titulo}</p>
                <p className="voc-ink-2" style={{ fontSize: 12, margin: "2px 0 0" }}>{p.texto}</p>
              </div>
              <span className="voc-step-status">aguardando…</span>
            </li>
          ))}
        </ol>

        <div className="voc-surface" style={{ marginTop: 20, padding: 14 }}>
          <p className="voc-ink-2" style={{ fontSize: 12, margin: 0, lineHeight: 1.6 }}>
            A geração de voz ainda não está integrada. Nenhuma chamada é feita e nenhum crédito é cobrado nesta
            versão.
          </p>
        </div>

        <div className="e1-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button type="button" className="e1-next" onClick={() => router.push("/vocalista/amostra")}>
            Ver amostra →
          </button>
          <button type="button" className="voc-btn-ghost" onClick={() => router.push("/vocalista")}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
