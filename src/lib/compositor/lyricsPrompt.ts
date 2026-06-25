import { DetailedFormData } from "@/lib/types";
import { LANGUAGES } from "@/lib/data/languages";

// Monta o prompt enviado à API de letras da Suno a partir das respostas
// das 3 etapas do compositor.

function languageNative(code?: string): string {
  return LANGUAGES.find((l) => l.code === code)?.native ?? "português";
}

// Opções de placeholder ("deixe a IA escolher") NÃO devem ir para a Suno —
// senão viram tag de estilo sem sentido e estragam a geração.
function isAuto(value: unknown): boolean {
  const t = String(value ?? "").trim().toLowerCase();
  return t === "auto" || /starsonic escolhe|escolhe para voc[eê]/.test(t);
}

function joinList(value: unknown): string | null {
  if (Array.isArray(value)) {
    const items = value.filter((v) => v && !isAuto(v)).map((v) => String(v));
    return items.length ? items.join(", ") : null;
  }
  const s = String(value ?? "").trim();
  if (!s || isAuto(s)) return null;
  return s;
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

// A API de letras da Suno limita o prompt a 200 caracteres. Por isso o prompt
// é CONCISO e por prioridade: tema/contexto e gênero primeiro (o que mais guia
// a letra), depois o resto, até estourar o limite.
export const MAX_PROMPT_LENGTH = 200;

export function buildLyricsPrompt(formData: Partial<DetailedFormData>): string {
  const f = formData;
  const native = languageNative(f.language);

  const theme = joinList(f.theme);
  const history = joinList(f.history);
  const subject = theme || history; // o que mais importa para a letra

  // Front-load: idioma + tema + gênero logo no começo (cabem no limite de 200).
  const parts: string[] = [`Letra em ${native}`];
  if (subject) parts.push(`sobre ${subject}`);

  const genre = joinList(f.genre);
  if (genre) parts.push(`gênero ${genre}`);

  const emotions = joinList(f.emotions);
  if (emotions) parts.push(`tom ${emotions}`);

  // Dueto.
  const duetHint = duetLyricHint(f.voiceStyle);
  if (duetHint) parts.push(duetHint);

  const phrases = joinList(f.mandatoryPhrases);
  if (phrases) parts.push(`incluir "${phrases}"`);

  const names = joinList(f.names);
  if (names) parts.push(`citar ${names}`);

  // Se não houve tema mas houve contexto, garante o contexto.
  if (!subject && history) parts.push(history);

  const audience = joinList(f.audience);
  if (audience) parts.push(`para ${audience}`);

  const restrictions = joinList(f.restrictions);
  if (restrictions) parts.push(`evitar ${restrictions}`);

  // Adiciona partes enquanto couber no limite de caracteres.
  let prompt = parts[0];
  for (const part of parts.slice(1)) {
    const next = `${prompt}, ${part}`;
    if (next.length > MAX_PROMPT_LENGTH) break;
    prompt = next;
  }

  return prompt.slice(0, MAX_PROMPT_LENGTH).trim();
}

// Instrumentos típicos por gênero — usados quando o usuário escolhe
// "A STARSONIC escolhe para você" (ou não seleciona nada) nos instrumentos.
function instrumentsForGenre(genre?: string): string | null {
  const g = (genre ?? "").toLowerCase();
  if (!g) return null;
  const map: { keys: string[]; instruments: string }[] = [
    { keys: ["rap", "hip hop", "hip-hop", "trap"], instruments: "808 bass, trap beats, hi-hats, synth" },
    { keys: ["sertanejo", "agro"], instruments: "viola caipira, acordeão, guitarra, bateria, baixo" },
    { keys: ["gospel", "louvor", "worship", "adoração"], instruments: "piano, órgão, cordas, coral, bateria" },
    { keys: ["funk"], instruments: "batidão de funk, grave pesado, sintetizador, beats eletrônicos" },
    { keys: ["pagode", "samba"], instruments: "cavaquinho, pandeiro, surdo, tantã, violão" },
    { keys: ["forró", "forro", "piseiro", "arrocha"], instruments: "acordeão, zabumba, triângulo, baixo" },
    { keys: ["mpb"], instruments: "violão, piano, percussão, baixo acústico" },
    { keys: ["rock", "punk", "metal"], instruments: "guitarra elétrica, baixo, bateria" },
    { keys: ["pop"], instruments: "sintetizador, piano, guitarra, bateria eletrônica" },
    { keys: ["eletrôn", "eletron", "edm", "house", "techno"], instruments: "sintetizadores, bateria eletrônica, baixo, drops" },
    { keys: ["reggae"], instruments: "guitarra skank, baixo, bateria, órgão" },
    { keys: ["jazz", "blues"], instruments: "piano, saxofone, contrabaixo, bateria com vassourinhas" },
    { keys: ["country"], instruments: "violão, banjo, slide guitar, bateria" },
  ];
  for (const m of map) if (m.keys.some((k) => g.includes(k))) return m.instruments;
  // Genérico, caso o gênero não esteja mapeado.
  return "guitarra, baixo, bateria, teclado";
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
  // Instrumentos: se o usuário escolheu instrumentos reais, usa-os.
  // Se escolheu "A STARSONIC escolhe" (auto) ou nada, preenche pelo gênero.
  const chosenInstruments = joinList(f.instruments);
  if (chosenInstruments) parts.push(chosenInstruments);
  else {
    const auto = instrumentsForGenre(joinList(f.genre) ?? "");
    if (auto) parts.push(auto);
  }
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
