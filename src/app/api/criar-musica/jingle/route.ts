import { NextRequest, NextResponse } from "next/server";
import { getProfile, createCreation } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { MUSIC_CREDIT_COST } from "@/lib/credits";
import { uploadBufferToR2 } from "@/lib/r2";
import { cutJingle } from "@/lib/ffmpeg";
import { getHookWindow } from "@/lib/suno/hookWindow";

// Precisa de runtime Node.js (FFmpeg via child_process, não roda em Edge) e
// de mais tempo que o default pra baixar + cortar + subir os 3 arquivos.
export const runtime = "nodejs";
export const maxDuration = 60;

// Jingle Comercial — passo final do fluxo (ver comentário em app/(app)/jingle/page.tsx):
// recebe o áudio completo já gerado pela Suno, consulta os timestamps da
// letra (get-timestamped-lyrics) pra achar o refrão, corta em 15s/30s/60s
// com FFmpeg a partir dali (fade in/out + normalização + 320kbps), sobe as
// 3 versões no R2 e grava em `jingles` + uma linha espelho em `creations`.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const audioUrl = String(body.audioUrl ?? "").trim();
  const title = String(body.title ?? "").trim() || "Jingle";
  const style = String(body.style ?? "").trim();
  const lyrics = String(body.lyrics ?? "");
  const sunoTaskId = String(body.sunoTaskId ?? "").trim();
  const sunoAudioId = String(body.sunoAudioId ?? "").trim();
  const brandName = String(body.brandName ?? "").trim();
  const slogan = String(body.slogan ?? "").trim();
  const audience = String(body.audience ?? "").trim();
  const genre = String(body.genre ?? "").trim();
  const vibe = String(body.vibe ?? "").trim();
  const durationChosen = String(body.durationChosen ?? "").trim();
  const voiceStyle = String(body.voiceStyle ?? "").trim();

  if (!audioUrl) {
    return NextResponse.json({ error: "Áudio ausente — jingle ainda não finalizado." }, { status: 400 });
  }

  const profile = await getProfile();

  let jingleId: string | null = null;
  try {
    // Busca os timestamps alinhados da letra pra achar o refrão ("hook") e
    // cortar exatamente do início do 1º ao fim do 2º — se a Suno não
    // devolver seções (falha, instrumental, etc.), cai pro corte desde 0s.
    const hook = sunoTaskId && sunoAudioId ? await getHookWindow(sunoTaskId, sunoAudioId) : null;
    const clips = await cutJingle(audioUrl, hook?.start ?? 0);

    jingleId = crypto.randomUUID();
    const base = `jingles/${profile?.id ?? "convidado"}/${jingleId}`;
    // Só as 3 versões cortadas são entregues (15s/30s/60s) — o áudio completo
    // da Suno é só a fonte interna do corte, nunca sobe pro R2.
    const [url15, url30, url60] = await Promise.all([
      uploadBufferToR2(clips.s15, `${base}/15s.mp3`, "audio/mpeg"),
      uploadBufferToR2(clips.s30, `${base}/30s.mp3`, "audio/mpeg"),
      uploadBufferToR2(clips.s60, `${base}/60s.mp3`, "audio/mpeg"),
    ]);

    const creation = await createCreation({
      ...(profile ? { profile_id: profile.id } : {}),
      title,
      kind: "jingle",
      genre: genre || style,
      duration: "1:00", // representa a versão principal (60s) na biblioteca/catálogo
      status: "finalized",
      progress: 100,
      words: lyrics.trim() ? lyrics.trim().split(/\s+/).length : 0,
      lyrics,
      badge_label: "JINGLE",
      emoji: "📣",
      gradient_from: "#3be6ff",
      gradient_to: "#a855f7",
      audio_url: url60, // versão principal exibida em Minhas Criações/Catálogo
      image_url: "",
      ...(sunoTaskId ? { suno_task_id: sunoTaskId } : {}),
    });

    const supabase = await createClient();
    const { error: jingleErr } = await supabase.from("jingles").insert({
      id: jingleId,
      creation_id: creation?.id ?? null,
      profile_id: profile?.id ?? null,
      brand_name: brandName,
      slogan,
      audience,
      genre,
      vibe,
      duration_chosen: durationChosen,
      voice_style: voiceStyle,
      url_15s: url15,
      url_30s: url30,
      url_60s: url60,
      suno_task_id: sunoTaskId,
      status: "ready",
    });
    if (jingleErr) console.error("[jingle] falha ao salvar em jingles:", jingleErr.message);

    let creditsLeft: number | null = null;
    if (profile) {
      creditsLeft = Math.max(0, (profile.credits ?? 0) - MUSIC_CREDIT_COST);
      await supabase.from("profiles").update({ credits: creditsLeft }).eq("id", profile.id);
    }

    return NextResponse.json({
      creationId: creation?.id ?? null,
      jingleId,
      urls: { s15: url15, s30: url30, s60: url60 },
      credits: creditsLeft,
    });
  } catch (e) {
    console.error("[jingle] falha ao cortar/salvar jingle:", e);
    const msg = e instanceof Error ? e.message : "Falha ao gerar as versões cortadas do jingle.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
