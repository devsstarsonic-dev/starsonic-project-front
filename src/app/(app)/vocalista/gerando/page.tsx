"use client";

/**
 * Etapa 02 do Vocalista — "Gerando amostra".
 *
 * O pipeline real (moderação → Suno → R2) ainda não existe. Nenhuma chamada é
 * feita: o balão de "gerando" e a liberação do botão de avanço são simulados
 * por um timeout local.
 *
 * ponytail: quando a geração via API da Suno entrar, troque o timeout abaixo
 * por polling/webhook do job real e ligue `done` na resposta de conclusão.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useVocalista } from "@/lib/vocalista/VocalistaContext";
import { Icon } from "@/components/Icon";

const GERACAO_SIMULADA_MS = 4000;

export default function GerandoPage() {
  const router = useRouter();
  const { draft, hydrated } = useVocalista();
  const [done, setDone] = useState(false);

  const semRascunho = !draft.name.trim();

  // Sem rascunho não há o que gerar.
  useEffect(() => {
    if (hydrated && semRascunho) router.replace("/vocalista/criar");
  }, [hydrated, semRascunho, router]);

  useEffect(() => {
    router.prefetch("/vocalista/amostra");
  }, [router]);

  useEffect(() => {
    if (!hydrated || semRascunho) return;
    const t = setTimeout(() => setDone(true), GERACAO_SIMULADA_MS);
    return () => clearTimeout(t);
  }, [hydrated, semRascunho]);

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

        {/* Balão único de status — vira "pronta" quando o job real concluir. */}
        <div className="voc-surface voc-step-row" role="status" aria-live="polite">
          {done ? (
            <span className="voc-step-num" aria-hidden="true">✓</span>
          ) : (
            <span className="voc-spinner" aria-hidden="true" />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="voc-ink" style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
              {done ? "Amostra pronta" : "Gerando amostra…"}
            </p>
            <p className="voc-ink-2" style={{ fontSize: 12, margin: "2px 0 0" }}>
              {done
                ? "Já dá pra ouvir e decidir se aprova essa voz."
                : "Moderação, composição e salvamento acontecem aqui. Isso leva cerca de 60s."}
            </p>
          </div>
          <span className="voc-step-status">{done ? "concluído" : "aguardando…"}</span>
        </div>

        <div className="voc-surface" style={{ marginTop: 20, padding: 14 }}>
          <p className="voc-ink-2" style={{ fontSize: 12, margin: 0, lineHeight: 1.6 }}>
            A geração de voz ainda não está integrada. Nenhuma chamada é feita e nenhum crédito é cobrado nesta
            versão.
          </p>
        </div>

        <div className="e1-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            className="e1-next"
            disabled={!done}
            aria-describedby={!done ? "gerando-motivo" : undefined}
            onClick={() => router.push("/vocalista/amostra")}
          >
            Ver amostra →
          </button>
          <button type="button" className="voc-btn-ghost" onClick={() => router.push("/vocalista/criar")}>
            Voltar
          </button>
        </div>
        {!done && (
          <p className="voc-ink-2" id="gerando-motivo" role="status" style={{ fontSize: 12, marginTop: 12, textAlign: "center" }}>
            Aguarde a geração terminar para ver a amostra.
          </p>
        )}
      </div>
    </div>
  );
}
