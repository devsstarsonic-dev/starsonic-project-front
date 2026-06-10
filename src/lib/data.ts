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

// Enquanto não há login, trabalhamos com o primeiro perfil (usuário demo).
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data as Profile | null;
}

export async function getCreations(): Promise<Creation[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("creations")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Creation[]) ?? [];
}

export async function getNotifications(): Promise<Notification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Notification[]) ?? [];
}

export async function getCatalogSongs(): Promise<CatalogSong[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("catalog_songs")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as CatalogSong[]) ?? [];
}

export async function getPlans(): Promise<Plan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("plans")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as Plan[]) ?? [];
}

export async function getDsps(): Promise<Dsp[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dsps")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as Dsp[]) ?? [];
}

export async function getPresets(): Promise<Preset[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("presets")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as Preset[]) ?? [];
}
