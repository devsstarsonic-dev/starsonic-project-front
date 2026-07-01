"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLyricsGeneration } from "@/lib/hooks/useLyricsGeneration";
import { AudioPlayer } from "@/components/Compositor/AudioPlayer";
import { Icon } from "@/components/Icon";
import type { Creation } from "@/lib/types";
import { MUSIC_FAILED as FAILED, MUSIC_STATUS_LABEL as STATUS_LABEL, type Track } from "@/lib/suno/status";

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
          model: "V5_5",
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

  const glassCard: React.CSSProperties = {
    background: "rgba(8,10,36,0.72)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(0,212,255,0.15)",
    borderRadius: 18,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
  };

  const sectionLabel: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 6,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10, color: "var(--text-3)",
    letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700,
  };

  const fieldLabel: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 600,
    color: "var(--text-3)", letterSpacing: "0.08em",
    textTransform: "uppercase", marginBottom: 6,
    fontFamily: "'JetBrains Mono', monospace",
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 16, alignItems: "start", paddingBottom: 16 }}>

      {/* ── Coluna esquerda: editor + lista ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Card: Nova letra */}
        <div style={{ ...glassCard, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={sectionLabel}>
              <Icon name="pencil" size={12} /> Nova letra
            </div>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: wordCount > 0 ? "var(--cyan-1)" : "var(--text-3)" }}>
              {wordCount} palavras
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(0,212,255,0.08)" }} />

          {/* Título */}
          <div>
            <label style={fieldLabel}>Título</label>
            <input
              className="wiz-input"
              placeholder="Nome da música..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Tema + botão IA */}
          <div>
            <label style={fieldLabel}>Tema para geração com IA</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="wiz-input"
                placeholder="Ex.: superação, amor, fé..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                className="btn-secondary"
                onClick={generateLyric}
                disabled={aiLoading}
                style={{ whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}
              >
                {aiLoading
                  ? <><Icon name="sparkle" size={13} /> Gerando…</>
                  : <><Icon name="sparkle" size={13} /> Gerar com IA</>}
              </button>
            </div>
          </div>

          {/* Textarea reduzido */}
          <div>
            <label style={fieldLabel}>Letra</label>
            <textarea
              className="wiz-textarea"
              placeholder={"[Verso]\nEscreva ou gere sua letra aqui…\n\n[Refrão]\n…"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              style={{ minHeight: 150, fontFamily: "var(--font-editorial)", resize: "vertical" }}
            />
          </div>

          {/* Erro IA */}
          {aiError && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.20)", fontSize: 12, color: "var(--orange)" }}>
              <Icon name="bolt" size={13} /> {aiError}
            </div>
          )}

          {/* Salvar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 2, borderTop: "1px solid rgba(0,212,255,0.08)" }}>
            <button className="btn-primary" onClick={saveLyric} disabled={saving} style={{ gap: 7 }}>
              {saving ? "Salvando…" : <><Icon name="save" size={14} /> Salvar letra</>}
            </button>
            {saveMsg && (
              <span style={{ fontSize: 12, color: saveMsg.startsWith("Erro") ? "var(--orange)" : "var(--green)" }}>
                {saveMsg}
              </span>
            )}
          </div>
        </div>

        {/* Card: Minhas letras */}
        <div style={{ ...glassCard, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={sectionLabel}>
              <Icon name="library" size={12} /> Minhas letras
            </div>
            <div style={{
              minWidth: 22, height: 22, borderRadius: 99, padding: "0 7px",
              background: list.length > 0 ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.06)",
              border: "1px solid rgba(0,212,255,0.20)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
              color: list.length > 0 ? "var(--cyan-1)" : "var(--text-3)",
            }}>
              {list.length}
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(0,212,255,0.08)" }} />

          {list.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "20px 12px", textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="lyrics" size={18} style={{ color: "rgba(0,212,255,0.4)" }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 3 }}>Nenhuma letra ainda</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.55 }}>Escreva ou gere a primeira letra acima e salve aqui.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {list.map((c) => (
                <div
                  key={c.id}
                  className={`lyric-card${activeLyric?.id === c.id ? " active" : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(0,212,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name="lyrics" size={12} style={{ color: "var(--cyan-1)" }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "var(--white)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.title}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5, maxHeight: 40, overflow: "hidden", whiteSpace: "pre-wrap" }}>
                    {(c.lyrics ?? "").slice(0, 80) || "—"}
                  </div>
                  <button
                    className={activeLyric?.id === c.id ? "btn-primary" : "btn-secondary"}
                    onClick={() => activeLyric?.id === c.id ? closeMusic() : openMusic(c)}
                    style={{ fontSize: 11, padding: "6px 10px", gap: 5, justifyContent: "center" }}
                  >
                    {activeLyric?.id === c.id
                      ? <><Icon name="check" size={11} /> Selecionada</>
                      : <><Icon name="music" size={11} /> Gerar música</>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Coluna direita: player ou banner ── */}
      <div>
        {activeLyric ? (
          /* Painel do player */
          <div style={{
            ...glassCard,
            padding: 20,
            display: "flex", flexDirection: "column", gap: 14,
            border: "1px solid rgba(0,212,255,0.25)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(0,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="music" size={15} style={{ color: "var(--cyan-1)" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: "var(--cyan-1)", letterSpacing: "0.12em", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>
                  Gerar música
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {activeLyric.title}
                </div>
              </div>
              <button
                onClick={closeMusic}
                aria-label="Fechar"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-3)", fontSize: 16, flexShrink: 0 }}
              >
                ×
              </button>
            </div>

            <div style={{ height: 1, background: "rgba(0,212,255,0.10)" }} />

            {/* Estilo */}
            <div>
              <label style={fieldLabel}>Estilo / gênero</label>
              <input
                className="wiz-input"
                placeholder="Ex.: Pop brasileiro, voz feminina…"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                disabled={generating}
              />
            </div>

            {/* Botão gerar */}
            {!tracks.some((t) => t.audioUrl) && (
              <button className="btn-primary" onClick={runMusic} disabled={generating} style={{ justifyContent: "center", gap: 7 }}>
                {generating
                  ? (STATUS_LABEL[genStatus ?? "PENDING"] ?? "Gerando…")
                  : <><Icon name="bolt" size={14} /> Gerar música</>}
              </button>
            )}

            {/* Tempo estimado */}
            {generating && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.10)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cyan-1)", animation: "pulse 1.5s infinite" }} />
                <span style={{ fontSize: 11, color: "var(--text-3)" }}>Costuma levar 2–3 minutos…</span>
              </div>
            )}

            {/* Erro */}
            {genError && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", color: "var(--orange)", fontSize: 12 }}>
                <Icon name="bolt" size={13} /> {genError}
              </div>
            )}

            {/* Players */}
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

            {/* Sucesso */}
            {genDone && (
              <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.20)", fontSize: 12, color: "var(--green)", textAlign: "center" }}>
                Salva em{" "}
                <Link href="/criacoes" style={{ color: "var(--cyan-1)", fontWeight: 600 }}>
                  Minhas Criações
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Banner placeholder */
          <div style={{
            background: "rgba(8,10,36,0.72)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(0,212,255,0.18)",
            borderRadius: 18,
            padding: 20,
            boxShadow: "0 12px 36px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 9px", borderRadius: 99,
              background: "rgba(0,212,255,0.10)", border: "1px solid rgba(0,212,255,0.20)",
              fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700, letterSpacing: "0.12em", color: "var(--cyan-1)",
              marginBottom: 12, width: "fit-content",
            }}>
              <Icon name="sparkle" size={9} /> SONIC LAB · LETRISTA
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 15, color: "var(--white)", lineHeight: 1.25, marginBottom: 2 }}>
                Escreva e guarde
              </div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 15, color: "var(--cyan-1)", lineHeight: 1.25 }}>
                as letras das suas músicas
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(0,212,255,0.10)", margin: "12px 0" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              {([
                { icon: "sparkle", label: "Geração com IA" },
                { icon: "save",    label: "Salva na sua conta" },
                { icon: "music",   label: "Vira música" },
              ] as const).map(({ icon, label }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 10px", borderRadius: 10,
                  background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.10)",
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(0,212,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={icon} size={12} style={{ color: "var(--cyan-1)" }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--white)" }}>{label}</span>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: "rgba(0,212,255,0.10)", marginBottom: 14 }} />

            <div style={{ display: "flex", gap: 8 }}>
              {([
                { value: "6", label: "Idiomas" },
                { value: "2", label: "Versões" },
                { value: "3min", label: "T. médio" },
              ] as const).map(({ value, label }) => (
                <div key={label} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 16, color: "var(--cyan-1)" }}>{value}</div>
                  <div style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
