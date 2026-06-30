import { NextRequest, NextResponse } from "next/server";

// Chat de ajuda da Star Sonic. Recebe o histórico de mensagens e responde
// dúvidas do usuário sobre a plataforma, usando a OpenAI.

const OPENAI_API_URL = process.env.OPENAI_API_URL ?? "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const SYSTEM_PROMPT = `Você é a "Sonic", a assistente virtual de suporte da Star Sonic — uma plataforma de criação de música com IA.
Responda SEMPRE em português do Brasil, de forma curta, amigável e objetiva. Use no máximo 1-2 parágrafos curtos (ou uma lista pequena).

O que a plataforma faz e onde fica cada coisa:
- Criar Música (/criar-musica e o Compositor): o usuário responde um formulário (tema, gênero, tom/estilo de voz, instrumentos, duração) e a IA gera a letra e a música. É possível pedir 2, 4 ou 6 músicas. Pode deixar a "STARSONIC criar o nome" automaticamente.
- Letra/Vocalista: ajustes de letra e voz dentro do Sonic Lab.
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

type ChatMsg = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const key = (process.env.OPENAI_API_KEY || process.env.OPENAPI_API_KEY || "").trim();
  if (!key) {
    console.error("[ajuda] OPENAI_API_KEY ausente — reinicie o dev após configurar o .env.");
    return NextResponse.json(
      { error: "OPENAI_API_KEY não configurada no servidor (.env)." },
      { status: 500 },
    );
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const raw = Array.isArray(body.messages) ? body.messages : [];
  const history: ChatMsg[] = raw
    .filter(
      (m): m is ChatMsg =>
        !!m &&
        typeof m === "object" &&
        ((m as ChatMsg).role === "user" || (m as ChatMsg).role === "assistant") &&
        typeof (m as ChatMsg).content === "string",
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-12); // últimas 12 mensagens para contexto

  if (!history.length || history[history.length - 1].role !== "user") {
    return NextResponse.json({ error: "Nenhuma pergunta para responder." }, { status: 400 });
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
        temperature: 0.5,
        max_tokens: 400,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
      }),
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível conectar à OpenAI." }, { status: 502 });
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.error?.message ?? `Erro ${res.status} ao responder.`;
    console.error("[ajuda] OpenAI falhou:", res.status, msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const reply = String(data?.choices?.[0]?.message?.content ?? "").trim();
  return NextResponse.json({ reply: reply || "Desculpe, não consegui responder agora. Tente novamente." });
}
