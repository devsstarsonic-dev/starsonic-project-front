import type { StoreProfile, StoreSong, Sale, Withdrawal } from "@/lib/types";

// Mock data — espelha os dados do protótipo (Demétrio)
// TODO: integração com Supabase

export function getStoreProfile(): StoreProfile {
  return {
    username: "artista",
    name: "Seu Nome",
    bio: "",
    themeColor: "#06b6d4",
    socials: {
      instagram: "",
      tiktok: "",
      youtube: "",
      twitter: "",
      spotify: "",
    },
  };
}

export function getStoreSongs(): StoreSong[] {
  return [];
}

export function getSales(): Sale[] {
  return [];
}

export function getWithdrawals(): Withdrawal[] {
  return [];
}

export function getStoreStats() {
  const songs = getStoreSongs();
  return {
    totalCatalog: songs.length,
    onSale: songs.filter((s) => s.onSale).length,
    totalSales: songs.reduce((sum, s) => sum + s.sales, 0),
    revenueCents: songs.reduce((sum, s) => sum + s.revenueCents, 0),
  };
}
