// Constantes e helpers compartilhados das gerações (Suno / KIE / WaveSpeed).
// Antes estavam copiados em ReviewPanel, CriarMusicaForm, Letrista,
// VideoStudio, CoverStudio e useLyricsGeneration — centralizados aqui.

// ===== Conjuntos de status de falha por tipo de geração =====
export const MUSIC_FAILED = new Set([
  "CREATE_TASK_FAILED",
  "GENERATE_AUDIO_FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

export const VIDEO_FAILED = new Set([
  "CREATE_TASK_FAILED",
  "GENERATE_MP4_FAILED",
  "FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

export const IMAGE_FAILED = new Set([
  "CREATE_TASK_FAILED",
  "GENERATE_MP4_FAILED",
  "GENERATE_AUDIO_FAILED",
  "FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

export const LYRICS_FAILED = new Set([
  "CREATE_TASK_FAILED",
  "GENERATE_LYRICS_FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

// ===== Rótulos exibidos ao usuário =====
export const MUSIC_STATUS_LABEL: Record<string, string> = {
  PENDING: "Na fila…",
  TEXT_SUCCESS: "Letra pronta, gerando áudio…",
  FIRST_SUCCESS: "Primeira versão pronta, finalizando…",
  SUCCESS: "Concluída!",
};

export const VIDEO_STATUS_LABEL: Record<string, string> = {
  PENDING: "Na fila…",
  GENERATING: "Renderizando o vídeo…",
  SUCCESS: "Concluído!",
};

// ===== Etapas da tela de loading da música (ordem em que a Suno avança) =====
export const MUSIC_STEPS: { status: string; label: string }[] = [
  { status: "PENDING", label: "Na fila" },
  { status: "TEXT_SUCCESS", label: "Letra pronta" },
  { status: "FIRST_SUCCESS", label: "Gerando áudio" },
  { status: "SUCCESS", label: "Concluída" },
];

export function musicStepIndex(status: string | null): number {
  const i = MUSIC_STEPS.findIndex((s) => s.status === status);
  return i < 0 ? 0 : i;
}

// Link de download do áudio (passa pelo proxy do servidor para forçar o nome).
export function audioDownloadHref(audioUrl: string, title: string): string {
  return `/api/criar-musica/download?url=${encodeURIComponent(audioUrl)}&title=${encodeURIComponent(title)}`;
}

// Faixa retornada pelo polling da Suno.
export type Track = {
  id: string | null;
  title: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  duration: number | null;
};

// Conta palavras de um texto (letra) de forma consistente em todo o app.
export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

// Formata segundos → "m:ss". Vazio quando não houver duração.
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
