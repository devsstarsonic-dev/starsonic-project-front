import { NextResponse } from "next/server";
import { openaiChat, OPENAI_MODEL, getOpenAIKey } from "@/lib/openai";

// Endpoint de diagnóstico: valida se a OPENAI_API_KEY está configurada e
// funcionando. Abra /api/health-claude no navegador — deve responder { ok: true }.
// Faz uma chamada mínima (poucos tokens) só para confirmar a chave/saldo.

export async function GET() {
  if (!getOpenAIKey()) {
    return NextResponse.json(
      {
        ok: false,
        stage: "config",
        error: "OPENAI_API_KEY não configurada no .env (ou o dev não foi reiniciado após salvar).",
      },
      { status: 500 },
    );
  }

  const result = await openaiChat({
    maxTokens: 5,
    temperature: 0,
    messages: [
      { role: "system", content: "Responda APENAS com a palavra: pong" },
      { role: "user", content: "ping" },
    ],
  });

  if (!result.ok) {
    // Erros comuns: 401 (chave inválida), quota/billing (sem crédito), 429 (limite).
    return NextResponse.json(
      { ok: false, stage: "api", model: OPENAI_MODEL, error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ ok: true, model: OPENAI_MODEL, reply: result.text });
}
