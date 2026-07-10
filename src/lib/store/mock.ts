import type { StoreProfile, StoreSong, Sale, Withdrawal } from "@/lib/types";

// Dados da Minha Loja. Tudo vazio: as tabelas ainda não existem no schema.
// ponytail: trocar estes retornos pelas queries do Supabase — as telas já
// tratam o estado vazio e passam a preencher sozinhas.
// (O catálogo à venda já usa dados reais — ver getCreations/getStoreListings
// em src/lib/data.ts e src/app/(app)/minha-loja/catalogo/page.tsx. As
// funções abaixo ainda são usadas pela preview do Star Card e pela tela de
// saques.)

export function getStoreProfile(): StoreProfile {
  return {
    username: "artista",
    name: "Seu Nome",
    bio: "",
    themeColor: "#06b6d4",
    socials: { instagram: "", tiktok: "", youtube: "", twitter: "", spotify: "" },
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

// Métricas de audiência da vitrine pública. Dependem de analytics do star.so,
// que ainda não existe — `null` significa "sem dado", e a UI mostra "—".
export function getStoreOverviewStats() {
  return {
    visits30d: null as number | null,
    linkClicks: null as number | null,
    conversionPct: null as number | null,
    storeRevenueCents: 0,
  };
}

// Saldo de saque. Sem tabela de vendas não há saldo a apurar.
export function getStoreBalance() {
  return {
    availableCents: 0,
    processingCents: 0,
    pixKey: null as string | null,
    pixKeyType: null as string | null,
    freeLimitUsedCents: 0,
    freeLimitCents: 500_000,
  };
}
