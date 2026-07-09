"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AudioPlayer } from "./AudioPlayer";
import { createClient } from "@/lib/supabase/client";
import { MUSIC_CREDIT_COST } from "@/lib/credits";
import {
  MUSIC_FAILED as FAILED,
  MUSIC_STATUS_LABEL as STATUS_LABEL,
  MUSIC_STEPS as STEPS,
  musicStepIndex as stepIndex,
  audioDownloadHref as downloadHref,
  type Track,
} from "@/lib/suno/status";

// Jingle Comercial: gera 1 único take completo na Suno (não 2 versões como o
// Studio) e, ao ficar pronto, chama /api/criar-musica/jingle pra cortar em
// 15s/30s/60s com FFmpeg e subir os 4 arquivos no R2 (ver comentário-guia em
// app/(app)/jingle/page.tsx).

interface Props {
  title: string;
  lyrics: string;
  lyricsLoading?: boolean;
  lyricsError?: string | null;
  onRegenerateLyrics?: () => void;
  style?: string;
  negativeTags?: string;
  selectedAnswers: Record<string, string | string[]>;
  brandName: string;
  slogan: string;
  audience: string;
  genre: string;
  vibe: string;
  durationChosen: string;
  voiceStyle: string;
  onGenerated?: () => void;
  saldo: number;
  onEdit?: () => void;
  onNewSong?: () => void;
}

type JingleUrls = { full: string; s15: string; s30: string; s60: string };

