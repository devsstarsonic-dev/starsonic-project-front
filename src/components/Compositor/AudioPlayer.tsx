"use client";

import { type MouseEvent } from "react";
import { useNowPlaying } from "@/lib/nowPlaying/NowPlayingContext";

interface Props {
  audioUrl: string;
  title?: string;
  /** Texto secundário (gênero/artista) exibido no painel "tocando agora". */
  subtitle?: string;
  /** Capa gerada pela Suno; cai no emoji se ausente. */
  imageUrl?: string | null;
  /** Esquema de cor: primário (ciano) ou secundário (roxo/rosa). */
  primary?: boolean;
  /** Link para baixar o MP3; se presente, mostra o botão de download. */
  downloadHref?: string;
  /** Convidado: o download não baixa, dispara onLockedAction (ir pro cadastro). */
  lockDownload?: boolean;
  onLockedAction?: () => void;
}

function fmt(t: number): string {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AudioPlayer({
  audioUrl,
  title,
  subtitle,
  imageUrl,
  primary = true,
  downloadHref,
  lockDownload = false,
  onLockedAction,
}: Props) {
  const player = useNowPlaying();

  // Esta faixa é a que está ativa no player global?
  const isActive = player?.track?.id === audioUrl;
  const playing = isActive && !!player?.playing;
  const current = isActive ? player!.current : 0;
  const duration = isActive ? player!.duration : 0;
  const volume = player?.volume ?? 1;
  const muted = player?.muted ?? false;

  function toggle() {
    if (!player) return;
    if (isActive) {
      player.toggle();
    } else {
      player.playTrack({
        id: audioUrl,
        audioUrl,
        title: title || "Sua música",
        subtitle,
        imageUrl,
        primary,
      });
    }
  }

  function seek(e: MouseEvent<HTMLDivElement>) {
    if (!player || !isActive || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    player.seekTo(ratio * duration);
  }

  const accent = primary ? "var(--cyan-1)" : "var(--purple)";
  const grad = primary
    ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
    : "linear-gradient(135deg, #a855f7, #ec4899)";
  const glow = primary ? "rgba(0, 212, 255, 0.35)" : "rgba(168, 85, 247, 0.35)";
  const progress = duration ? (current / duration) * 100 : 0;
  const volPct = muted ? 0 : volume * 100;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: 14,
        borderRadius: 14,
        background:
          "linear-gradient(180deg, rgba(10, 10, 46, 0.55), rgba(5, 6, 32, 0.55))",
        border: "1px solid var(--border)",
        backdropFilter: "blur(8px)",
        boxShadow: playing ? `0 0 24px ${glow}` : "none",
        transition: "box-shadow .3s ease",
      }}
    >
      {/* Capa + botão play */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pausar" : "Reproduzir"}
        style={{
          position: "relative",
          width: 52,
          height: 52,
          borderRadius: 12,
          flexShrink: 0,
          border: "none",
          cursor: "pointer",
          background: imageUrl ? `center / cover url(${imageUrl})` : grad,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 16px ${glow}`,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: imageUrl ? "rgba(5, 6, 32, 0.45)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {playing ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
              <rect x="6" y="5" width="4" height="14" rx="1.5" />
              <rect x="14" y="5" width="4" height="14" rx="1.5" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
              <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.79-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14z" />
            </svg>
          )}
        </span>
      </button>

      {/* Centro: título + barra de progresso */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "var(--white)",
              marginBottom: 7,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "var(--text-3)",
              minWidth: 34,
            }}
          >
            {fmt(current)}
          </span>

          {/* Trilha clicável */}
          <div
            onClick={seek}
            style={{
              flex: 1,
              height: 8,
              borderRadius: 100,
              background: "rgba(0, 212, 255, 0.12)",
              cursor: isActive ? "pointer" : "default",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${progress}%`,
                borderRadius: 100,
                background: grad,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `calc(${progress}% - 6px)`,
                top: "50%",
                transform: "translateY(-50%)",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#fff",
                boxShadow: `0 0 8px ${glow}`,
                opacity: isActive ? 1 : 0,
                pointerEvents: "none",
              }}
            />
          </div>

          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "var(--text-3)",
              minWidth: 34,
              textAlign: "right",
            }}
          >
            {fmt(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
      >
        <button
          type="button"
          onClick={() => player?.toggleMute()}
          aria-label={muted ? "Ativar som" : "Silenciar"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: accent,
            display: "flex",
            padding: 0,
          }}
        >
          {muted || volume === 0 ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => player?.setVolume(parseFloat(e.target.value))}
          aria-label="Volume"
          style={{
            width: 64,
            height: 5,
            accentColor: primary ? "#00d4ff" : "#a855f7",
            background: `linear-gradient(to right, ${accent} ${volPct}%, rgba(0,212,255,0.12) ${volPct}%)`,
            borderRadius: 100,
            cursor: "pointer",
          }}
        />
      </div>

      {/* Download (opcional). Convidado: botão leva ao cadastro. */}
      {downloadHref &&
        (lockDownload ? (
          <button
            type="button"
            onClick={onLockedAction}
            title="Crie uma conta para baixar"
            aria-label="Crie uma conta para baixar"
            style={{
              flexShrink: 0,
              width: 38,
              height: 38,
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </button>
        ) : (
          <a
            href={downloadHref}
            title="Baixar MP3"
            aria-label="Baixar MP3"
            style={{
              flexShrink: 0,
              width: 38,
              height: 38,
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </a>
        ))}
    </div>
  );
}
