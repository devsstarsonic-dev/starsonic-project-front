import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, CLAUDE_MODEL, textFromMessage } from "@/lib/anthropic";

// "Inspire-se": recebe o link e o nome de uma música de referência e usa o Claude
// para detectar gênero, tipo de voz, vibe/clima, tema e idioma — para gerar
// depois uma música NOVA em estilo similar (letra diferente).

const SYSTEM_PROMPT = `Você é um especialista em análise musical da Star Sonic.
Recebe o NOME (e opcionalmente o LINK) de uma música de referência e deve deduzir, com base no seu conhecimento sobre a música/artista, as características musicais dela.
Se não reconhecer a música, faça a melhor estimativa plausível pelo nome. Nunca deixe campos vazios.
Responda em português do Brasil nos valores dos campos.`;

// Esquema para structured outputs — garante um JSON válido no formato esperado.
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    genre: { type: "string", description: "Gênero musical principal (ex.: Sertanejo, Pop, Gospel)" },
    voice: {
      type: "string",
      enum: ["Masculina", "Feminina", "Dueto: 1 homem e 1 mulher", "Coral", "Melodia Kids"],
      description: "Tipo de voz",
    },
    vibe: { type: "string", description: "2 a 4 palavras de clima/emoção separadas por vírgula" },
    theme: { type: "string", description: "Assunto/tema central em uma frase curta" },
    language: { type: "string", enum: ["pt-BR", "en-US", "es-ES"], description: "Idioma predominante" },
  },
  required: ["genre", "voice", "vibe", "theme", "language"],
} as const;

export async function POST(req: NextRequest) {
  const client = getAnthropic();
  if (!client) {
    console.error("[inspire] ANTHROPIC_API_KEY ausente — reinicie o dev após configurar o .env.");
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada no servidor (.env)." }, { status: 500 });
  }

  let body: { link?: unknown; name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 300);
  const link = String(body.link ?? "").trim().slice(0, 500);
  if (!name && !link) {
    return NextResponse.json({ error: "Informe o nome ou o link da música." }, { status: 400 });
  }

  const str = (v: unknown, fallback: string) => {
    const s = String(v ?? "").trim();
    return s || fallback;
  };

  try {
    const msg = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
      messages: [
        { role: "user", content: `Nome da música: ${name || "—"}\nLink: ${link || "—"}\n\nAnalise e responda no formato pedido.` },
      ],
    });

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(textFromMessage(msg) || "{}");
    } catch {
      return NextResponse.json({ error: "Resposta da IA em formato inesperado." }, { status: 502 });
    }

    return NextResponse.json({
      genre: str(parsed.genre, "Pop"),
      voice: str(parsed.voice, "Masculina"),
      vibe: str(parsed.vibe, "Envolvente"),
      theme: str(parsed.theme, name || "Inspiração musical"),
      language: str(parsed.language, "pt-BR"),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao analisar a música.";
    console.error("[inspire] Claude falhou:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
