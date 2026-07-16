import { useCallback, useState } from "react";
import type { DetailedFormData } from "@/lib/types";

// Gera a letra COMPLETA com o GPT a partir das respostas do compositor.
// Chamada SÍNCRONA à /api/criar-musica/letra-ia (sem taskId/polling): o GPT
// devolve { lyrics, title } de uma vez, com a letra fiel à história.

export type LyricsRequest = {
  formData: Partial<DetailedFormData>;
  jingle?: boolean;
};

export function useLyricsGeneration() {
  const [lyrics, setLyrics] = useState<string>("");
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (req: LyricsRequest) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/criar-musica/letra-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: req.formData, jingle: req.jingle === true }),
      });
      const data = await res.json();
      if (!res.ok || !data.lyrics) {
        setError(data.error ?? "Não foi possível gerar a letra.");
        setLoading(false);
        return;
      }
      setLyrics(data.lyrics);
      setTitle(data.title ?? null);
    } catch {
      setError("Falha de conexão ao gerar a letra.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { lyrics, title, loading, error, generate };
}
