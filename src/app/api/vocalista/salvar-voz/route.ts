import { NextRequest, NextResponse } from "next/server";
import { getProfile, createCreation } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { SAMPLE_COST_CREDITS } from "@/lib/data/artistVoice";
import { formatDuration } from "@/lib/suno/status";
import { rehostToR2 } from "@/lib/r2";

// Salva uma Voz de Artista (amostra gerada pela Suno) na tabela "creations"
// com kind='voice' — assim ela fica em Minhas Criações e na aba Vozes de
// Artista, ligada ao profile do usuário. As informações da voz (descrição,
// gênero, timbre, estilos, referência) vão em creation_answers (jsonb).
// Espelha /api/criar-musica/salvar.

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const gender = body.gender == null ? null : String(body.gender);
  const timbre = String(body.timbre ?? "").trim();
  const styles = Array.isArray(body.styles) ? body.styles.map((s) => String(s)) : [];
  const referenceName = String(body.referenceName ?? "").trim();
  const referenceLink = String(body.referenceLink ?? "").trim();
  const sampleUrl = String(body.sampleUrl ?? "").trim();
  const sampleImageUrl = String(body.sampleImageUrl ?? "").trim();
  const sampleDuration = formatDuration(body.sampleDuration as number | null | undefined);
  const sampleTaskId = String(body.sampleTaskId ?? "").trim();
  const sampleAudioId = String(body.sampleAudioId ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Dê um nome à voz." }, { status: 400 });
  }
  if (!sampleUrl) {
    return NextResponse.json({ error: "Amostra ausente — gere a voz antes de salvar." }, { status: 400 });
  }

  const profile = await getProfile();

  // Re-hospeda a amostra no R2 (a URL da Suno expira). Cai pra URL original se
  // o R2 não estiver configurado.
  const mediaId = crypto.randomUUID();
  const [r2AudioUrl, r2ImageUrl] = await Promise.all([
    rehostToR2(sampleUrl, `voice-samples/${mediaId}.mp3`, "audio/mpeg"),
    sampleImageUrl
      ? rehostToR2(sampleImageUrl, `voice-samples/${mediaId}.jpg`, "image/jpeg")
      : Promise.resolve(sampleImageUrl),
  ]);

  try {
    const creation = await createCreation({
      ...(profile ? { profile_id: profile.id } : {}),
      title: name,
      kind: "voice",
      genre: styles.join(", "),
      duration: sampleDuration,
      status: "finalized",
      progress: 100,
      lyrics: description,
      badge_label: "VOZ",
      emoji: "🎤",
      gradient_from: "#a855f7",
      gradient_to: "#ec4899",
      audio_url: r2AudioUrl,
      image_url: r2ImageUrl,
      ...(sampleTaskId ? { suno_task_id: sampleTaskId } : {}),
      ...(sampleAudioId ? { suno_audio_id: sampleAudioId } : {}),
    });

    // Informações completas da voz, ligadas à criação.
    if (creation?.id) {
      const supabase = await createClient();
      const { error: ansErr } = await supabase.from("creation_answers").insert({
        creation_id: creation.id,
        answers: { description, gender, timbre, styles, referenceName, referenceLink },
      });
      if (ansErr) console.error("[salvar-voz] falha ao salvar creation_answers:", ansErr.message);
    }

    // Cobra os créditos da amostra do profile (modo demo: profile mais antigo).
    let creditsLeft: number | null = null;
    if (profile) {
      creditsLeft = Math.max(0, (profile.credits ?? 0) - SAMPLE_COST_CREDITS);
      const supabase = await createClient();
      await supabase.from("profiles").update({ credits: creditsLeft }).eq("id", profile.id);
    }

    return NextResponse.json({ id: creation?.id ?? null, credits: creditsLeft });
  } catch (e) {
    console.error("[salvar-voz] falha ao inserir em creations:", e);
    const msg = e instanceof Error ? e.message : "Falha ao salvar a voz.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
