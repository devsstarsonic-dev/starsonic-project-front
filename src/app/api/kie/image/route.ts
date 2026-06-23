import { NextRequest, NextResponse } from "next/server";

// Gera IMAGEM (miniatura/thumbnail) com a KIE AI a partir de um prompt.
// Usado para criar capas de YouTube (16:9) baseadas na música.

const KIE_API_URL = process.env.KIE_API_URL ?? "https://api.kie.ai";
const KIE_IMAGE_GEN_PATH = process.env.KIE_IMAGE_GEN_PATH ?? "/api/v1/gpt4o-image/generate";
const KIE_IMAGE_MODEL = process.env.KIE_IMAGE_MODEL ?? "";
const CALLBACK_URL =
  process.env.KIE_CALLBACK_URL ??
  process.env.SUNO_CALLBACK_URL ??
  "https://starsonic.app/api/suno-callback";

function pickUrl(d: Record<string, unknown> | null | undefined): string | null {
  if (!d) return null;
  const resp = (d.response ?? {}) as Record<string, unknown>;
  let urls: unknown = resp.resultUrls ?? d.resultUrls ?? d.imageUrl ?? d.imageUrls ?? null;
  if (typeof urls === "string") {
    try {
      urls = JSON.parse(urls);
    } catch {
      return urls as string;
    }
  }
  if (Array.isArray(urls)) return (urls[0] as string) ?? null;
  return typeof urls === "string" ? urls : null;
}

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
  const aspectRatio = String(body.aspectRatio ?? "16:9").trim();
  const size = String(body.size ?? "1280x720").trim();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt da imagem ausente." }, { status: 400 });
  }

  const payload: Record<string, unknown> = {
    prompt,
    size,
    aspectRatio,
    callBackUrl: CALLBACK_URL,
  };
  if (KIE_IMAGE_MODEL) payload.model = KIE_IMAGE_MODEL;

  let res: Response;
  try {
    res = await fetch(`${KIE_API_URL}${KIE_IMAGE_GEN_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível conectar à KIE AI." }, { status: 502 });
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.code !== 200) {
    const msg = data?.msg ?? data?.message ?? `Erro ${res.status} ao gerar a imagem na KIE.`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // Pode vir o taskId (assíncrono) ou já a imagem (síncrono).
  const taskId = data.data?.taskId ?? null;
  const imageUrl = pickUrl(data.data);
  return NextResponse.json({ taskId, imageUrl });
}
