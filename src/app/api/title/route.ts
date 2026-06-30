import { NextRequest, NextResponse } from "next/server";

// Gera um título de música com a OpenAI, baseado na letra (e gênero).
// Usado quando o usuário escolhe "STARSONIC cria o nome".

const OPENAI_API_URL = process.env.OPENAI_API_URL ?? "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export async function POST(req: NextRequest) {
  // Prefere o nome correto; `||` ignora string vazia (`??` não ignoraria).
  const key = (process.env.OPENAI_API_KEY || process.env.OPENAPI_API_KEY || "").trim();
  if (!key) {
    console.error("[title] OPENAI_API_KEY ausente — reinicie o dev após configurar o .env.");
    return NextResponse.json(
      { error: "OPENAI_API_KEY não configurada no servidor (.env)." },
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

  let res: Response;
  try {
    res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.8,
        max_tokens: 24,
        messages: [
          {
            role: "system",
            content:
              "Você cria títulos curtos e criativos para músicas em português, " +
              "totalmente baseados no tema e no sentimento da letra. " +
              "Responda APENAS com o título (2 a 5 palavras), sem aspas, sem pontuação final, sem explicações.",
          },
          {
            role: "user",
            content: `Gênero: ${genre || "—"}\n\nLetra:\n${lyrics}\n\nTítulo:`,
          },
        ],
      }),
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível conectar à OpenAI." }, { status: 502 });
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.error?.message ?? `Erro ${res.status} ao gerar o título.`;
    console.error("[title] OpenAI falhou:", res.status, msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  let title = String(data?.choices?.[0]?.message?.content ?? "").trim();
  // Limpa aspas/pontuação que o modelo às vezes inclui.
  title = title.replace(/^["'“”]+|["'“”.]+$/g, "").trim().slice(0, 80);

  return NextResponse.json({ title: title || null });
}
