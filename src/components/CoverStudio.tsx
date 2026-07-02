"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AudioPlayer } from "@/components/Compositor/AudioPlayer";
import { Icon, type IconName } from "@/components/Icon";
import type { Creation } from "@/lib/types";
import { IMAGE_FAILED } from "@/lib/suno/status";
import { useMediaPoll } from "@/lib/hooks/useMediaPoll";
import { persistVideo, buildMediaPrompt } from "@/lib/creations";

type Mode = "video" | "thumb";

const TABS: { key: Mode; label: string; icon: IconName; }[] = [
  { key: "video", label: "Vídeo curto com IA", icon: "film"},
  { key: "thumb", label: "Imagem", icon: "image" },
];

export function CoverStudio({ musics }: { musics: Creation[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(musics[0]?.id ?? null);
  const [mode, setMode] = useState<Mode>("video");
  const [prompt, setPrompt] = useState("");
  const [vidDuration, setVidDuration] = useState(6); // segundos
  const [vidResolution, setVidResolution] = useState("720p");

  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [thumbPrompt, setThumbPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { start: startMediaPoll, stop: stopPoll } = useMediaPoll();

  const selected = musics.find((m) => m.id === selectedId) ?? null;

  // Reset ao trocar de música ou de aba.
  useEffect(() => {
    setError(null);
    setStatus(null);
    setGenerating(false);
    setOutUrl(mode === "video" ? selected?.video_url ?? null : null);
    setImgUrl(null);
    stopPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, mode]);

  // Poll de vídeo (KIE ou Suno) → persiste a URL na criação ao concluir.
  function startPoll(statusUrl: string, creationId: string) {
    startMediaPoll({
      url: statusUrl,
      resultKey: "videoUrl",
      failed: IMAGE_FAILED,
      onStatus: setStatus,
      onResult: (url) => {
        setOutUrl(url);
        setGenerating(false);
        void persistVideo(creationId, url);
      },
      onError: (msg) => {
        setError(msg);
        setGenerating(false);
      },
    });
  }

  // ===== Videoclipe (KIE AI / Veo) =====
  async function genVideoKie() {
    if (!selected || generating) return;
    setError(null);
    setOutUrl(null);
    setGenerating(true);
    setStatus("PENDING");

    // Prompt: descrição digitada + nome/estilo + a LETRA da música (coluna lyrics).
    // Não usa a foto/capa — o vídeo é gerado a partir do texto (text-to-video).
    const fullPrompt = buildMediaPrompt({
      kind: "video",
      title: selected.title,
      genre: selected.genre,
      lyrics: selected.lyrics,
      userPrompt: prompt,
      maxLength: 1500,
      lyricsLength: 600,
    });

    try {
      const res = await fetch("/api/kie/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          // sem imageUrl → geração por texto (descrição + letra), não pela capa
          aspectRatio: "16:9",
          duration: vidDuration,
          resolution: vidResolution,
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

  // ===== Miniatura (KIE imagem · thumbnail YouTube 16:9) =====
  function startImagePoll(taskId: string) {
    startMediaPoll({
      url: `/api/kie/image/status?taskId=${encodeURIComponent(taskId)}`,
      resultKey: "imageUrl",
      failed: IMAGE_FAILED,
      onStatus: setStatus,
      onResult: (url) => {
        setImgUrl(url);
        setGenerating(false);
      },
      onError: (msg) => {
        setError(msg);
        setGenerating(false);
      },
    });
  }

  async function genThumb() {
    if (!selected || generating) return;
    setError(null);
    setImgUrl(null);
    setGenerating(true);
    setStatus("PENDING");

    const autoPrompt = buildMediaPrompt({
      kind: "image",
      title: selected.title,
      genre: selected.genre,
      lyrics: selected.lyrics,
      userPrompt: thumbPrompt,
      maxLength: 900,
      lyricsLength: 300,
    });

    try {
      const res = await fetch("/api/kie/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: autoPrompt, size: "3:2" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível gerar a imagem.");
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
    <div className="stack-mobile" style={{ display: "grid", gridTemplateColumns: "minmax(260px, 0.9fr) minmax(340px, 1.3fr)", gap: 20, alignItems: "start" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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
                  placeholder="Descreva a cena do vídeo (ex.: cidade neon à noite, câmera lenta, luzes ciano e roxo, clima futurista)…"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  disabled={generating}
                />

                {/* Duração do vídeo */}
                <div className="flex gap-16 py-4">
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
                    Duração do vídeo
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { value: 4, label: "4s" },
                      { value: 6, label: "6s" },
                      { value: 8, label: "8s" },
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

                {/* Resolução do vídeo */}
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
                    Resolução
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["480p", "720p", "1080p"].map((r) => {
                      const active = vidResolution === r;
                      return (
                        <button
                          key={r}
                          onClick={() => setVidResolution(r)}
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
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>
                </div>

                <ResultArea
                  outUrl={outUrl}
                  generating={generating}
                  status={status}
                  poster={selected.image_url}
                  ctaLabel="Gerar vídeo curto (IA)"
                  ctaIcon="film"
                  onGenerate={genVideoKie}
                  hint={`Gerado da descrição + letra da música (nome, estilo ${selected.genre || "—"}) · ${vidDuration}s${selected.lyrics ? "" : " · ⚠ esta música não tem letra salva"}`}
                />
              </>
            )}

            {/* ===== ABA MINIATURA (KIE imagem · 16:9 YouTube) ===== */}
            {mode === "thumb" && (
              <>
                <textarea
                  className="wiz-textarea"
                  placeholder="Detalhes extras da imagem (opcional) — ex.: rosto em destaque, paisagem, estética anos 80…"
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
                        alt={`Imagem · ${selected.title}`}
                        style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover", borderRadius: 12, border: "1px solid var(--border)" }}
                      />
                      <a href={imgUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ justifyContent: "center" }}>
                        <Icon name="download" size={15} /> Baixar imagem
                      </a>
                    </>
                  ) : (
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "3 / 2",
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
                          <div style={{ color: "var(--white)", fontSize: 13, fontWeight: 600 }}>{status === "PENDING" ? "Na fila…" : "Gerando imagem…"}</div>
                        </div>
                      ) : (
                        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, color: "var(--text-2)", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
                          <Icon name="image" size={14} /> Imagem 3:2
                        </div>
                      )}
                    </div>
                  )}
                  {!imgUrl && (
                    <button className="btn-primary" onClick={genThumb} disabled={generating} style={{ justifyContent: "center", opacity: generating ? 0.7 : 1 }}>
                      {generating ? "Gerando…" : <><Icon name="image" size={15} /> Gerar imagem</>}
                    </button>
                  )}
                  <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
                    Imagem gerada com base na letra e no estilo da música.
                  </div>
                </div>
              </>
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
          <video src={outUrl} controls poster={poster || undefined} style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "contain", borderRadius: 12, background: "#000", border: "1px solid var(--border)" }} />
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
