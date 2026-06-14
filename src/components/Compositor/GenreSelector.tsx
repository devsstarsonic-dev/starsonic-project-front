"use client";

import { useState, useEffect } from "react";
import { GENRES, GENRE_DESCRIPTIONS } from "@/lib/data/genres";

const MOBILE_VISIBLE_COUNT = 10;
const MOBILE_BREAKPOINT = 1024;

interface Props {
  selected: string;
  onChange: (genre: string) => void;
}

export function GenreSelector({ selected, onChange }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const genresToShow =
    !isMobile || showAll ? GENRES : GENRES.slice(0, MOBILE_VISIBLE_COUNT);
  const hiddenCount = GENRES.length - MOBILE_VISIBLE_COUNT;

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
              <div
                style={{
                  fontFamily: "var(--font-display)",
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
                  fontFamily: "var(--font-editorial)",
                }}
              >
                {description}
              </div>
            </button>
          );
        })}
      </div>

      {isMobile && !showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            marginTop: 12,
            background: "none",
            border: "none",
            color: "var(--cyan-1)",
            fontFamily: "var(--font-editorial)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            padding: "6px 0",
          }}
        >
          Ver mais {hiddenCount} gêneros →
        </button>
      )}

      {isMobile && showAll && (
        <button
          onClick={() => setShowAll(false)}
          style={{
            marginTop: 12,
            background: "none",
            border: "none",
            color: "var(--text-3)",
            fontFamily: "var(--font-editorial)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            padding: "6px 0",
          }}
        >
          Ver menos ↑
        </button>
      )}
    </div>
  );
}
