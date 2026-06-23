"use client";

import { useEffect, type MouseEvent, type CSSProperties } from "react";
import { useNowPlaying } from "@/lib/nowPlaying/NowPlayingContext";

const BAR_H = 60; // altura do player (um pouco menor)

function fmt(t: number): string {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Player fixo no rodapé (estilo Spotify). Aparece quando há uma faixa tocando,
// usando o MESMO player global da sidebar (NowPlaying) — fica sincronizado.
// Estilos inline + <style> próprio para não depender do globals.css.
export function BottomPlayer() {
  const player = useNowPlaying();
  const track = player?.track;

  useEffect(() => {
    if (track) document.body.classList.add("player-open");
    else document.body.classList.remove("player-open");
    return () => document.body.classList.remove("player-open");
  }, [track]);

  if (!player || !track) return null;

  const { playing, current, duration, volume, muted } = player;
  const accent = track.primary ? "var(--cyan-1)" : "var(--purple)";
  const grad = track.primary
    ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
    : "linear-gradient(135deg, #a855f7, #ec4899)";
  const glow = track.primary ? "rgba(0,212,255,0.35)" : "rgba(168,85,247,0.35)";
  const progress = duration ? (current / duration) * 100 : 0;
  const volPct = muted ? 0 : volume * 100;

  function seek(e: MouseEvent<HTMLDivElement>) {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    player!.seekTo(ratio * duration);
  }

  const bar: CSSProperties = {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    height: BAR_H,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "0 16px",
    background: "linear-gradient(180deg, rgba(10,10,46,0.96), rgba(5,6,32,0.98))",
    borderTop: "1px solid var(--border)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 -8px 30px rgba(0,0,0,0.4)",
  };

  return (
    <>
      {/* Encolhe o app pra não cobrir conteúdo (independe do globals.css) */}
      <style>{`body.player-open .app, body.player-open .guest-app { height: calc(100vh - ${BAR_H}px); }`}</style>

      <div style={bar}>
        {/* Esquerda: capa + título */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: 220, minWidth: 0 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 7,
              flexShrink: 0,
              background: track.imageUrl ? `center / cover url(${track.imageUrl})` : grad,
              boxShadow: `0 2px 10px ${glow}`,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 12.5, color: "var(--white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {track.title}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {track.subtitle || "Star Sonic"}
            </div>
          </div>
        </div>

        {/* Centro: play + progresso (centralizado) */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, minWidth: 0 }}>
          <button
            type="button"
            onClick={() => player.toggle()}
            aria-label={playing ? "Pausar" : "Reproduzir"}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: grad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 3px 12px ${glow}`,
              flexShrink: 0,
            }}
          >
            {playing ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff">
                <rect x="6" y="5" width="4" height="14" rx="1.5" />
                <rect x="14" y="5" width="4" height="14" rx="1.5" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.79-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14z" />
              </svg>
            )}
          </button>

          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "var(--text-3)", minWidth: 32, textAlign: "right" }}>
            {fmt(current)}
          </span>
          <div
            onClick={seek}
            style={{ width: "min(46vw, 520px)", height: 5, borderRadius: 100, background: "rgba(0,212,255,0.12)", cursor: "pointer", position: "relative" }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${progress}%`, borderRadius: 100, background: grad }} />
            <div
              style={{
                position: "absolute",
                left: `calc(${progress}% - 5px)`,
                top: "50%",
                transform: "translateY(-50%)",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#fff",
                boxShadow: `0 0 8px ${glow}`,
                pointerEvents: "none",
              }}
            />
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "var(--text-3)", minWidth: 32 }}>
            {fmt(duration)}
          </span>
        </div>

        {/* Direita: volume (mesma largura da esquerda → centro fica simétrico) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, width: 220, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => player.toggleMute()}
            aria-label={muted ? "Ativar som" : "Silenciar"}
            style={{ background: "none", border: "none", cursor: "pointer", color: accent, display: "flex", padding: 0 }}
          >
            {muted || volume === 0 ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            onChange={(e) => player.setVolume(parseFloat(e.target.value))}
            aria-label="Volume"
            style={{
              width: 92,
              height: 4,
              accentColor: track.primary ? "#00d4ff" : "#a855f7",
              background: `linear-gradient(to right, ${accent} ${volPct}%, rgba(0,212,255,0.12) ${volPct}%)`,
              borderRadius: 100,
              cursor: "pointer",
            }}
          />
        </div>
      </div>
    </>
  );
}
