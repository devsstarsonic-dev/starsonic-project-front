"use client";

import { useMemo, useState } from "react";
import { IcCheck, IcSearch } from "@/components/distribuicao/icons";
import type { Creation } from "@/lib/types";

const VISIBLE_COUNT = 10;

export function MusicPicker({ musicas, selected, onSelect }: { musicas: Creation[]; selected: string | null; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return musicas;
    return musicas.filter((m) => `${m.title} ${m.genre}`.toLowerCase().includes(q));
  }, [musicas, query]);

  const visible = query.trim() || showAll ? filtered : filtered.slice(0, VISIBLE_COUNT);

  return (
    <>
      <div className="mx-search" style={{ marginBottom: 16 }}>
        <IcSearch width={16} height={16} />
        <input
          type="text"
          placeholder="Buscar por nome ou gênero..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowAll(false);
          }}
        />
      </div>

      {visible.length === 0 ? (
        <p style={{ color: "var(--text-3)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
          Nenhuma música encontrada para &quot;{query}&quot;.
        </p>
      ) : (
        <div className="music-list">
          {visible.map((m) => (
            <div key={m.id} className={`music-item${selected === m.id ? " selected" : ""}`} onClick={() => onSelect(m.id)}>
              <div
                className="mi-cover"
                style={{
                  background: m.image_url
                    ? `center / cover url(${m.image_url})`
                    : `linear-gradient(135deg, ${m.gradient_from}, ${m.gradient_to})`,
                }}
              >
                {!m.image_url && m.emoji}
              </div>
              <div className="mi-info">
                <div className="mi-title">{m.title}</div>
                <div className="mi-meta">{[m.genre, m.duration].filter(Boolean).join(" · ")}</div>
              </div>
              <div className="mi-check"><IcCheck width={12} height={12} /></div>
            </div>
          ))}
        </div>
      )}

      {!query.trim() && !showAll && filtered.length > VISIBLE_COUNT && (
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button type="button" className="btn-pill" onClick={() => setShowAll(true)}>Ver mais</button>
        </div>
      )}
    </>
  );
}
