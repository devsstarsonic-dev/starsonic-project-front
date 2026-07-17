import { DetailedFormData } from "@/lib/types";
import { LANGUAGES } from "@/lib/data/languages";
import { duetStyleTag } from "@/lib/compositor/lyricsPrompt";
import type { ChatMessage } from "@/lib/openai";

// Monta as mensagens (system + user) enviadas ao GPT para escrever a letra
// COMPLETA a partir das respostas do compositor. Diferente do prompt da Suno
// (que é comprimido a 200 chars e ignora a narrativa), aqui mandamos a história
// inteira e todo o contexto do wizard, com regras rígidas de fidelidade ao enredo.

function languageNative(code?: string): string {
  return LANGUAGES.find((l) => l.code === code)?.label ?? "português (Brasil)";
}

// Valores de placeholder ("deixe a IA escolher") não devem ir para o prompt —
// senão viram instrução sem sentido. Espelha o isAuto de lyricsPrompt.ts.
function isAuto(value: unknown): boolean {
  const t = String(value ?? "").trim().toLowerCase();
  return t === "auto" || /starsonic escolhe|escolhe para voc[eê]/.test(t);
}

// Junta listas/strings ignorando vazios e placeholders. null quando não há nada.
function joinList(value: unknown): string | null {
  if (Array.isArray(value)) {
    const items = value.filter((v) => v && !isAuto(v)).map((v) => String(v).trim());
    return items.length ? items.join(", ") : null;
  }
  const s = String(value ?? "").trim();
  if (!s || isAuto(s)) return null;
  return s;
}

const SYSTEM_PROMPT = `Você é um LETRISTA profissional brasileiro da Star Sonic. Sua tarefa é escrever a letra COMPLETA de uma música a partir da história e das escolhas do usuário.

REGRA MAIS IMPORTANTE — FIDELIDADE À HISTÓRIA:
- Escreva a letra SOBRE a história que o usuário contou. Preserve os personagens, os NOMES PRÓPRIOS (ex.: se a história fala de "Gabriel", a letra fala de Gabriel), o cenário (ex.: chuva, noite escura), o conflito e o desfecho.
- É PROIBIDO trocar o enredo por um tema genérico (amizade, superação, fé, amor abstrato) que não esteja na história. Se a história é "procurar meu irmão Gabriel na chuva", a letra é sobre essa busca — não sobre amizade em geral.
- Quando a história for pessoal, escreva em 1ª pessoa.
- Se houver uma pessoa central, o REFRÃO deve chamá-la diretamente e criar um gancho memorável (ex.: "Gabriel, onde você está?").

ESTRUTURA (use estes marcadores de seção, em português, cada um em sua própria linha):
[Intro] (opcional, curto)
[Verso 1]
[Pré-Refrão]
[Refrão]
[Verso 2]
[Pré-Refrão]
[Refrão]
[Ponte]
[Refrão]

QUALIDADE:
- Rimas e métrica cantáveis no idioma pedido; versos com tamanho parecido.
- O refrão se repete igual a cada retorno (é o gancho da música).
- Linguagem natural e emotiva, sem clichês vazios.

RESPONDA SOMENTE com um JSON válido, sem texto fora do JSON, no formato EXATO:
{"title": "título curto e forte da música (no idioma da letra)", "lyrics": "a letra completa, com quebras de linha reais (\\n) e os marcadores [Seção]"}`;

/** Monta as mensagens de chat (system + user) para o GPT gerar a letra. */
export function buildLyricsMessages(
  formData: Partial<DetailedFormData>,
  opts?: { jingle?: boolean },
): ChatMessage[] {
  const f = formData;
  const lang = languageNative(f.language);

  const lines: string[] = [`Idioma da letra: ${lang} (escreva a letra INTEIRA neste idioma).`];

  if (opts?.jingle) {
    // Jingle comercial: marca, produto e slogan são o que definem a letra.
    const brand = joinList(f.musicName);
    const product = joinList(f.theme);
    const slogan = joinList(f.mandatoryPhrases);
    lines.push("Tipo: JINGLE COMERCIAL — letra CURTA, cativante e fácil de memorizar (não uma música completa).");
    if (brand) {
      lines.push(
        `Marca / empresa (OBRIGATÓRIO): cante e repita o nome "${brand}" na letra, ` +
          `principalmente no refrão/gancho final. O nome "${brand}" deve aparecer, escrito exatamente assim.`,
      );
      lines.push(`Use "${brand}" também como título do jingle.`);
    }
    if (product) lines.push(`Produto / o que vende: ${product}`);
    if (slogan) lines.push(`Slogan (inclua exatamente): ${slogan}`);
  } else {
    // Estúdio: a história é o coração da letra.
    const history = joinList(f.history);
    const theme = joinList(f.theme);
    if (history) lines.push(`HISTÓRIA (base obrigatória da letra):\n${history}`);
    if (theme) lines.push(`Tema central: ${theme}`);
    if (!history && !theme) lines.push("Tema: livre — crie algo emocionante e coerente.");
    const musicName = joinList(f.musicName);
    if (musicName) lines.push(`Nome da música (use como título): ${musicName}`);
  }

  const genre = joinList(f.genre);
  if (genre) lines.push(`Gênero musical: ${genre}`);

  const emotions = joinList(f.emotions);
  if (emotions) lines.push(`Emoções / clima: ${emotions}`);

  const audience = joinList(f.audience);
  if (audience) lines.push(`Público-alvo: ${audience}`);

  // Dueto: alterna dois cantores com partes marcadas.
  if (duetStyleTag(f.voiceStyle)) {
    lines.push("Formato: DUETO — alterne dois cantores, marcando as partes de cada um.");
  }

  const phrases = joinList(f.mandatoryPhrases);
  if (phrases && !opts?.jingle) lines.push(`Inclua obrigatoriamente estas frases na letra: ${phrases}`);

  const names = joinList(f.names);
  if (names) lines.push(`Cite estes nomes na letra: ${names}`);

  const structure = joinList(f.songStructure) ?? joinList(f.structure);
  if (structure) lines.push(`Estrutura desejada: ${structure}`);

  const duration = joinList(f.duration);
  if (duration) lines.push(`Duração aproximada: ${duration}`);

  const restrictions = joinList(f.restrictions);
  if (restrictions) lines.push(`Evite (não use): ${restrictions}`);

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: lines.join("\n\n") },
  ];
}
