import { NextRequest, NextResponse } from "next/server";

// Consulta o resultado da geração de vídeo na WaveSpeed por id.

const WAVE_SPEED_API_URL =
  process.env.WAVE_SPEED_API_URL ?? "https://api.wavespeed.ai/api/v3";

export async function GET(req: NextRequest) {
  const key = process.env.WAVE_SPEED_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "WAVE_SPEED_KEY não configurada no servidor (.env)." },
      { status: 500 },
    );
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Parâmetro id ausente." }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${WAVE_SPEED_API_URL}/predictions/${encodeURIComponent(id)}/result`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível conectar à WaveSpeed." }, { status: 502 });
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const msg = data?.message ?? `Erro ${res.status} ao consultar o vídeo.`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const d = data.data ?? data;
  const raw = String(d.status ?? "").toLowerCase();

  // outputs costuma ser um array de URLs.
  let urls: unknown = d.outputs ?? d.output ?? null;
  if (typeof urls === "string") urls = [urls];
  const videoUrl: string | null = Array.isArray(urls) ? (urls[0] as string) ?? null : null;

  const status =
    raw === "completed" || videoUrl
      ? "SUCCESS"
      : raw === "failed" || raw === "error"
        ? "FAILED"
        : raw === "processing"
          ? "GENERATING"
          : "PENDING";

  return NextResponse.json({ status, videoUrl });
}
