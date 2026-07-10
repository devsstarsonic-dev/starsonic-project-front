"use client";

import { useEffect, useState } from "react";
import type { StoreSong } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { useNowPlaying } from "@/lib/nowPlaying/NowPlayingContext";
import { Toggle } from "./Toggle";
import { PriceInput } from "./PriceInput";
import { EmptyState } from "./EmptyState";

const PlayGlyph = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const PauseGlyph = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);

export function CatalogTable({ songs }: { songs: StoreSong[] }) {
  const [items, setItems] = useState(songs);
  const [error, setError] = useState<string | null>(null);
  const player = useNowPlaying();

  // Sincroniza quando o pai troca a lista (ex.: mudança de aba em CatalogVendaClient).
  useEffect(() => setItems(songs), [songs]);

  async function patchListing(id: string, patch: { on_sale?: boolean; price_cents?: number }) {
    setError(null);
    try {
      const res = await fetch("/api/store/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creation_id: id, ...patch }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Não foi possível salvar.");
      }
    } catch (e) {
      // Reverte a mudança otimista se a gravação falhar.
      setItems(songs);
      setError(e instanceof Error ? e.message : "Falha de conexão ao salvar.");
    }
  }

  const handleToggleSale = (id: string, onSale: boolean) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, onSale } : s)));
    patchListing(id, { on_sale: onSale });
  };

  const handlePriceChange = (id: string, cents: number) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, priceCents: cents } : s)));
    patchListing(id, { price_cents: cents });
  };

  const handlePlay = (song: StoreSong) => {
    if (!player || !song.audioUrl) return;
    if (player.track?.id === song.audioUrl) {
      player.toggle();
      return;
    }
    player.playTrack({
      id: song.audioUrl,
      audioUrl: song.audioUrl,
      title: song.title,
      subtitle: song.genre || "Star Sonic",
      imageUrl: song.imageUrl,
      primary: true,
    });
  };

  if (items.length === 0) {
    return (
      <div className="card-glow store-table-card store-rise" style={{ marginBottom: 24 }}>
        <EmptyState
          icon="music"
          title="Nenhuma criação no catálogo ainda"
          description="Suas músicas finalizadas aparecem aqui. Publique uma criação para começar a vender na sua loja."
          cta={{ label: "Criar música", href: "/criar-musica" }}
        />
      </div>
    );
  }

  return (
    <div className="card-glow store-table-card store-rise" style={{ marginBottom: 24 }}>
      {error && (
        <div style={{ margin: "0 16px 12px", padding: "10px 14px", borderRadius: 10, background: "rgba(251, 146, 60, 0.08)", border: "1px solid rgba(251, 146, 60, 0.25)", color: "var(--orange)", fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}
      <div className="store-table-wrap">
        <table className="store-table">
          <thead>
            <tr>
              <th style={{ width: "46%" }}>Música</th>
              <th style={{ width: "16%" }}>Preço</th>
              <th style={{ width: "12%" }}>Vendas</th>
              <th style={{ width: "16%" }}>Faturado</th>
              <th style={{ width: "10%" }}>À venda</th>
            </tr>
          </thead>
          <tbody>
            {items.map((song) => {
              const isActive = !!player && player.track?.id === song.audioUrl;
              const playing = isActive && player.playing;
              return (
                <tr key={song.id} style={{ opacity: song.onSale ? 1 : 0.6 }}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <button
                        type="button"
                        onClick={() => handlePlay(song)}
                        disabled={!song.audioUrl}
                        aria-label={playing ? "Pausar" : `Reproduzir ${song.title}`}
                        title={song.audioUrl ? (playing ? "Pausar" : "Reproduzir") : "Áudio indisponível"}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: `linear-gradient(135deg, ${song.gradientFrom}, ${song.gradientTo})`,
                          flexShrink: 0,
                          border: "none",
                          cursor: song.audioUrl ? "pointer" : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          opacity: song.audioUrl ? 1 : 0.5,
                        }}
                      >
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "rgba(0,0,0,0.45)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {playing ? <PauseGlyph /> : <PlayGlyph />}
                        </span>
                      </button>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--white)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {song.title}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-3)" }}>{song.duration}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <PriceInput initialCents={song.priceCents} onChange={(c) => handlePriceChange(song.id, c)} />
                  </td>
                  <td className="num" style={{ color: "var(--white)" }}>
                    {song.sales}
                  </td>
                  <td className="num" style={{ color: "var(--green)", fontWeight: 600 }}>
                    {formatBRL(song.revenueCents)}
                  </td>
                  <td>
                    <Toggle
                      checked={song.onSale}
                      onChange={(v) => handleToggleSale(song.id, v)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
