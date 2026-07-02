import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, CLAUDE_MODEL, textFromMessage } from "@/lib/anthropic";

// Gera um título de música com o Claude, baseado na letra (e gênero).
// Usado quando o usuário escolhe "STARSONIC cria o nome".

export async function POST(req: NextRequest) {
  const client = getAnthropic();
  if (!client) {
    console.error("[title] ANTHROPIC_API_KEY ausente — reinicie o dev após configurar o .env.");
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor (.env)." },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const lyrics = String(body.lyrics ?? "").trim().slice(0, 2000);
  const genre = String(body.genre ?? "").trim();
  if (!lyrics) {
    return NextResponse.json({ error: "Letra ausente para gerar o título." }, { status: 400 });
  }

  try {
    const msg = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 60,
      system:
        "Você cria títulos curtos e criativos para músicas em português, " +
        "totalmente baseados no tema e no sentimento da letra. " +
        "Responda APENAS com o título (2 a 5 palavras), sem aspas, sem pontuação final, " +
        "sem explicações e sem qualquer texto adicional.",
      messages: [
        { role: "user", content: `Gênero: ${genre || "—"}\n\nLetra:\n${lyrics}\n\nTítulo:` },
      ],
    });

    let title = textFromMessage(msg);
    title = title.replace(/^["'“”]+|["'“”.]+$/g, "").trim().slice(0, 80);
    return NextResponse.json({ title: title || null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao gerar o título.";
    console.error("[title] Claude falhou:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
