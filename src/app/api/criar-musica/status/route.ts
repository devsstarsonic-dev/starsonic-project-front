import { NextRequest, NextResponse } from "next/server";

// Consulta o andamento de uma geração na Suno (apibox) por taskId.
// Status possíveis do apibox: PENDING, TEXT_SUCCESS, FIRST_SUCCESS, SUCCESS,
// CREATE_TASK_FAILED, GENERATE_AUDIO_FAILED, CALLBACK_EXCEPTION, SENSITIVE_WORD_ERROR.

const SUNO_API_URL = process.env.SUNO_API_URL ?? "https://apibox.erweima.ai";

type SunoTrack = {
  id?: string;
  title?: string;
  audioUrl?: string;
  streamAudioUrl?: string;
  imageUrl?: string;
  duration?: number;
};

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
      `${SUNO_API_URL}/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
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
    const msg = data?.msg ?? `Erro ${res.status} ao consultar o status.`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const d = data.data ?? {};
  const tracks = ((d.response?.sunoData as SunoTrack[]) ?? []).map((t) => ({
    id: t.id ?? null,
    title: t.title ?? null,
    audioUrl: t.audioUrl ?? t.streamAudioUrl ?? null,
    imageUrl: t.imageUrl ?? null,
    duration: t.duration ?? null,
  }));

  return NextResponse.json({ status: d.status ?? "PENDING", tracks });
}
