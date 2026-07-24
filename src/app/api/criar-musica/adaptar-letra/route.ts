import { NextRequest, NextResponse } from "next/server";
import { openaiChat } from "@/lib/openai";
import { buildAdaptLyricsMessages } from "@/lib/compositor/lyricsAI";

// Adapta uma letra JÁ EXISTENTE a um novo gênero e/ou idioma, preservando a
// história. Usado pelo "Gerar com outros estilos" no /compositor/revisar, para a
// nova versão sair com a letra adaptada ao estilo/idioma escolhido.

export async function POST(req: NextRequest) {
  let body: { lyrics?: unknown; genre?: unknown; language?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const lyrics = String(body.lyrics ?? "").trim();
  const genre = body.genre ? String(body.genre).trim() : "";
  const language = body.language ? String(body.language).trim() : "";
  if (!lyrics) {
    return NextResponse.json({ error: "Sem letra para adaptar." }, { status: 400 });
  }
  if (!genre && !language) {
    // Nada a mudar: devolve a própria letra (o cliente segue sem re-gerar).
    return NextResponse.json({ lyrics, title: null });
  }

  const messages = buildAdaptLyricsMessages(lyrics, { genre, language });
  const result = await openaiChat({ messages, json: true, maxTokens: 1800, temperature: 0.8 });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  let parsed: { title?: unknown; lyrics?: unknown } = {};
  try {
    parsed = JSON.parse(result.text || "{}");
  } catch {
    return NextResponse.json({ error: "Resposta da IA em formato inesperado." }, { status: 502 });
  }

  const adapted = String(parsed.lyrics ?? "").trim();
  if (!adapted) {
    return NextResponse.json({ error: "Não foi possível adaptar a letra. Tente novamente." }, { status: 502 });
  }
  const titleOut = String(parsed.title ?? "").trim();
  return NextResponse.json({ lyrics: adapted, title: titleOut || null });
}
