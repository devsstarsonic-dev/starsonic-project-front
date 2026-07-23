"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MUSIC_CREDIT_COST } from "@/lib/credits";
import { MUSIC_FAILED, type Track } from "@/lib/suno/status";

// Geração de música em SEGUNDO PLANO. Antes o ciclo compor → poll → salvar vivia
// como estado local do ReviewPanel (/compositor/revisar); ao sair da página o
// componente desmontava e a geração se perdia. Aqui o job vive num provider no
// nível do app (montado no (app)/layout, dentro do NowPlayingProvider), então o
// polling continua ao navegar. Persistido em sessionStorage para sobreviver a um
// refresh (mesmo padrão do CompositionContext).

const STORAGE_KEY = "starsonic:generation";
// Marca, no navegador, que o convidado já usou a música grátis.
const GUEST_USED_KEY = "starsonic:guestCreditUsed";
const GUEST_CREATION_KEY = "starsonic:guestCreationId";

export type GenTrack = Track & { taskId: string };

// Snapshot completo do que o ReviewPanel sabe ao iniciar — usado tanto para
// salvar na biblioteca quanto para re-renderizar a tela de resultado ao voltar.
export type StartPayload = {
  title: string;
  style: string;
  negativeTags: string;
  kind: "music" | "instrumental" | "jingle";
  instrumental: boolean;
  quantity: number;
  autoTitle: boolean;
  editedLyrics: string;
  answers: Record<string, unknown> | null;
  selectedAnswers: Record<string, string | string[]>;
  returnHref: string;
  styleOverride?: string;
};

export type GenJob = {
  id: string;
  status: string | null; // SUBMITTING | PENDING | TEXT_SUCCESS | FIRST_SUCCESS | SUCCESS
  taskIds: string[];
  tracks: GenTrack[];
  error: string | null;
  saving: boolean;
  saved: boolean;
  saveError: string | null;
  // snapshot (persistido)
  title: string;
  style: string;
  negativeTags: string;
  kind: "music" | "instrumental" | "jingle";
  instrumental: boolean;
  quantity: number;
  autoTitle: boolean;
  editedLyrics: string;
  answers: Record<string, unknown> | null;
  selectedAnswers: Record<string, string | string[]>;
  returnHref: string;
  startedAt: number;
};

type StartResult = { ok: boolean; error?: string };

type GenerationContextValue = {
  job: GenJob | null;
  /** true quando o job está compondo/processando (não terminou nem falhou). */
  generating: boolean;
  start: (p: StartPayload) => Promise<StartResult>;
  /** Descarta o job atual (limpa o card da sidebar). */
  dismiss: () => void;
};

const GenerationContext = createContext<GenerationContextValue | null>(null);

function guestCreditUsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(GUEST_USED_KEY) === "1";
}

// Título derivado (fallback quando o GPT falha): usa o tema ou a 1ª linha da letra.
function deriveTitle(lyrics: string, theme?: string): string {
  if (theme && theme.trim()) {
    return theme.trim().split(/\s+/).slice(0, 6).join(" ");
  }
  const line = (lyrics || "")
    .split("\n")
    .map((l) => l.replace(/\[[^\]]*\]/g, "").trim())
    .find((l) => l.length > 0);
  return line ? line.split(/\s+/).slice(0, 6).join(" ") : "";
}

export function isJobGenerating(job: GenJob | null): boolean {
  if (!job) return false;
  if (job.error) return false;
  if (job.status === "SUCCESS") return false;
  return true; // SUBMITTING, PENDING, TEXT_SUCCESS, FIRST_SUCCESS
}

