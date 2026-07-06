"use client";

import { useState } from "react";
import type { StoreSong } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { Toggle } from "./Toggle";
import { PriceInput } from "./PriceInput";

export function CatalogTable({ songs }: { songs: StoreSong[] }) {
  const [items, setItems] = useState(songs);

  const handleToggleSale = (id: string, onSale: boolean) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, onSale } : s)));
  };

  const handlePriceChange = (id: string, cents: number) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, priceCents: cents } : s)));
  };

  return (
    <div className="card-glow" style={{ padding: "6px 4px", marginBottom: 24 }}>
      <div className="table-scroll">
        <table
          className="music-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead className="music-table-head">
            <tr>
              <th style={{ textAlign: "left", padding: "12px", fontSize: 12, width: "35%" }}>Música</th>
              <th style={{ textAlign: "left", padding: "12px", fontSize: 12, width: "15%" }}>Gênero</th>
              <th style={{ textAlign: "left", padding: "12px", fontSize: 12, width: "12%" }}>Preço</th>
              <th style={{ textAlign: "left", padding: "12px", fontSize: 12, width: "10%" }}>Vendas</th>
              <th style={{ textAlign: "left", padding: "12px", fontSize: 12, width: "14%" }}>Faturado</th>
              <th style={{ textAlign: "left", padding: "12px", fontSize: 12, width: "10%" }}>À venda</th>
              <th style={{ textAlign: "left", padding: "12px", fontSize: 12, width: "12%" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((song) => (
              <tr
                key={song.id}
                style={{
                  borderBottom: "1px solid var(--border-soft)",
                  opacity: song.published ? 1 : 0.6,
                }}
              >
                <td style={{ padding: "12px", display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: `linear-gradient(135deg, ${song.gradientFrom}, ${song.gradientTo})`,
                      flexShrink: 0,
                    }}
                  />
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
                </td>
                <td style={{ padding: "12px", color: "var(--text-3)", fontSize: 12 }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 8px",
                      borderRadius: 100,
                      background: "rgba(148, 163, 184, 0.1)",
                      color: "var(--text-3)",
                      fontSize: 11,
                    }}
                  >
                    {song.genre}
                  </span>
                </td>
                <td style={{ padding: "12px" }}>
                  <PriceInput initialCents={song.priceCents} onChange={(c) => handlePriceChange(song.id, c)} />
                </td>
                <td style={{ padding: "12px", color: "var(--white)", fontSize: 13 }}>{song.sales}</td>
                <td style={{ padding: "12px", color: "var(--green)", fontWeight: 600, fontSize: 12 }}>
                  {formatBRL(song.revenueCents)}
                </td>
                <td style={{ padding: "12px" }}>
                  <Toggle checked={song.onSale} onChange={(v) => handleToggleSale(song.id, v)} />
                </td>
                <td style={{ padding: "12px" }}>
                  <button
                    className="btn-secondary"
                    style={{
                      padding: "6px 10px",
                      fontSize: 12,
                      borderRadius: 6,
                      background: song.published ? undefined : "linear-gradient(135deg, var(--cyan-1), var(--purple))",
                      color: song.published ? undefined : "#0a0a2e",
                    }}
                  >
                    {song.published ? "Editar" : "Publicar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
