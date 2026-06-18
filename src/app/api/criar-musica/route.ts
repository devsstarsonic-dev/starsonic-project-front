import { NextRequest, NextResponse } from "next/server";

// Integração com a API da Suno (sunoapi.org / apibox).
// A SUNO_KEY fica somente no servidor — nunca é exposta ao browser.

const SUNO_API_URL = process.env.SUNO_API_URL ?? "https://apibox.erweima.ai";
const SUNO_MODEL = process.env.SUNO_MODEL ?? "V4_5";
// O apibox exige o campo callBackUrl. Como acompanhamos por polling (status),
// basta uma URL válida — não precisa receber o callback de fato.
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

  const title = String(body.title ?? "").trim();
  const style = String(body.style ?? "").trim();
  const lyrics = String(body.lyrics ?? "").trim();
  const negativeTags = String(body.negativeTags ?? "").trim();
  const instrumental = Boolean(body.instrumental);
  const model = String(body.model ?? SUNO_MODEL);

  if (!style) {
    return NextResponse.json({ error: "Informe o estilo/gênero da música." }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Informe o título da música." }, { status: 400 });
  }
  if (!instrumental && !lyrics) {
    return NextResponse.json(
      { error: "Escreva a letra ou marque a opção instrumental." },
      { status: 400 },
    );
  }

  const payload: Record<string, unknown> = {
    customMode: true,
    instrumental,
    model,
    style,
    title,
    prompt: instrumental ? "" : lyrics,
    callBackUrl: SUNO_CALLBACK_URL,
  };
  // Estilos/conteúdos a evitar (vindos das restrições do wizard).
  if (negativeTags) payload.negativeTags = negativeTags;

  let res: Response;
  try {
    res = await fetch(`${SUNO_API_URL}/api/v1/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível conectar à API da Suno." },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data || data.code !== 200) {
    const msg = data?.msg ?? `Erro ${res.status} ao chamar a API da Suno.`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  return NextResponse.json({ taskId: data.data?.taskId ?? null });
}
