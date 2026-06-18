"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AudioPlayer } from "@/components/Compositor/AudioPlayer";
import type { Creation } from "@/lib/types";

const FAILED = new Set([
  "CREATE_TASK_FAILED",
  "GENERATE_MP4_FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Na fila…",
  GENERATING: "Renderizando o vídeo…",
  SUCCESS: "Concluído!",
};

export function CoverStudio({ musics }: { musics: Creation[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(musics[0]?.id ?? null);
  const [mode, setMode] = useState<"mp4" | "clipe">("mp4");
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selected = musics.find((m) => m.id === selectedId) ?? null;

  function stopPoll() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }
  useEffect(() => stopPoll, []);

  // Ao trocar de música, reseta e mostra o vídeo já existente (se houver).
  useEffect(() => {
    setError(null);
    setStatus(null);
    setGenerating(false);
    setVideoUrl(mode === "mp4" ? selected?.video_url ?? null : null);
    stopPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, mode]);

  async function persistVideo(creationId: string, url: string) {
    const sb = createClient();
    await sb.from("creations").update({ has_video: true, video_url: url }).eq("id", creationId);
  }

  async function generate() {
    if (!selected || generating) return;

    // Videoclipe com cenas usará outro modelo de IA — ainda não disponível.
    if (mode === "clipe") {
      setError("O videoclipe com cenas (outro modelo de IA) chega em breve. Por enquanto, gere o MP4 com áudio + capa.");
      return;
    }

    if (!selected.suno_task_id || !selected.suno_audio_id) {
      setError("Esta música não tem os dados da Suno (foi criada antes do recurso de vídeo). Gere uma música nova para criar o clipe.");
      return;
    }
    setError(null);
    setVideoUrl(null);
    setGenerating(true);
    setStatus("PENDING");

    try {
      const res = await fetch("/api/criar-musica/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selected.suno_task_id,
          audioId: selected.suno_audio_id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.taskId) {
        setError(data.error ?? "Não foi possível iniciar a geração do vídeo.");
        setGenerating(false);
        return;
      }

      const videoTask = data.taskId as string;
      const creationId = selected.id;
      stopPoll();

      const check = async () => {
        try {
          const r = await fetch(`/api/criar-musica/video/status?taskId=${encodeURIComponent(videoTask)}`);
          const d = await r.json();
          if (!r.ok) {
            setError(d.error ?? "Erro ao consultar o vídeo.");
            setGenerating(false);
            stopPoll();
            return;
          }
          setStatus(d.status);
          if (d.videoUrl) {
            setVideoUrl(d.videoUrl);
            setGenerating(false);
            stopPoll();
            void persistVideo(creationId, d.videoUrl);
          } else if (FAILED.has(d.status)) {
            setError("A geração do vídeo falhou na Suno. Tente novamente.");
            setGenerating(false);
            stopPoll();
          }
        } catch {
          // erro de rede transitório — tenta de novo no próximo ciclo
        }
      };

      check();
      pollRef.current = setInterval(check, 5000);
    } catch {
      setError("Falha de conexão ao enviar para a API.");
      setGenerating(false);
    }
  }

  if (musics.length === 0) {
    return (
      <div className="card-glow" style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 18, color: "var(--white)", marginBottom: 6 }}>
          Você ainda não tem músicas
        </div>
        <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 18 }}>
          Crie uma música primeiro para transformá-la em vídeo clipe.
        </div>
        <Link href="/criar-musica" className="btn-primary">🎵 Criar música</Link>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 1fr) minmax(320px, 1.2fr)", gap: 20, alignItems: "start" }}>
      {/* Coluna esquerda: escolher a música */}
      <div className="card-glow" style={{ padding: 18 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
          1 · Escolha a música
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 520, overflowY: "auto" }}>
          {musics.map((m) => {
            const active = m.id === selectedId;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 10,
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "left",
                  background: active ? "rgba(0,212,255,0.1)" : "var(--bg-card)",
                  border: `1px solid ${active ? "var(--border-strong)" : "var(--border-soft)"}`,
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: m.image_url
                      ? `center / cover url(${m.image_url})`
                      : `linear-gradient(135deg, ${m.gradient_from}, ${m.gradient_to})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {!m.image_url && (m.emoji || "🎵")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {[m.genre, m.duration].filter(Boolean).join(" · ")}
                  </div>
                </div>
                {m.video_url && (
                  <span className="badge purple" style={{ flexShrink: 0 }}>🎬 vídeo</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Coluna direita: gerar / preview do vídeo */}
      <div className="card-glow" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>
          2 · Escolha o formato
        </div>

        {/* Duas opções: MP4 (Suno) ou videoclipe com IA (em breve) */}
        <div style={{ display: "flex", gap: 8 }}>
          {([
            { key: "mp4", label: "🎞️ MP4 (áudio + capa)", sub: "Suno" },
            { key: "clipe", label: "🎬 Videoclipe IA", sub: "em breve" },
          ] as const).map((opt) => {
            const active = mode === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setMode(opt.key)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "left",
                  background: active ? "rgba(0,212,255,0.1)" : "var(--bg-card)",
                  border: `1px solid ${active ? "var(--border-strong)" : "var(--border-soft)"}`,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 12, color: active ? "var(--cyan-1)" : "var(--text-1)" }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                  {opt.sub}
                </div>
              </button>
            );
          })}
        </div>

        {selected && (
          <>

            {/* Player de vídeo quando pronto */}
            {videoUrl ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  src={videoUrl}
                  controls
                  poster={selected.image_url || undefined}
                  style={{ width: "50%", borderRadius: 12, background: "#000", border: "1px solid var(--border)" }}
                />
                <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ justifyContent: "center" }}>
                  ⬇ Baixar vídeo (MP4)
                </a>
              </div>
            ) : (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: selected.image_url
                    ? `center / cover url(${selected.image_url})`
                    : `linear-gradient(135deg, ${selected.gradient_from}, ${selected.gradient_to})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ position: "absolute", inset: 0, background: "rgba(5,6,32,0.45)" }} />
                {generating ? (
                  <div style={{ position: "relative", textAlign: "center" }}>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        border: "3px solid var(--cyan-1)",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        display: "inline-block",
                        marginBottom: 10,
                      }}
                    />
                    <div style={{ color: "var(--white)", fontSize: 13, fontWeight: 600 }}>
                      {STATUS_LABEL[status ?? "PENDING"] ?? "Processando…"}
                    </div>
                    <div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 2 }}>
                      O vídeo costuma levar 1-3 minutos
                    </div>
                  </div>
                ) : (
                  <div style={{ position: "relative", textAlign: "center", color: "var(--text-2)", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
                    {mode === "mp4" ? (
                      "🎞️ Pré-visualização (áudio + capa)"
                    ) : (
                      <>
                        🎬 Videoclipe com cenas
                        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
                          em breve · outro modelo de IA
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {!videoUrl && (
              <button
                className="btn-primary"
                onClick={generate}
                disabled={generating}
                style={{ justifyContent: "center", opacity: generating ? 0.7 : 1 }}
              >
                {generating
                  ? "Gerando…"
                  : mode === "mp4"
                    ? "🎞️ Gerar MP4 (áudio + capa)"
                    : "🎬 Gerar videoclipe"}
              </button>
            )}

            {error && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: "rgba(251, 146, 60, 0.08)",
                  border: "1px solid rgba(251, 146, 60, 0.25)",
                  color: "var(--orange)",
                  fontSize: 13,
                }}
              >
                ⚠️ {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
