import type { SpotifyAudioFeatures } from "@/lib/compositor/spotify";
import { keyLabel } from "@/lib/compositor/spotify";

// Puxa o "DNA numérico" real de uma faixa do Spotify via
// spotify-extended-audio-features-api (RapidAPI). Só servidor: usa RAPIDAPI_KEY.
// O plano free tem cota DIÁRIA baixa, então gastamos só 1 requisição por análise
// (só /audio-features; título/artista/capa já vêm do MusicBrainz na UI).
// Retorna um resultado tipado para a UI distinguir "sem cota" de "indisponível".

const RAPIDAPI_HOST = "spotify-extended-audio-features-api.p.rapidapi.com";
const BASE = `https://${RAPIDAPI_HOST}/v1`;

export type SpotifyDNAResult =
  | { ok: true; features: SpotifyAudioFeatures }
  | { ok: false; reason: "no-key" | "quota" | "unavailable" };

// Cache por trackId (processo do servidor): cada faixa gasta cota da RapidAPI
// UMA vez — a "primeira requisição". Repetições da mesma faixa vêm daqui, sem
// consumir a cota diária (baixa no plano free). Guarda só sucessos.
const cache = new Map<string, SpotifyAudioFeatures>();

// GET com timeout curto; devolve o status HTTP + JSON (ou null em falha de rede).
async function fetchJson(url: string, key: string): Promise<{ status: number; data: any | null }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": key,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  } catch {
    return { status: 0, data: null };
  } finally {
    clearTimeout(t);
  }
}

function toFeatures(raw: any): SpotifyAudioFeatures | null {
  if (!raw || typeof raw.tempo !== "number") return null;
  const key = Number.isFinite(raw.key) ? Number(raw.key) : -1;
  const mode = Number.isFinite(raw.mode) ? Number(raw.mode) : 1;
  const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  return {
    tempo: num(raw.tempo),
    energy: num(raw.energy),
    valence: num(raw.valence),
    danceability: num(raw.danceability),
    acousticness: num(raw.acousticness),
    instrumentalness: num(raw.instrumentalness),
    liveness: num(raw.liveness),
    speechiness: num(raw.speechiness),
    loudness: num(raw.loudness),
    key,
    mode,
    keyLabel: keyLabel(key, mode),
    timeSignature: num(raw.time_signature),
    durationMs: num(raw.duration_ms),
  };
}

export async function fetchSpotifyDNA(trackId: string): Promise<SpotifyDNAResult> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key || !trackId) return { ok: false, reason: "no-key" };

  const hit = cache.get(trackId);
  if (hit) return { ok: true, features: hit }; // já pago antes: não gasta cota

  const { status, data } = await fetchJson(
    `${BASE}/audio-features/${encodeURIComponent(trackId)}`,
    key,
  );
  if (status === 429) return { ok: false, reason: "quota" }; // cota diária estourou
  const features = toFeatures(data);
  if (!features) return { ok: false, reason: "unavailable" };
  cache.set(trackId, features);
  return { ok: true, features };
}
