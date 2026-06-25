"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AudioPlayer } from "@/components/Compositor/AudioPlayer";
import { Icon } from "@/components/Icon";
import type { Creation } from "@/lib/types";

const FAILED = new Set([
  "CREATE_TASK_FAILED",
  "GENERATE_MP4_FAILED",
  "FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

const DURATIONS = [
  { value: 4, label: "4s" },
  { value: 6, label: "6s" },
  { value: 8, label: "8s" },
];
const RESOLUTIONS = ["480p", "720p", "1080p"];

// Estúdio focado APENAS em videoclipes (KIE AI). Gera o vídeo a partir da
// descrição da cena + a letra e o estilo da música selecionada.
export function VideoStudio({ musics }: { musics: Creation[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(musics[0]?.id ?? null);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(6);
  const [resolution, setResolution] = useState("720p");

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

  useEffect(() => {
    setError(null);
    setStatus(null);
    setGenerating(false);
    setOutUrl(selected?.video_url ?? null);
    stopPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  async function persistVideo(creationId: string, url: string) {
    const sb = createClient();
    await sb.from("creations").update({ has_video: true, video_url: url }).eq("id", creationId);
  }

  async function gerar() {
    if (!selected || generating) return;
    setError(null);
    setOutUrl(null);
    setGenerating(true);
    setStatus("PENDING");

    const lyricSnippet = (selected.lyrics ?? "").replace(/\s+/g, " ").trim().slice(0, 600);
    const fullPrompt = [
      `Videoclipe para a música "${selected.title}"`,
      selected.genre ? `estilo ${selected.genre}` : "",
      prompt.trim(),
      lyricSnippet ? `baseado na letra: ${lyricSnippet}` : "",
      "cinematográfico, cenas que contam a história da letra, alta qualidade",
    ]
      .filter(Boolean)
      .join(", ")
      .slice(0, 1500);

    try {
      const res = await fetch("/api/kie/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt, aspectRatio: "16:9", duration, resolution }),
      });
      const data = await res.json();
      if (!res.ok || !data.taskId) {
        setError(data.error ?? "Não foi possível iniciar o videoclipe.");
        setGenerating(false);
        return;
      }
      const vt = data.taskId as string;
      const creationId = selected.id;
      stopPoll();
      const check = async () => {
        try {
          const r = await fetch(`/api/kie/video/status?taskId=${encodeURIComponent(vt)}`);
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
    } catch {
      setError("Falha de conexão.");
      setGenerating(false);
    }
  }

  if (musics.length === 0) {
    return (
      <div className="card-glow" style={{ padding: 32, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, color: "var(--cyan-1)" }}>
          <Icon name="film" size={40} strokeWidth={1.5} />
        </div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 18, color: "var(--white)", marginBottom: 6 }}>
          Você ainda não tem músicas
        </div>
        <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 18 }}>
          Crie uma música primeiro para gerar o videoclipe.
        </div>
        <Link href="/criar-musica" className="btn-primary"><Icon name="music" size={15} /> Criar música</Link>
      </div>
    );
  }

  const pill = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: 100,
    cursor: generating ? "not-allowed" : "pointer",
    background: active ? "linear-gradient(135deg, #00d4ff, #3b9eff)" : "var(--bg-card)",
    color: active ? "var(--bg-deep)" : "var(--text-1)",
    border: active ? "none" : "1px solid var(--border-soft)",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 13,
    transition: "all 0.15s",
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 0.85fr) minmax(360px, 1.4fr)", gap: 20, alignItems: "start" }}>
      {/* Esquerda: escolher a música */}
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
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 10,
                    flexShrink: 0,
                    color: "#fff",
                    background: m.image_url ? `center / cover url(${m.image_url})` : `linear-gradient(135deg, ${m.gradient_from}, ${m.gradient_to})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!m.image_url && <Icon name="music" size={18} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {[m.genre, m.duration].filter(Boolean).join(" · ")}
                  </div>
                </div>
                {m.video_url && <span className="badge cyan" style={{ flexShrink: 0 }}><Icon name="film" size={11} /></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Direita: gerar videoclipe */}
      <div className="card-glow" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
        {selected && (
          <>
            <AudioPlayer audioUrl={selected.audio_url} title={selected.title} subtitle={selected.genre || "Star Sonic"} imageUrl={selected.image_url} />

            <textarea
              className="wiz-textarea"
              placeholder="Descreva a cena do videoclipe (ex.: cidade neon à noite, câmera lenta, luzes ciano e roxo, clima futurista)…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              disabled={generating}
            />

            {/* Duração */}
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
                Duração
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DURATIONS.map((d) => (
                  <button key={d.value} onClick={() => setDuration(d.value)} disabled={generating} style={pill(duration === d.value)}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolução */}
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
                Resolução
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {RESOLUTIONS.map((r) => (
                  <button key={r} onClick={() => setResolution(r)} disabled={generating} style={pill(resolution === r)}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Resultado */}
            {outUrl ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video src={outUrl} controls poster={selected.image_url || undefined} style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "contain", borderRadius: 12, background: "#000", border: "1px solid var(--border)" }} />
                <a href={outUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ justifyContent: "center" }}>
                  <Icon name="download" size={15} /> Baixar videoclipe (MP4)
                </a>
              </div>
            ) : (
              <>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: selected.image_url ? `center / cover url(${selected.image_url})` : "linear-gradient(135deg, #1a0840, #050520)",
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
                      <div style={{ color: "var(--white)", fontSize: 13, fontWeight: 600 }}>{status === "PENDING" ? "Na fila…" : "Renderizando…"}</div>
                      <div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 2 }}>pode levar alguns minutos</div>
                    </div>
                  ) : (
                    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, color: "var(--text-2)", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
                      <Icon name="play" size={14} /> Pré-visualização
                    </div>
                  )}
                </div>
                <button className="btn-primary" onClick={gerar} disabled={generating} style={{ justifyContent: "center", opacity: generating ? 0.7 : 1 }}>
                  {generating ? "Gerando…" : <><Icon name="film" size={15} /> Gerar videoclipe</>}
                </button>
              </>
            )}

            <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
              Gerado da descrição + letra (nome, estilo {selected.genre || "—"}) · {duration}s · {resolution}
              {selected.lyrics ? "" : " · ⚠ sem letra salva"}
            </div>

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
