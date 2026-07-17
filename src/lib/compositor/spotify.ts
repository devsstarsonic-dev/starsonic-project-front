// Helpers puros (client-safe) do "Inspire-se" para links do Spotify.
// Extraem o trackId de um link/URI, rotulam o tom musical e espelham o formato
// das métricas retornadas pela spotify-extended-audio-features-api (RapidAPI).

// Métricas de áudio da faixa (campos numéricos do endpoint /v1/audio-features).
export type SpotifyAudioFeatures = {
  tempo: number; // BPM
  energy: number; // 0–1
  valence: number; // 0–1 (humor: 0 triste, 1 alegre)
  danceability: number; // 0–1
  acousticness: number; // 0–1
  instrumentalness: number; // 0–1
  liveness: number; // 0–1
  speechiness: number; // 0–1
  loudness: number; // dB (negativo)
  key: number; // 0–11 (classe de altura), -1 se desconhecido
  mode: number; // 1 = maior, 0 = menor
  keyLabel: string; // ex.: "Ré maior" (derivado de key+mode)
  timeSignature: number;
  durationMs: number;
};

// Metadados da faixa (endpoint /v1/tracks) para exibir a música inspirada.
export type SpotifyTrackMeta = {
  title: string;
  artist: string;
  cover: string; // URL da capa do álbum, ou ""
  year: string;
  durationMs: number;
  popularity: number;
};

// Aceita: open.spotify.com/track/{id}, open.spotify.com/intl-pt/track/{id},
// spotify:track:{id}. O id do Spotify é base62 de 22 caracteres.
export function extractSpotifyTrackId(input: string): string | null {
  const s = String(input ?? "").trim();
  const uri = s.match(/spotify:track:([A-Za-z0-9]{22})/);
  if (uri) return uri[1];
  const url = s.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?track\/([A-Za-z0-9]{22})/i);
  if (url) return url[1];
  return null;
}

// Nota (0=Dó … 11=Si, usando sustenido) + maior/menor. "" se key inválido.
const PITCH_CLASSES_PT = [
  "Dó", "Dó#", "Ré", "Ré#", "Mi", "Fá",
  "Fá#", "Sol", "Sol#", "Lá", "Lá#", "Si",
];

export function keyLabel(key: number, mode: number): string {
  if (!Number.isInteger(key) || key < 0 || key > 11) return "";
  const note = PITCH_CLASSES_PT[key];
  return `${note} ${mode === 0 ? "menor" : "maior"}`;
}

// Estrutura (duração desejada) a partir da duração real da faixa.
export function structureFromDuration(ms: number): "padrao" | "completa" | "estendida" {
  const min = ms / 60000;
  if (min > 5) return "estendida";
  if (min >= 3) return "completa";
  return "padrao";
}
