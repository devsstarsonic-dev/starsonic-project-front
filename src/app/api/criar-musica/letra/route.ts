import { NextRequest, NextResponse } from "next/server";

// Gera a letra na API da Suno a partir de um prompt construído com as
// respostas do wizard. A SUNO_KEY fica somente no servidor.
// A geração é assíncrona: aqui criamos a task e devolvemos o taskId; o
// resultado é consultado por polling em /api/criar-musica/letra/status.

const SUNO_LYRICS_API_URL =
  process.env.SUNO_LYRICS_API_URL ?? "https://api.sunoapi.org";
// O endpoint exige callBackUrl. Como acompanhamos por polling, basta uma
// URL válida — não precisa receber o callback de fato.
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

  // Prompt da letra montado com as respostas do compositor.
  const prompt = String(body.prompt ?? "").trim().slice(0, 900);
  if (!prompt) {
    return NextResponse.json(
      { error: "Informe as respostas para gerar a letra." },
      { status: 400 },
    );
  }

  let res: Response;
  try {
    res = await fetch(`${SUNO_LYRICS_API_URL}/api/v1/lyrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ prompt, callBackUrl: SUNO_CALLBACK_URL }),
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível conectar à API da Suno." },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data || data.code !== 200) {
    const msg = data?.msg ?? `Erro ${res.status} ao gerar a letra.`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  return NextResponse.json({ taskId: data.data?.taskId ?? null });
}
