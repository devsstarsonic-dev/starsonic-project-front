"use client";

import { ReactNode, useState, useMemo, useEffect, useRef, memo, useCallback } from "react";
import Link from "next/link";
import type { ReviewUi } from "@/lib/data/reviewConfigs";
import { useRouter } from "next/navigation";
import { AudioPlayer } from "./AudioPlayer";
import { createClient } from "@/lib/supabase/client";
import { MUSIC_CREDIT_COST } from "@/lib/credits";
import { GENRES } from "@/lib/data/genres";
import { LANGUAGES } from "@/lib/data/languages";
import {
  MUSIC_FAILED as FAILED,
  VIDEO_FAILED,
  MUSIC_STATUS_LABEL as STATUS_LABEL,
  VIDEO_STATUS_LABEL,
  MUSIC_STEPS as STEPS,
  musicStepIndex as stepIndex,
  audioDownloadHref as downloadHref,
  type Track,
} from "@/lib/suno/status";

interface Props {
  title: string;
  lyrics: string;
  /** A letra está sendo gerada pela IA (Suno). */
  lyricsLoading?: boolean;
  /** Erro ocorrido ao gerar a letra. */
  lyricsError?: string | null;
  /** Dispara uma nova geração da letra a partir das respostas. */
  onRegenerateLyrics?: () => void;
  /** Trilha sem vocal (modo Instrumental): esconde a letra e envia instrumental=true à Suno. */
  instrumental?: boolean;
  /** Estilo/gênero enviado para a Suno (ex.: "Pop brasileiro, voz feminina"). */
  style?: string;
  /** Estilos/conteúdos a evitar na geração (negativeTags da Suno). */
  negativeTags?: string;
  selectedAnswers: Record<string, string | string[]>;
  /** Respostas completas do formulário (DetailedFormData) — salvas junto da música. */
  answers?: Record<string, unknown>;
  /** "STARSONIC cria o nome": gera o título pela OpenAI a partir da letra, ao salvar. */
  autoTitle?: boolean;
  /** Quantas músicas gerar (2, 4 ou 6). A Suno gera 2 por chamada. */
  quantity?: number;
  /** Chamado quando a música é gerada/salva — para limpar o form na próxima. */
  onGenerated?: () => void;
  totalCost: number;
  saldo: number;
  onEdit?: () => void;
  /** Limpa a composição atual e volta ao início do formulário (etapa 1). */
  onNewSong?: () => void;
  statsInfo?: ReactNode;
  /** Cópia específica do modo (Studio / Instrumental / Jingle). */
  ui: ReviewUi;
}

// Marca, no navegador, que o convidado já usou a música grátis.
const GUEST_USED_KEY = "starsonic:guestCreditUsed";
const GUEST_CREATION_KEY = "starsonic:guestCreationId";

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

