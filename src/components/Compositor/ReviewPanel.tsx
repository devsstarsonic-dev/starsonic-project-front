"use client";

import { ReactNode, useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";

interface Props {
  title: string;
  lyrics: string;
  /** Estilo/gênero enviado para a Suno (ex.: "Pop brasileiro, voz feminina"). */
  style?: string;
  selectedAnswers: Record<string, any>;
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

export function ReviewPanel({
  title,
  lyrics,
  style = "",
  selectedAnswers,
  totalCost,
  saldo,
  onEdit,
}: Props) {
  const [editedLyrics, setEditedLyrics] = useState(lyrics);

  const lyricsStats = useMemo(
    () => ({
      words: editedLyrics.split(/\s+/).filter(Boolean).length,
      choruses: (editedLyrics.match(/\[Chorus\]|\[Refrão\]/gi) || []).length,
    }),
    [editedLyrics]
  );

  // ----- Estado da geração (Suno) -----
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado da gravação na biblioteca (tabela "creations").
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  // Quando a música fica pronta, salva automaticamente na biblioteca (creations).
  useEffect(() => {
    if (status !== "SUCCESS" || savedRef.current) return;
    const primary = tracks.find((t) => t.audioUrl);
    if (!primary?.audioUrl) return;

    savedRef.current = true;
    setSaving(true);
    setSaveError(null);

    (async () => {
      try {
        const res = await fetch("/api/criar-musica/salvar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || primary.title || "Nova música",
            style,
            audioUrl: primary.audioUrl,
            imageUrl: primary.imageUrl,
            duration: primary.duration,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          savedRef.current = false; // permite tentar de novo
          setSaveError(data.error ?? "Não foi possível salvar na biblioteca.");
          return;
        }
        setSaved(true);
      } catch {
        savedRef.current = false;
        setSaveError("Falha de conexão ao salvar na biblioteca.");
      } finally {
        setSaving(false);
      }
    })();
  }, [status, tracks, title, style]);

  // Envia a letra (do box acima) para a Suno.
  async function handleCompose() {
    if (generating) return;

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
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 20 }}>
      {/* Seção Superior: Grid 2x2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
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
            <div>
              <div
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  color: "var(--white)",
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                {generating ? "Gerando — letra bloqueada" : "Clique para editar"}
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
            <textarea
              value={editedLyrics}
              onChange={(e) => setEditedLyrics(e.target.value)}
              disabled={generating}
              style={{
                width: "100%",
                fontFamily: "'Caveat', cursive",
                fontSize: 13,
                lineHeight: 1.6,
                height: 180,
                background: "rgba(10, 10, 46, 0.6)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "8px 10px",
                color: "var(--text-1)",
                resize: "none",
                cursor: generating ? "not-allowed" : "text",
                opacity: generating ? 0.6 : 1,
              }}
            />

            {/* Stats */}
            <div
              style={{
                marginTop: 10,
                padding: "8px 10px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-soft)",
                borderRadius: 8,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: "var(--text-3)",
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <div>📝 <b style={{ color: "var(--cyan-1)" }}>{lyricsStats.words}</b></div>
              <div>🎵 <b style={{ color: "var(--cyan-1)" }}>{lyricsStats.choruses}</b></div>
            </div>
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
              fontSize: 9,
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
            📋 Suas escolhas
            <span
              style={{
                marginLeft: "auto",
                color: "var(--cyan-1)",
                cursor: "pointer",
                fontSize: 10,
              }}
              onClick={onEdit}
            >
              editar
            </span>
          </div>

          <div
            style={{
              fontSize: 10,
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
                  padding: "4px 0",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <span style={{ color: "var(--text-3)", fontSize: 9 }}>{key}</span>
                <span style={{ color: "var(--white)", fontWeight: 600, fontSize: 9, textAlign: "right" }}>
                  {String(Array.isArray(value) ? value.join(", ") : value).substring(0, 20)}
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
                fontSize: 9,
                color: "var(--purple)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              💰 Custo total
            </div>

            <div style={{ fontSize: 10, lineHeight: 1.8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <span style={{ color: "var(--text-2)", fontSize: 9 }}>⚡ Letra</span>
                <span style={{ color: "var(--green)", fontWeight: 600, fontSize: 9 }}>incluso</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <span style={{ color: "var(--text-2)", fontSize: 9 }}>🎵 Composição</span>
                <span style={{ color: "var(--white)", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}>
                  {totalCost} créditos
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <span style={{ color: "var(--text-2)", fontSize: 9 }}>🎶 Versões</span>
                <span style={{ color: "var(--white)", fontWeight: 600, fontSize: 9 }}>2 músicas</span>
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
              {totalCost}
            </span>
          </div>

          <div
            style={{
              fontSize: 10,
              color: "var(--text-3)",
              fontFamily: "'JetBrains Mono', monospace",
              padding: "10px 10px",
              background: "rgba(10, 10, 46, 0.4)",
              borderRadius: 8,
              marginTop: 10,
              textAlign: "center",
            }}
          >
            Saldo: <b style={{ color: "var(--cyan-1)" }}>{saldo}</b>
          </div>
        </div>
      </div>

      {/* Seção Média: resultado / loading da composição */}
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
            {tracks.map((t, i) => (
              <div
                key={t.id ?? i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: 12,
                  borderRadius: 12,
                  background: "var(--bg-card-2)",
                  border: "1px solid var(--border-soft)",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: t.imageUrl
                      ? `center / cover url(${t.imageUrl})`
                      : "var(--grad-brand)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  {!t.imageUrl && "🎵"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--white)" }}>
                    {t.title || `Versão ${i + 1}`}
                  </div>
                  {t.audioUrl ? (
                    <>
                      <audio controls src={t.audioUrl} style={{ width: "100%", marginTop: 8, height: 36 }} />
                      <a
                        href={downloadHref(t.audioUrl, t.title || title || `Versão ${i + 1}`)}
                        className="btn-pill"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "6px 12px", fontSize: 12 }}
                      >
                        ⬇ Baixar MP3
                      </a>
                    </>
                  ) : (
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
                      gerando áudio…
                    </div>
                  )}
                </div>
              </div>
            ))}
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
        <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
          ⚡ Saldo: <b style={{ color: "var(--cyan-1)" }}>{saldo} créditos</b>
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
              padding: "9px 16px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              cursor: generating ? "not-allowed" : "pointer",
              opacity: generating ? 0.6 : 1,
            }}
          >
            ⬅ Editar respostas
          </button>
          <button
            onClick={handleCompose}
            disabled={generating}
            style={{
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              color: "var(--bg-deep)",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 800,
              fontSize: 13,
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              cursor: generating ? "not-allowed" : "pointer",
              letterSpacing: "0.3px",
              opacity: generating ? 0.7 : 1,
            }}
          >
            {generating ? "🎵 GERANDO…" : `🎵 COMPOR MÚSICA · ${totalCost} CRÉDITOS`}
          </button>
        </div>
      </div>
    </div>
  );
}
