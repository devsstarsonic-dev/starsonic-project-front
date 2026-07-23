import { DetailedFormData, VoiceReference } from "@/lib/types";
import { languageTag } from "@/lib/data/languages";

// Monta o prompt enviado à API de letras da Suno a partir das respostas
// das 3 etapas do compositor.

// Resolve código ("en-US") OU texto livre da opção "Outro" ("japonês").
const languageNative = languageTag;

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
/** minúsculas + sem acentos — o texto pode vir do wizard ou da IA. */
export function normalizeVoice(value?: string): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function duetStyleTag(voiceStyle?: string): string | null {
  const v = normalizeVoice(voiceStyle);
  if (!/dueto|duet|dupla/.test(v)) return null;

  const male = /homem|homens|masculin|\bmale\b|\bmen\b/.test(v);
  const female = /mulher|mulheres|feminin|\bfemale\b|\bwomen\b/.test(v);

  // Misto só quando os DOIS gêneros aparecem (ex.: "1 homem e 1 mulher").
  if (male && female) return "duet, male and female vocals";
  if (male) return "duet, two male vocalists";
  if (female) return "duet, two female vocalists";
  // "Dueto" sem gênero: NÃO assume misto — antes qualquer dueto não reconhecido
  // virava "male and female vocals", trocando dueto de 2 homens por misto.
  return "duet";
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
    // Duração escolhida no formulário de Jingle (cards de 15s/30s/60s/PADRÃO).
    case "15s": return "very short jingle, around 15 seconds";
    case "30s": return "short jingle, around 30 seconds";
    case "60s": return "jingle, around 60 seconds";
    case "PADRÃO": return "jingle, around 30 seconds";
    default: return null;
  }
}

// A API de letras da Suno limita o prompt a 200 caracteres. Por isso o prompt
// é CONCISO e por prioridade: tema/contexto e gênero primeiro (o que mais guia
// a letra), depois o resto, até estourar o limite.
export const MAX_PROMPT_LENGTH = 200;

// Empacota partes na ordem de prioridade dada, respeitando MAX_PROMPT_LENGTH.
// Para no primeiro item que não couber (não pula pra tentar os próximos).
function packParts(parts: string[]): string {
  let prompt = parts[0];
  for (const part of parts.slice(1)) {
    const next = `${prompt}, ${part}`;
    if (next.length > MAX_PROMPT_LENGTH) break;
    prompt = next;
  }
  return prompt.slice(0, MAX_PROMPT_LENGTH).trim();
}

export function buildLyricsPrompt(
  formData: Partial<DetailedFormData>,
  opts?: { jingle?: boolean },
): string {
  const f = formData;
  const native = languageNative(f.language);

  // Jingle: prompt próprio — marca, produto e slogan são o que definem um
  // jingle comercial (diferente do Estúdio, onde o "assunto" é o tema/história).
  if (opts?.jingle) {
    const brand = joinList(f.musicName); // nome da empresa/marca
    const product = joinList(f.theme); // o que a marca vende
    const slogan = joinList(f.mandatoryPhrases);
    const genre = joinList(f.genre);
    const vibe = joinList(f.emotions);
    const audience = joinList(f.audience);

    const parts: string[] = [`Jingle comercial em ${native}`];
    if (brand) parts.push(`para a marca ${brand}`);
    if (product) parts.push(`vendendo ${product}`);
    if (slogan) parts.push(`slogan "${slogan}"`);
    if (genre) parts.push(`gênero ${genre}`);
    if (vibe) parts.push(`vibe ${vibe}`);
    if (audience) parts.push(`para ${audience}`);

    return packParts(parts);
  }

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

  return packParts(parts);
}

// Jingle: letra curta e cativante — sem corte de áudio depois, uma letra
// curta é o que faz a Suno gerar um áudio curto. O prompt já pede isso à
// IA; este limite é a garantia final (corta sem quebrar palavra/linha no meio).
export const MAX_JINGLE_LYRICS_LENGTH = 500;

export function truncateLyrics(text: string, max = MAX_JINGLE_LYRICS_LENGTH): string {
  const t = (text ?? "").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastBreak = Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(" "));
  return (lastBreak > max * 0.6 ? cut.slice(0, lastBreak) : cut).trim();
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

