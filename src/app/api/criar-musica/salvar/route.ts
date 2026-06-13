import { NextRequest, NextResponse } from "next/server";
import { getProfile, createCreation } from "@/lib/data";

// Salva na tabela "creations" a música já gerada pela Suno.
// Chamado pelo formulário quando o status vira SUCCESS.

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const genre = String(body.style ?? "").trim();
  const audioUrl = String(body.audioUrl ?? "").trim();
  const duration = formatDuration(body.duration as number | null | undefined);

  if (!title) {
    return NextResponse.json({ error: "Título ausente." }, { status: 400 });
  }
  if (!audioUrl) {
    return NextResponse.json({ error: "Áudio ausente — música ainda não finalizada." }, { status: 400 });
  }

  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Perfil demo não encontrado." }, { status: 500 });
  }

  try {
    const creation = await createCreation({
      profile_id: profile.id,
      title,
      kind: "music",
      genre,
      duration,
      status: "finalized",
      progress: 100,
      badge_label: "NOVA",
      emoji: "🎵",
      audio_url: audioUrl,
    });
    return NextResponse.json({ id: creation?.id ?? null });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao salvar a criação.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
