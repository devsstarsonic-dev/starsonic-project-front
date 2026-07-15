import { NextRequest, NextResponse } from "next/server";
import { openaiChat } from "@/lib/openai";
import { GENRES } from "@/lib/data/genres";
import { EMOTIONS } from "@/lib/data/emotions";
import { INSTRUMENTS } from "@/lib/data/instruments";
import { VOICE_STYLES, VOICE_TONES } from "@/lib/data/voice";
import { LANGUAGES } from "@/lib/data/languages";
import { SONG_STRUCTURES } from "@/lib/data/structures";

// "Inspire-se": recebe o link e o NOME de uma música de referência e usa o GPT
// para IDENTIFICAR a música e extrair TODO o "DNA musical" dela (gênero, voz,
// tom, emoções, instrumentos, referências, estrutura, idioma e público) —
// para depois gerar uma música NOVA em estilo fiel ao original, com letra
// diferente. As opções são normalizadas para o vocabulário exato do compositor,
// então tudo já cai pré-selecionado nas etapas / no prompt da Suno.

// Opções válidas (mantêm o resultado alinhado com os campos do wizard).
const EMO = EMOTIONS.join(", ");
const GEN = GENRES.join(", ");
const INSTR = INSTRUMENTS.filter((i) => !i.toLowerCase().includes("starsonic")).join(", ");
const VOICES = VOICE_STYLES.filter((v) => !v.toLowerCase().includes("starsonic")).join(", ");
const TONES = VOICE_TONES.filter((v) => !v.toLowerCase().includes("starsonic")).join(", ");

const SYSTEM_PROMPT = `Você é um MUSICÓLOGO especialista da Star Sonic. Sua tarefa é IDENTIFICAR com precisão uma música de referência a partir do NOME (e opcionalmente do LINK) e extrair TODAS as características musicais importantes dela, para servir de base para uma música NOVA no mesmo estilo (com letra diferente).

Use o seu conhecimento real sobre a música, o artista e o gênero. Seja fiel ao original: se é Evidências (Chitãozinho & Xororó), é sertanejo romântico, voz masculina em dueto, dramática/emocionante, com piano/violão/orquestra. Analise de verdade, não chute genérico.

Responda SOMENTE com um JSON válido, sem texto fora do JSON, no formato EXATO:
{
  "recognized": true se você reconhece a música/artista, false se está estimando pelo nome,
  "title": "nome da música identificada (corrija erros de digitação do usuário)",
  "artist": "artista/banda principal, ou \"\" se desconhecido",
  "genre": "UM gênero, escolha o mais próximo desta lista: ${GEN}",
  "voice": "UM tipo de voz desta lista: ${VOICES}",
  "voiceTone": ["1 a 3 tons desta lista: ${TONES}"],
  "emotions": ["1 a 3 emoções desta lista: ${EMO}"],
  "instruments": ["2 a 5 instrumentos-chave desta lista: ${INSTR}"],
  "bpm": andamento aproximado da música em batidas por minuto (número inteiro entre 40 e 220, ex.: 72),
  "references": "2 a 3 artistas/estilos parecidos separados por vírgula (para orientar o som)",
  "vibe": "2 a 4 palavras de clima em português separadas por vírgula (para exibir)",
  "theme": "o assunto/tema central da música em UMA frase curta em português",
  "structure": "padrao (2-3min), completa (3-5min) ou estendida (+5min) — conforme a duração típica da música",
  "language": "código do idioma predominante: pt-BR, en-US, es-ES, fr-FR, it-IT ou de-DE",
  "audience": "público típico dessa música em poucas palavras (ex.: Casais, Jovens, Fiéis, Público geral)"
}

Regras:
- SEMPRE escolha os valores de genre, voice, voiceTone, emotions e instruments a partir das listas fornecidas (o mais próximo possível). NUNCA invente valores fora das listas para esses campos.
- Se não reconhecer a música, faça a melhor estimativa plausível pelo nome/estilo. NUNCA deixe campos vazios (exceto artist, que pode ser "").
- Não copie a letra original; capture apenas o estilo e o tema.`;

// ── Normalização: casa a resposta da IA com o vocabulário exato do wizard. ──
function pick(value: unknown, options: readonly string[], fallback: string): string {
  const s = String(value ?? "").trim().toLowerCase();
  if (!s) return fallback;
  const exact = options.find((o) => o.toLowerCase() === s);
  if (exact) return exact;
  const contains = options.find((o) => o.toLowerCase().includes(s) || s.includes(o.toLowerCase()));
  return contains ?? fallback;
}

