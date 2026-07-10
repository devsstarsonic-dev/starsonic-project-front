import { StatCard } from "@/components/store/StatCard";
import { CatalogVendaClient } from "@/components/store/CatalogVendaClient";
import { Icon } from "@/components/store/Icon";
import { formatBRL } from "@/lib/format";
import { getCreations, getStoreListings } from "@/lib/data";
import type { StoreSong } from "@/lib/types";

const SELLABLE_KINDS = new Set(["music", "instrumental", "jingle"]);

export default async function CatalogoVendaPage() {
  const [creations, listings] = await Promise.all([getCreations(), getStoreListings()]);

  const listingByCreation = new Map(listings.map((l) => [l.creation_id, l]));

  // Só músicas/instrumentais/jingles finalizados com áudio pronto entram no
  // catálogo à venda (mesmo critério do Explorar público, ver getAllCreations).
  const songs: StoreSong[] = creations
    .filter((c) => SELLABLE_KINDS.has(c.kind) && c.status === "finalized" && c.audio_url)
    .map((c) => {
      const listing = listingByCreation.get(c.id);
      return {
        id: c.id,
        title: c.title,
        duration: c.duration,
        genre: c.genre || "—",
        priceCents: listing?.price_cents ?? 0,
        sales: 0, // ponytail: sem tabela "sales" ainda — ver /minha-loja/vendas
        revenueCents: 0,
        onSale: listing?.on_sale ?? false,
        gradientFrom: c.gradient_from,
        gradientTo: c.gradient_to,
        audioUrl: c.audio_url,
        imageUrl: c.image_url || null,
      };
    });

  const onSaleCount = songs.filter((s) => s.onSale).length;
  const totalSales = songs.reduce((sum, s) => sum + s.sales, 0);
  const revenueCents = songs.reduce((sum, s) => sum + s.revenueCents, 0);

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
        <StatCard label="Total no catálogo" value={songs.length} icon="music" color="var(--cyan-1)" sub="criações" index={0} />
        <StatCard label="À venda" value={onSaleCount} icon="store" color="var(--green)" sub="publicadas" index={1} />
        <StatCard label="Vendas total" value={totalSales} icon="coins" color="var(--yellow)" sub="unidades" index={2} />
        <StatCard label="Faturamento total" value={formatBRL(revenueCents)} icon="wallet" color="var(--purple)" sub="acumulado" index={3} />
      </div>

      {/* Abas + tabela (trata estado vazio internamente) */}
      <CatalogVendaClient songs={songs} />

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
