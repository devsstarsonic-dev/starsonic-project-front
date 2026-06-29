import { useCallback, useEffect, useRef, useState } from "react";
import { LYRICS_FAILED as FAILED } from "@/lib/suno/status";

// Gera a letra na Suno (POST cria a task; polling consulta o resultado).

export function useLyricsGeneration() {
  const [lyrics, setLyrics] = useState<string>("");
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const generate = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return;

      stopPolling();
      setLoading(true);
      setError(null);

      let taskId: string | null = null;
      try {
        const res = await fetch("/api/criar-musica/letra", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        if (!res.ok || !data.taskId) {
          setError(data.error ?? "Não foi possível gerar a letra.");
          setLoading(false);
          return;
        }
        taskId = data.taskId;
      } catch {
        setError("Falha de conexão ao gerar a letra.");
        setLoading(false);
        return;
      }

      async function check() {
        try {
          const res = await fetch(
            `/api/criar-musica/letra/status?taskId=${encodeURIComponent(taskId!)}`,
          );
          const data = await res.json();
          if (!res.ok) {
            setError(data.error ?? "Erro ao consultar a letra.");
            setLoading(false);
            stopPolling();
            return;
          }
          if (data.status === "SUCCESS" && data.lyrics) {
            setLyrics(data.lyrics);
            setTitle(data.title ?? null);
            setLoading(false);
            stopPolling();
            return;
          }
          if (FAILED.has(data.status)) {
            setError("A geração da letra falhou. Tente novamente.");
            setLoading(false);
            stopPolling();
          }
        } catch {
          // erro de rede transitório — tenta de novo no próximo ciclo
        }
      }

      check();
      pollRef.current = setInterval(check, 4000);
    },
    [stopPolling],
  );

  return { lyrics, title, loading, error, generate };
}
