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

// A API de letras da Suno limita o prompt a 200 caracteres. Montamos um
// prompt curto, por ordem de prioridade, e cortamos no limite.
export const MAX_PROMPT_LENGTH = 200;

export function buildLyricsPrompt(formData: Partial<DetailedFormData>): string {
  const f = formData;
  const native = languageNative(f.language);

  // Partes em ordem de prioridade para a letra (as mais relevantes primeiro).
  const parts: string[] = [`Letra em ${native}`];

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
  add(f.voiceStyle); // estilo vocal (ex.: voz feminina)
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