function JingleReviewPanelComponent({
  title,
  lyrics,
  lyricsLoading = false,
  lyricsError = null,
  onRegenerateLyrics,
  style = "",
  negativeTags = "",
  selectedAnswers,
  brandName,
  slogan,
  audience,
  genre,
  vibe,
  durationChosen,
  voiceStyle,
  onGenerated,
  saldo,
  onEdit,
  onNewSong,
}: Props) {
  const router = useRouter();
  const [editedLyrics, setEditedLyrics] = useState(lyrics);

  useEffect(() => {
    if (lyrics) setEditedLyrics(lyrics);
  }, [lyrics]);

  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [track, setTrack] = useState<(Track & { taskId: string }) | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Corte em 15s/30s/60s (chamado depois que a Suno termina o áudio completo).
  const [cutting, setCutting] = useState(false);
  const [cutError, setCutError] = useState<string | null>(null);
  const [urls, setUrls] = useState<JingleUrls | null>(null);
  const cutRef = useRef(false); // evita cortar duas vezes

  const [isGuest, setIsGuest] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(async ({ data: { user } }) => {
      setIsGuest(!user);
      if (user) {
        const { data } = await sb.from("profiles").select("credits").eq("id", user.id).maybeSingle();
        if (data) setCredits(data.credits as number);
      }
    });
  }, []);

  const cost = MUSIC_CREDIT_COST;
  const saldoView = credits ?? saldo;
  const answerEntries = Object.entries(selectedAnswers);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const generating = submitting || (!!taskId && status !== "SUCCESS" && !error);
  const started = !!taskId || submitting || !!error;

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }
  useEffect(() => stopPolling, []);

  // Polling do status da Suno (1 única task — 1 take completo).
  useEffect(() => {
    if (!taskId) return;
    stopPolling();

    async function check() {
      try {
        const res = await fetch(`/api/criar-musica/status?taskId=${encodeURIComponent(taskId!)}`);
        const data = await res.json();
        if (!res.ok) return;
        const s = String(data.status ?? "PENDING");
        const tracks = (Array.isArray(data.tracks) ? data.tracks : []) as Track[];
        const ready = tracks.find((t) => t.audioUrl);
        if (ready) setTrack({ ...ready, taskId: taskId! });

        if (s === "SUCCESS") {
          setStatus("SUCCESS");
          stopPolling();
        } else if (FAILED.has(s)) {
          if (ready) setStatus("SUCCESS");
          else setError("A geração falhou na Suno. Ajuste os campos e tente novamente.");
          stopPolling();
        } else {
          setStatus(ready ? "FIRST_SUCCESS" : "PENDING");
        }
      } catch {
        // erro de rede transitório — tenta de novo no próximo ciclo
      }
    }

    check();
    pollRef.current = setInterval(check, 5000);
    return stopPolling;
  }, [taskId]);

  // Áudio completo pronto → corta em 15s/30s/60s e salva tudo (creations + jingles + R2).
  useEffect(() => {
    if (status !== "SUCCESS" || !track?.audioUrl || cutRef.current) return;
    cutRef.current = true;
    setCutting(true);
    setCutError(null);

    (async () => {
      try {
        const res = await fetch("/api/criar-musica/jingle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioUrl: track.audioUrl,
            title: brandName ? `${brandName} · Jingle` : title,
            style,
            lyrics: editedLyrics,
            sunoTaskId: track.taskId,
            brandName,
            slogan,
            audience,
            genre,
            vibe,
            durationChosen,
            voiceStyle,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          cutRef.current = false;
          setCutError(data.error ?? "Não foi possível cortar as versões curtas do jingle.");
          return;
        }
        setUrls(data.urls as JingleUrls);
        onGenerated?.();
        if (typeof data.credits === "number") setCredits(data.credits);
        if (!isGuest) router.refresh();
      } catch {
        cutRef.current = false;
        setCutError("Falha de conexão ao cortar o jingle.");
      } finally {
        setCutting(false);
      }
    })();
  }, [status, track, title, style, editedLyrics, brandName, slogan, audience, genre, vibe, durationChosen, voiceStyle, onGenerated, isGuest, router]);

  const handleCompose = useCallback(async () => {
    if (generating) return;

    const { data: { user } } = await createClient().auth.getUser();
    if (user && credits !== null && credits < cost) {
      setError(`Créditos insuficientes (você tem ${credits}, precisa de ${cost}). Faça upgrade do plano.`);
      return;
    }
    if (!editedLyrics.trim()) {
      setError("Escreva a letra do jingle no box acima antes de compor.");
      return;
    }

    setError(null);
    setTrack(null);
    setStatus(null);
    setTaskId(null);
    setUrls(null);
    setCutError(null);
    cutRef.current = false;
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
          model: "V5_5",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.taskId) {
        setError(data.error ?? "Não foi possível iniciar a geração.");
        return;
      }
      setTaskId(data.taskId as string);
      setStatus("PENDING");
    } catch {
      setError("Falha de conexão ao enviar para a API.");
    } finally {
      setSubmitting(false);
    }
  }, [editedLyrics, title, style, negativeTags, generating, credits, cost]);

  const busy = generating || cutting;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 20 }}>
      <div className="rev-grid3">
        {/* Card 1: Sua Letra */}
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
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}
            >
              📣
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 14, color: "var(--white)" }}>
                Sua Letra
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "'Sora', sans-serif" }}>
                {busy ? "Gerando — letra bloqueada" : "Clique para editar (inclui o slogan)"}
              </div>
            </div>
            {onRegenerateLyrics && (
              <button
                onClick={onRegenerateLyrics}
                disabled={lyricsLoading || busy}
                title="Gerar a letra novamente a partir das suas respostas"
                style={{
                  marginLeft: "auto", flexShrink: 0, padding: "6px 10px", fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace", background: "var(--bg-card)",
                  color: "var(--cyan-1)", border: "1px solid var(--border-soft)", borderRadius: 8,
                  cursor: lyricsLoading || busy ? "not-allowed" : "pointer",
                  opacity: lyricsLoading || busy ? 0.5 : 1, whiteSpace: "nowrap",
                }}
              >
                {lyricsLoading ? "↻ gerando…" : "↻ gerar de novo"}
              </button>
            )}
          </div>

          <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
            <textarea
              value={editedLyrics}
              onChange={(e) => setEditedLyrics(e.target.value)}
              disabled={busy || lyricsLoading}
              placeholder={lyricsLoading ? "Gerando a letra a partir das suas respostas…" : "[Verso]\nEscreva ou edite a letra do jingle…"}
              style={{
                width: "100%", fontFamily: "'Caveat', cursive", fontSize: 13, lineHeight: 1.6,
                flex: 1, minHeight: 300, maxHeight: 1000, background: "rgba(10, 10, 46, 0.6)",
                border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px",
                color: "var(--text-1)", resize: "vertical",
                cursor: busy || lyricsLoading ? "not-allowed" : "text",
                opacity: busy || lyricsLoading ? 0.6 : 1,
              }}
            />
            {lyricsError && (
              <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: "rgba(251, 146, 60, 0.08)", border: "1px solid rgba(251, 146, 60, 0.25)", color: "var(--orange)", fontSize: 12 }}>
                ⚠️ {lyricsError} Você pode escrever a letra manualmente acima.
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Suas Escolhas */}
        <div
          className="rev-answers-rail"
          style={{
            background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
            border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px",
            display: "flex", flexDirection: "column",
          }}
        >
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            Suas escolhas
            <button
              type="button"
              onClick={onEdit}
              style={{ marginLeft: "auto", color: "var(--cyan-1)", cursor: "pointer", fontSize: 12, fontFamily: "'Sora', sans-serif", textTransform: "none", letterSpacing: 0, background: "none", border: "none", padding: 0 }}
            >
              editar
            </button>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 2 }}>
            {answerEntries.map(([key, value]) => {
              const full = String(Array.isArray(value) ? value.join(", ") : value);
              return (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "5px 0", borderBottom: "1px solid var(--border-soft)" }}>
                  <span style={{ color: "var(--text-3)", fontSize: 12, flexShrink: 0 }}>{key}</span>
                  <span style={{ color: "var(--white)", fontWeight: 600, fontSize: 12, textAlign: "right", wordBreak: "break-word" }}>{full}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna do meio: Seu Jingle */}
        <div
          className="rev-col2"
          style={{
            background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
            border: "1px solid var(--border)", borderRadius: 14, padding: "20px",
          }}
        >
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>
            📣 Seu Jingle
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: "rgba(251, 146, 60, 0.08)", border: "1px solid rgba(251, 146, 60, 0.25)", color: "var(--orange)", fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}
          {cutError && (
            <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: "rgba(251, 146, 60, 0.08)", border: "1px solid rgba(251, 146, 60, 0.25)", color: "var(--orange)", fontSize: 13 }}>
              ⚠️ {cutError}
            </div>
          )}

          {/* Loading: gerando o áudio completo na Suno */}
          {generating && (
            <div style={{ padding: 20, borderRadius: 14, background: "var(--bg-card-2)", border: "1px solid var(--border-soft)", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <span style={{ width: 30, height: 30, border: "3px solid var(--cyan-1)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block", flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--white)" }}>Compondo o áudio completo…</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                    {STATUS_LABEL[status ?? "PENDING"] ?? "Processando…"} · costuma levar 2-3 minutos
                  </div>
                </div>
              </div>
              <div style={{ height: 6, background: "var(--bg-card)", borderRadius: 100, overflow: "hidden", marginBottom: 14 }}>
                <div style={{ height: "100%", borderRadius: 100, background: "var(--grad-brand)", width: `${((stepIndex(status) + 1) / STEPS.length) * 100}%`, transition: "width .4s ease" }} />
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {STEPS.map((s, i) => {
                  const cur = stepIndex(status);
                  const st = i < cur ? "done" : i === cur ? "active" : "todo";
                  const color = st === "todo" ? "var(--text-3)" : st === "done" ? "var(--green)" : "var(--cyan-1)";
                  return (
                    <div key={s.status} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color }}>
                      <span>{st === "done" ? "✓" : st === "active" ? "●" : "○"}</span>
                      {s.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading: cortando com FFmpeg */}
          {cutting && (
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 14, background: "var(--bg-card-2)", border: "1px solid var(--border-soft)", marginBottom: 16 }}>
              <span style={{ width: 26, height: 26, border: "3px solid var(--purple)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--white)" }}>✂️ Cortando em 15s / 30s / 60s…</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>Aplicando fade-out e salvando as versões no R2</div>
              </div>
            </div>
          )}

          {/* Concluído */}
          {urls && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 13, color: "var(--green)", fontWeight: 600, marginBottom: 16 }}>
              ✓ Jingle pronto — 4 versões geradas!
              <span style={{ color: "var(--text-3)", fontWeight: 400 }}>
                · salvo em{" "}
                <Link href="/criacoes" style={{ color: "var(--cyan-1)", fontWeight: 600 }}>
                  Minhas Criações
                </Link>
              </span>
            </div>
          )}

          {urls ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <AudioPlayer audioUrl={urls.full} title={`${title} · Completo`} subtitle="Áudio completo" imageUrl={null} primary downloadHref={downloadHref(urls.full, `${title} - completo`)} lockDownload={isGuest} onLockedAction={() => router.push("/cadastro")} />
              <AudioPlayer audioUrl={urls.s60} title={`${title} · 60s`} subtitle="Rádio / TV" imageUrl={null} primary={false} downloadHref={downloadHref(urls.s60, `${title} - 60s`)} lockDownload={isGuest} onLockedAction={() => router.push("/cadastro")} />
              <AudioPlayer audioUrl={urls.s30} title={`${title} · 30s`} subtitle="Reels / Anúncio" imageUrl={null} primary={false} downloadHref={downloadHref(urls.s30, `${title} - 30s`)} lockDownload={isGuest} onLockedAction={() => router.push("/cadastro")} />
              <AudioPlayer audioUrl={urls.s15} title={`${title} · 15s`} subtitle="Stories / Vinheta" imageUrl={null} primary={false} downloadHref={downloadHref(urls.s15, `${title} - 15s`)} lockDownload={isGuest} onLockedAction={() => router.push("/cadastro")} />
            </div>
          ) : (
            !busy &&
            !error && (
              <div style={{ background: "rgba(10, 10, 46, 0.4)", border: "1px dashed var(--border-soft)", borderRadius: 10, padding: "20px", textAlign: "center", color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                {started ? "[Aguardando o áudio…]" : "Clique em “COMPOR JINGLE” para gerar o áudio completo e cortar em 15s/30s/60s."}
              </div>
            )
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          background: "var(--grad-card)", border: "1px solid var(--border)", borderRadius: 14,
          padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12, flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
            Saldo: <b style={{ color: "var(--cyan-1)" }}>{saldoView} créditos</b>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'Sora', sans-serif" }}>
            Esta ação utilizará <b style={{ color: "var(--cyan-1)" }}>{cost} créditos</b> · gera o áudio completo + 15s + 30s + 60s
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {onNewSong && urls && (
            <button
              onClick={onNewSong}
              title="Limpa tudo e volta ao início do formulário de criação"
              style={{
                background: "linear-gradient(135deg, #a855f7, #ec4899)", color: "#fff",
                fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 13,
                padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                letterSpacing: "0.3px", boxShadow: "0 4px 20px rgba(168,85,247,0.4)",
              }}
            >
              ＋ Criar novo jingle
            </button>
          )}
          <button
            onClick={onEdit}
            disabled={busy}
            style={{
              background: "var(--bg-card)", color: "var(--text-1)", fontFamily: "'Sora', sans-serif",
              fontWeight: 600, fontSize: 13, padding: "10px 18px", borderRadius: 10,
              border: "1px solid var(--border)", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1,
            }}
          >
            ← Editar respostas
          </button>
          <button
            onClick={handleCompose}
            disabled={busy || lyricsLoading}
            style={{
              background: "#00D6F7", color: "#0a0a2e", fontFamily: "'Orbitron', sans-serif",
              fontWeight: 800, fontSize: 13, padding: "10px 22px", borderRadius: 10, border: "none",
              cursor: busy || lyricsLoading ? "not-allowed" : "pointer", letterSpacing: "0.3px",
              opacity: busy || lyricsLoading ? 0.7 : 1,
              boxShadow: busy || lyricsLoading ? "none" : "0 4px 20px rgba(0, 214, 247, 0.4)",
            }}
          >
            {generating ? "GERANDO…" : cutting ? "CORTANDO…" : lyricsLoading ? "AGUARDE A LETRA…" : `COMPOR JINGLE · ${cost} CRÉDITOS`}
          </button>
        </div>
      </div>
    </div>
  );
}

export const JingleReviewPanel = memo(JingleReviewPanelComponent);
