"use client";

import Link from "next/link";
import { AudioPlayer } from "@/components/Compositor/AudioPlayer";
import { PlaylistMenu } from "@/components/playlist/PlaylistMenu";
import { Icon } from "@/components/Icon";
import { kindLabel, timeAgo, formatPlays } from "@/lib/format";
import type { CatalogCreation } from "@/lib/data";

type PlaylistOpt = { id: string; name: string; creationsId: string[] };

// Visualização "Now Playing" estilo Spotify: capa + letra em destaque.
export function SongView({
  song,
  author,
  playlists,
  profileId,
}: {
  song: CatalogCreation;
  author: string;
  playlists: PlaylistOpt[];
  profileId: string | null;
}) {
  const cover = song.image_url
    ? `center / cover url(${song.image_url})`
    : `linear-gradient(135deg, ${song.gradient_from}, ${song.gradient_to})`;

  return (
    <section className="page" style={{ position: "relative" }}>
      {/* Fundo desfocado usando a mesma capa/gradiente */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: cover,
          filter: "blur(60px) brightness(0.35) saturate(1.3)",
          transform: "scale(1.2)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: "linear-gradient(180deg, rgba(10,10,46,0.5) 0%, rgba(10,10,46,0.88) 60%, rgba(10,10,46,0.97) 100%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/catalogo" style={{ fontSize: 12, color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            ← Voltar para Explorar
          </Link>
        </div>

        {/* Hero: capa + info */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: 16,
              flexShrink: 0,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
              background: cover,
            }}
          >
            {!song.image_url && <Icon name="music" size={72} />}
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
              {kindLabel(song.kind)}
            </div>
            <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 38, color: "var(--white)", margin: 0, lineHeight: 1.1, wordBreak: "break-word" }}>
              {song.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap", fontSize: 13, color: "var(--text-2)" }}>
              <span style={{ fontWeight: 700, color: "var(--white)" }}>{author}</span>
              {song.genre && <><span style={{ color: "var(--text-3)" }}>·</span><span>{song.genre}</span></>}
              {song.duration && <><span style={{ color: "var(--text-3)" }}>·</span><span>{song.duration}</span></>}
              <span style={{ color: "var(--text-3)" }}>·</span>
              <span>{formatPlays(song.plays ?? 0)} plays</span>
              <span style={{ color: "var(--text-3)" }}>·</span>
              <span>{timeAgo(song.created_at)}</span>
            </div>
          </div>

          <div style={{ flexShrink: 0 }}>
            <PlaylistMenu creationId={song.id} title={song.title} playlists={playlists} profileId={profileId} />
          </div>
        </div>

        {/* Player */}
        {song.audio_url && (
          <div style={{ marginBottom: 28 }}>
            <AudioPlayer
              audioUrl={song.audio_url}
              title={song.title}
              subtitle={author}
              imageUrl={song.image_url}
              primary
            />
          </div>
        )}

        {/* Letra */}
        <div
          style={{
            background: "rgba(8,10,36,0.72)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(0,212,255,0.15)",
            borderRadius: 18,
            padding: 28,
            maxWidth: 720,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>
            <Icon name="lyrics" size={13} style={{ color: "var(--cyan-1)" }} /> Letra
          </div>
          {song.lyrics?.trim() ? (
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 15, lineHeight: 1.8, color: "var(--text-1)", margin: 0 }}>
              {song.lyrics}
            </pre>
          ) : (
            <div style={{ fontSize: 13, color: "var(--text-3)" }}>Essa música ainda não tem letra cadastrada.</div>
          )}
        </div>
      </div>
    </section>
  );
}
