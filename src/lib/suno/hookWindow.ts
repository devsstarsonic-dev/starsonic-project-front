// Acha o melhor trecho pra cortar o jingle: usa a API de "timestamped
// lyrics" da Suno (marcações [Verse]/[Chorus]/etc com timestamp em segundos
// de cada palavra) pra localizar o refrão ("hook") e cortar exatamente do
// início do 1º refrão até o fim do 2º — em vez de cortar do zero do áudio.
// Se a Suno não retornar seções (instrumental, alinhamento falhou, etc.),
// devolve null e quem chamar cai de volta pro corte simples desde o início.

const SUNO_API_URL = process.env.SUNO_API_URL ?? "https://apibox.erweima.ai";

type AlignedWord = { word: string; startS: number; endS: number };
type Section = { tag: string; start: number; end: number };

const HOOK_TAG = /hook|chorus|ref(r[ãa]o)?/i;

function extractSections(words: AlignedWord[]): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const w of words) {
    const tagMatch = w.word.match(/^\[([^\]]+)\]/);
    if (tagMatch) {
      if (current) sections.push(current);
      current = { tag: tagMatch[1].trim(), start: w.startS, end: w.endS };
    } else if (current) {
      current.end = w.endS;
    }
  }
  if (current) sections.push(current);
  return sections;
}

export type HookWindow = { start: number; end: number };

export async function getHookWindow(taskId: string, audioId: string): Promise<HookWindow | null> {
  const key = process.env.SUNO_KEY;
  if (!key || !taskId || !audioId) return null;

  try {
    const res = await fetch(`${SUNO_API_URL}/api/v1/generate/get-timestamped-lyrics`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, audioId }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.code !== 200) return null;

    const words = (data.data?.alignedWords ?? []) as AlignedWord[];
    if (!words.length) return null;

    const hooks = extractSections(words).filter((s) => HOOK_TAG.test(s.tag));
    if (hooks.length >= 2) return { start: hooks[0].start, end: hooks[1].end };
    if (hooks.length === 1) return { start: hooks[0].start, end: hooks[0].end };
    return null;
  } catch {
    return null;
  }
}
