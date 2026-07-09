import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  Profile,
  Plan,
  CatalogSong,
  Dsp,
  Preset,
  Creation,
  Notification,
  Sale,
  Withdrawal,
} from "@/lib/types";

// cache() do React deduplica chamadas idênticas dentro da mesma request SSR.
// Assim, getProfile() chamado no layout e numa page não gera duas queries ao Supabase.

export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();

  // Com login ativo: retorna o profile do usuário autenticado (id = auth.uid()).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    return data as Profile | null;
  }

  // Fallback (modo demo, sem login): primeiro/mais antigo profile.
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data as Profile | null;
});

// Todos os usuários, pra tela de administrador (ver src/app/(app)/admin).
export const getAllProfiles = cache(async (): Promise<Profile[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Profile[]) ?? [];
});

// Criações do usuário logado (apenas o profile dele).
export const getCreations = cache(async (): Promise<Creation[]> => {
  const profile = await getProfile();
  if (!profile) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("creations")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });
  return (data as Creation[]) ?? [];
});

// TODAS as criações (de todos os profiles) — usado no Explorar/Catálogo.
// Inclui o autor (nome do profile) via join.
export type CatalogCreation = Creation & {
  profiles?: { full_name: string | null; avatar_initial: string | null } | null;
};

export const getAllCreations = cache(async (): Promise<CatalogCreation[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("creations")
    .select("*, profiles(full_name, avatar_initial)")
    .in("kind", ["music", "instrumental", "jingle"])
    .not("audio_url", "eq", "")
    .order("created_at", { ascending: false });
  return (data as CatalogCreation[]) ?? [];
});

// Playlists do usuário (tabela "playlist"). Cada linha é UMA playlist; a coluna
// "creations_id" (jsonb) guarda um array com os ids das músicas.
export type PlaylistGroup = {
  id: string;
  name: string;
  creationsId: string[];
  songs: Creation[];
};

export const getPlaylists = cache(async (): Promise<PlaylistGroup[]> => {
  const profile = await getProfile();
  if (!profile) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("playlist")
    .select("id, name, creations_id, created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: true });

  const rows = (data as unknown as { id: string; name: string; creations_id: unknown }[]) ?? [];
  const asIds = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);

  // Busca todas as criações referenciadas em uma única query.
  const allIds = Array.from(new Set(rows.flatMap((r) => asIds(r.creations_id))));
  const byId = new Map<string, Creation>();
  if (allIds.length) {
    const { data: cs } = await supabase.from("creations").select("*").in("id", allIds);
    for (const c of (cs as Creation[]) ?? []) byId.set(c.id, c);
  }

  return rows.map((r) => {
    const ids = asIds(r.creations_id);
    return {
      id: r.id,
      name: r.name,
      creationsId: ids,
      songs: ids.map((id) => byId.get(id)).filter(Boolean) as Creation[],
    };
  });
});

// Uma playlist específica (por id) com suas músicas (na ordem do array).
export const getPlaylistById = cache(async (id: string): Promise<PlaylistGroup | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("playlist")
    .select("id, name, creations_id")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const row = data as unknown as { id: string; name: string; creations_id: unknown };
  const ids = Array.isArray(row.creations_id) ? row.creations_id.filter((x) => typeof x === "string") : [];

  const byId = new Map<string, Creation>();
  if (ids.length) {
    const { data: cs } = await supabase.from("creations").select("*").in("id", ids);
    for (const c of (cs as Creation[]) ?? []) byId.set(c.id, c);
  }

  return {
    id: row.id,
    name: row.name,
    creationsId: ids,
    songs: ids.map((cid) => byId.get(cid)).filter(Boolean) as Creation[],
  };
});

// Versão leve usada pelo layout: só busca id, is_public e total_plays para montar dashStats.
// Evita carregar o payload completo das criações em todas as navegações.
export const getCreationStats = cache(async (): Promise<{
  total: number;
  inCatalog: number;
}> => {
  const profile = await getProfile();
  if (!profile) return { total: 0, inCatalog: 0 };
  const supabase = await createClient();
  const { data } = await supabase
    .from("creations")
    .select("id, is_public")
    .eq("profile_id", profile.id);
  const rows = (data as { id: string; is_public: boolean }[]) ?? [];
  return {
    total: rows.length,
    inCatalog: rows.filter((r) => r.is_public).length,
  };
});

// Respostas do formulário do compositor, ligadas à criação (música).
export const getCreationAnswers = cache(
  async (creationId: string): Promise<Record<string, unknown> | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("creation_answers")
      .select("answers")
      .eq("creation_id", creationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return (data?.answers as Record<string, unknown>) ?? null;
  },
);

// Campos que o app define ao salvar uma criação; o resto usa os defaults da tabela.
export type NewCreation = Partial<Omit<Creation, "id" | "created_at">> & {
  title: string;
};

export async function createCreation(input: NewCreation): Promise<Creation | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("creations")
    .insert(input)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return (data as Creation) ?? null;
}

export const getNotifications = cache(async (): Promise<Notification[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Notification[]) ?? [];
});

export const getCatalogSongs = cache(async (): Promise<CatalogSong[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("catalog_songs")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as CatalogSong[]) ?? [];
});

export const getPlans = cache(async (): Promise<Plan[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("plans")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as Plan[]) ?? [];
});

export const getDsps = cache(async (): Promise<Dsp[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dsps")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as Dsp[]) ?? [];
});

export const getPresets = cache(async (): Promise<Preset[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("presets")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as Preset[]) ?? [];
});

// ponytail: tables sales/withdrawals don't exist yet · add to schema.sql when needed
export const getSales = cache(async (): Promise<Sale[]> => {
  return [];
});

export const getWithdrawals = cache(async (): Promise<Withdrawal[]> => {
  return [];
});
