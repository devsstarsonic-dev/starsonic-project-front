"use client";

import { CompositionVersion } from "@/lib/types";
import { AudioPlayer } from "./AudioPlayer";

interface Props {
  version: CompositionVersion;
  title: string;
  isPrimary: boolean;
  onDownload?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
}

export function VersionCard({
  version,
  title,
  isPrimary,
  onDownload,
  onFavorite,
  onShare,
}: Props) {
  const bgColor = isPrimary
    ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
    : "linear-gradient(135deg, #a855f7, #ec4899)";

  const badgeBg = isPrimary
    ? "rgba(0, 212, 255, 0.1)"
    : "rgba(168, 85, 247, 0.1)";
  const badgeColor = isPrimary ? "var(--cyan-1)" : "var(--purple)";

  return (
    <div
      style={{
        background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: 18,
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 10,
            background: bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            flexShrink: 0,
          }}
        >
          {isPrimary ? "🎵" : "🎶"}
        </div>

        <div style={{ flex: 1 }}>
          <h4
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 800,
              fontSize: 15,
              color: "var(--white)",
              marginBottom: 3,
            }}
          >
            {title} · v{version.version}
          </h4>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {version.duration} · {version.genre} · v5
          </div>
          <span
            style={{
              display: "inline-block",
              background: badgeBg,
              border: `1px solid ${badgeColor}`,
              color: badgeColor,
              padding: "2px 8px",
              borderRadius: "100px",
              fontSize: 9,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              marginTop: 4,
            }}
          >
            {version.badge}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <AudioPlayer audioUrl={version.audioUrl} primary={isPrimary} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onDownload}
          style={{
            flex: 1,
            minWidth: 100,
            background: "var(--bg-card)",
            color: "var(--text-1)",
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: 13,
            padding: "9px 16px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = "var(--bg-card-2)";
            (e.target as HTMLElement).style.borderColor = "var(--border-strong)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = "var(--bg-card)";
            (e.target as HTMLElement).style.borderColor = "var(--border)";
          }}
        >
          ⬇ Baixar MP3
        </button>
        <button
          onClick={() => alert("Abrindo letra...")}
          style={{
            flex: 1,
            minWidth: 100,
            background: "var(--bg-card)",
            color: "var(--text-1)",
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: 13,
            padding: "9px 16px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = "var(--bg-card-2)";
            (e.target as HTMLElement).style.borderColor = "var(--border-strong)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = "var(--bg-card)";
            (e.target as HTMLElement).style.borderColor = "var(--border)";
          }}
        >
          📄 Letra
        </button>
        <button
          onClick={onFavorite}
          style={{
            flex: 1,
            minWidth: 100,
            background: "var(--bg-card)",
            color: "var(--text-1)",
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: 13,
            padding: "9px 16px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = "var(--bg-card-2)";
            (e.target as HTMLElement).style.borderColor = "var(--border-strong)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = "var(--bg-card)";
            (e.target as HTMLElement).style.borderColor = "var(--border)";
          }}
        >
          ⭐ Favoritar
        </button>
        <button
          onClick={onShare}
          style={{
            flex: 1,
            minWidth: 100,
            background: "var(--bg-card)",
            color: "var(--text-1)",
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: 13,
            padding: "9px 16px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = "var(--bg-card-2)";
            (e.target as HTMLElement).style.borderColor = "var(--border-strong)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = "var(--bg-card)";
            (e.target as HTMLElement).style.borderColor = "var(--border)";
          }}
        >
          🔗 Compartilhar
        </button>
      </div>
    </div>
  );
}