export function GenerationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [job, setJob] = useState<GenJob | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedRef = useRef(false); // evita salvar duas vezes

  // Reidrata o job salvo (sobrevive a refresh). Roda só no cliente, após o mount.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as GenJob;
        // "SUBMITTING" é transitório (nunca chegou a virar taskIds) — descarta.
        if (saved && saved.status !== "SUBMITTING") {
          savedRef.current = !!saved.saved;
          setJob(saved);
        }
      }
    } catch {
      /* ignora JSON inválido */
    }
    setHydrated(true);
  }, []);

  // Persiste a cada mudança do job (após a hidratação).
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (job) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(job));
      else window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignora limite de quota */
    }
  }, [job, hydrated]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Polling: consulta TODAS as gerações (1 por par de músicas) e junta as faixas.
  const jobId = job?.id;
  const taskKey = job?.taskIds.join(",") ?? "";
  useEffect(() => {
    if (!jobId || !taskKey) return;
    const tids = taskKey.split(",");
    stopPolling();

    async function check() {
      try {
        const results = await Promise.all(
          tids.map(async (tid) => {
            try {
              const res = await fetch(`/api/criar-musica/status?taskId=${encodeURIComponent(tid)}`);
              const data = await res.json();
              if (!res.ok) return { tid, status: "PENDING", tracks: [] as Track[] };
              return {
                tid,
                status: String(data.status ?? "PENDING"),
                tracks: (Array.isArray(data.tracks) ? data.tracks : []) as Track[],
              };
            } catch {
              return { tid, status: "PENDING", tracks: [] as Track[] };
            }
          }),
        );

        const merged: GenTrack[] = results.flatMap((r) => r.tracks.map((t) => ({ ...t, taskId: r.tid })));
        const statuses = results.map((r) => r.status);
        let done = false;

        setJob((j) => {
          if (!j || j.id !== jobId) return j;
          let status = j.status;
          let error = j.error;
          if (statuses.every((s) => s === "SUCCESS")) {
            status = "SUCCESS";
            done = true;
          } else if (statuses.some((s) => MUSIC_FAILED.has(s))) {
            // Alguma falhou: mantém o que veio; conclui se houver faixas.
            if (merged.some((t) => t.audioUrl)) status = "SUCCESS";
            else error = "Não foi possível gerar a música. Tente novamente mais tarde.";
            done = true;
          } else {
            status = merged.some((t) => t.audioUrl) ? "FIRST_SUCCESS" : "PENDING";
          }
          return { ...j, tracks: merged.length ? merged : j.tracks, status, error };
        });

        if (done) stopPolling();
      } catch {
        // erro de rede transitório — tenta de novo no próximo ciclo
      }
    }

    // Não repolla um job já terminal (ex.: rehidratou em SUCCESS/erro).
    if (job && (job.status === "SUCCESS" || job.error)) return;

    check();
    pollRef.current = setInterval(check, 5000);
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, taskKey, stopPolling]);

  // Quando a música fica pronta, salva AS DUAS versões (v1 e v2) na biblioteca.
  const jobStatus = job?.status;
  const jobTracksKey = job?.tracks.map((t) => t.id).join(",") ?? "";
  useEffect(() => {
    if (!job || jobStatus !== "SUCCESS" || job.saved || savedRef.current) return;
    const ready = job.tracks.filter((t) => t.audioUrl);
    if (ready.length === 0) return;

    const id = job.id;
    const snap = job;
    savedRef.current = true;
    setJob((j) => (j && j.id === id ? { ...j, saving: true, saveError: null } : j));

    (async () => {
      try {
        const sb = createClient();
        const {
          data: { user },
        } = await sb.auth.getUser();
        const isGuest = !user;

        const answers = snap.answers;
        const theme =
          (typeof answers?.theme === "string" && (answers.theme as string)) ||
          (typeof answers?.genre === "string" && (answers.genre as string)) ||
          "";
        const base = snap.autoTitle
          ? deriveTitle(snap.editedLyrics, theme) || "Nova música"
          : snap.title || ready[0].title || "Nova música";

        let firstId: string | null = null;
        let lastCredits: number | null = null;
        const createdIds: string[] = [];

        // Salva cada versão como uma criação (v1, v2…).
        // Só a 1ª desconta crédito e guarda as respostas do formulário.
        for (let i = 0; i < ready.length; i++) {
          const t = ready[i];
          const res = await fetch("/api/criar-musica/salvar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: `${base} · v${i + 1}`,
              style: snap.style,
              kind: snap.kind,
              audioUrl: t.audioUrl,
              imageUrl: t.imageUrl,
              duration: t.duration,
              lyrics: snap.editedLyrics,
              sunoTaskId: t.taskId,
              sunoAudioId: t.id,
              badge: `V${i + 1}`,
              chargeCredits: i === 0,
              answers: i === 0 ? snap.answers ?? null : null,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            savedRef.current = false; // permite tentar de novo
            setJob((j) =>
              j && j.id === id
                ? { ...j, saving: false, saveError: data.error ?? "Não foi possível salvar na biblioteca." }
                : j,
            );
            return;
          }
          if (i === 0) firstId = data.id ?? null;
          if (data.id) createdIds.push(data.id as string);
          if (typeof data.credits === "number") lastCredits = data.credits;
        }

        // "STARSONIC cria o nome": gera o título (GPT) a partir da letra e
        // ATUALIZA o title de cada criação na tabela creations.
        if (snap.autoTitle && createdIds.length && snap.editedLyrics.trim()) {
          try {
            const tr = await fetch("/api/title", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lyrics: snap.editedLyrics, genre: snap.style }),
            });
            const td = await tr.json();
            const gpt = tr.ok && td.title ? String(td.title) : "";
            if (gpt) {
              const updates = createdIds.map((cid, i) => ({ id: cid, title: `${gpt} · v${i + 1}` }));
              await fetch("/api/creations/title", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updates }),
              });
            }
          } catch {
            /* mantém o título provisório se a geração falhar */
          }
        }

        setJob((j) => (j && j.id === id ? { ...j, saved: true, saving: false } : j));
        if (isGuest && typeof window !== "undefined") {
          window.localStorage.setItem(GUEST_USED_KEY, "1");
          if (firstId) window.localStorage.setItem(GUEST_CREATION_KEY, firstId);
        } else if (!isGuest) {
          // Atualiza a UI do servidor (créditos/criações) sem depender do valor.
          void lastCredits;
          router.refresh();
        }
      } catch {
        savedRef.current = false;
        setJob((j) =>
          j && j.id === id ? { ...j, saving: false, saveError: "Falha de conexão ao salvar na biblioteca." } : j,
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobStatus, jobTracksKey, jobId, router]);

  // Envia a letra para a Suno. Cria o job imediatamente (para o card da sidebar
  // aparecer na hora) e coleta os taskIds (Suno gera 2 músicas por chamada).
  const start = useCallback(
    async (p: StartPayload): Promise<StartResult> => {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();

      // Convidado: pode gerar 1 música grátis. Se já usou, vai pro cadastro.
      if (!user && guestCreditUsed()) {
        router.push("/cadastro");
        return { ok: false };
      }
      // Logado: bloqueia se não houver créditos suficientes.
      if (user) {
        const { data } = await sb.from("profiles").select("credits").eq("id", user.id).maybeSingle();
        const credits = (data?.credits as number | undefined) ?? null;
        if (credits !== null && credits < MUSIC_CREDIT_COST) {
          return {
            ok: false,
            error: `Créditos insuficientes (você tem ${credits}, precisa de ${MUSIC_CREDIT_COST}). Faça upgrade do plano.`,
          };
        }
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      savedRef.current = false;
      setJob({
        id,
        status: "SUBMITTING",
        taskIds: [],
        tracks: [],
        error: null,
        saving: false,
        saved: false,
        saveError: null,
        title: p.title,
        style: p.style,
        negativeTags: p.negativeTags,
        kind: p.kind,
        instrumental: p.instrumental,
        quantity: p.quantity,
        autoTitle: p.autoTitle,
        editedLyrics: p.editedLyrics,
        answers: p.answers,
        selectedAnswers: p.selectedAnswers,
        returnHref: p.returnHref,
        startedAt: Date.now(),
      });

      // Suno gera 2 músicas por chamada → nº de chamadas = quantidade / 2.
      const wanted = p.quantity && p.quantity > 0 ? p.quantity : 2;
      const calls = Math.max(1, Math.ceil(wanted / 2));

      const fail = (msg: string): StartResult => {
        setJob((j) => (j && j.id === id ? { ...j, status: null, error: msg } : j));
        return { ok: false, error: msg };
      };

      try {
        const ids: string[] = [];
        for (let k = 0; k < calls; k++) {
          const res = await fetch("/api/criar-musica", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: p.title,
              style: p.styleOverride || p.style || "Pop brasileiro",
              negativeTags: p.negativeTags,
              lyrics: p.instrumental ? "" : p.editedLyrics,
              instrumental: p.instrumental,
              model: "V5_5",
            }),
          });
          const data = await res.json();
          if (res.ok && data.taskId) ids.push(data.taskId);
          else if (k === 0) return fail(data.error ?? "Não foi possível iniciar a geração.");
        }
        if (ids.length === 0) return fail("Não foi possível iniciar a geração.");
        setJob((j) => (j && j.id === id ? { ...j, taskIds: ids, status: "PENDING" } : j));
        return { ok: true };
      } catch {
        return fail("Falha de conexão ao enviar para a API.");
      }
    },
    [router],
  );

  const dismiss = useCallback(() => {
    stopPolling();
    savedRef.current = false;
    setJob(null);
  }, [stopPolling]);

  // O card serve para avisar/voltar enquanto o usuário está em OUTRA tela. Assim
  // que ele volta para a tela da criação ou vai começar outra música, o card já
  // cumpriu o papel — é descartado de vez, sem precisar fechar na mão e sem
  // voltar depois. O ReviewPanel guarda um espelho local do job, então os
  // players continuam na tela da criação mesmo com o job descartado.
  useEffect(() => {
    if (!job) return;
    if (isJobGenerating(job)) return; // ainda gerando: mantém o acompanhamento
    if (pathname === job.returnHref || pathname === "/compositor") dismiss();
  }, [pathname, job, dismiss]);

  const value: GenerationContextValue = {
    job,
    generating: isJobGenerating(job),
    start,
    dismiss,
  };

  return <GenerationContext.Provider value={value}>{children}</GenerationContext.Provider>;
}

// null-safe (igual a useNowPlaying): retorna null fora do provider.
export function useGeneration(): GenerationContextValue | null {
  return useContext(GenerationContext);
}
