import { NextResponse } from "next/server";
import { getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { VoiceReference } from "@/lib/types";

// Lista as vozes criadas pelo usuário (creations kind='voice') com os metadados
// salvos em creation_answers (gênero, timbre, estilos, descrição). Usado pelo
// formulário do compositor para "Importar voz" — a voz escolhida vira referência
// no style enviado à Suno.

export async function GET() {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ voices: [] });

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("creations")
    .select("id, title, genre, lyrics, image_url, audio_url")
    .eq("profile_id", profile.id)
    .eq("kind", "voice")
    .order("created_at", { ascending: false });

  const voices = rows ?? [];
  if (voices.length === 0) return NextResponse.json({ voices: [] });

  // Metadados ricos (gênero vocal, timbre, estilos, descrição) numa única query.
  const ids = voices.map((v) => v.id);
  const answersById: Record<string, Record<string, unknown>> = {};
  const { data: ans } = await supabase
    .from("creation_answers")
    .select("creation_id, answers")
    .in("creation_id", ids);
  for (const a of ans ?? []) {
    answersById[a.creation_id as string] = (a.answers as Record<string, unknown>) ?? {};
  }

  const result: VoiceReference[] = voices.map((v) => {
    const a = answersById[v.id] ?? {};
    const styles = Array.isArray(a.styles)
      ? (a.styles as unknown[]).map((s) => String(s)).filter(Boolean)
      : v.genre
        ? String(v.genre)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    return {
      id: v.id as string,
      name: (v.title as string) ?? "Voz",
      gender: typeof a.gender === "string" ? a.gender : "",
      timbre: typeof a.timbre === "string" ? a.timbre : "",
      styles,
      description: typeof a.description === "string" ? a.description : (v.lyrics as string) ?? "",
      imageUrl: (v.image_url as string) ?? undefined,
      audioUrl: (v.audio_url as string) ?? undefined,
    };
  });

  return NextResponse.json({ voices: result });
}
