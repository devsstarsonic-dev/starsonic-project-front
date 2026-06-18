import { NextRequest, NextResponse } from "next/server";

// Gera o vídeo clipe (MP4) de uma música já criada na Suno (apibox).
// Precisa do taskId e audioId da geração original.

const SUNO_API_URL = process.env.SUNO_API_URL ?? "https://apibox.erweima.ai";
const SUNO_CALLBACK_URL =
  process.env.SUNO_CALLBACK_URL ?? "https://starsonic.app/api/suno-callback";

export async function POST(req: NextRequest) {
  const key = process.env.SUNO_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "SUNO_KEY não configurada no servidor (.env)." },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const taskId = String(body.taskId ?? "").trim();
  const audioId = String(body.audioId ?? "").trim();

  if (!taskId || !audioId) {
    return NextResponse.json(
      { error: "Esta música não tem os dados da Suno necessários para o vídeo. Gere uma música nova." },
      { status: 400 },
    );
  }

  let res: Response;
  try {
    res = await fetch(`${SUNO_API_URL}/api/v1/mp4/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        taskId,
        audioId,
        callBackUrl: SUNO_CALLBACK_URL,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível conectar à API da Suno." },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data || data.code !== 200) {
    const msg = data?.msg ?? `Erro ${res.status} ao iniciar a geração do vídeo.`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  return NextResponse.json({ taskId: data.data?.taskId ?? null });
}
