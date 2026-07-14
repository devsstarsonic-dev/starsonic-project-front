"use client";

import { useState } from "react";
import type { StoreSong } from "@/lib/types";
import { StoreTabs } from "./StoreTabs";
import { CatalogTable } from "./CatalogTable";
import { EmptyState } from "./EmptyState";

// Dono do estado da aba (StoreTabs é "burro"/controlado) e do filtro da
// lista antes de passar pra CatalogTable — as abas eram só decorativas
// antes (StoreTabs/CatalogTable ficavam soltas na page, sem ligação).
// Começa em "all" pra quem chega sem nada à venda ainda ver o que tem pra
// selecionar, em vez de cair direto num catálogo "vazio".
export function CatalogVendaClient({ songs }: { songs: StoreSong[] }) {
  const [activeTab, setActiveTab] = useState(songs.some((s) => s.onSale) ? "on-sale" : "all");

  const onSaleCount = songs.filter((s) => s.onSale).length;
  const visible = activeTab === "on-sale" ? songs.filter((s) => s.onSale) : songs;

  return (
    <>
      <StoreTabs
        tabs={[
          { key: "on-sale", label: `À venda (${onSaleCount})` },
          { key: "all", label: `Suas criações (${songs.length})` },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {activeTab === "on-sale" && songs.length > 0 && visible.length === 0 ? (
        <div className="card-glow store-table-card store-rise" style={{ marginBottom: 24 }}>
          <EmptyState
            icon="store"
            title="Nenhuma música à venda ainda"
            description="Ative o toggle “À venda” nas suas criações para elas aparecerem aqui."
            compact
          />
          <div style={{ textAlign: "center", paddingBottom: 20 }}>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className="btn-secondary"
              style={{ fontSize: 12, padding: "8px 16px" }}
            >
              Ver suas criações
            </button>
          </div>
        </div>
      ) : (
        <CatalogTable songs={visible} />
      )}
    </>
  );
}