function ReviewPanelComponent({
  title,
  lyrics,
  lyricsLoading = false,
  lyricsError = null,
  onRegenerateLyrics,
  instrumental = false,
  style = "",
  negativeTags = "",
  selectedAnswers,
  answers,
  autoTitle,
  quantity,
  onGenerated,
  totalCost,
  saldo,
  onEdit,
  onNewSong,
  ui,
}: Props) {
  const router = useRouter();
  const [editedLyrics, setEditedLyrics] = useState(lyrics);

  // A letra chega de forma assíncrona (gerada pela IA). Quando uma nova letra
  // chega, sincroniza o textarea — sem sobrescrever com vazio enquanto gera.
  useEffect(() => {
    if (lyrics) setEditedLyrics(lyrics);
  }, [lyrics]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Caixa "Gerar com outros estilos": escolha de estilos mantendo a mesma letra.
  const [stylesOpen, setStylesOpen] = useState(false);
  const [chosenStyles, setChosenStyles] = useState<string[]>([]);
  const [customStyle, setCustomStyle] = useState("");
  // Idioma da nova versão (opcional). "" = mantém o idioma original.
  const [chosenLang, setChosenLang] = useState("");
  // Estilo enviado na próxima composição: undefined = estilo normal;
  // preenchido = "Gerar com outros estilos" (recompõe com variação).
  const [pendingStyleOverride, setPendingStyleOverride] = useState<string | undefined>(undefined);
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [tracks, setTracks] = useState<(Track & { taskId: string })[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  // Vídeo (MP4) gerado a partir da música pronta.
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detecta convidado e, se logado, carrega os créditos do profile.
  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(async ({ data: { user } }) => {
      setIsGuest(!user);
      if (user) {
        const { data } = await sb
          .from("profiles")
          .select("credits")
          .eq("id", user.id)
          .maybeSingle();
        if (data) setCredits(data.credits as number);
      }
    });
  }, []);

  const cost = MUSIC_CREDIT_COST;
  const versions = quantity && quantity > 0 ? quantity : 2;
  const saldoView = credits ?? saldo;

  // "Suas escolhas": todas as respostas ficam sempre visíveis (sem expandir/recolher).
  const answerEntries = Object.entries(selectedAnswers);

  // Estilo enviado quando o usuário pede "Gerar com outros estilos" sem escolher
  // estilos específicos (variação livre do estilo atual).
  const variationStyle = `${style || "Pop brasileiro"} — versão alternativa, explore um ritmo, andamento e arranjo diferentes`;

  // Monta o estilo a partir dos estilos escolhidos na caixa. Jingle/Studio
  // mantêm a mesma letra; instrumental não tem letra, então só varia o arranjo.
  const chosenStylesText = [...chosenStyles, customStyle.trim()].filter(Boolean).join(", ");
  // Idioma escolhido (só faz sentido com vocal) → instrução de tradução/canto.
  const langOption = LANGUAGES.find((l) => l.code === chosenLang);
  const langInstruction = !instrumental && langOption
    ? ` Traduza e cante a letra em ${langOption.label} (${langOption.native}).`
    : "";
  const stylesOverride = (chosenStylesText
    ? `${chosenStylesText} — ${ui.keepLyricsOnVariation ? "mantenha exatamente a mesma letra, mas " : ""}explore um ritmo, andamento e arranjo de ${chosenStylesText}`
    : variationStyle) + langInstruction;

  function toggleStyle(g: string) {
    setChosenStyles((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  const lyricsStats = useMemo(
    () => ({
      words: editedLyrics.split(/\s+/).filter(Boolean).length,
      choruses: (editedLyrics.match(/\[Chorus\]|\[Refrão\]/gi) || []).length,
    }),
    [editedLyrics]
  );

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedRef = useRef(false); // evita salvar duas vezes

  const generating = submitting || (taskIds.length > 0 && status !== "SUCCESS" && !error);
  const started = taskIds.length > 0 || submitting || !!error;

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => stopPolling, []);

  // Polling: consulta TODAS as gerações (1 por par de músicas) e junta as faixas.
  useEffect(() => {
    if (taskIds.length === 0) return;
    stopPolling();

    async function check() {
      try {
        const results = await Promise.all(
          taskIds.map(async (tid) => {
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

        // Junta as faixas de todas as tasks, marcando de qual task vieram.
        const merged = results.flatMap((r) => r.tracks.map((t) => ({ ...t, taskId: r.tid })));
        if (merged.length) setTracks(merged);

        const statuses = results.map((r) => r.status);
        if (statuses.every((s) => s === "SUCCESS")) {
          setStatus("SUCCESS");
          stopPolling();
        } else if (statuses.some((s) => FAILED.has(s))) {
          // Alguma falhou: mantém o que já veio; conclui se houver faixas.
          if (merged.some((t) => t.audioUrl)) setStatus("SUCCESS");
          else setError("A geração falhou na Suno. Ajuste os campos e tente novamente.");
          stopPolling();
        } else {
          setStatus(merged.some((t) => t.audioUrl) ? "FIRST_SUCCESS" : "PENDING");
        }
      } catch {
        // erro de rede transitório — tenta de novo no próximo ciclo
      }
    }

    check();
    pollRef.current = setInterval(check, 5000);
    return stopPolling;
  }, [taskIds]);

  // Quando a música fica pronta, salva AS DUAS versões (v1 e v2) na biblioteca.
  useEffect(() => {
    if (status !== "SUCCESS" || savedRef.current) return;
    const ready = tracks.filter((t) => t.audioUrl);
    if (ready.length === 0) return;

    savedRef.current = true;
    setSaving(true);
    setSaveError(null);

    (async () => {
      try {
        // Título base. Para auto-título, salva com um provisório derivado da letra
        // (nunca "Sua Música"); o título do GPT é gerado depois e atualizado no banco.
        // Instrumental não tem letra/tema — usa o gênero como fallback do título.
        const theme =
          (typeof answers?.theme === "string" && answers.theme) ||
          (typeof answers?.genre === "string" && answers.genre) ||
          "";
        const base = autoTitle
          ? deriveTitle(editedLyrics, theme) || "Nova música"
          : title || ready[0].title || "Nova música";

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
              style,
              audioUrl: t.audioUrl,
              imageUrl: t.imageUrl,
              duration: t.duration,
              lyrics: editedLyrics,
              sunoTaskId: t.taskId,
              sunoAudioId: t.id,
              badge: `V${i + 1}`,
              chargeCredits: i === 0,
              answers: i === 0 ? answers ?? null : null,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            savedRef.current = false; // permite tentar de novo
            setSaveError(data.error ?? "Não foi possível salvar na biblioteca.");
            return;
          }
          if (i === 0) firstId = data.id ?? null;
          if (data.id) createdIds.push(data.id as string);
          if (typeof data.credits === "number") lastCredits = data.credits;
        }

        // "STARSONIC cria o nome": gera o título (GPT) a partir da letra e
        // ATUALIZA o title de cada criação na tabela creations.
        if (autoTitle && createdIds.length && editedLyrics.trim()) {
          try {
            const tr = await fetch("/api/title", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lyrics: editedLyrics, genre: style }),
            });
            const td = await tr.json();
            const gpt = tr.ok && td.title ? String(td.title) : "";
            if (gpt) {
              const updates = createdIds.map((id, i) => ({ id, title: `${gpt} · v${i + 1}` }));
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

        setSaved(true);
        onGenerated?.(); // marca como gerado → limpa o form na próxima criação
        if (isGuest && typeof window !== "undefined") {
          window.localStorage.setItem(GUEST_USED_KEY, "1");
          if (firstId) window.localStorage.setItem(GUEST_CREATION_KEY, firstId);
        } else if (!isGuest) {
          if (typeof lastCredits === "number") setCredits(lastCredits);
          router.refresh();
        }
      } catch {
        savedRef.current = false;
        setSaveError("Falha de conexão ao salvar na biblioteca.");
      } finally {
        setSaving(false);
      }
    })();
  }, [status, tracks, title, style, editedLyrics, isGuest, router, answers, onGenerated, autoTitle]);

  // Envia a letra (do box acima) para a Suno.
  // styleOverride: usado por "Gerar com outros estilos" para variar o ritmo/estilo.
  const handleCompose = useCallback(async (styleOverride?: string) => {
    if (generating) return;

    // Convidado: pode gerar 1 música grátis. Se já usou, vai pro cadastro.
    const { data: { user } } = await createClient().auth.getUser();
    if (!user && guestCreditUsed()) {
      router.push("/cadastro");
      return;
    }

    // Logado: bloqueia se não houver créditos suficientes.
    if (user && credits !== null && credits < cost) {
      setError(`Créditos insuficientes (você tem ${credits}, precisa de ${cost}). Faça upgrade do plano.`);
      return;
    }

    if (!instrumental && !editedLyrics.trim()) {
      setError("Escreva a letra da música no box acima antes de compor.");
      return;
    }

    setError(null);
    setTracks([]);
    setStatus(null);
    setTaskIds([]);
    setSaved(false);
    setSaving(false);
    setSaveError(null);
    savedRef.current = false;
    setSubmitting(true);

    // Suno gera 2 músicas por chamada → nº de chamadas = quantidade / 2.
    const wanted = quantity && quantity > 0 ? quantity : 2;
    const calls = Math.max(1, Math.ceil(wanted / 2));

    try {
      const ids: string[] = [];
      for (let k = 0; k < calls; k++) {
        const res = await fetch("/api/criar-musica", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            style: styleOverride || style || "Pop brasileiro",
            negativeTags,
            lyrics: editedLyrics,
            instrumental,
            model: "V5_5",
          }),
        });
        const data = await res.json();
        if (res.ok && data.taskId) ids.push(data.taskId);
        else if (k === 0) {
          // se a 1ª falhou, aborta com erro
          setError(data.error ?? "Não foi possível iniciar a geração.");
          setSubmitting(false);
          return;
        }
      }
      if (ids.length === 0) {
        setError("Não foi possível iniciar a geração.");
        setSubmitting(false);
        return;
      }
      setTaskIds(ids);
      setStatus("PENDING");
    } catch {
      setError("Falha de conexão ao enviar para a API.");
    } finally {
      setSubmitting(false);
    }
  }, [editedLyrics, title, style, negativeTags, generating, router, credits, cost, quantity, instrumental]);

  const primaryImage = tracks.find((t) => t.audioUrl)?.imageUrl ?? null;
  const videoGenerating = !!videoStatus && !videoUrl && !videoError;

  useEffect(
    () => () => {
      if (videoPollRef.current) clearInterval(videoPollRef.current);
    },
    [],
  );

  // Gera o vídeo (MP4) da música pronta na Suno (usa o taskId + audioId).
  async function generateVideo() {
    const primary = tracks.find((t) => t.audioUrl);
    if (!primary?.id || !primary.taskId) {
      setVideoError("Faltam os dados da Suno para gerar o vídeo.");
      return;
    }
    setVideoError(null);
    setVideoUrl(null);
    setVideoStatus("PENDING");

    let vt: string | null = null;
    try {
      const res = await fetch("/api/criar-musica/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: primary.taskId, audioId: primary.id }),
      });
      const d = await res.json();
      if (!res.ok || !d.taskId) {
        setVideoError(d.error ?? "Não foi possível iniciar o vídeo.");
        setVideoStatus(null);
        return;
      }
      vt = d.taskId;
    } catch {
      setVideoError("Falha de conexão ao gerar o vídeo.");
      setVideoStatus(null);
      return;
    }

    if (videoPollRef.current) clearInterval(videoPollRef.current);
    const check = async () => {
      try {
        const r = await fetch(`/api/criar-musica/video/status?taskId=${encodeURIComponent(vt!)}`);
        const d = await r.json();
        if (!r.ok) {
          setVideoError(d.error ?? "Erro ao consultar o vídeo.");
          setVideoStatus(null);
          if (videoPollRef.current) clearInterval(videoPollRef.current);
          return;
        }
        setVideoStatus(d.status);
        if (d.videoUrl) {
          setVideoUrl(d.videoUrl);
          if (videoPollRef.current) clearInterval(videoPollRef.current);
        } else if (VIDEO_FAILED.has(d.status)) {
          setVideoError("A geração do vídeo falhou na Suno.");
          if (videoPollRef.current) clearInterval(videoPollRef.current);
        }
      } catch {
        // rede transitória
      }
    };
    check();
    videoPollRef.current = setInterval(check, 5000);
  }

  // Fecha o modal de confirmação com a tecla Esc.
  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen]);

  // Fecha a caixa de "outros estilos" com a tecla Esc.
  useEffect(() => {
    if (!stylesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStylesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stylesOpen]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 20 }}>

      {/* Modal de confirmação de créditos */}
      {confirmOpen && (
        <div
          onClick={() => setConfirmOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar geração da música"
            onClick={(e) => e.stopPropagation()}
            style={{
            background: "linear-gradient(180deg, rgba(22,22,77,0.98), rgba(10,10,46,0.98))",
            border: "1px solid rgba(168,85,247,0.4)",
            borderRadius: 16, padding: "28px 32px", maxWidth: 400, width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 18, color: "var(--white)", marginBottom: 8 }}>
              Confirmar geração
            </div>
            <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 20 }}>
              Você vai usar <b style={{ color: "var(--cyan-1)" }}>{cost} créditos</b> para compor esta música.
              <br />Saldo atual: <b style={{ color: "var(--text-1)" }}>{saldoView} créditos</b>.
              {pendingStyleOverride && (
                <>
                  <br />
                  <span style={{ color: "var(--cyan-1)" }}>
                    Gerando novas versões em ritmos e estilos diferentes.
                  </span>
                </>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{
                  padding: "10px 20px", borderRadius: 10,
                  background: "var(--bg-card)", border: "1px solid var(--border-soft)",
                  color: "var(--text-1)", fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => { setConfirmOpen(false); handleCompose(pendingStyleOverride); }}
                style={{
                  padding: "10px 24px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #a855f7, #ec4899)",
                  color: "#fff", fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(168,85,247,0.4)",
                }}
              >
                Confirmar e Compor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Caixa "Gerar com outros estilos" — escolha de estilos (mesma letra) */}
      {stylesOpen && (
        <div
          onClick={() => setStylesOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Escolha os estilos para gerar com a mesma letra"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(180deg, rgba(22,22,77,0.98), rgba(10,10,46,0.98))",
              border: "1px solid rgba(0,214,247,0.4)",
              borderRadius: 16, padding: "24px 28px", maxWidth: 520, width: "100%",
              maxHeight: "85vh", overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 18, color: "var(--white)", marginBottom: 6 }}>
              {ui.otherModalTitle}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 16 }}>
              {ui.otherModalDesc}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {GENRES.map((g) => {
                const on = chosenStyles.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleStyle(g)}
                    aria-pressed={on}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 100,
                      fontSize: 12,
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: on ? "linear-gradient(135deg, #a855f7, #ec4899)" : "var(--bg-card)",
                      color: on ? "#fff" : "var(--text-1)",
                      border: on ? "1px solid transparent" : "1px solid var(--border-soft)",
                      boxShadow: on ? "0 4px 16px rgba(168,85,247,0.35)" : "none",
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
              Outro estilo (opcional)
            </label>
            <input
              type="text"
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              placeholder="Ex.: Bossa nova acústica, voz feminina suave"
              maxLength={120}
              style={{
                width: "100%",
                background: "rgba(10,10,46,0.6)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 12px",
                color: "var(--text-1)",
                fontSize: 13,
                marginBottom: 20,
              }}
            />

            {/* Idioma da nova versão — só com vocal (instrumental não tem letra). */}
            {!instrumental && (
              <>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  Idioma da versão (opcional)
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {LANGUAGES.map((l) => {
                    const on = chosenLang === l.code;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setChosenLang(on ? "" : l.code)}
                        aria-pressed={on}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 100,
                          fontSize: 12,
                          fontFamily: "'Sora', sans-serif",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: on ? "linear-gradient(135deg, #00D6F7, #a855f7)" : "var(--bg-card)",
                          color: on ? "#fff" : "var(--text-1)",
                          border: on ? "1px solid transparent" : "1px solid var(--border-soft)",
                          boxShadow: on ? "0 4px 16px rgba(0,214,247,0.35)" : "none",
                        }}
                      >
                        <span>{l.flag}</span>
                        {l.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setStylesOpen(false)}
                style={{
                  padding: "10px 20px", borderRadius: 10,
                  background: "var(--bg-card)", border: "1px solid var(--border-soft)",
                  color: "var(--text-1)", fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setPendingStyleOverride(stylesOverride);
                  setStylesOpen(false);
                  setConfirmOpen(true);
                }}
                disabled={chosenStyles.length === 0 && !customStyle.trim() && !chosenLang}
                style={{
                  padding: "10px 24px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #a855f7, #ec4899)",
                  color: "#fff", fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 13,
                  cursor: chosenStyles.length === 0 && !customStyle.trim() && !chosenLang ? "not-allowed" : "pointer",
                  opacity: chosenStyles.length === 0 && !customStyle.trim() && !chosenLang ? 0.5 : 1,
                  boxShadow: "0 4px 20px rgba(168,85,247,0.4)",
                }}
              >
                Continuar →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Letra (esq) | Música+Vídeo (meio) | Escolhas (dir).
          Instrumental não tem letra — vira grid de 2 colunas (.rev-grid3--no-lyrics). */}
      <div className={`rev-grid3${instrumental ? " rev-grid3--no-lyrics" : ""}`}>
        {/* Card 1: Sua Letra (coluna esquerda, trilho de altura cheia) — só quando há vocal */}
        {!instrumental && (
        <div
          className="rev-lyrics"
          style={{
            background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--border-soft)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              📝
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  color: "var(--white)",
                }}
              >
                {ui.lyricsLabel}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "'Sora', sans-serif" }}>
                {generating ? "Gerando — letra bloqueada" : "Clique para editar"}
              </div>
            </div>

            {onRegenerateLyrics && (
              <button
                onClick={onRegenerateLyrics}
                disabled={lyricsLoading || generating}
                title="Gerar a letra novamente a partir das suas respostas"
                style={{
                  marginLeft: "auto",
                  flexShrink: 0,
                  padding: "6px 10px",
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: "var(--bg-card)",
                  color: "var(--cyan-1)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: 8,
                  cursor: lyricsLoading || generating ? "not-allowed" : "pointer",
                  opacity: lyricsLoading || generating ? 0.5 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {lyricsLoading ? "↻ gerando…" : "↻ gerar de novo"}
              </button>
            )}
          </div>

          {/* Textarea */}
          <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
            <textarea
              value={editedLyrics}
              onChange={(e) => setEditedLyrics(e.target.value)}
              disabled={generating || lyricsLoading}
              placeholder={
                lyricsLoading
                  ? "Gerando a letra a partir das suas respostas…"
                  : "[Verso]\nEscreva ou edite a letra da sua música…"
              }
              style={{
                width: "100%",
                fontFamily: "'Caveat', cursive",
                fontSize: 13,
                lineHeight: 1.6,
                flex: 1,
                minHeight: 300,
                maxHeight: 1000,
                background: "rgba(10, 10, 46, 0.6)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "8px 10px",
                color: "var(--text-1)",
                resize: "vertical",
                cursor: generating || lyricsLoading ? "not-allowed" : "text",
                opacity: generating || lyricsLoading ? 0.6 : 1,
              }}
            />

            {lyricsError && (
              <div
                style={{
                  marginTop: 8,
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "rgba(251, 146, 60, 0.08)",
                  border: "1px solid rgba(251, 146, 60, 0.25)",
                  color: "var(--orange)",
                  fontSize: 12,
                }}
              >
                ⚠️ {lyricsError} Você pode escrever a letra manualmente acima.
              </div>
            )}


          </div>
        </div>
        )}

        {/* Card 2: Suas Escolhas (coluna direita, trilho alto — ocupa toda a altura) */}
        <div
          className="rev-answers-rail"
          style={{
            background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "var(--text-3)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Suas escolhas
            <button
              type="button"
              onClick={onEdit}
              style={{
                marginLeft: "auto",
                color: "var(--cyan-1)",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "'Sora', sans-serif",
                textTransform: "none",
                letterSpacing: 0,
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              editar
            </button>
          </div>

          <div
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {answerEntries.map(([key, value]) => {
              const full = String(Array.isArray(value) ? value.join(", ") : value);
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "5px 0",
                    borderBottom: "1px solid var(--border-soft)",
                  }}
                >
                  <span style={{ color: "var(--text-3)", fontSize: 12, flexShrink: 0 }}>{key}</span>
                  <span
                    style={{
                      color: "var(--white)",
                      fontWeight: 600,
                      fontSize: 12,
                      textAlign: "right",
                      wordBreak: "break-word",
                    }}
                  >
                    {full}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sua Música (coluna do meio, topo) */}
        <div
          className="rev-col2"
          style={{
            background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "20px",
          }}
        >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "var(--text-3)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          {ui.musicEmoji} {ui.musicLabel}
        </div>

        {/* Erro */}
        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 10,
              background: "rgba(251, 146, 60, 0.08)",
              border: "1px solid rgba(251, 146, 60, 0.25)",
              color: "var(--orange)",
              fontSize: 13,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* TELA DE LOADING enquanto a música é processada */}
        {generating && (
          <div
            style={{
              padding: 20,
              borderRadius: 14,
              background: "var(--bg-card-2)",
              border: "1px solid var(--border-soft)",
              marginBottom: tracks.length ? 16 : 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  border: "3px solid var(--cyan-1)",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--white)" }}>
                  Compondo sua música…
                </div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                  {STATUS_LABEL[status ?? "PENDING"] ?? "Processando…"} · costuma levar 2-3 minutos
                </div>
              </div>
            </div>

            {/* barra de progresso por etapa */}
            <div style={{ height: 6, background: "var(--bg-card)", borderRadius: 100, overflow: "hidden", marginBottom: 14 }}>
              <div
                style={{
                  height: "100%",
                  borderRadius: 100,
                  background: "var(--grad-brand)",
                  width: `${((stepIndex(status) + 1) / STEPS.length) * 100}%`,
                  transition: "width .4s ease",
                }}
              />
            </div>

            {/* etapas */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {STEPS.map((s, i) => {
                const cur = stepIndex(status);
                const state = i < cur ? "done" : i === cur ? "active" : "todo";
                const color =
                  state === "todo" ? "var(--text-3)" : state === "done" ? "var(--green)" : "var(--cyan-1)";
                return (
                  <div
                    key={s.status}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      color,
                    }}
                  >
                    <span>{state === "done" ? "✓" : state === "active" ? "●" : "○"}</span>
                    {s.label}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CONCLUÍDA + status de gravação na biblioteca */}
        {status === "SUCCESS" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              fontSize: 13,
              color: "var(--green)",
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            ✓ Concluída!
            {saving && <span style={{ color: "var(--text-3)", fontWeight: 400 }}>· salvando na biblioteca…</span>}
            {saved && (
              <span style={{ color: "var(--text-3)", fontWeight: 400 }}>
                · salva em{" "}
                <Link href="/criacoes" style={{ color: "var(--cyan-1)", fontWeight: 600 }}>
                  Minhas Criações
                </Link>
              </span>
            )}
          </div>
        )}

        {saveError && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 10,
              background: "rgba(251, 146, 60, 0.08)",
              border: "1px solid rgba(251, 146, 60, 0.25)",
              color: "var(--orange)",
              fontSize: 13,
            }}
          >
            ⚠️ {saveError}
          </div>
        )}

        {/* Versões geradas */}
        {tracks.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tracks.map((t, i) =>
              t.audioUrl ? (
                <AudioPlayer
                  key={t.id ?? i}
                  audioUrl={t.audioUrl}
                  title={`${t.title || title || `Versão ${i + 1}`} · v${i + 1}`}
                  subtitle={style || "Star Sonic"}
                  imageUrl={t.imageUrl}
                  primary={i === 0}
                  downloadHref={downloadHref(
                    t.audioUrl,
                    t.title || title || `Versão ${i + 1}`,
                  )}
                  lockDownload={isGuest}
                  onLockedAction={() => router.push("/cadastro")}
                />
              ) : (
                <div
                  key={t.id ?? i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: 14,
                    borderRadius: 14,
                    background: "var(--bg-card-2)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      flexShrink: 0,
                      background: "var(--grad-brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    🎵
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--white)" }}>
                      {t.title || `Versão ${i + 1}`}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
                      gerando áudio…
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          !generating &&
          !error && (
            <div
              style={{
                background: "rgba(10, 10, 46, 0.4)",
                border: "1px dashed var(--border-soft)",
                borderRadius: 10,
                padding: "20px",
                textAlign: "center",
                color: "var(--text-3)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
              }}
            >
              {started ? "[Aguardando o áudio…]" : ui.emptyHint}
            </div>
          )
        )}
        </div>

        {/* Seu Video (coluna do meio, abaixo da música) */}
        <div
          className="rev-col2"
          style={{
            background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>
            🎬 Seu Video
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {videoUrl ? (
              <>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  src={videoUrl}
                  controls
                  poster={primaryImage || undefined}
                  style={{ width: "100%", flex: 1, minHeight: 220, borderRadius: 8, background: "#000", border: "1px solid var(--border)", objectFit: "cover" }}
                />
                <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ justifyContent: "center" }}>
                  ⬇ Baixar vídeo (MP4)
                </a>
              </>
            ) : status === "SUCCESS" && tracks.some((t) => t.audioUrl) ? (
              <button
                onClick={generateVideo}
                disabled={videoGenerating}
                style={{ width: "100%", flex: 1, minHeight: 220, background: "linear-gradient(135deg, rgba(236,72,153,0.12), rgba(249,115,22,0.12))", border: "1px dashed var(--border-soft)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, cursor: videoGenerating ? "default" : "pointer", color: "var(--text-2)" }}
              >
                {videoGenerating ? (
                  <>
                    <span style={{ width: 30, height: 30, border: "3px solid var(--cyan-1)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block" }} />
                    <span style={{ fontSize: 12 }}>{VIDEO_STATUS_LABEL[videoStatus ?? "PENDING"] ?? "Renderizando…"}</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>leva 1-3 min</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 36 }}>🎥</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Clique para gerar vídeo (MP4)</span>
                  </>
                )}
              </button>
            ) : (
              <div style={{ width: "100%", flex: 1, minHeight: 220, background: "rgba(10, 10, 46, 0.4)", border: "1px dashed var(--border-soft)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 32, opacity: 0.4 }}>📺</div>
                <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>{generating ? "Gerando música…" : "Gere a música primeiro"}</div>
              </div>
            )}

            {videoError && (
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", color: "var(--orange)", fontSize: 12 }}>
                ⚠️ {videoError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          background: "var(--grad-card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
            Saldo: <b style={{ color: "var(--cyan-1)" }}>{saldoView} créditos</b>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'Sora', sans-serif" }}>
            Esta ação utilizará <b style={{ color: "var(--cyan-1)" }}>{cost} créditos</b> · {ui.footerExtra} · {versions} versões
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {onNewSong && status === "SUCCESS" && (
            <button
              onClick={onNewSong}
              title="Limpa tudo e volta ao início do formulário de criação"
              style={{
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                color: "#fff",
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 800,
                fontSize: 13,
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.3px",
                boxShadow: "0 4px 20px rgba(168,85,247,0.4)",
              }}
            >
              ＋ Criar nova música
            </button>
          )}
          <button
            onClick={onEdit}
            disabled={generating}
            style={{
              background: "var(--bg-card)",
              color: "var(--text-1)",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              cursor: generating ? "not-allowed" : "pointer",
              opacity: generating ? 0.6 : 1,
            }}
          >
            ← Editar respostas
          </button>
          <button
            onClick={() => {
              if (generating || lyricsLoading) return;
              setStylesOpen(true);
            }}
            disabled={generating || lyricsLoading}
            title="Escolha outros estilos e gere novas versões com a mesma letra"
            style={{
              background: "var(--bg-card)",
              color: "var(--cyan-1)",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid rgba(0, 214, 247, 0.4)",
              cursor: generating || lyricsLoading ? "not-allowed" : "pointer",
              opacity: generating || lyricsLoading ? 0.6 : 1,
            }}
          >
            ↻ {ui.otherActionLabel}
          </button>
          <button
            onClick={() => {
              if (generating || lyricsLoading) return;
              setPendingStyleOverride(undefined);
              setConfirmOpen(true);
            }}
            disabled={generating || lyricsLoading}
            style={{
              background: "#00D6F7",
              color: "#0a0a2e",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 800,
              fontSize: 13,
              padding: "10px 22px",
              borderRadius: 10,
              border: "none",
              cursor: generating || lyricsLoading ? "not-allowed" : "pointer",
              letterSpacing: "0.3px",
              opacity: generating || lyricsLoading ? 0.7 : 1,
              boxShadow: generating || lyricsLoading ? "none" : "0 4px 20px rgba(0, 214, 247, 0.4)",
            }}
          >
            {generating
              ? "GERANDO…"
              : lyricsLoading
                ? "AGUARDE A LETRA…"
                : `COMPOR MÚSICA · ${cost} CRÉDITOS`}
          </button>
        </div>
      </div>
    </div>
  );
}

export const ReviewPanel = memo(ReviewPanelComponent);
