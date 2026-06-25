"use client";

import { ReactNode, useState, useMemo, useEffect, useRef, memo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AudioPlayer } from "./AudioPlayer";
import { createClient } from "@/lib/supabase/client";
import { MUSIC_CREDIT_COST } from "@/lib/credits";

interface Props {
  title: string;
  lyrics: string;
  /** A letra está sendo gerada pela IA (Suno). */
  lyricsLoading?: boolean;
  /** Erro ocorrido ao gerar a letra. */
  lyricsError?: string | null;
  /** Dispara uma nova geração da letra a partir das respostas. */
  onRegenerateLyrics?: () => void;
  /** Estilo/gênero enviado para a Suno (ex.: "Pop brasileiro, voz feminina"). */
  style?: string;
  /** Estilos/conteúdos a evitar na geração (negativeTags da Suno). */
  negativeTags?: string;
  selectedAnswers: Record<string, any>;
  /** Respostas completas do formulário (DetailedFormData) — salvas junto da música. */
  answers?: Record<string, unknown>;
  totalCost: number;
  saldo: number;
  onEdit?: () => void;
  statsInfo?: ReactNode;
}

type Track = {
  id: string | null;
  title: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  duration: number | null;
};

// Status do apibox traduzidos para o usuário.
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Na fila…",
  TEXT_SUCCESS: "Letra pronta, gerando áudio…",
  FIRST_SUCCESS: "Primeira versão pronta, finalizando…",
  SUCCESS: "Concluída!",
};

