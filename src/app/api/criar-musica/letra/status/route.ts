import { NextRequest, NextResponse } from "next/server";

// Consulta o andamento da geração de uma letra na Suno por taskId.
// Status possíveis: PENDING, SUCCESS, CREATE_TASK_FAILED,
// GENERATE_LYRICS_FAILED, CALLBACK_EXCEPTION, SENSITIVE_WORD_ERROR.

const SUNO_LYRICS_API_URL =
  process.env.SUNO_LYRICS_API_URL ?? "https://api.sunoapi.org";

type LyricCandidate = {
  text?: string;
  title?: string;
  status?: string;
  errorMessage?: string;
};

export async function GET(req: NextRequest) {
  const key = process.env.SUNO_KEY;
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
      `${SUNO_LYRICS_API_URL}/api/v1/lyrics/record-info?taskId=${encodeURIComponent(taskId)}`,
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
    const msg = data?.msg ?? `Erro ${res.status} ao consultar a letra.`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const d = data.data ?? {};
  const candidates = (d.response?.data as LyricCandidate[]) ?? [];
  const best = candidates.find((c) => c.text && c.text.trim()) ?? candidates[0];

  return NextResponse.json({
    status: d.status ?? "PENDING",
    lyrics: best?.text ?? null,
    title: best?.title ?? null,
  });
}
