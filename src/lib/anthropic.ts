import Anthropic from "@anthropic-ai/sdk";

// Cliente compartilhado da Anthropic (Claude). Usado nas rotas de IA:
// título automático, "inspire-se" e chat de ajuda. Só roda no servidor.
//
// Configure ANTHROPIC_API_KEY no .env. Modelo padrão: Opus 4.8.

export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

/** Retorna o cliente, ou null se a chave não estiver configurada. */
export function getAnthropic(): Anthropic | null {
  const key = (process.env.ANTHROPIC_API_KEY || "").trim();
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

/** Extrai o texto concatenado dos blocos de texto de uma resposta do Claude. */
export function textFromMessage(msg: Anthropic.Message): string {
  return msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}