function pickMany(value: unknown, options: readonly string[], max: number): string[] {
  const arr = Array.isArray(value) ? value : String(value ?? "").split(/[,;]+/);
  const out: string[] = [];
  for (const raw of arr) {
    const s = String(raw ?? "").trim().toLowerCase();
    if (!s) continue;
    const match =
      options.find((o) => o.toLowerCase() === s) ??
      options.find((o) => o.toLowerCase().includes(s) || s.includes(o.toLowerCase()));
    if (match && !out.includes(match)) out.push(match);
    if (out.length >= max) break;
  }
  return out;
}

function pickLanguage(value: unknown): string {
  const s = String(value ?? "").trim().toLowerCase();
  const byCode = LANGUAGES.find((l) => l.code.toLowerCase() === s);
  if (byCode) return byCode.code;
  const byName = LANGUAGES.find(
    (l) => l.native.toLowerCase() === s || l.label.toLowerCase().includes(s),
  );
  return byName?.code ?? "pt-BR";
}

function clampBpm(value: unknown): number | null {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 40 || n > 220) return null;
  return n;
}

function pickStructure(value: unknown): string {
  const s = String(value ?? "").trim().toLowerCase();
  const match = SONG_STRUCTURES.find(
    (st) => st.value === s || st.label.toLowerCase().includes(s),
  );
  if (match && match.value !== "auto") return match.value;
  if (s.includes("estend") || s.includes("+5") || s.includes("5 min")) return "estendida";
  if (s.includes("complet") || s.includes("3-5") || s.includes("3 a 5")) return "completa";
  return "padrao";
}

export async function POST(req: NextRequest) {
  let body: {
    link?: unknown;
    name?: unknown;
    mbTitle?: unknown;
    mbArtist?: unknown;
    year?: unknown;
    isrc?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 300);
  const link = String(body.link ?? "").trim().slice(0, 500);
  if (!name && !link) {
    return NextResponse.json({ error: "Informe o nome ou o link da música." }, { status: 400 });
  }

  // Música confirmada pelo usuário no MusicBrainz: identificação exata, sem chute.
  const mbTitle = String(body.mbTitle ?? "").trim().slice(0, 200);
  const mbArtist = String(body.mbArtist ?? "").trim().slice(0, 200);
  const year = String(body.year ?? "").trim().slice(0, 10);
  const isrc = String(body.isrc ?? "").trim().slice(0, 20);
  const confirmed = mbTitle
    ? `Música CONFIRMADA via MusicBrainz (use exatamente esta, não troque): ${mbTitle}${
        mbArtist ? ` — ${mbArtist}` : ""
      }${year ? ` (${year})` : ""}${isrc ? ` [ISRC ${isrc}]` : ""}\n`
    : "";

  const result = await openaiChat({
    maxTokens: 500,
    temperature: 0.2, // baixa = análise mais precisa e fiel ao original
    json: true,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `${confirmed}Música de referência:\nNome: ${name || "—"}\nLink: ${link || "—"}\n\nIdentifique a música e responda no formato JSON completo.`,
      },
    ],
  });

  if (!result.ok) {
    console.error("[inspire] GPT falhou:", result.error);
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(result.text || "{}");
  } catch {
    return NextResponse.json({ error: "Resposta da IA em formato inesperado." }, { status: 502 });
  }

  const str = (v: unknown, fallback: string) => {
    const s = String(v ?? "").trim();
    return s || fallback;
  };

  // Normaliza tudo para o vocabulário exato do compositor.
  const genre = pick(parsed.genre, GENRES, "Pop");
  const voice = pick(parsed.voice, VOICE_STYLES, "Masculina");
  const voiceTone = pickMany(parsed.voiceTone, VOICE_TONES, 3);
  const emotions = pickMany(parsed.emotions, EMOTIONS, 3);
  const instruments = pickMany(parsed.instruments, INSTRUMENTS, 5);

  return NextResponse.json({
    recognized: parsed.recognized === true,
    title: str(parsed.title, name || "Música de referência"),
    artist: str(parsed.artist, ""),
    genre,
    voice,
    voiceTone: voiceTone.length ? voiceTone : ["Emocionante"],
    emotions: emotions.length ? emotions : ["Emoção"],
    instruments,
    bpm: clampBpm(parsed.bpm),
    references: str(parsed.references, ""),
    vibe: str(parsed.vibe, "Envolvente"),
    theme: str(parsed.theme, name || "Inspiração musical"),
    structure: pickStructure(parsed.structure),
    language: pickLanguage(parsed.language),
    audience: str(parsed.audience, "Público geral"),
  });
}
