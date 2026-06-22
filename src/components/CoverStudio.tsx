"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AudioPlayer } from "@/components/Compositor/AudioPlayer";
import type { Creation } from "@/lib/types";

type Mode = "video" | "mp4" | "foto";

const FAILED = new Set([
  "CREATE_TASK_FAILED",
  "GENERATE_MP4_FAILED",
  "GENERATE_AUDIO_FAILED",
  "FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

const TABS: { key: Mode; label: string; icon: string; sub: string }[] = [
  { key: "video", label: "Videoclipe", icon: "🎬", sub: "Cenas com IA · KIE" },
  { key: "mp4", label: "Capa com letra", icon: "🎤", sub: "MP4 cantado · Suno" },
  { key: "foto", label: "Capa / Foto", icon: "🖼️", sub: "Imagem · Suno" },
];

export function CoverStudio({ musics }: { musics: Creation[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(musics[0]?.id ?? null);
  const [mode, setMode] = useState<Mode>("video");
  const [prompt, setPrompt] = useState("");

  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
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

  // Reset ao trocar de música ou de aba.
  useEffect(() => {
    setError(null);
    setStatus(null);
    setGenerating(false);
    setOutUrl(mode === "video" || mode === "mp4" ? selected?.video_url ?? null : null);
    stopPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, mode]);

  async function persistVideo(creationId: string, url: string) {
    const sb = createClient();
    await sb.from("creations").update({ has_video: true, video_url: url }).eq("id", creationId);
  }

  // Poll genérico de status (KIE ou Suno).
  function startPoll(statusUrl: string, creationId: string) {
    stopPoll();
    const check = async () => {
      try {
        const r = await fetch(statusUrl);
        const d = await r.json();
        if (!r.ok) {
          setError(d.error ?? "Erro ao consultar o status.");
          setGenerating(false);
          stopPoll();
          return;
        }
        setStatus(d.status);
        if (d.videoUrl) {
          setOutUrl(d.videoUrl);
          setGenerating(false);
          stopPoll();
          void persistVideo(creationId, d.videoUrl);
        } else if (FAILED.has(d.status)) {
          setError("A geração falhou. Tente novamente.");
          setGenerating(false);
          stopPoll();
        }
      } catch {
        // rede transitória
      }
    };
    check();
    pollRef.current = setInterval(check, 5000);
  }

  // ===== Videoclipe (KIE AI / Veo) =====
  async function genVideoKie() {
    if (!selected || generating) return;
    setError(null);
    setOutUrl(null);
    setGenerating(true);
    setStatus("PENDING");
    try {
      const res = await fetch("/api/kie/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim() || `Videoclipe cinematográfico para a música "${selected.title}"`,
          imageUrl: selected.image_url || "",
          aspectRatio: "16:9",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.taskId) {
        setError(data.error ?? "Não foi possível iniciar o videoclipe.");
        setGenerating(false);
        return;
      }
      startPoll(`/api/kie/video/status?taskId=${encodeURIComponent(data.taskId)}`, selected.id);
    } catch {
      setError("Falha de conexão.");
      setGenerating(false);
    }
  }

  // ===== Capa com letra (Suno mp4 = áudio + capa) =====
  async function genMp4Suno() {
    if (!selected || generating) return;
    if (!selected.suno_task_id || !selected.suno_audio_id) {
      setError("Esta música foi criada antes do recurso. Gere uma música nova para a capa cantada.");
      return;
    }
    setError(null);
    setOutUrl(null);
    setGenerating(true);
    setStatus("PENDING");
    try {
      const res = await fetch("/api/criar-musica/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: selected.suno_task_id, audioId: selected.suno_audio_id }),
      });
      const data = await res.json();
      if (!res.ok || !data.taskId) {
        setError(data.error ?? "Não foi possível iniciar a capa cantada.");
        setGenerating(false);
        return;
      }
      startPoll(`/api/criar-musica/video/status?taskId=${encodeURIComponent(data.taskId)}`, selected.id);
    } catch {
      setError("Falha de conexão.");
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
          Crie uma música primeiro para transformá-la em vídeo, capa ou foto.
        </div>
        <Link href="/criar-musica" className="btn-primary">🎵 Criar música</Link>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 0.9fr) minmax(340px, 1.3fr)", gap: 20, alignItems: "start" }}>
      {/* Coluna esquerda: escolher a música */}
      <div className="card-glow" style={{ padding: 18 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
          1 · Escolha a música
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 560, overflowY: "auto" }}>
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
                {m.video_url && <span className="badge purple" style={{ flexShrink: 0 }}>🎬</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Coluna direita: criar */}
      <div className="card-glow" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Abas das ferramentas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {TABS.map((t) => {
            const active = mode === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setMode(t.key)}
                style={{
                  padding: "12px 10px",
                  borderRadius: 14,
                  cursor: "pointer",
                  textAlign: "center",
                  background: active
                    ? "linear-gradient(135deg, rgba(0,212,255,0.18), rgba(168,85,247,0.14))"
                    : "var(--bg-card)",
                  border: `1px solid ${active ? "var(--border-strong)" : "var(--border-soft)"}`,
                  boxShadow: active ? "0 0 18px rgba(0,212,255,0.15)" : "none",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{t.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: active ? "var(--cyan-1)" : "var(--text-1)" }}>{t.label}</div>
                <div style={{ fontSize: 9.5, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{t.sub}</div>
              </button>
            );
          })}
        </div>

        {selected && (
          <>
            <AudioPlayer
              audioUrl={selected.audio_url}
              title={selected.title}
              subtitle={selected.genre || "Star Sonic"}
              imageUrl={selected.image_url}
            />

            {/* ===== ABA VÍDEO (KIE) ===== */}
            {mode === "video" && (
              <>
                <textarea
                  className="wiz-textarea"
                  placeholder="Descreva a cena do videoclipe (ex.: cidade neon à noite, câmera lenta, luzes ciano e roxo, clima futurista)…"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  disabled={generating}
                />
                <ResultArea
                  outUrl={outUrl}
                  generating={generating}
                  status={status}
                  poster={selected.image_url}
                  ctaLabel="🎬 Gerar videoclipe (IA)"
                  onGenerate={genVideoKie}
                  hint="Cenas geradas pela KIE AI a partir da capa + sua descrição."
                />
              </>
            )}

            {/* ===== ABA CAPA COM LETRA (Suno mp4) ===== */}
            {mode === "mp4" && (
              <ResultArea
                outUrl={outUrl}
                generating={generating}
                status={status}
                poster={selected.image_url}
                ctaLabel="🎤 Gerar capa com letra (MP4)"
                onGenerate={genMp4Suno}
                hint="MP4 com a capa e a música cantada (Suno)."
              />
            )}

            {/* ===== ABA FOTO / CAPA (Suno) ===== */}
            {mode === "foto" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {selected.image_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selected.image_url}
                      alt={selected.title}
                      style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border)" }}
                    />
                    <a href={selected.image_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ justifyContent: "center" }}>
                      ⬇ Baixar capa (PNG)
                    </a>
                  </>
                ) : (
                  <div style={{ padding: 28, textAlign: "center", color: "var(--text-3)", border: "1px dashed var(--border-soft)", borderRadius: 12 }}>
                    🖼️ Esta música não tem capa gerada.
                  </div>
                )}
              </div>
            )}

            {error && (
              <div style={{ padding: 12, borderRadius: 10, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", color: "var(--orange)", fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Área de resultado/geração compartilhada por Vídeo (KIE) e Capa (Suno).
function ResultArea({
  outUrl,
  generating,
  status,
  poster,
  ctaLabel,
  onGenerate,
  hint,
}: {
  outUrl: string | null;
  generating: boolean;
  status: string | null;
  poster?: string | null;
  ctaLabel: string;
  onGenerate: () => void;
  hint: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {outUrl ? (
        <>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src={outUrl} controls poster={poster || undefined} style={{ width: "100%", borderRadius: 12, background: "#000", border: "1px solid var(--border)" }} />
          <a href={outUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ justifyContent: "center" }}>
            ⬇ Baixar vídeo (MP4)
          </a>
        </>
      ) : (
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 12,
            overflow: "hidden",
            background: poster ? `center / cover url(${poster})` : "linear-gradient(135deg, #1a0840, #050520)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "rgba(5,6,32,0.5)" }} />
          {generating ? (
            <div style={{ position: "relative", textAlign: "center" }}>
              <span style={{ width: 34, height: 34, border: "3px solid var(--cyan-1)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block", marginBottom: 10 }} />
              <div style={{ color: "var(--white)", fontSize: 13, fontWeight: 600 }}>
                {status === "PENDING" ? "Na fila…" : "Renderizando…"}
              </div>
              <div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 2 }}>pode levar alguns minutos</div>
            </div>
          ) : (
            <div style={{ position: "relative", color: "var(--text-2)", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
              ▶ Pré-visualização
            </div>
          )}
        </div>
      )}

      {!outUrl && (
        <button className="btn-primary" onClick={onGenerate} disabled={generating} style={{ justifyContent: "center", opacity: generating ? 0.7 : 1 }}>
          {generating ? "Gerando…" : ctaLabel}
        </button>
      )}
      <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>{hint}</div>
    </div>
  );
}
