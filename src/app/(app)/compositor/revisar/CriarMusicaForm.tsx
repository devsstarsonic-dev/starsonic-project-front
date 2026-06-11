"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const MODELS = [
  { value: "V4_5", label: "V4.5 · equilíbrio (recomendado)" },
  { value: "V4_5PLUS", label: "V4.5+ · máxima qualidade" },
  { value: "V5", label: "V5 · mais recente" },
  { value: "V4", label: "V4 · rápido" },
  { value: "V3_5", label: "V3.5 · econômico" },
];

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

export default function CriarMusicaForm2() {
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [instrumental, setInstrumental] = useState(false);
  const [model, setModel] = useState("V4_5");

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        body: JSON.stringify({ title, style, lyrics, instrumental, model }),
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--bg-card-2)",
    border: "1px solid var(--border-soft)",
    borderRadius: 10,
    padding: "10px 12px",
    color: "var(--white)",
    fontSize: 13,
    fontFamily: "'Sora', sans-serif",
    outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    color: "var(--text-3)",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 6,
  };

  return (
    <div className="card-glow" style={{ padding: 24, marginBottom: 24 }}>
      <h3
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 800,
          fontSize: 18,
          color: "var(--white)",
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        🎼 Compor agora
      </h3>
      <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 20 }}>
        Preencha os campos e envie direto para a Suno. Você recebe 2 versões.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle} htmlFor="title">Título</label>
            <input
              id="title"
              style={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Luz da Manhã"
              disabled={generating}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="style">Estilo / Gênero</label>
            <input
              id="style"
              style={inputStyle}
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Ex.: Pop brasileiro, animado, voz feminina"
              disabled={generating}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="lyrics">
            Letra {instrumental && <span style={{ textTransform: "none" }}>(desativada — instrumental)</span>}
          </label>
          <textarea
            id="lyrics"
            style={{ ...inputStyle, minHeight: 140, resize: "vertical", lineHeight: 1.6 }}
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder={"[Verso]\nEscreva aqui a letra da sua música…\n\n[Refrão]\n…"}
            disabled={generating || instrumental}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-2)", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={instrumental}
              onChange={(e) => setInstrumental(e.target.checked)}
              disabled={generating}
            />
            Instrumental (sem voz)
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--text-2)" }}>Modelo:</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={generating}
              style={{ ...inputStyle, width: "auto", padding: "8px 10px" }}
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={generating} style={{ opacity: generating ? 0.7 : 1 }}>
          {generating ? "Gerando…" : "Criar música ⚡"}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: 18,
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

      {taskId && !error && (
        <div style={{ marginTop: 20 }}>
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
        </div>
      )}
    </div>
  );
}
