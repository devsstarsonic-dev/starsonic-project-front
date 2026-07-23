import { NextRequest, NextResponse } from "next/server";

// Consulta o andamento da geração de vídeo na KIE AI (Veo) por taskId.

const KIE_API_URL = process.env.KIE_API_URL ?? "https://api.kie.ai";

export async function GET(req: NextRequest) {
  const key = process.env.KIE_AI_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Serviço indisponível. Tente novamente mais tarde." },
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
      `${KIE_API_URL}/api/v1/veo/record-info?taskId=${encodeURIComponent(taskId)}`,
      {
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Serviço indisponível. Tente novamente mais tarde." },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data || data.code !== 200) {
    const msg = data?.msg ?? data?.message ?? `Erro ${res.status} ao consultar o vídeo na KIE.`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const d = data.data ?? {};

  // A KIE devolve as URLs em response.resultUrls (array ou string JSON).
  let urls: unknown = d.response?.resultUrls ?? d.resultUrls ?? null;
  if (typeof urls === "string") {
    try {
      urls = JSON.parse(urls);
    } catch {
      urls = [urls];
    }
  }
  const videoUrl: string | null = Array.isArray(urls) ? (urls[0] as string) ?? null : null;

  // successFlag: 0/ausente = gerando, 1 = sucesso, 2/3 = falhou.
  const flag = d.successFlag;
  const status =
    videoUrl || flag === 1
      ? "SUCCESS"
      : flag === 2 || flag === 3
        ? "FAILED"
        : "GENERATING";

  return NextResponse.json({ status, videoUrl });
}
