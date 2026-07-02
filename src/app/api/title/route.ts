import { NextRequest, NextResponse } from "next/server";
import { openaiChat } from "@/lib/openai";

// Gera um título de música com o GPT (OpenAI), baseado na letra (e gênero).
// Usado quando o usuário escolhe "STARSONIC cria o nome".

export async function POST(req: NextRequest) {
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

  const result = await openaiChat({
    maxTokens: 24,
    temperature: 0.8,
    messages: [
      {
        role: "system",
        content:
          "Você cria títulos curtos e criativos para músicas em português, " +
          "totalmente baseados no tema e no sentimento da letra. " +
          "Responda APENAS com o título (2 a 5 palavras), sem aspas, sem pontuação final, sem explicações.",
      },
      { role: "user", content: `Gênero: ${genre || "—"}\n\nLetra:\n${lyrics}\n\nTítulo:` },
    ],
  });

  if (!result.ok) {
    console.error("[title] GPT falhou:", result.error);
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const title = result.text.replace(/^["'“”]+|["'“”.]+$/g, "").trim().slice(0, 80);
  return NextResponse.json({ title: title || null });
}
