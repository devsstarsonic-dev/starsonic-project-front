"use client";

import { useState, useMemo, memo, CSSProperties } from "react";
import { GENRES, GENRE_DESCRIPTIONS } from "@/lib/data/genres";

const VISIBLE_COUNT = 9;

interface Props {
  selected: string;
  onChange: (genre: string) => void;
}

function GenreSelectorComponent({ selected, onChange }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGenres = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return GENRES.filter((genre) => {
      const genreName = genre.toLowerCase();
      const description = (GENRE_DESCRIPTIONS[genre] || "").toLowerCase();
      return genreName.includes(query) || description.includes(query);
    });
  }, [searchQuery]);

  const genresToShow = showAll ? filteredGenres : filteredGenres.slice(0, VISIBLE_COUNT);
  const hiddenCount = filteredGenres.length - VISIBLE_COUNT;

  const inputStyle = useMemo<CSSProperties>(() => ({
    width: "100%",
    padding: "10px 14px",
    marginBottom: 14,
    background: "var(--bg-card)",
    border: "1px solid var(--border-soft)",
    borderRadius: 10,
    color: "var(--text-1)",
    fontFamily: "var(--font-editorial)",
    fontSize: 14,
    transition: "all 0.15s",
    boxSizing: "border-box",
  }), []);

  const gridStyle = useMemo<CSSProperties>(() => ({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 12,
  }), []);

  const buttonStyle = useMemo<CSSProperties>(() => ({
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
  }), []);

  return (
    <div>
      <input
        type="text"
        placeholder="Pesquisar gênero..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={inputStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--cyan-1)";
          e.currentTarget.style.background = "rgba(0, 212, 255, 0.02)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border-soft)";
          e.currentTarget.style.background = "var(--bg-card)";
        }}
      />

      <div style={gridStyle}>
        {genresToShow.map((genre) => {
          const isSelected = selected === genre;
          const description = GENRE_DESCRIPTIONS[genre];

          return (
            <button
              key={genre}
              onClick={() => onChange(isSelected ? "" : genre)}
              onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
              onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-card)"; }}
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
                transition: "background 0.15s, border-color 0.15s, transform 0.1s",
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

      {filteredGenres.length > VISIBLE_COUNT && !showAll && (
        <button onClick={() => setShowAll(true)} style={buttonStyle}>
          Ver lista completa (+{hiddenCount} gêneros) ↓
        </button>
      )}

      {showAll && filteredGenres.length > VISIBLE_COUNT && (
        <button onClick={() => setShowAll(false)} style={buttonStyle}>
          Ver menos ↑
        </button>
      )}
    </div>
  );
}

export const GenreSelector = memo(GenreSelectorComponent);