// O campo "style" da geração de música aceita até 1000 caracteres. Empacotamos
// aqui TODAS as especificações musicais escolhidas no wizard (gênero, mood, voz,
// tom, instrumentos, referências, estrutura, idioma e comprimento) — traduzidas
// para inglês quando isso melhora a interpretação da Suno.
export const MAX_STYLE_LENGTH = 1000;

// Traduz estilo/tom de voz (PT) para tags em inglês que a Suno entende melhor.
const VOICE_EN: Record<string, string> = {
  // estilos de voz
  "masculina": "male vocals",
  "feminina": "female vocals",
  "melodia kids": "kids vocals, children's choir",
  "coral": "choir vocals",
  "suave e melódico": "smooth melodic vocals",
  "rouco e expressivo": "raspy expressive vocals",
  "claro e cristalino": "clear crystalline vocals",
  "profundo e grave": "deep low vocals",
  "agudo e leve": "high light airy vocals",
  "dramático": "dramatic vocals",
  // tons de voz
  "rouca": "raspy",
  "suave": "soft",
  "emocionante": "emotional",
  "poderosa": "powerful",
  "agressiva": "aggressive",
  "divertida": "playful",
  "épica": "epic",
  "triste": "sad",
  "inspiradora": "inspiring",
  "dramática": "dramatic",
  "alegre": "cheerful",
  "apaixonado": "passionate",
  "reflexivo": "reflective",
  "irônico": "ironic",
  "esperançoso": "hopeful",
};

function toEnVoice(value: unknown): string | null {
  const items = Array.isArray(value) ? value : [value];
  const out = items
    .map((v) => String(v ?? "").trim())
    .filter((v) => v && !isAuto(v))
    .map((v) => VOICE_EN[v.toLowerCase()] ?? v);
  return out.length ? out.join(", ") : null;
}

// Clima/emoção (PT) → tag de mood em inglês que a Suno entende melhor.
const MOOD_EN: Record<string, string> = {
  "motivação": "motivational",
  "fé": "faith-driven, spiritual",
  "determinação": "determined",
  "alegria": "joyful, upbeat",
  "esperança": "hopeful",
  "inspiração": "inspiring",
  "emoção": "emotional",
  "romance": "romantic",
  "nostalgia": "nostalgic",
  "gratidão": "grateful, heartfelt",
  "superação": "uplifting, triumphant",
  "energia": "energetic, high energy",
};

function toEnMood(value: unknown): string | null {
  const items = Array.isArray(value) ? value : [value];
  const out = items
    .map((v) => String(v ?? "").trim())
    .filter((v) => v && !isAuto(v))
    .map((v) => MOOD_EN[v.toLowerCase()] ?? v);
  return out.length ? Array.from(new Set(out)).join(", ") : null;
}

// "Onde vai usar" (Instrumental) → tag de contexto de uso em inglês. Para os
// demais modos (público-alvo do Studio/Jingle), mantém o texto original —
// ainda ajuda a Suno a calibrar o tom mesmo sem tradução.
const USAGE_EN: Record<string, string> = {
  "vídeo / youtube": "video background music",
  "podcast": "podcast intro/outro music",
  "ambientação": "ambient background music",
  "meditação": "meditation music, calm and soothing",
  "loja / estabelecimento": "retail store background music",
  "jogo / app": "video game background music, loopable",
};

function toEnUsage(value: unknown): string | null {
  const s = String(value ?? "").trim();
  if (!s || isAuto(s)) return null;
  return USAGE_EN[s.toLowerCase()] ?? s;
}

// Gênero vocal (PT) → male/female vocals.
function vocalGenderTag(value?: string): string | null {
  const v = (value ?? "").trim().toLowerCase();
  if (!v || isAuto(v)) return null;
  if (/(masculin|homem|male)/.test(v)) return "male vocals";
  if (/(feminin|mulher|female)/.test(v)) return "female vocals";
  return null;
}

// Padrão de estrutura (COMPOSITION_STRUCTURES, em PT) → tag em inglês.
function structureTag(value?: string): string | null {
  const raw = (value ?? "").trim();
  if (!raw || isAuto(raw) || /livre|deixar a ia/i.test(raw)) return null;
  const en = raw
    .replace(/versos?/gi, "verse")
    .replace(/refr[ãa]os?/gi, "chorus")
    .replace(/ponte|bridge/gi, "bridge")
    .replace(/intro/gi, "intro")
    .replace(/outro/gi, "outro")
    .replace(/[úu]nico/gi, "single")
    .replace(/com m[úu]ltiplos/gi, "with multiple")
    .trim();
  return `structure: ${en}`;
}

