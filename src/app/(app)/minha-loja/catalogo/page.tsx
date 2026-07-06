import { StatCard } from "@/components/store/StatCard";
import { StoreTabs } from "@/components/store/StoreTabs";
import { CatalogTable } from "@/components/store/CatalogTable";
import { formatBRL } from "@/lib/format";
import { getStoreSongs, getStoreStats } from "@/lib/store/mock";

export default function CatalogoVendaPage() {
  const songs = getStoreSongs();
  const stats = getStoreStats();
  const onSaleCount = songs.filter((s) => s.onSale).length;

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <div className="page-title">Catálogo à venda</div>
          <div className="page-sub">Escolha quais das suas criações ficam disponíveis na sua loja</div>
        </div>
      </div>

      {/* Stats — 4 cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total no catálogo" value={stats.totalCatalog} sub="criações" />
        <StatCard label="À venda" value={onSaleCount} sub="publicadas" color="var(--green)" />
        <StatCard label="Vendas total" value={stats.totalSales} sub="unidades" color="var(--yellow)" />
        <StatCard label="Faturamento total" value={formatBRL(stats.revenueCents)} color="var(--purple)" />
      </div>

      {/* Abas */}
      <StoreTabs
        tabs={[
          { key: "on-sale", label: `À venda (${onSaleCount})` },
          { key: "all", label: `Suas criações (${songs.length})` },
        ]}
      />

      {/* Tabela catálogo */}
      <CatalogTable songs={songs} />

      {/* Info comissão */}
      <div
        className="card"
        style={{
          marginTop: 24,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(168, 85, 247, 0.04))",
          border: "1px solid rgba(0, 212, 255, 0.2)",
        }}
      >
        <span style={{ color: "var(--cyan-1)", fontSize: 20 }}>ℹ️</span>
        <div style={{ fontSize: 13, color: "var(--text-2)" }}>
          <strong style={{ color: "var(--cyan-1)" }}>Comissão da plataforma:</strong> 5% quando o cliente vem da sua Star Card (link direto), 30%
          quando vem do marketplace geral. O restante cai no seu saldo em até 24h.
        </div>
      </div>
    </section>
  );
}
