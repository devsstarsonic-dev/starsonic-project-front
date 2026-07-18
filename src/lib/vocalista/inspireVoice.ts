import { extractSpotifyTrackId } from "@/lib/compositor/spotify";
import { MAX_STYLES } from "@/lib/data/artistVoice";
import type { ArtistVoiceDraft, ArtistVoiceGender } from "@/lib/types";

// "Inspire-se" da Voz de Artista: recebe só o LINK de uma música e reaproveita o
// MESMO pipeline do Inspire-se do compositor (resolve a faixa no MusicBrainz via
// oEmbed + /api/inspire, que usa a RapidAPI do Spotify para métricas reais). O
// DNA detectado é mapeado para os campos da voz (estilos, gênero vocal, timbre e
// descrição) — que são exatamente os que /api/vocalista/salvar-voz grava no banco.

// Resposta do /api/inspire (mesma do InspireBox).
type Detected = {
  recognized: boolean;
  title: string;
  artist: string;
  genre: string;
  voice: string;
  voiceTone: string[];
  emotions: string[];
  instruments: string[];
  bpm: number | null;
  references: string;
  vibe: string;
  theme: string;
  structure: string;
  language: string;
  audience: string;
};

// Estilo de voz detectado (VOICE_STYLES, ex.: "Feminina", "Dueto: 2 homens")
// → gênero da voz salvo (male | female | nb).
function mapGender(voice: string): ArtistVoiceGender | null {
  const v = (voice || "").toLowerCase();
  const hasMale = /mascul|homem|homens/.test(v);
  const hasFemale = /femin|mulher|mulheres/.test(v);
  if (hasMale && hasFemale) return "nb"; // dueto misto
  if (hasFemale) return "female";
  if (hasMale) return "male";
  return null;
}

// Descrição em PT resumindo o DNA vocal (sem nome do artista original — a voz é
// sintética). É o texto salvo em creation_answers.description e usado na amostra.
function buildDescription(d: Detected): string {
  const parts: string[] = [];
  if (d.voice) parts.push(`Voz ${d.voice.toLowerCase()}`);
  if (d.voiceTone?.length) parts.push(`tom ${d.voiceTone.join(", ").toLowerCase()}`);
  if (d.vibe) parts.push(`clima ${d.vibe.toLowerCase()}`);
  if (d.emotions?.length) parts.push(d.emotions.join(", ").toLowerCase());
  let s = parts.join(", ");
  if (d.genre) s = s ? `${s}. Inspirada em ${d.genre.toLowerCase()}` : `Inspirada em ${d.genre.toLowerCase()}`;
  return s.replace(/\s+/g, " ").trim().slice(0, 500);
}

// Analisa o link e devolve o patch do rascunho da voz. Lança em erro do /api/inspire.
export async function analyzeVoiceFromLink(link: string): Promise<Partial<ArtistVoiceDraft>> {
  // 1. Resolve a faixa pelo link (oEmbed + MusicBrainz) — igual ao InspireBox,
  //    para o GPT identificar a música certa em vez de chutar pelo URL.
  let mbTitle = "";
  let mbArtist = "";
  let year = "";
  let isrc = "";
  try {
    const r = await fetch(`/api/musicbrainz/search?link=${encodeURIComponent(link)}`);
    const d = await r.json();
    const top = Array.isArray(d?.candidates) ? d.candidates[0] : null;
    if (top) {
      mbTitle = String(top.title ?? "");
      mbArtist = String(top.artist ?? "");
      year = String(top.year ?? "");
      isrc = String(top.isrc ?? "");
    }
  } catch {
    // segue sem candidato — o /api/inspire ainda usa o link + Spotify features
  }

  const spotifyTrackId = extractSpotifyTrackId(link) ?? undefined;

  // 2. Análise do DNA (mesmo endpoint do compositor; usa a RapidAPI do Spotify).
  const res = await fetch("/api/inspire", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ link, name: mbTitle, mbTitle, mbArtist, year, isrc, spotifyTrackId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Não foi possível analisar a música.");
  const d = data as Detected;

  // 3. Mapeia o DNA para os campos que a voz salva no banco.
  return {
    styles: (d.genre ? [d.genre] : []).slice(0, MAX_STYLES),
    gender: mapGender(d.voice),
    timbre: (d.voiceTone ?? []).join(", "),
    description: buildDescription(d),
    referenceName: d.artist ? `${d.title} — ${d.artist}` : d.title,
  };
}
