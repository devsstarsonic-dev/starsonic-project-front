import { NextRequest, NextResponse } from "next/server";

// Busca de música no MusicBrainz para o autocomplete da aba "Inspire-se".
// Recebe um NOME (`q`) OU um LINK (`link`) do Spotify/YouTube. Quando vem link,
// resolvemos o título via oEmbed (sem API key) e usamos como busca. Devolve uma
// lista de candidatos (Título · Artista · Ano · ISRC) para o usuário escolher a
// gravação certa ANTES de mandar pro /api/inspire — assim o OpenAI não chuta a
// música errada. Roda no servidor: o MusicBrainz exige User-Agent próprio e
// limita ~1 req/s, e evitamos CORS no browser.

export const runtime = "nodejs";
export const revalidate = 0;

// MusicBrainz pede um User-Agent identificável (senão pode bloquear).
const MB_USER_AGENT = "StarSonic/1.0 ( https://starsonic.app )";
const MB_URL = "https://musicbrainz.org/ws/2/recording";

type Source = "spotify" | "youtube" | "other";

type Candidate = {
  id: string;
  title: string;
  artist: string;
  year: string;
  isrc: string;
  cover: string; // URL da capa (iTunes) ou "" se não achou
  score: number;
};

// Capa via iTunes Search (grátis, sem auth) — cobertura bem melhor que o
// Cover Art Archive. Busca por "título artista" e sobe a arte de 100 → 300px.
async function fetchCover(title: string, artist: string): Promise<string> {
  const term = encodeURIComponent(`${title} ${artist}`.trim());
  const data = await fetchJson(`https://itunes.apple.com/search?term=${term}&entity=song&limit=1`);
  const url = data?.results?.[0]?.artworkUrl100;
  return url ? String(url).replace("100x100bb", "300x300bb") : "";
}

function detectSource(link: string): Source {
  const s = link.toLowerCase();
  if (s.includes("spotify.com") || s.startsWith("spotify:")) return "spotify";
  if (s.includes("youtube.com") || s.includes("youtu.be")) return "youtube";
  return "other";
}

// Faz um fetch com timeout curto; devolve null em qualquer falha.
async function fetchJson(url: string, headers?: Record<string, string>): Promise<any | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, { headers, signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

// Resolve o título de uma música a partir do link, via oEmbed (sem auth).
async function resolveTitle(link: string, source: Source): Promise<string> {
  if (source === "spotify") {
    const data = await fetchJson(`https://open.spotify.com/oembed?url=${encodeURIComponent(link)}`);
    if (data?.title) return String(data.title);
  } else if (source === "youtube") {
    const data = await fetchJson(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(link)}&format=json`,
    );
    // Título do vídeo costuma vir "Artista - Música (Official...)"; o MB tolera.
    if (data?.title) {
      const author = data.author_name ? ` ${data.author_name}` : "";
      return `${data.title}${author}`;
    }
  }
  // Fonte desconhecida ou oEmbed falhou: usa o próprio link como busca (fallback).
  return link;
}

function toCandidates(recordings: any[]): Candidate[] {
  const out: Candidate[] = [];
  const seen = new Set<string>();
  for (const rec of recordings) {
    if (!rec?.title) continue;
    const artist = Array.isArray(rec["artist-credit"])
      ? rec["artist-credit"].map((a: any) => a?.name).filter(Boolean).join(", ")
      : "";
    const key = `${rec.title}|${artist}`.toLowerCase();
    if (seen.has(key)) continue; // MB repete a mesma gravação em vários releases
    seen.add(key);
    out.push({
      id: String(rec.id ?? ""),
      title: String(rec.title),
      artist,
      year: String(rec["first-release-date"] ?? "").slice(0, 4),
      isrc: Array.isArray(rec.isrcs) && rec.isrcs[0] ? String(rec.isrcs[0]) : "",
      cover: "",
      score: Number(rec.score ?? 0),
    });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, 6);
}

// A busca de recording NÃO traz ISRC nem capa. Para cada candidato buscamos, em
// paralelo, o ISRC (lookup no MB) e a capa (iTunes). Tolerante a falha: se algum
// serviço throttlar, o campo correspondente fica vazio.
async function enrichCandidates(candidates: Candidate[]): Promise<Candidate[]> {
  return Promise.all(
    candidates.map(async (c) => {
      const [mb, cover] = await Promise.all([
        c.id
          ? fetchJson(`${MB_URL}/${c.id}?inc=isrcs&fmt=json`, {
              "User-Agent": MB_USER_AGENT,
              Accept: "application/json",
            })
          : Promise.resolve(null),
        fetchCover(c.title, c.artist),
      ]);
      const isrc = Array.isArray(mb?.isrcs) && mb.isrcs[0] ? String(mb.isrcs[0]) : c.isrc;
      return { ...c, isrc, cover };
    }),
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const link = (searchParams.get("link") ?? "").trim().slice(0, 500);
  let q = (searchParams.get("q") ?? "").trim().slice(0, 300);

  let source: Source = "other";
  if (!q && link) {
    source = detectSource(link);
    q = (await resolveTitle(link, source)).trim().slice(0, 300);
  }

  if (!q || q.length < 3) {
    return NextResponse.json({ candidates: [], source });
  }

  const url = `${MB_URL}?query=${encodeURIComponent(q)}&fmt=json&limit=8`;
  const data = await fetchJson(url, {
    "User-Agent": MB_USER_AGENT,
    Accept: "application/json",
  });

  // Em falha do MusicBrainz, degrada silencioso (sem dropdown, sem erro).
  const recordings = Array.isArray(data?.recordings) ? data.recordings : [];
  const candidates = await enrichCandidates(toCandidates(recordings));
  return NextResponse.json({ candidates, source });
}
