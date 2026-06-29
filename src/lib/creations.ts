import { createClient } from "@/lib/supabase/client";

// Helpers de criações usados pelos componentes de estúdio (client-side).

// Marca uma criação como tendo vídeo e guarda a URL gerada.
export async function persistVideo(creationId: string, url: string): Promise<void> {
  const sb = createClient();
  await sb.from("creations").update({ has_video: true, video_url: url }).eq("id", creationId);
}

// Monta o prompt de geração de mídia a partir de uma música:
// descrição digitada + nome/estilo + trecho da letra + diretrizes fixas.
export function buildMediaPrompt(opts: {
  kind: "video" | "image";
  title: string;
  genre?: string | null;
  lyrics?: string | null;
  userPrompt?: string;
  maxLength: number;
  lyricsLength: number;
}): string {
  const { kind, title, genre, lyrics, userPrompt = "", maxLength, lyricsLength } = opts;
  const lyricSnippet = (lyrics ?? "").replace(/\s+/g, " ").trim().slice(0, lyricsLength);

  const intro =
    kind === "video"
      ? `Videoclipe para a música "${title}"`
      : `Imagem artística para a música "${title}"`;
  const lyricLine =
    kind === "video"
      ? lyricSnippet
        ? `baseado na letra: ${lyricSnippet}`
        : ""
      : lyricSnippet
        ? `inspirada na letra: ${lyricSnippet}`
        : "";
  const guidelines =
    kind === "video"
      ? "cinematográfico, cenas que contam a história da letra, alta qualidade"
      : "composição chamativa, cores vibrantes, alto contraste, alta qualidade, detalhada";

  return [
    intro,
    genre ? `estilo ${genre}` : "",
    userPrompt.trim(),
    lyricLine,
    guidelines,
  ]
    .filter(Boolean)
    .join(", ")
    .slice(0, maxLength);
}
