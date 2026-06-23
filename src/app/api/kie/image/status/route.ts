import { NextRequest, NextResponse } from "next/server";

// Consulta o andamento da geração de imagem (miniatura) na KIE AI por taskId.

const KIE_API_URL = process.env.KIE_API_URL ?? "https://api.kie.ai";
const KIE_IMAGE_INFO_PATH =
  process.env.KIE_IMAGE_INFO_PATH ?? "/api/v1/gpt4o-image/record-info";

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

export async function GET(req: NextRequest) {
  const key = process.env.KIE_AI_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "KIE_AI_KEY não configurada no servidor (.env)." },
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
      `${KIE_API_URL}${KIE_IMAGE_INFO_PATH}?taskId=${encodeURIComponent(taskId)}`,
      { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" },
    );
  } catch {
    return NextResponse.json({ error: "Não foi possível conectar à KIE AI." }, { status: 502 });
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.code !== 200) {
    const msg = data?.msg ?? data?.message ?? `Erro ${res.status} ao consultar a imagem na KIE.`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const d = data.data ?? {};
  const imageUrl = pickUrl(d);
  const flag = d.successFlag;
  const status =
    imageUrl || flag === 1
      ? "SUCCESS"
      : flag === 2 || flag === 3
        ? "FAILED"
        : "GENERATING";

  return NextResponse.json({ status, imageUrl });
}
