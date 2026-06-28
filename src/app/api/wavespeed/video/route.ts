import { NextRequest, NextResponse } from "next/server";

// Gera vídeo com a WaveSpeed AI (text-to-video). A WAVE_SPEED_KEY fica só no
// servidor. O modelo é configurável via WAVE_SPEED_MODEL.
// Docs: https://wavespeed.ai (padrão: POST modelo -> data.id, depois polling)

const WAVE_SPEED_API_URL =
  process.env.WAVE_SPEED_API_URL ?? "https://api.wavespeed.ai/api/v3";
const WAVE_SPEED_MODEL =
  process.env.WAVE_SPEED_MODEL ?? "wavespeed-ai/wan-2.1/t2v-480p";

export async function POST(req: NextRequest) {
  const key = process.env.WAVE_SPEED_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "WAVE_SPEED_KEY não configurada no servidor (.env)." },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const prompt = String(body.prompt ?? "").trim();
  const duration = Number(body.duration);

  if (!prompt) {
    return NextResponse.json(
      { error: "Descreva a cena do vídeo (prompt)." },
      { status: 400 },
    );
  }

  const payload: Record<string, unknown> = { prompt };
  if (Number.isFinite(duration) && duration > 0) payload.duration = duration;

  let res: Response;
  try {
    res = await fetch(`${WAVE_SPEED_API_URL}/${WAVE_SPEED_MODEL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível conectar à WaveSpeed." },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => null);
  const id = data?.data?.id ?? data?.id ?? null;
  if (!res.ok || !id) {
    const msg =
      data?.message ||
      (typeof data?.error === "string" ? data.error : null) ||
      `Erro ${res.status} ao iniciar o vídeo na WaveSpeed.`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  return NextResponse.json({ id });
}