const FAILED = new Set([
  "CREATE_TASK_FAILED",
  "GENERATE_AUDIO_FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

// Etapas exibidas na tela de loading (na ordem em que a Suno avança).
const STEPS: { status: string; label: string }[] = [
  { status: "PENDING", label: "Na fila" },
  { status: "TEXT_SUCCESS", label: "Letra pronta" },
  { status: "FIRST_SUCCESS", label: "Gerando áudio" },
  { status: "SUCCESS", label: "Concluída" },
];

function stepIndex(status: string | null): number {
  const i = STEPS.findIndex((s) => s.status === status);
  return i < 0 ? 0 : i;
}

function downloadHref(audioUrl: string, title: string): string {
  return `/api/criar-musica/download?url=${encodeURIComponent(audioUrl)}&title=${encodeURIComponent(title)}`;
}

// Marca, no navegador, que o convidado já usou a música grátis.
const GUEST_USED_KEY = "starsonic:guestCreditUsed";
const GUEST_CREATION_KEY = "starsonic:guestCreationId";

function guestCreditUsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(GUEST_USED_KEY) === "1";
}

// Geração do vídeo (MP4) na Suno.
const VIDEO_FAILED = new Set([
  "CREATE_TASK_FAILED",
  "GENERATE_MP4_FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);
const VIDEO_STATUS_LABEL: Record<string, string> = {
  PENDING: "Na fila…",
  GENERATING: "Renderizando o vídeo…",
  SUCCESS: "Concluído!",
};

function ReviewPanelComponent({
  title,
  lyrics,
  lyricsLoading = false,
  lyricsError = null,
  onRegenerateLyrics,
  style = "",
  negativeTags = "",
  selectedAnswers,
  answers,
  totalCost,
  saldo,
  onEdit,
}: Props) {
  const router = useRouter();
  const [editedLyrics, setEditedLyrics] = useState(lyrics);

  // A letra chega de forma assíncrona (gerada pela IA). Quando uma nova letra
  // chega, sincroniza o textarea — sem sobrescrever com vazio enquanto gera.
  useEffect(() => {
    if (lyrics) setEditedLyrics(lyrics);
  }, [lyrics]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
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
  const saldoView = credits ?? saldo;

  const lyricsStats = useMemo(
    () => ({
      words: editedLyrics.split(/\s+/).filter(Boolean).length,
      choruses: (editedLyrics.match(/\[Chorus\]|\[Refrão\]/gi) || []).length,
    }),
    [editedLyrics]
  );

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedRef = useRef(false); // evita salvar duas vezes

  const generating = submitting || (!!taskId && status !== "SUCCESS" && !error);
  const started = !!taskId || submitting || !!error;

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => stopPolling, []);

  // Polling do status enquanto houver um taskId em andamento.
  useEffect(() => {
    if (!taskId) return;
    stopPolling();

    async function check() {
      try {
        const res = await fetch(`/api/criar-musica/status?taskId=${encodeURIComponent(taskId!)}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Erro ao consultar o status.");
          stopPolling();
          return;
        }
        setStatus(data.status);
        if (Array.isArray(data.tracks) && data.tracks.length) setTracks(data.tracks);
        if (data.status === "SUCCESS") stopPolling();
        if (FAILED.has(data.status)) {
          setError("A geração falhou na Suno. Ajuste os campos e tente novamente.");
          stopPolling();
        }
      } catch {
        // erro de rede transitório — tenta de novo no próximo ciclo
      }
    }

    check();
    pollRef.current = setInterval(check, 5000);
    return stopPolling;
  }, [taskId]);

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
        const base = title || ready[0].title || "Nova música";
        let firstId: string | null = null;
        let lastCredits: number | null = null;

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
              sunoTaskId: taskId,
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
          if (typeof data.credits === "number") lastCredits = data.credits;
        }

        setSaved(true);
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
  }, [status, tracks, title, style, editedLyrics, isGuest, router, answers]);

  // Envia a letra (do box acima) para a Suno.
  const handleCompose = useCallback(async () => {
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

    if (!editedLyrics.trim()) {
      setError("Escreva a letra da música no box acima antes de compor.");
      return;
    }

    setError(null);
    setTracks([]);
    setStatus(null);
    setTaskId(null);
    setSaved(false);
    setSaving(false);
    setSaveError(null);
    savedRef.current = false;
    setSubmitting(true);

    try {
      const res = await fetch("/api/criar-musica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          style: style || "Pop brasileiro",
          negativeTags,
          lyrics: editedLyrics,
          instrumental: false,
          model: "V4_5",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.taskId) {
        setError(data.error ?? "Não foi possível iniciar a geração.");
        return;
      }
      setTaskId(data.taskId);
      setStatus("PENDING");
    } catch {
      setError("Falha de conexão ao enviar para a API.");
    } finally {
      setSubmitting(false);
    }
  }, [editedLyrics, title, style, negativeTags, generating, router, credits, cost]);

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
    if (!primary?.id || !taskId) {
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
        body: JSON.stringify({ taskId, audioId: primary.id }),
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 20 }}>

      {/* Modal de confirmação de créditos */}
      {confirmOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
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
                onClick={() => { setConfirmOpen(false); handleCompose(); }}
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

      {/* Seção Superior: Grid responsivo */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 1fr) minmax(220px, 1fr) minmax(200px, 1fr)", gap: 16 }}>
        {/* Card 1: Sua Música (reduzido) */}
        <div
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
                Sua Letra
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
                minHeight: 180,
                maxHeight: 400,
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

        {/* Card 2: Suas Escolhas */}
        <div
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
            <span
              style={{
                marginLeft: "auto",
                color: "var(--cyan-1)",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "'Sora', sans-serif",
                textTransform: "none",
                letterSpacing: 0,
              }}
              onClick={onEdit}
            >
              editar
            </span>
          </div>

          <div
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              overflowY: "auto",
              maxHeight: 280,
            }}
          >
            {Object.entries(selectedAnswers).map(([key, value]) => (
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
                <span style={{ color: "var(--text-3)", fontSize: 12 }}>{key}</span>
                <span style={{ color: "var(--white)", fontWeight: 600, fontSize: 12, textAlign: "right" }}>
                  {String(Array.isArray(value) ? value.join(", ") : value).substring(0, 24)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Custo Total */}
        <div
          style={{
            background: "linear-gradient(180deg, rgba(168, 85, 247, 0.08), rgba(236, 72, 153, 0.04))",
            border: "1px solid rgba(168, 85, 247, 0.25)",
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "var(--purple)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              Custo total
            </div>

            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <span style={{ color: "var(--text-2)", fontSize: 12 }}>Letra</span>
                <span style={{ color: "var(--green)", fontWeight: 600, fontSize: 12 }}>incluso</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <span style={{ color: "var(--text-2)", fontSize: 12 }}>Composição</span>
                <span style={{ color: "var(--white)", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                  {cost} créditos
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <span style={{ color: "var(--text-2)", fontSize: 12 }}>Versões</span>
                <span style={{ color: "var(--white)", fontWeight: 600, fontSize: 12 }}>2 músicas</span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0 0",
              marginTop: 8,
              borderTop: "1px dashed rgba(168, 85, 247, 0.3)",
              fontSize: 12,
            }}
          >
            <span style={{ color: "var(--text-1)", fontWeight: 700 }}>TOTAL</span>
            <span
              style={{
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              {cost}
            </span>
          </div>


        </div>
      </div>

      {/* Seção Média: resultado / loading da composição + Seu Vídeo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Coluna 1: Sua Música */}
        <div
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
          🎵 Sua Música
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
              {started
                ? "[Aguardando o áudio…]"
                : "Clique em “COMPOR MÚSICA” para gerar a partir da letra acima."}
            </div>
          )
        )}
        </div>

        {/* Coluna 2: Seu Video */}
        <div
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
        <div style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
          Saldo: <b style={{ color: "var(--cyan-1)" }}>{saldoView} créditos</b>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
            onClick={() => !generating && !lyricsLoading && setConfirmOpen(true)}
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
