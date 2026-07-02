// Helper compartilhado da OpenAI (GPT). Usado nas rotas de IA:
// título automático, "inspire-se" e chat de ajuda. Só roda no servidor.
//
// Configure OPENAI_API_KEY no .env. Modelo padrão: gpt-4o-mini.
// Chamamos a API via fetch (sem SDK) para não precisar de dependência.

const OPENAI_API_URL = process.env.OPENAI_API_URL ?? "https://api.openai.com/v1/chat/completions";
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/** Prefere OPENAI_API_KEY; aceita OPENAPI_API_KEY por engano comum. Ignora string vazia. */
export function getOpenAIKey(): string {
  return (process.env.OPENAI_API_KEY || process.env.OPENAPI_API_KEY || "").trim();
}

type ChatOptions = {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Quando true, pede resposta em JSON (response_format json_object). */
  json?: boolean;
};

type ChatResult = { ok: true; text: string } | { ok: false; status: number; error: string };

/** Faz uma chamada de chat à OpenAI e devolve o texto (ou um erro tratado). */
export async function openaiChat(opts: ChatOptions): Promise<ChatResult> {
  const key = getOpenAIKey();
  if (!key) {
    return { ok: false, status: 500, error: "OPENAI_API_KEY não configurada no servidor (.env)." };
  }

  let res: Response;
  try {
    res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 500,
        messages: opts.messages,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
  } catch {
    return { ok: false, status: 502, error: "Não foi possível conectar à OpenAI." };
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = data?.error?.message ?? `Erro ${res.status} ao chamar a OpenAI.`;
    return { ok: false, status: 502, error };
  }

  const text = String(data?.choices?.[0]?.message?.content ?? "").trim();
  return { ok: true, text };
}
