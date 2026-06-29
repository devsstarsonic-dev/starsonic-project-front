import { NextRequest, NextResponse } from "next/server";

// Envia um arquivo (vídeo do rosto) para a HeyGen (upload de asset).
// O cliente faz POST com o arquivo no corpo e Content-Type do arquivo.
// Retorna o id/url do asset na HeyGen.

export const runtime = "nodejs";

const HEYGEN_UPLOAD_URL =
  process.env.HEYGEN_UPLOAD_URL ?? "https://upload.heygen.com/v1/asset";

export async function POST(req: NextRequest) {
  const key = process.env.HEYGEN_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "HEYGEN_KEY não configurada no servidor (.env)." },
      { status: 500 },
    );
  }

  const contentType = req.headers.get("content-type") || "video/mp4";
  const buffer = await req.arrayBuffer();
  if (!buffer || buffer.byteLength === 0) {
    return NextResponse.json({ error: "Arquivo vazio." }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(HEYGEN_UPLOAD_URL, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        "X-Api-Key": key,
      },
      body: buffer,
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível conectar à HeyGen." },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || data?.error) {
    const msg =
      (typeof data?.error === "string" && data.error) ||
      data?.error?.message ||
      data?.message ||
      `Erro ${res.status} ao enviar o vídeo.`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const d = data?.data ?? data;
  return NextResponse.json({
    id: d?.id ?? d?.asset_id ?? null,
    url: d?.url ?? null,
  });
}
