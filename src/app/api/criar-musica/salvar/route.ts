import { NextRequest, NextResponse } from "next/server";
import { getProfile, createCreation } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { MUSIC_CREDIT_COST } from "@/lib/credits";
import { rehostToR2 } from "@/lib/r2";

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
  // "music" (com letra/vocal), "instrumental" (sem vocal) ou "jingle" (comercial curto).
  const kind = body.kind === "instrumental" ? "instrumental" : body.kind === "jingle" ? "jingle" : "music";
  const genre = String(body.style ?? "").trim();
  const audioUrl = String(body.audioUrl ?? "").trim();
  const imageUrl = String(body.imageUrl ?? "").trim();
  const lyrics = String(body.lyrics ?? "");
  const duration = formatDuration(body.duration as number | null | undefined);
  const words = lyrics.trim() ? lyrics.trim().split(/\s+/).length : 0;
  // Ids da Suno — necessários depois para gerar o vídeo clipe (mp4).
  const sunoTaskId = String(body.sunoTaskId ?? "").trim();
  const sunoAudioId = String(body.sunoAudioId ?? "").trim();
  // Respostas completas do formulário do compositor (DetailedFormData).
  const answers = (body.answers && typeof body.answers === "object") ? body.answers : null;
  const badge = String(body.badge ?? "NOVA").trim() || "NOVA";
  // Cobra crédito? (ao salvar 2 versões, só a 1ª cobra). Default: true.
  const chargeCredits = body.chargeCredits !== false;

  if (!title) {
    return NextResponse.json({ error: "Título ausente." }, { status: 400 });
  }
  if (!audioUrl) {
    return NextResponse.json({ error: "Áudio ausente — música ainda não finalizada." }, { status: 400 });
  }

  // Convidado (sem login) também salva: a criação fica com profile_id nulo
  // e é reivindicada quando ele cria a conta.
  const profile = await getProfile();

  // Re-hospeda áudio/capa no R2 (se configurado) — a URL da Suno pode expirar,
  // a do R2 não. Se falhar ou o R2 não estiver configurado, cai pra URL original.
  const mediaId = crypto.randomUUID();
  const [r2AudioUrl, r2ImageUrl] = await Promise.all([
    rehostToR2(audioUrl, `songs/${mediaId}.mp3`, "audio/mpeg"),
    imageUrl ? rehostToR2(imageUrl, `covers/${mediaId}.jpg`, "image/jpeg") : Promise.resolve(imageUrl),
  ]);

  try {
    const creation = await createCreation({
      ...(profile ? { profile_id: profile.id } : {}),
      title,
      kind,
      genre,
      duration,
      status: "finalized",
      progress: 100,
      // Nasce PRIVADA: só vai pro catálogo via "Publicar criação" em /criacoes.
      is_public: false,
      words,
      lyrics,
      badge_label: badge,
      emoji: kind === "instrumental" ? "🎹" : kind === "jingle" ? "📣" : "🎵",
      gradient_from: "#3be6ff",
      gradient_to: "#a855f7",
      audio_url: r2AudioUrl,
      image_url: r2ImageUrl,
      ...(sunoTaskId ? { suno_task_id: sunoTaskId } : {}),
      ...(sunoAudioId ? { suno_audio_id: sunoAudioId } : {}),
    });

    // Salva as respostas do formulário numa tabela própria, ligada à criação.
    if (creation?.id && answers) {
      const supabase = await createClient();
      const { error: ansErr } = await supabase
        .from("creation_answers")
        .insert({ creation_id: creation.id, answers });
      if (ansErr) console.error("[salvar] falha ao salvar creation_answers:", ansErr.message);
    }

    // Logado: desconta os créditos do profile no banco (só quando chargeCredits).
    let creditsLeft: number | null = null;
    if (profile && chargeCredits) {
      creditsLeft = Math.max(0, (profile.credits ?? 0) - MUSIC_CREDIT_COST);
      const supabase = await createClient();
      await supabase
        .from("profiles")
        .update({ credits: creditsLeft })
        .eq("id", profile.id);
    } else if (profile) {
      creditsLeft = profile.credits ?? null;
    }

    return NextResponse.json({ id: creation?.id ?? null, credits: creditsLeft });
  } catch (e) {
    // Loga o erro completo no terminal para diagnóstico (coluna/RLS faltando, etc.)
    console.error("[salvar] falha ao inserir em creations:", e);
    const msg = e instanceof Error ? e.message : "Falha ao salvar a criação.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
