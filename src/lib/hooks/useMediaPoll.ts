import { useCallback, useEffect, useRef } from "react";

// Polling genérico de status para gerações de mídia (vídeo/imagem) que
// retornam um único resultado por uma chave (ex.: "videoUrl", "imageUrl").
// Substitui os loops de setInterval copiados em VideoStudio e CoverStudio.

type PollConfig = {
  /** URL do endpoint de status (já com os parâmetros). */
  url: string;
  /** Campo da resposta que carrega o resultado pronto. */
  resultKey: string;
  /** Status que indicam falha definitiva. */
  failed: Set<string>;
  /** Chamado a cada ciclo com o status atual. */
  onStatus?: (status: string) => void;
  /** Chamado uma vez quando o resultado fica pronto. */
  onResult: (value: string) => void;
  /** Chamado quando a geração falha ou o endpoint retorna erro. */
  onError: (message: string) => void;
  /** Intervalo entre consultas (ms). Padrão: 5000. */
  intervalMs?: number;
};

export function useMediaPoll() {
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Limpa o intervalo ao desmontar.
  useEffect(() => stop, [stop]);

  const start = useCallback(
    ({ url, resultKey, failed, onStatus, onResult, onError, intervalMs = 5000 }: PollConfig) => {
      stop();
      const check = async () => {
        try {
          const r = await fetch(url);
          const d = await r.json();
          if (!r.ok) {
            onError(d.error ?? "Erro ao consultar o status.");
            stop();
            return;
          }
          if (d.status) onStatus?.(d.status);
          if (d[resultKey]) {
            onResult(d[resultKey] as string);
            stop();
          } else if (failed.has(d.status)) {
            onError("A geração falhou. Tente novamente.");
            stop();
          }
        } catch {
          // erro de rede transitório — tenta de novo no próximo ciclo
        }
      };
      check();
      pollRef.current = setInterval(check, intervalMs);
    },
    [stop],
  );

  return { start, stop };
}
