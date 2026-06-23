import { DetailedFormData } from "@/lib/types";
import { LANGUAGES } from "@/lib/data/languages";

// Monta o prompt enviado à API de letras da Suno a partir das respostas
// das 3 etapas do compositor.

function languageNative(code?: string): string {
  return LANGUAGES.find((l) => l.code === code)?.native ?? "português";
}

function joinList(value: unknown): string | null {
  if (Array.isArray(value)) {
    const items = value.filter(Boolean);
    return items.length ? items.join(", ") : null;
  }
  const s = String(value ?? "").trim();
  return s || null;
}

/** Indica se há respostas suficientes para valer a geração automática. */
export function hasAnswers(formData: Partial<DetailedFormData>): boolean {
  return Boolean(formData.musicName || formData.theme || formData.genre || formData.history);
}

// Detecta dueto pelo estilo de voz e devolve a tag que a Suno entende (em inglês,
// que o modelo interpreta melhor) para de fato cantar em dueto.
export function duetStyleTag(voiceStyle?: string): string | null {
  const v = (voiceStyle ?? "").toLowerCase();
  if (!v.includes("dueto")) return null;
  if (v.includes("2 homens") || v.includes("dois homens")) return "duet, two male vocalists";
  if (v.includes("2 mulheres") || v.includes("duas mulheres")) return "duet, two female vocalists";
  return "duet, male and female vocals"; // 1 homem e 1 mulher
}

// Instrução para a letra sair em formato de dueto (partes marcadas por cantor).
function duetLyricHint(voiceStyle?: string): string | null {
  return duetStyleTag(voiceStyle)
    ? "em formato de dueto, alternando dois cantores (marque as partes)"
    : null;
}

// Dica de comprimento da música (a Suno não aceita segundos exatos; serve de guia).
function durationHint(duration?: string): string | null {
  switch (duration) {
    case "1min": return "short song, around 1 minute";
    case "2min": return "around 2 minutes long";
    case "3min": return "around 3 minutes long";
    case "4min": return "extended song, around 4 minutes";
    default: return null;
  }
}

// Limite de caracteres do prompt da letra. Aumentado para caber praticamente
// todas as respostas úteis do formulário do compositor.
export const MAX_PROMPT_LENGTH = 900;

export function buildLyricsPrompt(formData: Partial<DetailedFormData>): string {
  const f = formData;
  const native = languageNative(f.language);

  // Partes em ordem de prioridade para a letra (as mais relevantes primeiro),
  // reunindo praticamente todas as respostas úteis do wizard.
  const parts: string[] = [`Letra em ${native}`];

  // Dueto entra cedo para não ser cortado pelo limite de caracteres.
  const duetHint = duetLyricHint(f.voiceStyle);
  if (duetHint) parts.push(duetHint);

  const musicName = joinList(f.musicName);
  if (musicName) parts.push(`título "${musicName}"`);

  const theme = joinList(f.theme);
  if (theme) parts.push(`tema: ${theme}`);

  const history = joinList(f.history);
  if (history) parts.push(`contexto: ${history}`);

  const emotions = joinList(f.emotions);
  if (emotions) parts.push(`emoções ${emotions}`);

  // Público-alvo não tem campo na geração de música → influencia a letra.
  const audience = joinList(f.audience);
  if (audience) parts.push(`para ${audience}`);

  // Estrutura desejada (verso/refrão/ponte etc.).
  const structure = joinList(f.songStructure ?? f.structure);
  if (structure) parts.push(`estrutura: ${structure}`);

  const phrases = joinList(f.mandatoryPhrases);
  if (phrases) parts.push(`incluir obrigatoriamente: "${phrases}"`);

  const names = joinList(f.names);
  if (names) parts.push(`citar nomes: ${names}`);

  // Estilo/tom de voz ajudam a definir pronomes e clima da letra.
  const voiceStyle = joinList(f.voiceStyle);
  if (voiceStyle && !duetHint) parts.push(`voz ${voiceStyle}`);

  const voiceTone = joinList(f.voiceTone);
  if (voiceTone) parts.push(`tom de voz ${voiceTone}`);

  const references = joinList(f.references);
  if (references) parts.push(`inspiração: ${references}`);

  // Restrições → o que evitar na letra.
  const restrictions = joinList(f.restrictions);
  if (restrictions) parts.push(`evitar: ${restrictions}`);

  // Versão base também não vai para a Suno → serve de referência para a letra.
  const baseVersion = joinList(f.baseVersion);
  if (baseVersion) parts.push(`base: ${baseVersion}`);

  const genre = joinList(f.genre);
  if (genre) parts.push(`estilo musical ${genre}`);

  // Adiciona partes enquanto couber no limite de caracteres.
  let prompt = parts[0];
  for (const part of parts.slice(1)) {
    const next = `${prompt}, ${part}`;
    if (next.length > MAX_PROMPT_LENGTH) break;
    prompt = next;
  }

  return prompt.slice(0, MAX_PROMPT_LENGTH).trim();
}

// O campo "style" da geração de música (modelo V4_5) aceita até ~1000 chars.
// Empacotamos aqui TODAS as especificações musicais escolhidas no wizard.
export const MAX_STYLE_LENGTH = 1000;

export function buildMusicStyle(formData: Partial<DetailedFormData>): string {
  const f = formData;
  const parts: string[] = [];

  const add = (value: unknown) => {
    const v = joinList(value);
    if (v) parts.push(v);
  };

  add(f.genre); // gênero musical
  add(f.emotions); // clima/mood
  // Dueto: usa a tag em inglês ("duet, ...") que a Suno entende. Senão, o estilo cru.
  const duet = duetStyleTag(f.voiceStyle);
  if (duet) parts.push(duet);
  else add(f.voiceStyle); // estilo vocal (ex.: voz feminina)
  add(f.voiceTone); // tons de voz
  add(f.instruments); // instrumentos principais
  add(f.references); // artistas/estilos de inspiração
  add(languageNative(f.language)); // idioma do vocal
  // Duração desejada — vira uma dica de comprimento que a Suno usa como guia.
  const dur = durationHint(f.duration);
  if (dur) parts.push(dur);

  // Remove duplicatas mantendo a ordem e respeita o limite de caracteres.
  const seen = new Set<string>();
  const unique = parts.filter((p) => {
    const key = p.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.join(", ").slice(0, MAX_STYLE_LENGTH).trim();
}

// Estilos/conteúdos a evitar → enviados como negativeTags na geração.
export function buildNegativeTags(formData: Partial<DetailedFormData>): string {
  return (joinList(formData.restrictions) ?? "").slice(0, MAX_STYLE_LENGTH).trim();
}
