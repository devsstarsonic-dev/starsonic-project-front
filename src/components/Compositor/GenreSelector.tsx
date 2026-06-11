"use client";

import { GENRES, GENRE_DESCRIPTIONS } from "@/lib/data/genres";

interface Props {
  selected: string;
  onChange: (genre: string) => void;
}

export function GenreSelector({ selected, onChange }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: 12,
      }}
    >
      {GENRES.map((genre) => {
        const isSelected = selected === genre;
        const description = GENRE_DESCRIPTIONS[genre];

        return (
          <button
            key={genre}
            onClick={() => onChange(isSelected ? "" : genre)}
            style={{
              padding: 16,
              background: isSelected
                ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
                : "var(--bg-card)",
              color: isSelected ? "var(--bg-deep)" : "var(--text-1)",
              border: isSelected ? "none" : "1px solid var(--border-soft)",
              borderRadius: 12,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {genre}
            </div>
            <div
              style={{
                fontSize: 11,
                opacity: 0.7,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              {description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
