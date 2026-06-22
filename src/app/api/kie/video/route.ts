import { NextRequest, NextResponse } from "next/server";

// Gera VÍDEO CLIPE com a KIE AI (modelo Veo) a partir de uma imagem (capa da
// música) + um prompt de cena. A KIE_AI_KEY fica somente no servidor.

const KIE_API_URL = process.env.KIE_API_URL ?? "https://api.kie.ai";
const KIE_VEO_MODEL = process.env.KIE_VEO_MODEL ?? "veo3_fast";
const CALLBACK_URL =
  process.env.KIE_CALLBACK_URL ??
  process.env.SUNO_CALLBACK_URL ??
  "https://starsonic.app/api/suno-callback";

export async function POST(req: NextRequest) {
  const key = process.env.KIE_AI_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "KIE_AI_KEY não configurada no servidor (.env)." },
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
  const imageUrl = String(body.imageUrl ?? "").trim();
  const aspectRatio = String(body.aspectRatio ?? "16:9").trim();

  if (!prompt) {
    return NextResponse.json(
      { error: "Descreva a cena do videoclipe (prompt)." },
      { status: 400 },
    );
  }

  const payload: Record<string, unknown> = {
    prompt,
    model: KIE_VEO_MODEL,
    aspectRatio,
    callBackUrl: CALLBACK_URL,
  };
  // Quando há capa, gera vídeo a partir da imagem (image-to-video).
  if (imageUrl) payload.imageUrls = [imageUrl];

  let res: Response;
  try {
    res = await fetch(`${KIE_API_URL}/api/v1/veo/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível conectar à KIE AI." },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data || data.code !== 200) {
    const msg = data?.msg ?? data?.message ?? `Erro ${res.status} ao iniciar o vídeo na KIE.`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  return NextResponse.json({ taskId: data.data?.taskId ?? null });
}
