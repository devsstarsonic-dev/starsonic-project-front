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

export const getCreations = cache(async (): Promise<Creation[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("creations")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Creation[]) ?? [];
});

// Versão leve usada pelo layout: só busca id, is_public e total_plays para montar dashStats.
// Evita carregar o payload completo das criações em todas as navegações.
export const getCreationStats = cache(async (): Promise<{
  total: number;
  inCatalog: number;
}> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("creations")
    .select("id, is_public");
  const rows = (data as { id: string; is_public: boolean }[]) ?? [];
  return {
    total: rows.length,
    inCatalog: rows.filter((r) => r.is_public).length,
  };
});

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
