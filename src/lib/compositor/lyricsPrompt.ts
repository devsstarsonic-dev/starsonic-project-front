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

// A API de letras da Suno limita o prompt a 200 caracteres. Montamos um
// prompt curto, por ordem de prioridade, e cortamos no limite.
export const MAX_PROMPT_LENGTH = 200;

export function buildLyricsPrompt(formData: Partial<DetailedFormData>): string {
  const f = formData;
  const native = languageNative(f.language);

  // Partes em ordem de prioridade para a letra (as mais relevantes primeiro).
  const parts: string[] = [`Letra em ${native}`];

  // Dueto entra cedo para não ser cortado pelo limite de caracteres.
  const duetHint = duetLyricHint(f.voiceStyle);
  if (duetHint) parts.push(duetHint);

  const theme = joinList(f.theme);
  if (theme) parts.push(`sobre ${theme}`);

  const history = joinList(f.history);
  if (history) parts.push(history);

  const emotions = joinList(f.emotions);
  if (emotions) parts.push(`tom ${emotions}`);

  // Público-alvo não tem campo na geração de música → influencia a letra.
  const audience = joinList(f.audience);
  if (audience) parts.push(`para ${audience}`);

  const phrases = joinList(f.mandatoryPhrases);
  if (phrases) parts.push(`incluir "${phrases}"`);

  const names = joinList(f.names);
  if (names) parts.push(`citar ${names}`);

  // Versão base também não vai para a Suno → serve de referência para a letra.
  const baseVersion = joinList(f.baseVersion);
  if (baseVersion) parts.push(`base: ${baseVersion}`);

  const genre = joinList(f.genre);
  if (genre) parts.push(`estilo ${genre}`);

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
