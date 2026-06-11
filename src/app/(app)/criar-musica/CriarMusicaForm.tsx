"use client";

import { useEffect, useRef, useState } from "react";

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

export default function CriarMusicaForm() {
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

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTracks([]);
    setStatus(null);
    setTaskId(null);
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: status === "SUCCESS" ? "var(--green)" : "var(--cyan-1)",
              fontWeight: 600,
              marginBottom: tracks.length ? 16 : 0,
            }}
          >
            {status !== "SUCCESS" && (
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid var(--cyan-1)",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                }}
              />
            )}
            {STATUS_LABEL[status ?? "PENDING"] ?? "Processando…"}
          </div>

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
                    <audio controls src={t.audioUrl} style={{ width: "100%", marginTop: 8, height: 36 }} />
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
