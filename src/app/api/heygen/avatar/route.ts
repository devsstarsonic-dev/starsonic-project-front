import { NextRequest, NextResponse } from "next/server";

// Gera uma foto de avatar com a HeyGen (Photo Avatar) a partir das opções.
// https://developers.heygen.com/reference/create-avatar
// A HEYGEN_KEY fica somente no servidor.

const HEYGEN_API_URL = process.env.HEYGEN_API_URL ?? "https://api.heygen.com";

export async function POST(req: NextRequest) {
  const key = process.env.HEYGEN_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "HEYGEN_KEY não configurada no servidor (.env)." },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const name = String(body.name ?? "Avatar Star Sonic").trim();
  const gender = String(body.gender ?? "Woman").trim();
  const age = String(body.age ?? "Young Adult").trim();
  const ethnicity = String(body.ethnicity ?? "Unspecified").trim();
  const style = String(body.style ?? "Realistic").trim();
  const appearance = String(body.appearance ?? "").trim();

  if (!appearance) {
    return NextResponse.json(
      { error: "Descreva como o avatar deve ser (aparência)." },
      { status: 400 },
    );
  }

  let res: Response;
  try {
    res = await fetch(`${HEYGEN_API_URL}/v2/photo_avatar/photo/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": key,
      },
      body: JSON.stringify({
        name,
        age,
        gender,
        ethnicity,
        orientation: "square",
        pose: "close_up",
        style,
        appearance,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível conectar à HeyGen." },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => null);
  // A HeyGen retorna { error: null, data: { generation_id } }.
  const generationId = data?.data?.generation_id ?? null;
  if (!res.ok || data?.error || !generationId) {
    const msg =
      (typeof data?.error === "string" && data.error) ||
      data?.error?.message ||
      `Erro ${res.status} ao gerar o avatar.`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  return NextResponse.json({ id: generationId });
}
