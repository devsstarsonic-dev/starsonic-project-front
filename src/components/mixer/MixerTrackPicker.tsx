"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IcSliders, IcMusic, IcSearch } from "@/components/mixer/icons";
import type { Creation } from "@/lib/types";

const VISIBLE_COUNT = 10;

export function MixerTrackPicker({ tracks }: { tracks: Creation[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter((t) => `${t.title} ${t.genre}`.toLowerCase().includes(q));
  }, [tracks, query]);

  const visible = query.trim() ? filtered : filtered.slice(0, VISIBLE_COUNT);

  return (
    <>
      <div className="mx-search">
        <IcSearch width={16} height={16} />
        <input
          type="text"
          placeholder="Buscar por nome ou gênero..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {visible.length === 0 ? (
        <div className="mx-card" style={{ textAlign: "center", padding: "48px 20px" }}>
          <p style={{ color: "var(--text-3)", fontSize: 13 }}>Nenhuma música encontrada para &quot;{query}&quot;.</p>
        </div>
      ) : (
        <div className="mx-tracks">
          {visible.map((t) => (
            <Link key={t.id} href={`/mixer/${t.id}`} className="mx-track">
              <div
                className="mx-track-cover"
                style={{
                  background: t.image_url
                    ? `center / cover url(${t.image_url})`
                    : `linear-gradient(135deg, ${t.gradient_from}, ${t.gradient_to})`,
                }}
              >
                {!t.image_url && (t.emoji || <IcMusic width={22} height={22} color="#fff" />)}
              </div>
              <div className="mx-track-info">
                <p className="mx-track-title">{t.title}</p>
                <p className="mx-track-meta">{[t.genre, t.duration].filter(Boolean).join(" · ")}</p>
              </div>
              <span className="btn-primary" style={{ fontSize: 12, padding: "8px 16px", pointerEvents: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <IcSliders width={13} height={13} /> Remixar
              </span>
            </Link>
          ))}
        </div>
      )}

      {!query.trim() && tracks.length > VISIBLE_COUNT && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/criacoes" className="btn-pill">Ver todas as criações</Link>
        </div>
      )}
    </>
  );
}
