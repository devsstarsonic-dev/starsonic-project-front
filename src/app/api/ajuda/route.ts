import { NextRequest, NextResponse } from "next/server";
import { openaiChat, type ChatMessage } from "@/lib/openai";

// Chat de ajuda da Star Sonic. Recebe o histórico de mensagens e responde
// dúvidas do usuário sobre a plataforma, usando o GPT (OpenAI).

const SYSTEM_PROMPT = `Você é a "Sonic", a assistente virtual de suporte da Star Sonic — uma plataforma de criação de música com IA.
Responda SEMPRE em português do Brasil, de forma curta, amigável e objetiva. Use no máximo 1-2 parágrafos curtos (ou uma lista pequena).

O que a plataforma faz e onde fica cada coisa:
- Criar Música (/criar-musica e o Compositor): o usuário responde um formulário (tema, gênero, tom/estilo de voz, instrumentos, duração) e a IA gera a letra e a música. É possível pedir 2, 4 ou 6 músicas. Pode deixar a "STARSONIC criar o nome" automaticamente. No compositor há duas opções: "Personalizado" (formulário completo) e "Inspire-se" (informe uma música de referência e a IA cria algo no mesmo estilo com letra diferente).
- Explorar (/catalogo): ouvir músicas da comunidade, criar playlists e adicionar músicas às playlists (menu de 3 pontinhos). Clicar numa playlist abre a página dela, onde dá para renomear e remover músicas.
- Player: barra inferior estilo Spotify; ao tocar uma playlist aparecem os botões de anterior/próxima.
- Criações (/criacoes): suas músicas geradas, com opção de baixar MP3, baixar capa com letra e excluir.
- Mídia / Cover Studio: gerar vídeo curto, imagem e videoclipe com IA a partir da música.
- Avatar (/meu-perfil e /avatar-studio): criar um avatar com IA (foto ou vídeo do rosto).
- Distribuição: enviar a música para plataformas (DSPs).
- Planos e créditos: cada geração consome créditos; é possível ver os planos em /planos.

Regras:
- Se não souber algo específico ou for um problema técnico/financeiro que exige um humano, oriente a procurar o suporte e seja honesta que não tem essa informação.
- Nunca invente preços, prazos ou recursos que não foram citados.
- Se a pergunta não for sobre a Star Sonic, responda de forma breve e gentil e traga de volta para o contexto da plataforma.`;

export async function POST(req: NextRequest) {
  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const raw = Array.isArray(body.messages) ? body.messages : [];
  const history: ChatMessage[] = raw
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
        typeof (m as ChatMessage).content === "string",
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-12); // últimas 12 mensagens para contexto

  if (!history.length || history[history.length - 1].role !== "user") {
    return NextResponse.json({ error: "Nenhuma pergunta para responder." }, { status: 400 });
  }

  const result = await openaiChat({
    maxTokens: 400,
    temperature: 0.5,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
  });

  if (!result.ok) {
    console.error("[ajuda] GPT falhou:", result.error);
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ reply: result.text || "Desculpe, não consegui responder agora. Tente novamente." });
}
