import { NextRequest, NextResponse } from "next/server";

// Consulta o andamento da geração da foto de avatar na HeyGen por generation_id.

const HEYGEN_API_URL = process.env.HEYGEN_API_URL ?? "https://api.heygen.com";

export async function GET(req: NextRequest) {
  const key = process.env.HEYGEN_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "HEYGEN_KEY não configurada no servidor (.env)." },
      { status: 500 },
    );
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Parâmetro id ausente." }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(
      `${HEYGEN_API_URL}/v2/photo_avatar/generation/${encodeURIComponent(id)}`,
      { headers: { "X-Api-Key": key }, cache: "no-store" },
    );
  } catch {
    return NextResponse.json({ error: "Não foi possível conectar à HeyGen." }, { status: 502 });
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || data?.error) {
    const msg =
      (typeof data?.error === "string" && data.error) ||
      data?.error?.message ||
      `Erro ${res.status} ao consultar o avatar.`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const d = data?.data ?? {};
  const status = String(d.status ?? "pending").toLowerCase();

  // A HeyGen devolve as imagens em image_url_list (array de URLs).
  let urls: unknown = d.image_url_list ?? d.image_urls ?? d.image_url ?? null;
  if (typeof urls === "string") urls = [urls];
  const imageUrl: string | null = Array.isArray(urls) ? (urls[0] as string) ?? null : null;

  return NextResponse.json({ status, imageUrl });
}
