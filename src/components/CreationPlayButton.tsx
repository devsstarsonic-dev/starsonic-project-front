"use client";

import { useNowPlaying } from "@/lib/nowPlaying/NowPlayingContext";
import type { Creation } from "@/lib/types";

// Botão de play de uma criação na lista de "Minhas Criações".
// Usa o player global: ao clicar, toca a música e ela aparece no painel direito
// (capa + título + controles), estilo Spotify.
const PlayGlyph = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const PauseGlyph = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);

export function CreationPlayButton({ creation, round = false }: { creation: Creation; round?: boolean }) {
  const player = useNowPlaying();
  const audioUrl = creation.audio_url;
  const isActive = player?.track?.id === audioUrl;
  const playing = isActive && !!player?.playing;

  // Sem áudio (ex.: criações de exemplo) → botão desabilitado.
  if (!audioUrl) {
    if (round) {
      return (
        <button className="music-play-btn" style={{ opacity: 0.4, cursor: "not-allowed" }} disabled aria-label="Áudio indisponível">
          <PlayGlyph />
        </button>
      );
    }
    return (
      <button className="btn-pill" style={{ padding: "6px 10px", opacity: 0.4, cursor: "not-allowed" }} disabled title="Áudio indisponível">
        ▶
      </button>
    );
  }

  function handleClick() {
    if (!player) return;
    if (isActive) {
      player.toggle();
    } else {
      player.playTrack({
        id: audioUrl,
        audioUrl,
        title: creation.title,
        subtitle: creation.genre || "Star Sonic",
        imageUrl: creation.image_url || null,
        primary: true,
      });
    }
  }

  // Variante redonda (igual à tabela do dashboard).
  if (round) {
    return (
      <button
        className="music-play-btn"
        onClick={handleClick}
        aria-label={playing ? "Pausar" : `Reproduzir ${creation.title}`}
        style={playing ? { background: "rgba(0,212,255,0.2)", borderColor: "var(--cyan-1)", color: "var(--cyan-1)" } : undefined}
      >
        {playing ? <PauseGlyph /> : <PlayGlyph />}
      </button>
    );
  }

  return (
    <button
      className="btn-pill"
      onClick={handleClick}
      style={{
        padding: "6px 12px",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        ...(playing
          ? { background: "rgba(0,212,255,0.15)", borderColor: "var(--border-strong)", color: "var(--cyan-1)" }
          : {}),
      }}
      title={playing ? "Pausar" : "Reproduzir"}
    >
      {playing ? "❚❚ Tocando" : "▶ Ouvir"}
    </button>
  );
}
