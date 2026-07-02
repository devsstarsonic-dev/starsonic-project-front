import { NextResponse } from "next/server";
import { getAnthropic, CLAUDE_MODEL, textFromMessage } from "@/lib/anthropic";

// Endpoint de diagnóstico: valida se a ANTHROPIC_API_KEY está configurada e
// funcionando. Abra /api/health-claude no navegador — deve responder { ok: true }.
// Faz uma chamada mínima (poucos tokens) só para confirmar a chave/saldo.

export async function GET() {
  const client = getAnthropic();
  if (!client) {
    return NextResponse.json(
      {
        ok: false,
        stage: "config",
        error: "ANTHROPIC_API_KEY não configurada no .env (ou o dev não foi reiniciado após salvar).",
      },
      { status: 500 },
    );
  }

  try {
    const msg = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 16,
      system: "Responda APENAS com a palavra: pong",
      messages: [{ role: "user", content: "ping" }],
    });
    const reply = textFromMessage(msg);
    return NextResponse.json({ ok: true, model: CLAUDE_MODEL, reply });
  } catch (e) {
    // Erros comuns: 401 (chave inválida), 402/billing (sem crédito), 429 (limite).
    const err = e as { status?: number; message?: string };
    return NextResponse.json(
      {
        ok: false,
        stage: "api",
        status: err.status ?? null,
        model: CLAUDE_MODEL,
        error: err.message ?? "Falha ao chamar o Claude.",
      },
      { status: 502 },
    );
  }
}
