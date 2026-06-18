"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLyricsGeneration } from "@/lib/hooks/useLyricsGeneration";
import { AudioPlayer } from "@/components/Compositor/AudioPlayer";
import type { Creation } from "@/lib/types";

const FAILED = new Set([
  "CREATE_TASK_FAILED",
  "GENERATE_AUDIO_FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Na fila…",
  TEXT_SUCCESS: "Letra pronta, gerando áudio…",
  FIRST_SUCCESS: "Primeira versão pronta…",
  SUCCESS: "Concluída!",
};

type Track = { id: string | null; title: string | null; audioUrl: string | null; imageUrl: string | null; duration: number | null };

export function Letrista({ lyrics: initial, profileId }: { lyrics: Creation[]; profileId: string | null }) {
  // ---- Criador de letra ----
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [list, setList] = useState<Creation[]>(initial);

  const { lyrics: aiLyrics, title: aiTitle, loading: aiLoading, error: aiError, generate } = useLyricsGeneration();

  // Quando a IA devolve a letra, joga no textarea.
  useEffect(() => {
    if (aiLyrics) setText(aiLyrics);
  }, [aiLyrics]);
  useEffect(() => {
    if (aiTitle && !title) setTitle(aiTitle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiTitle]);

  function generateLyric() {
    setSaveMsg(null);
    const prompt = `Letra sobre ${theme || title || "um tema livre"}`.slice(0, 200);
    generate(prompt);
  }

  async function saveLyric() {
    if (!text.trim()) {
      setSaveMsg("Escreva ou gere a letra antes de salvar.");
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    const sb = createClient();
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const { data, error } = await sb
      .from("creations")
      .insert({
        ...(profileId ? { profile_id: profileId } : {}),
        title: title.trim() || "Letra sem título",
        kind: "lyric",
        lyrics: text,
        words,
        status: "finalized",
        progress: 100,
        emoji: "📝",
        badge_label: "LETRA",
        gradient_from: "#a855f7",
        gradient_to: "#ec4899",
      })
      .select("*")
      .single();
    setSaving(false);
    if (error) {
      setSaveMsg("Erro ao salvar: " + error.message);
      return;
    }
    setList((l) => [data as Creation, ...l]);
    setSaveMsg("Letra salva! ✓");
    setTitle("");
    setTheme("");
    setText("");
  }

  // ---- Gerar música a partir de uma letra salva ----
  const [activeLyric, setActiveLyric] = useState<Creation | null>(null);
  const [style, setStyle] = useState("");
  const [genStatus, setGenStatus] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [genError, setGenError] = useState<string | null>(null);
  const [genDone, setGenDone] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedRef = useRef(false);
  const generating = !!genStatus && genStatus !== "SUCCESS" && !genError;

  function stopPoll() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }
  useEffect(() => stopPoll, []);

  function openMusic(lyric: Creation) {
    stopPoll();
    setActiveLyric(lyric);
    setStyle("");
    setGenStatus(null);
    setTracks([]);
    setGenError(null);
    setGenDone(false);
    savedRef.current = false;
  }

  function closeMusic() {
    stopPoll();
    setActiveLyric(null);
  }

  async function runMusic() {
    if (!activeLyric || generating) return;
    setGenError(null);
    setTracks([]);
    setGenDone(false);
    savedRef.current = false;
    setGenStatus("PENDING");

    let taskId: string | null = null;
    try {
      const res = await fetch("/api/criar-musica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeLyric.title,
          style: style.trim() || "Pop brasileiro",
          lyrics: activeLyric.lyrics ?? "",
          instrumental: false,
          model: "V4_5",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.taskId) {
        setGenError(data.error ?? "Não foi possível iniciar a geração.");
        setGenStatus(null);
        return;
      }
      taskId = data.taskId;
    } catch {
      setGenError("Falha de conexão.");
      setGenStatus(null);
      return;
    }

    const check = async () => {
      try {
        const r = await fetch(`/api/criar-musica/status?taskId=${encodeURIComponent(taskId!)}`);
        const d = await r.json();
        if (!r.ok) {
          setGenError(d.error ?? "Erro ao consultar o status.");
          stopPoll();
          setGenStatus(null);
          return;
        }
        setGenStatus(d.status);
        if (Array.isArray(d.tracks) && d.tracks.length) setTracks(d.tracks);
        if (d.status === "SUCCESS") {
          stopPoll();
          const primary = (d.tracks as Track[]).find((t) => t.audioUrl);
          if (primary?.audioUrl && !savedRef.current) {
            savedRef.current = true;
            void fetch("/api/criar-musica/salvar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: activeLyric.title,
                style,
                audioUrl: primary.audioUrl,
                imageUrl: primary.imageUrl,
                duration: primary.duration,
                lyrics: activeLyric.lyrics ?? "",
                sunoTaskId: taskId,
                sunoAudioId: primary.id,
              }),
            }).then(() => setGenDone(true));
          }
        }
        if (FAILED.has(d.status)) {
          setGenError("A geração falhou na Suno. Tente de novo.");
          stopPoll();
        }
      } catch {
        // rede transitória
      }
    };
    check();
    pollRef.current = setInterval(check, 5000);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1.1fr) minmax(300px, 1fr)", gap: 20, alignItems: "start" }}>
      {/* Criador de letra */}
      <div className="card-glow" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>
          ✍️ Nova letra
        </div>

        <input
          className="wiz-input"
          placeholder="Título da letra"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="wiz-input"
            placeholder="Tema (ex.: superação, amor, fé...)"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn-secondary" onClick={generateLyric} disabled={aiLoading} style={{ whiteSpace: "nowrap" }}>
            {aiLoading ? "Gerando…" : "✨ Gerar com IA"}
          </button>
        </div>

        <textarea
          className="wiz-textarea"
          placeholder={"[Verso]\nEscreva ou gere sua letra aqui…\n\n[Refrão]\n…"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          style={{ minHeight: 260, fontFamily: "var(--font-editorial)" }}
        />

        {aiError && <div style={{ fontSize: 12, color: "var(--orange)" }}>⚠️ {aiError}</div>}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn-primary" onClick={saveLyric} disabled={saving}>
            {saving ? "Salvando…" : "💾 Salvar letra"}
          </button>
          {saveMsg && (
            <span style={{ fontSize: 12, color: saveMsg.startsWith("Erro") ? "var(--orange)" : "var(--green)" }}>
              {saveMsg}
            </span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
            {text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0} palavras
          </span>
        </div>
      </div>

      {/* Minhas letras */}
      <div className="card-glow" style={{ padding: 20 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
          📚 Minhas letras ({list.length})
        </div>

        {list.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-3)", padding: "20px 0", textAlign: "center" }}>
            Nenhuma letra salva ainda. Crie a primeira ao lado.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 560, overflowY: "auto" }}>
            {list.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-soft)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>📝</span>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--white)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.title}
                  </div>
                  <span className="badge purple">{c.words} palavras</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5, maxHeight: 54, overflow: "hidden", whiteSpace: "pre-wrap", marginBottom: 10 }}>
                  {(c.lyrics ?? "").slice(0, 140) || "—"}
                </div>
                <button className="btn-primary" onClick={() => openMusic(c)} style={{ fontSize: 12, padding: "8px 14px" }}>
                  🎵 Gerar música com esta letra
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: gerar música da letra */}
      {activeLyric && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={closeMusic}
        >
          <div
            className="card-glow"
            style={{ width: "100%", maxWidth: 520, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🎵</span>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 16, color: "var(--white)", flex: 1 }}>
                Gerar música · {activeLyric.title}
              </div>
              <button onClick={closeMusic} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 20 }}>×</button>
            </div>

            <input
              className="wiz-input"
              placeholder="Estilo / gênero (ex.: Pop brasileiro, voz feminina)"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              disabled={generating}
            />

            {!tracks.some((t) => t.audioUrl) && (
              <button className="btn-primary" onClick={runMusic} disabled={generating} style={{ justifyContent: "center" }}>
                {generating ? (STATUS_LABEL[genStatus ?? "PENDING"] ?? "Gerando…") : "⚡ Gerar música"}
              </button>
            )}

            {generating && (
              <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>
                Costuma levar 2-3 minutos…
              </div>
            )}

            {genError && (
              <div style={{ padding: 12, borderRadius: 10, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", color: "var(--orange)", fontSize: 13 }}>
                ⚠️ {genError}
              </div>
            )}

            {tracks.filter((t) => t.audioUrl).map((t, i) => (
              <AudioPlayer
                key={t.id ?? i}
                audioUrl={t.audioUrl as string}
                title={`${activeLyric.title} · v${i + 1}`}
                subtitle={style || "Star Sonic"}
                imageUrl={t.imageUrl}
                primary={i === 0}
              />
            ))}

            {genDone && (
              <div style={{ fontSize: 13, color: "var(--green)", textAlign: "center" }}>
                ✓ Salva em <Link href="/criacoes" style={{ color: "var(--cyan-1)", fontWeight: 600 }}>Minhas Criações</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
