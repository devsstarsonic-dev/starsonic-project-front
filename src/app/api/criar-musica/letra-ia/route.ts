import { NextRequest, NextResponse } from "next/server";
import { openaiChat } from "@/lib/openai";
import { buildLyricsMessages } from "@/lib/compositor/lyricsAI";
import type { DetailedFormData } from "@/lib/types";

// Gera a letra COMPLETA com o GPT a partir das respostas do compositor.
// Diferente da rota /letra (Suno, assíncrona e limitada a 200 chars), aqui a
// geração é SÍNCRONA: recebe todo o formData, monta um prompt fiel à história
// e devolve { lyrics, title } direto. A OPENAI_API_KEY fica só no servidor.

export async function POST(req: NextRequest) {
  let body: { formData?: Partial<DetailedFormData>; jingle?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const formData = body.formData ?? {};
  const jingle = body.jingle === true;

  const messages = buildLyricsMessages(formData, { jingle });

  const result = await openaiChat({
    messages,
    json: true,
    maxTokens: 1800,
    temperature: 0.85, // criatividade na escrita; a fidelidade vem do system prompt
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  let parsed: { title?: unknown; lyrics?: unknown } = {};
  try {
    parsed = JSON.parse(result.text || "{}");
  } catch {
    return NextResponse.json(
      { error: "Resposta da IA em formato inesperado." },
      { status: 502 },
    );
  }

  const lyrics = String(parsed.lyrics ?? "").trim();
  if (!lyrics) {
    return NextResponse.json({ error: "A IA não retornou a letra. Tente novamente." }, { status: 502 });
  }
  const title = String(parsed.title ?? "").trim();

  return NextResponse.json({ lyrics, title: title || null });
}
