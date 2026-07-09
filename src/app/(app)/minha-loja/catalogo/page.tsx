import { KpiCard } from "@/components/store/KpiCard";
import { StoreTabs } from "@/components/store/StoreTabs";
import { CatalogTable } from "@/components/store/CatalogTable";
import { Icon } from "@/components/store/Icon";
import { formatBRL } from "@/lib/format";
import { getStoreSongs, getStoreStats } from "@/lib/store/mock";

const ICONS = {
  camadas: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  etiqueta: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1.4" />
    </svg>
  ),
  sacola: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  carteira: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" />
      <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
    </svg>
  ),
};

export default function CatalogoVendaPage() {
  const songs = getStoreSongs();
  const stats = getStoreStats();
  const onSale = songs.filter((s) => s.onSale).length;
  const foraDaLoja = stats.totalCatalog - onSale;
  const ticketMedio = stats.totalSales ? stats.revenueCents / stats.totalSales : 0;

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <div className="page-title">Catálogo à venda</div>
          <div className="page-sub">Escolha quais das suas criações ficam disponíveis na sua loja</div>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard
          accent="cyan"
          icon={ICONS.camadas}
          label="Total no catálogo"
          value={String(stats.totalCatalog)}
          sub={`${foraDaLoja} ainda fora da loja`}
        />
        <KpiCard
          accent="purple"
          icon={ICONS.etiqueta}
          pill={`de ${stats.totalCatalog}`}
          label="À venda"
          value={String(onSale)}
          barPct={stats.totalCatalog ? (onSale / stats.totalCatalog) * 100 : 0}
        />
        <KpiCard
          accent="pink"
          icon={ICONS.sacola}
          label="Vendas total"
          value={String(stats.totalSales)}
          sub={stats.totalSales ? `ticket médio ${formatBRL(ticketMedio)}` : "nenhuma venda ainda"}
        />
        <KpiCard
          accent="emerald"
          hero
          icon={ICONS.carteira}
          label="Faturamento total"
          value={formatBRL(stats.revenueCents)}
          sub="acumulado"
        />
      </div>

      <StoreTabs
        tabs={[
          { key: "on-sale", label: `À venda (${onSale})` },
          { key: "all", label: `Suas criações (${songs.length})` },
        ]}
      />

      {/* Trata o estado vazio internamente */}
      <CatalogTable songs={songs} />

      <div className="store-card-highlight" style={{ marginTop: 24, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "var(--cyan-1)", flexShrink: 0 }}>
          <Icon name="info" size={20} />
        </span>
        <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.5 }}>
          <strong style={{ color: "var(--cyan-1)" }}>Comissão da plataforma:</strong> 5% quando o cliente vem da sua
          Star Card (link direto), 30% quando vem do marketplace geral. O restante cai no seu saldo em até 24h.
        </p>
      </div>
    </section>
  );
}
