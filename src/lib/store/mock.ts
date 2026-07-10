import type { StoreProfile, Sale, Withdrawal } from "@/lib/types";

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

export function getSales(): Sale[] {
  return [];
}

export function getWithdrawals(): Withdrawal[] {
  return [];
}
