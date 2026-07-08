import { StatCard } from "@/components/store/StatCard";
import { StoreTabs } from "@/components/store/StoreTabs";
import { CatalogTable } from "@/components/store/CatalogTable";
import { Icon } from "@/components/store/Icon";
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

      {/* KPIs */}
      <div className="store-kpis">
        <StatCard label="Total no catálogo" value={stats.totalCatalog} icon="music" color="var(--cyan-1)" sub="criações" index={0} />
        <StatCard label="À venda" value={onSaleCount} icon="store" color="var(--green)" sub="publicadas" index={1} />
        <StatCard label="Vendas total" value={stats.totalSales} icon="coins" color="var(--yellow)" sub="unidades" index={2} />
        <StatCard label="Faturamento total" value={formatBRL(stats.revenueCents)} icon="wallet" color="var(--purple)" sub="acumulado" index={3} />
      </div>

      {/* Abas */}
      <StoreTabs
        tabs={[
          { key: "on-sale", label: `À venda (${onSaleCount})` },
          { key: "all", label: `Suas criações (${songs.length})` },
        ]}
      />

      {/* Tabela catálogo (trata estado vazio internamente) */}
      <CatalogTable songs={songs} />

      {/* Info comissão */}
      <div
        className="card store-rise"
        style={{
          marginTop: 24,
          padding: "14px 18px",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(168, 85, 247, 0.04))",
          border: "1px solid rgba(0, 212, 255, 0.2)",
          animationDelay: "120ms",
        }}
      >
        <span style={{ color: "var(--cyan-1)", flexShrink: 0, marginTop: 1 }}>
          <Icon name="info" size={18} />
        </span>
        <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
          <strong style={{ color: "var(--cyan-1)" }}>Comissão da plataforma:</strong> 5% quando o cliente vem da sua Star Card
          (link direto), 30% quando vem do marketplace geral. O restante cai no seu saldo em até 24h.
        </div>
      </div>
    </section>
  );
}
