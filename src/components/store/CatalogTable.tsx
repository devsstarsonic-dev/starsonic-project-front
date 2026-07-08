"use client";

import { useState } from "react";
import type { StoreSong } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { Toggle } from "./Toggle";
import { PriceInput } from "./PriceInput";
import { EmptyState } from "./EmptyState";
import { Icon } from "./Icon";

export function CatalogTable({ songs }: { songs: StoreSong[] }) {
  const [items, setItems] = useState(songs);

  const handleToggleSale = (id: string, onSale: boolean) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, onSale } : s)));
  };

  const handlePriceChange = (id: string, cents: number) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, priceCents: cents } : s)));
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
      <div className="store-table-wrap">
        <table className="store-table">
          <thead>
            <tr>
              <th style={{ width: "34%" }}>Música</th>
              <th style={{ width: "14%" }}>Gênero</th>
              <th style={{ width: "12%" }}>Preço</th>
              <th style={{ width: "10%" }}>Vendas</th>
              <th style={{ width: "14%" }}>Faturado</th>
              <th style={{ width: "8%" }}>À venda</th>
              <th style={{ width: "8%" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((song) => (
              <tr key={song.id} style={{ opacity: song.published ? 1 : 0.6 }}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
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
                  </div>
                </td>
                <td>
                  <span className="store-pill neutral">{song.genre}</span>
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
                <td>
                  <button
                    className="btn-secondary"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "7px 11px",
                      fontSize: 12,
                      borderRadius: 7,
                      background: song.published ? undefined : "linear-gradient(135deg, var(--cyan-1), var(--purple))",
                      color: song.published ? undefined : "#0a0a2e",
                    }}
                  >
                    <Icon name={song.published ? "pencil" : "arrow-up-right"} size={13} />
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
