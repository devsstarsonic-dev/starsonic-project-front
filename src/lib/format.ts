export function formatPlays(n: number): string {
  if (n >= 1000) {
    const v = n / 1000;
    return `${v.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(n);
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} minuto${min > 1 ? "s" : ""}`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} hora${h > 1 ? "s" : ""}`;
  const d = Math.floor(h / 24);
  if (d < 7) return `há ${d} dia${d > 1 ? "s" : ""}`;
  const w = Math.floor(d / 7);
  return `há ${w} semana${w > 1 ? "s" : ""}`;
}

const KIND_LABEL: Record<string, string> = {
  music: "Música",
  lyric: "Letra",
  video: "Vídeo Visualizer",
  cover: "Capa de Álbum",
  podcast: "Áudio Podcast",
};

const KIND_ICON: Record<string, string> = {
  music: "🎼",
  lyric: "📝",
  video: "🎬",
  cover: "🎨",
  podcast: "🎙️",
};

export function kindLabel(kind: string): string {
  return KIND_LABEL[kind] ?? "Criação";
}

export function kindIcon(kind: string): string {
  return KIND_ICON[kind] ?? "🎵";
}

export function formatBRL(cents: number): string {
  const reais = cents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(reais);
}
