import type { StoreProfile, StoreSong, Sale, Withdrawal } from "@/lib/types";

// Mock data — espelha os dados do protótipo (Demétrio)
// TODO: integração com Supabase

export function getStoreProfile(): StoreProfile {
  return {
    username: "demetrio",
    name: "Demétrio",
    bio: "Compositor apaixonado por sertanejo. Faço músicas que falam da vida real.",
    themeColor: "#06b6d4",
    socials: {
      instagram: "@demetrio.mitre",
      tiktok: "@demetrio.oficial",
      youtube: "",
      twitter: "",
      spotify: "",
    },
  };
}

export function getStoreSongs(): StoreSong[] {
  return [
    {
      id: "song-1",
      title: "Coração de Papel",
      duration: "3:42",
      genre: "Sertanejo",
      priceCents: 990,
      sales: 62,
      revenueCents: 58380,
      onSale: true,
      published: true,
      gradientFrom: "#22d3ee",
      gradientTo: "#a855f7",
    },
    {
      id: "song-2",
      title: "Saudade Boa",
      duration: "4:18",
      genre: "Sertanejo raiz",
      priceCents: 1290,
      sales: 48,
      revenueCents: 61920,
      onSale: true,
      published: true,
      gradientFrom: "#a855f7",
      gradientTo: "#ec4899",
    },
    {
      id: "song-3",
      title: "Amor Verdadeiro",
      duration: "3:15",
      genre: "Universitário",
      priceCents: 890,
      sales: 35,
      revenueCents: 31150,
      onSale: true,
      published: true,
      gradientFrom: "#ec4899",
      gradientTo: "#f97316",
    },
    {
      id: "song-4",
      title: "Estrada da Vida",
      duration: "4:05",
      genre: "Sertanejo raiz",
      priceCents: 1190,
      sales: 27,
      revenueCents: 32130,
      onSale: true,
      published: true,
      gradientFrom: "#10b981",
      gradientTo: "#22d3ee",
    },
    {
      id: "song-5",
      title: "Rascunho sem título",
      duration: "2:30",
      genre: "Sertanejo",
      priceCents: 0,
      sales: 0,
      revenueCents: 0,
      onSale: false,
      published: false,
      gradientFrom: "#6366f1",
      gradientTo: "#8b5cf6",
    },
  ];
}

export function getSales(): Sale[] {
  return [
    {
      id: "sale-1",
      date: "2026-07-03T10:23:00Z",
      songTitle: "Coração de Papel",
      customer: "Ana R.",
      origin: "star_card",
      license: "pessoal",
      netCents: 940,
    },
    {
      id: "sale-2",
      date: "2026-07-02T18:45:00Z",
      songTitle: "Saudade Boa",
      customer: "Carlos M.",
      origin: "marketplace",
      license: "pessoal",
      netCents: 903,
    },
    {
      id: "sale-3",
      date: "2026-07-02T14:12:00Z",
      songTitle: "Estrada da Vida",
      customer: "João P.",
      origin: "star_card",
      license: "pessoal",
      netCents: 1130,
    },
    {
      id: "sale-4",
      date: "2026-07-01T22:38:00Z",
      songTitle: "Amor Verdadeiro",
      customer: "Marina S.",
      origin: "marketplace",
      license: "pessoal",
      netCents: 623,
    },
    {
      id: "sale-5",
      date: "2026-06-30T15:20:00Z",
      songTitle: "Saudade Boa",
      customer: "Pedro L.",
      origin: "star_card",
      license: "comercial",
      netCents: 4740,
    },
  ];
}

export function getWithdrawals(): Withdrawal[] {
  return [
    {
      id: "w-1",
      date: "2026-06-28",
      amountCents: 62000,
      method: "Pix · e-mail",
      status: "pago",
    },
    {
      id: "w-2",
      date: "2026-06-14",
      amountCents: 48000,
      method: "Pix · e-mail",
      status: "pago",
    },
    {
      id: "w-3",
      date: "2026-06-02",
      amountCents: 35500,
      method: "Pix · e-mail",
      status: "pago",
    },
  ];
}

export function getStoreStats() {
  const songs = getStoreSongs();
  return {
    totalCatalog: 84,
    onSale: songs.filter((s) => s.onSale).length,
    totalSales: songs.reduce((sum, s) => sum + s.sales, 0),
    revenueCents: songs.reduce((sum, s) => sum + s.revenueCents, 0),
  };
}
