"use client";

import { useNowPlaying } from "@/lib/nowPlaying/NowPlayingContext";
import type { Creation } from "@/lib/types";

// Botão de play de uma criação na lista de "Minhas Criações".
// Usa o player global: ao clicar, toca a música e ela aparece no painel direito
// (capa + título + controles), estilo Spotify.
export function CreationPlayButton({ creation }: { creation: Creation }) {
  const player = useNowPlaying();
  const audioUrl = creation.audio_url;
  const isActive = player?.track?.id === audioUrl;
  const playing = isActive && !!player?.playing;

  // Sem áudio (ex.: criações de exemplo) → botão desabilitado.
  if (!audioUrl) {
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
