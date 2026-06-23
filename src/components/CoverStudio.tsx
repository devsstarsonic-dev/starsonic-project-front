"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AudioPlayer } from "@/components/Compositor/AudioPlayer";
import { Icon, type IconName } from "@/components/Icon";
import type { Creation } from "@/lib/types";

type Mode = "video" | "thumb" | "mp4";

const FAILED = new Set([
  "CREATE_TASK_FAILED",
  "GENERATE_MP4_FAILED",
  "GENERATE_AUDIO_FAILED",
  "FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

const TABS: { key: Mode; label: string; icon: IconName; sub: string }[] = [
  { key: "video", label: "Videoclipe", icon: "film", sub: "Cenas com IA · KIE" },
  { key: "thumb", label: "Miniatura", icon: "image", sub: "Thumbnail YouTube · KIE" },
  { key: "mp4", label: "Capa com letra", icon: "mic", sub: "MP4 cantado · Suno" },
];

export function CoverStudio({ musics }: { musics: Creation[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(musics[0]?.id ?? null);
  const [mode, setMode] = useState<Mode>("video");
  const [prompt, setPrompt] = useState("");
  const [vidDuration, setVidDuration] = useState(15); // segundos

  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [thumbPrompt, setThumbPrompt] = useState("");
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
    setImgUrl(null);
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

    // Prompt combina o que o usuário digitou + nome e estilo da música.
    const fullPrompt = [
      `Videoclipe para a música "${selected.title}"`,
      selected.genre ? `estilo ${selected.genre}` : "",
      prompt.trim(),
      "cinematográfico, alta qualidade, coerente com o ritmo da música",
    ]
      .filter(Boolean)
      .join(", ")
      .slice(0, 900);

    try {
      const res = await fetch("/api/kie/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          imageUrl: selected.image_url || "",
          aspectRatio: "16:9",
          duration: vidDuration,
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

  // ===== Miniatura (KIE imagem · thumbnail YouTube 16:9) =====
  function startImagePoll(taskId: string) {
    stopPoll();
    const check = async () => {
      try {
        const r = await fetch(`/api/kie/image/status?taskId=${encodeURIComponent(taskId)}`);
        const d = await r.json();
        if (!r.ok) {
          setError(d.error ?? "Erro ao consultar a miniatura.");
          setGenerating(false);
          stopPoll();
          return;
        }
        setStatus(d.status);
        if (d.imageUrl) {
          setImgUrl(d.imageUrl);
          setGenerating(false);
          stopPoll();
        } else if (FAILED.has(d.status)) {
          setError("A geração da miniatura falhou. Tente novamente.");
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

  async function genThumb() {
    if (!selected || generating) return;
    setError(null);
    setImgUrl(null);
    setGenerating(true);
    setStatus("PENDING");

    const lyricSnippet = (selected.lyrics ?? "").replace(/\s+/g, " ").trim().slice(0, 220);
    const autoPrompt = [
      `Thumbnail de YouTube (16:9, 1280x720) para a música "${selected.title}"`,
      selected.genre ? `gênero ${selected.genre}` : "",
      thumbPrompt.trim() ? thumbPrompt.trim() : "",
      lyricSnippet ? `inspirada na letra: ${lyricSnippet}` : "",
      "composição chamativa, cores vibrantes, alto contraste, foco central, alta qualidade",
    ]
      .filter(Boolean)
      .join(", ")
      .slice(0, 900);

    try {
      const res = await fetch("/api/kie/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: autoPrompt, aspectRatio: "16:9", size: "1280x720" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível gerar a miniatura.");
        setGenerating(false);
        return;
      }
      if (data.imageUrl) {
        // Síncrono: já veio a imagem.
        setImgUrl(data.imageUrl);
        setGenerating(false);
        return;
      }
      if (data.taskId) {
        startImagePoll(data.taskId);
      } else {
        setError("Resposta inesperada da KIE.");
        setGenerating(false);
      }
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
          Crie uma música primeiro para transformá-la em vídeo, capa ou foto.
        </div>
        <Link href="/criar-musica" className="btn-primary"><Icon name="music" size={15} /> Criar música</Link>
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
                  {!m.image_url && <Icon name="music" size={18} style={{ color: "#fff" }} />}
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
                <div style={{ marginBottom: 4, display: "flex", justifyContent: "center", color: active ? "var(--cyan-1)" : "var(--text-2)" }}>
                  <Icon name={t.icon} size={22} strokeWidth={1.7} />
                </div>
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

                {/* Duração do vídeo */}
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
                    Duração do vídeo
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { value: 5, label: "5s" },
                      { value: 15, label: "15s" },
                      { value: 35, label: "35s" },
                      { value: 60, label: "1 min" },
                    ].map((d) => {
                      const active = vidDuration === d.value;
                      return (
                        <button
                          key={d.value}
                          onClick={() => setVidDuration(d.value)}
                          disabled={generating}
                          style={{
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
                          }}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <ResultArea
                  outUrl={outUrl}
                  generating={generating}
                  status={status}
                  poster={selected.image_url}
                  ctaLabel="Gerar videoclipe (IA)"
                  ctaIcon="film"
                  onGenerate={genVideoKie}
                  hint={`Baseado no nome, estilo (${selected.genre || "—"}) e na sua descrição · ${vidDuration === 60 ? "1 min" : `${vidDuration}s`}`}
                />
              </>
            )}

            {/* ===== ABA MINIATURA (KIE imagem · 16:9 YouTube) ===== */}
            {mode === "thumb" && (
              <>
                <textarea
                  className="wiz-textarea"
                  placeholder="Detalhes extras da miniatura (opcional) — ex.: rosto em destaque, texto grande, estética anos 80…"
                  value={thumbPrompt}
                  onChange={(e) => setThumbPrompt(e.target.value)}
                  rows={2}
                  disabled={generating}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {imgUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`Miniatura · ${selected.title}`}
                        style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", borderRadius: 12, border: "1px solid var(--border)" }}
                      />
                      <a href={imgUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ justifyContent: "center" }}>
                        <Icon name="download" size={15} /> Baixar miniatura (1280×720)
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
                        background: selected.image_url ? `center / cover url(${selected.image_url})` : "linear-gradient(135deg, #1a0840, #050520)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ position: "absolute", inset: 0, background: "rgba(5,6,32,0.55)" }} />
                      {generating ? (
                        <div style={{ position: "relative", textAlign: "center" }}>
                          <span style={{ width: 34, height: 34, border: "3px solid var(--cyan-1)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block", marginBottom: 10 }} />
                          <div style={{ color: "var(--white)", fontSize: 13, fontWeight: 600 }}>{status === "PENDING" ? "Na fila…" : "Gerando miniatura…"}</div>
                        </div>
                      ) : (
                        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, color: "var(--text-2)", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
                          <Icon name="image" size={14} /> Miniatura 16:9 (YouTube)
                        </div>
                      )}
                    </div>
                  )}
                  {!imgUrl && (
                    <button className="btn-primary" onClick={genThumb} disabled={generating} style={{ justifyContent: "center", opacity: generating ? 0.7 : 1 }}>
                      {generating ? "Gerando…" : <><Icon name="image" size={15} /> Gerar miniatura</>}
                    </button>
                  )}
                  <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
                    Imagem gerada pela KIE AI com base na letra e no estilo da música.
                  </div>
                </div>
              </>
            )}

            {/* ===== ABA CAPA COM LETRA (Suno mp4) ===== */}
            {mode === "mp4" && (
              <ResultArea
                outUrl={outUrl}
                generating={generating}
                status={status}
                poster={selected.image_url}
                ctaLabel="Gerar capa com letra (MP4)"
                ctaIcon="mic"
                onGenerate={genMp4Suno}
                hint="MP4 com a capa e a música cantada (Suno)."
              />
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
  ctaIcon,
  onGenerate,
  hint,
}: {
  outUrl: string | null;
  generating: boolean;
  status: string | null;
  poster?: string | null;
  ctaLabel: string;
  ctaIcon: IconName;
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
            <Icon name="download" size={15} /> Baixar vídeo (MP4)
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
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, color: "var(--text-2)", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
              <Icon name="play" size={14} /> Pré-visualização
            </div>
          )}
        </div>
      )}

      {!outUrl && (
        <button className="btn-primary" onClick={onGenerate} disabled={generating} style={{ justifyContent: "center", opacity: generating ? 0.7 : 1 }}>
          {generating ? "Gerando…" : <><Icon name={ctaIcon} size={15} /> {ctaLabel}</>}
        </button>
      )}
      <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>{hint}</div>
    </div>
  );
}
