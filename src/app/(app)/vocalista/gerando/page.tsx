"use client";

/**
 * Etapa 02 do Vocalista — "Gerando amostra".
 *
 * Geração REAL: monta o estilo/letra da amostra a partir do rascunho, cria a
 * task na Suno (/api/criar-musica) e faz polling do resultado. Quando o áudio
 * fica pronto, guarda a URL da amostra no draft (sampleUrl…) e libera a etapa
 * de aprovação. Mesmo padrão generate→poll do compositor (ReviewPanel).
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useVocalista } from "@/lib/vocalista/VocalistaContext";
import { Icon } from "@/components/Icon";
import { MUSIC_FAILED, type Track } from "@/lib/suno/status";
import { buildSampleTitle, buildVoiceSampleStyle, SAMPLE_LYRICS } from "@/lib/vocalista/voiceSample";

export default function GerandoPage() {
  const router = useRouter();
  const { draft, hydrated, updateDraft } = useVocalista();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const semRascunho = !draft.name.trim();

  // Sem rascunho não há o que gerar.
  useEffect(() => {
    if (hydrated && semRascunho) router.replace("/vocalista/criar");
  }, [hydrated, semRascunho, router]);

  useEffect(() => {
    router.prefetch("/vocalista/amostra");
  }, [router]);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };
  useEffect(() => stopPolling, []);

  // Dispara a geração real na Suno, uma vez.
  useEffect(() => {
    if (!hydrated || semRascunho || startedRef.current) return;
    startedRef.current = true;

    (async () => {
      let taskId: string | null = null;
      try {
        const res = await fetch("/api/criar-musica", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: buildSampleTitle(draft),
            style: buildVoiceSampleStyle(draft),
            lyrics: SAMPLE_LYRICS,
            instrumental: false,
            model: "V5_5",
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.taskId) {
          setError(data.error ?? "Não foi possível iniciar a geração da amostra.");
          return;
        }
        taskId = data.taskId;
      } catch {
        setError("Falha de conexão ao gerar a amostra.");
        return;
      }

      const check = async () => {
        try {
          const res = await fetch(`/api/criar-musica/status?taskId=${encodeURIComponent(taskId!)}`);
          const data = await res.json();
          if (!res.ok) return;
          const tracks = (Array.isArray(data.tracks) ? data.tracks : []) as Track[];
          const ready = tracks.find((t) => t.audioUrl);
          if (ready?.audioUrl) {
            updateDraft({
              sampleUrl: ready.audioUrl,
              sampleImageUrl: ready.imageUrl ?? undefined,
              sampleDuration: ready.duration ?? undefined,
              sampleTaskId: ready.id ? taskId! : undefined,
              sampleAudioId: ready.id ?? undefined,
            });
            setDone(true);
            stopPolling();
            return;
          }
          if (MUSIC_FAILED.has(String(data.status))) {
            setError("A geração da amostra falhou. Ajuste a descrição e tente de novo.");
            stopPolling();
          }
        } catch {
          // erro de rede transitório — tenta de novo no próximo ciclo
        }
      };
      check();
      pollRef.current = setInterval(check, 5000);
    })();
  }, [hydrated, semRascunho, draft, updateDraft]);

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

        {/* Balão único de status — vira "pronta" quando a Suno concluir. */}
        <div className="voc-surface voc-step-row" role="status" aria-live="polite">
          {error ? (
            <span className="voc-step-num" aria-hidden="true">⚠</span>
          ) : done ? (
            <span className="voc-step-num" aria-hidden="true">✓</span>
          ) : (
            <span className="voc-spinner" aria-hidden="true" />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="voc-ink" style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
              {error ? "Não deu certo" : done ? "Amostra pronta" : "Gerando amostra…"}
            </p>
            <p className="voc-ink-2" style={{ fontSize: 12, margin: "2px 0 0" }}>
              {error
                ? error
                : done
                  ? "Já dá pra ouvir e decidir se aprova essa voz."
                  : "Estamos compondo a amostra da voz. Isso leva cerca de 60s."}
            </p>
          </div>
          <span className="voc-step-status">{error ? "erro" : done ? "concluído" : "aguardando…"}</span>
        </div>

        <div className="e1-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            className="e1-next"
            disabled={!done}
            aria-describedby={!done && !error ? "gerando-motivo" : undefined}
            onClick={() => router.push("/vocalista/amostra")}
          >
            Ver amostra →
          </button>
          <button type="button" className="voc-btn-ghost" onClick={() => router.push("/vocalista/criar")}>
            {error ? "Ajustar e tentar de novo" : "Voltar"}
          </button>
        </div>
        {!done && !error && (
          <p className="voc-ink-2" id="gerando-motivo" role="status" style={{ fontSize: 12, marginTop: 12, textAlign: "center" }}>
            Aguarde a geração terminar para ver a amostra.
          </p>
        )}
      </div>
    </div>
  );
}