// "Estrutura desejada" (padrão/completa/estendida) → dica de comprimento.
function songStructureHint(value?: string): string | null {
  const v = (value ?? "").trim().toLowerCase();
  if (!v || isAuto(v)) return null;
  if (v.includes("padr")) return "around 2-3 minutes";
  if (v.includes("complet")) return "full song, around 3-5 minutes";
  if (v.includes("estend")) return "extended song, over 5 minutes";
  return null;
}

// A Suno rejeita o estilo quando encontra nome de artista/música (direitos
// autorais). Aqui mantemos apenas referências que sejam descrições de som
// genéricas (ex.: "guitarra distorcida, vibe anos 80") e descartamos qualquer
// item que pareça nome próprio (palavra com inicial maiúscula, "&", "feat").
function sanitizeReferences(value: unknown): string | null {
  const joined = joinList(value);
  if (!joined) return null;
  const kept = joined
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((item) => {
      if (/[&]|\bfeat\.?\b|\bft\.?\b/i.test(item)) return false; // colaborações/nomes
      const hasProperNoun = item.split(/\s+/).some((w) => /^[A-ZÀ-Þ][a-zà-ÿ]+/.test(w));
      return !hasProperNoun;
    });
  return kept.length ? kept.join(", ") : null;
}

// Voz criada importada como referência: transforma TODA a informação salva da
// voz (gênero vocal, timbre, estilos, descrição e nome) em tags de estilo que a
// Suno usa para imitar a voz de referência. O nome é de uma voz fictícia do
// próprio usuário (sem direitos autorais), então pode ir para o style.
function vocalGenderRefTag(gender: string): string {
  const g = (gender || "").toLowerCase();
  if (g === "male") return "male vocals";
  if (g === "female") return "female vocals";
  if (g === "nb") return "androgynous vocals";
  return "";
}

export function buildVoiceReferenceStyle(v?: VoiceReference): string {
  if (!v) return "";
  const parts: string[] = [];
  const g = vocalGenderRefTag(v.gender);
  if (g) parts.push(g);
  const styles = (v.styles ?? []).filter(Boolean);
  if (styles.length) parts.push(styles.join(", "));
  if (v.timbre?.trim()) parts.push(v.timbre.trim());
  const desc = (v.description || "").trim().replace(/\s+/g, " ");
  if (desc) parts.push(desc.slice(0, 200));
  if (v.name?.trim()) parts.push(`reference voice "${v.name.trim()}"`);
  return parts.join(", ");
}

