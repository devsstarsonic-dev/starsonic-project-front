import { MinhaLojaClient } from "@/components/store/MinhaLojaClient";
import { getStoreProfile, getStoreSongs, getStoreOverviewStats } from "@/lib/store/mock";
import { getCreations, getStoreListings } from "@/lib/data";
import type { StoreSong } from "@/lib/types";

const SELLABLE_KINDS = new Set(["music", "instrumental", "jingle"]);

export default async function MinhaLojaPage() {
  const profile = getStoreProfile();
  const previewSongs = getStoreSongs();
  const stats = getStoreOverviewStats();

  const [creations, listings] = await Promise.all([getCreations(), getStoreListings()]);
  const listingByCreation = new Map(listings.map((l) => [l.creation_id, l]));

  // Só músicas/instrumentais/jingles finalizados com áudio pronto entram no
  // catálogo à venda (mesmo critério do Explorar público, ver getAllCreations).
  const catalogSongs: StoreSong[] = creations
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

  return (
    <MinhaLojaClient profile={profile} previewSongs={previewSongs} stats={stats} catalogSongs={catalogSongs} />
  );
}
