import { NextRequest, NextResponse } from "next/server";

// Consulta o andamento da geração do vídeo (MP4) na Suno por taskId.

const SUNO_API_URL = process.env.SUNO_API_URL ?? "https://apibox.erweima.ai";

export async function GET(req: NextRequest) {
  const key = process.env.SUNO_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "SUNO_KEY não configurada no servidor (.env)." },
      { status: 500 },
    );
  }

  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) {
    return NextResponse.json({ error: "Parâmetro taskId ausente." }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(
      `${SUNO_API_URL}/api/v1/mp4/record-info?taskId=${encodeURIComponent(taskId)}`,
      {
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Não foi possível conectar à API da Suno." },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data || data.code !== 200) {
    const msg = data?.msg ?? `Erro ${res.status} ao consultar o status do vídeo.`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const d = data.data ?? {};
  // O apibox devolve o vídeo em response.videoUrl quando concluído.
  const videoUrl: string | null =
    d.response?.videoUrl ?? d.videoUrl ?? null;
  const status: string = d.successFlag ?? d.status ?? "PENDING";

  return NextResponse.json({ status, videoUrl });
}