export function buildMusicStyle(formData: Partial<DetailedFormData>): string {
  const f = formData;
  const parts: string[] = [];

  const add = (value: unknown) => {
    const v = joinList(value);
    if (v) parts.push(v);
  };

  // VOZ IMPORTADA tem PRIORIDADE: entra ANTES de tudo (gênero, mood…) para
  // dominar o estilo. Como a Suno pesa mais as primeiras tags e o de-dup mantém
  // a 1ª ocorrência, o estilo da voz importada guia a geração. Ela define a voz
  // por completo — estilo de voz, gênero vocal, tom e artistas de referência do
  // formulário ficam ocultos e são ignorados aqui.
  if (f.voiceRef) {
    const voiceRefStyle = buildVoiceReferenceStyle(f.voiceRef);
    if (voiceRefStyle) parts.push(voiceRefStyle);
  }

  add(f.genre); // gênero musical (mais importante — vem primeiro)

  // Clima/mood traduzido (ex.: "Alegria, Fé" -> "joyful, upbeat, faith-driven").
  const mood = toEnMood(f.emotions);
  if (mood) parts.push(mood);

  // Onde vai usar (ex.: "Meditação" -> "meditation music, calm and soothing").
  const usage = toEnUsage(f.audience);
  if (usage) parts.push(usage);

  // Sem voz importada: usa o estilo/tom de voz do formulário.
  if (!f.voiceRef) {
    // dueto vira tag em inglês; senão traduz o estilo de voz para inglês.
    const duet = duetStyleTag(f.voiceStyle);
    if (duet) parts.push(duet);
    else {
      const vs = toEnVoice(f.voiceStyle); // ex.: "Masculina" -> "male vocals"
      if (vs) parts.push(vs);
      // Reforça o gênero vocal quando informado separadamente.
      const vg = vocalGenderTag(f.vocalGender);
      if (vg) parts.push(vg);
    }

    // Tom da voz traduzido (ex.: "Rouca, Poderosa" -> "raspy, powerful vocal tone").
    const vt = toEnVoice(f.voiceTone);
    if (vt) parts.push(`${vt} vocal tone`);
  }

  // Instrumentos: se o usuário escolheu instrumentos reais, usa-os.
  // Se escolheu "A STARSONIC escolhe" (auto) ou nada, preenche pelo gênero.
  const chosenInstruments = joinList(f.instruments);
  if (chosenInstruments) parts.push(chosenInstruments);
  else {
    const auto = instrumentsForGenre(joinList(f.genre) ?? "");
    if (auto) parts.push(auto);
  }

  // NÃO enviar nomes de artistas/músicas de referência para a Suno: a API
  // bloqueia o estilo quando detecta nome de artista real (direitos autorais),
  // fazendo a geração falhar. O "som" já está definido por gênero + mood + voz +
  // tom + instrumentos. Só aproveitamos as referências que forem descrições de
  // som genéricas (sem parecer nome próprio) — as demais são ignoradas.
  // Com voz importada, o "som" já vem da voz — ignora artistas de referência.
  const refs = f.voiceRef ? null : sanitizeReferences(f.references);
  if (refs) parts.push(refs);

  // Padrão de estrutura (verso/refrão/ponte…), quando escolhido.
  const struct = structureTag(f.structure);
  if (struct) parts.push(struct);

  // Andamento (BPM) detectado no "Inspire-se" — a Suno entende a tag "72 BPM".
  if (typeof f.bpm === "number" && f.bpm >= 40 && f.bpm <= 220) {
    parts.push(`${Math.round(f.bpm)} BPM`);
  }

  // Métricas reais do Spotify (audio-features): energia/humor/dançabilidade/tom
  // viram tags em inglês para orientar o som na Suno.
  const sf = f.spotifyFeatures;
  if (sf) {
    if (sf.energy >= 0.66) parts.push("high energy");
    else if (sf.energy <= 0.33) parts.push("low energy");
    if (sf.valence >= 0.6) parts.push("uplifting mood");
    else if (sf.valence <= 0.35) parts.push("melancholic mood");
    if (sf.danceability >= 0.66) parts.push("danceable");
    if (sf.acousticness >= 0.6) parts.push("acoustic");
    else if (sf.acousticness <= 0.15) parts.push("electronic");
    // Tom musical (ex.: "in D major") — sf.key de 0–11, mode 1 maior / 0 menor.
    const KEYS_EN = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    if (sf.key >= 0 && sf.key <= 11) {
      parts.push(`in ${KEYS_EN[sf.key]} ${sf.mode === 0 ? "minor" : "major"}`);
    }
  }

  add(languageNative(f.language)); // idioma do vocal

  // Comprimento desejado: usa a duração explícita ou a "estrutura desejada".
  const dur = durationHint(f.duration) ?? songStructureHint(f.songStructure);
  if (dur) parts.push(dur);

  // Remove duplicatas mantendo a ordem e respeita o limite de caracteres.
  const seen = new Set<string>();
  const unique = parts.filter((p) => {
    const key = p.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Junta e corta no limite SEM cortar uma tag no meio (remove a última parcial).
  let style = unique.join(", ");
  if (style.length > MAX_STYLE_LENGTH) {
    style = style.slice(0, MAX_STYLE_LENGTH);
    const lastComma = style.lastIndexOf(",");
    if (lastComma > 0) style = style.slice(0, lastComma);
  }
  return style.trim();
}

// Estilos/conteúdos a evitar → enviados como negativeTags na geração.
export function buildNegativeTags(formData: Partial<DetailedFormData>): string {
  return (joinList(formData.restrictions) ?? "").slice(0, MAX_STYLE_LENGTH).trim();
}
