"use client";

import { useState } from "react";
import { GENRES, GENRE_DESCRIPTIONS } from "@/lib/data/genres";

const VISIBLE_COUNT = 9;

interface Props {
  selected: string;
  onChange: (genre: string) => void;
}

export function GenreSelector({ selected, onChange }: Props) {
  const [showAll, setShowAll] = useState(false);

  const genresToShow = showAll ? GENRES : GENRES.slice(0, VISIBLE_COUNT);
  const hiddenCount = GENRES.length - VISIBLE_COUNT;

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 12,
        }}
      >
        {genresToShow.map((genre) => {
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
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>
                {genre}
              </div>
              <div style={{ fontSize: 11, opacity: 0.7, fontFamily: "var(--font-editorial)" }}>
                {description}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setShowAll((v) => !v)}
        style={{
          marginTop: 12,
          background: "none",
          border: "1px solid var(--border-soft)",
          borderRadius: 8,
          color: "var(--cyan-1)",
          fontFamily: "var(--font-editorial)",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          padding: "6px 16px",
          width: "100%",
        }}
      >
        {showAll ? "Ver menos ↑" : `Ver lista completa (+${hiddenCount} gêneros) ↓`}
      </button>
    </div>
  );
}
