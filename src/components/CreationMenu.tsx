"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/Icon";
import { slugify } from "@/lib/format";
import type { Creation } from "@/lib/types";

const VIDEO_FAILED = new Set([
  "CREATE_TASK_FAILED",
  "GENERATE_MP4_FAILED",
  "FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

// Menu de "3 pontinhos" de uma criação na lista de Minhas Criações.
// Inclui "Baixar capa com letra" (MP4 da Suno: capa + música cantada).
export function CreationMenu({ creation, round = false }: { creation: Creation; round?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function excluir() {
    if (deleting) return;
    if (!window.confirm(`Excluir "${creation.title}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(true);
    setMsg("Excluindo…");
    const sb = createClient();
    const { error } = await sb.from("creations").delete().eq("id", creation.id);
    if (error) {
      setDeleting(false);
      setMsg("Erro ao excluir: " + error.message);
      return;
    }
    setOpen(false);
    router.refresh(); // recarrega a lista (a linha some)
  }

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => {
      document.removeEventListener("click", onDoc);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function copiarLink() {
    const url = `${window.location.origin}/song/${slugify(creation.title)}`;
    try {
      await navigator.clipboard.writeText(url);
      setMsg("Link copiado ✓");
    } catch {
      setMsg("Não foi possível copiar.");
    }
  }

  async function baixarCapaComLetra() {
    if (busy) return;
    if (!creation.suno_task_id || !creation.suno_audio_id) {
      setMsg("Música sem dados da Suno (criada antes do recurso).");
      return;
    }
    setBusy(true);
    setMsg("Gerando capa com letra… (1-3 min)");

    try {
      const res = await fetch("/api/criar-musica/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: creation.suno_task_id, audioId: creation.suno_audio_id }),
      });
      const data = await res.json();
      if (!res.ok || !data.taskId) {
        setBusy(false);
        setMsg(data.error ?? "Falha ao iniciar.");
        return;
      }
      const vt = data.taskId as string;
      if (pollRef.current) clearInterval(pollRef.current);

      const check = async () => {
        try {
          const r = await fetch(`/api/criar-musica/video/status?taskId=${encodeURIComponent(vt)}`);
          const d = await r.json();
          if (!r.ok) {
            setBusy(false);
            setMsg(d.error ?? "Erro ao consultar.");
            if (pollRef.current) clearInterval(pollRef.current);
            return;
          }
          if (d.videoUrl) {
            if (pollRef.current) clearInterval(pollRef.current);
            setBusy(false);
            setMsg(null);
            setOpen(false);
            const sb = createClient();
            await sb.from("creations").update({ has_video: true, video_url: d.videoUrl }).eq("id", creation.id);
            window.open(d.videoUrl, "_blank", "noopener");
          } else if (VIDEO_FAILED.has(d.status)) {
            setBusy(false);
            setMsg("A geração falhou. Tente de novo.");
            if (pollRef.current) clearInterval(pollRef.current);
          }
        } catch {
          // rede transitória
        }
      };
      check();
      pollRef.current = setInterval(check, 5000);
    } catch {
      setBusy(false);
      setMsg("Falha de conexão.");
    }
  }

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    textAlign: "left",
    background: "none",
    border: "none",
    color: "var(--text-1)",
    fontSize: 13,
    padding: "9px 12px",
    borderRadius: 8,
    cursor: busy ? "default" : "pointer",
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className={round ? "music-kebab" : "btn-pill"}
        style={round ? undefined : { padding: "6px 10px" }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
          setMsg(null);
        }}
        title="Mais opções"
        aria-label="Mais opções"
      >
        {round ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        ) : (
          "⋯"
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            zIndex: 60,
            width: 230,
            background: "linear-gradient(180deg, rgba(22,22,77,0.98), rgba(10,10,46,0.98))",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 6,
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          }}
        >
          {creation.audio_url && (
            <a
              href={`/api/criar-musica/download?url=${encodeURIComponent(creation.audio_url)}&title=${encodeURIComponent(creation.title)}`}
              style={itemStyle}
              onClick={() => setOpen(false)}
            >
              <Icon name="download" size={15} style={{ color: "var(--cyan-1)" }} /> Baixar MP3
            </a>
          )}
          {creation.kind === "music" && creation.audio_url && (
            <button onClick={copiarLink} style={itemStyle}>
              <Icon name="globe" size={15} style={{ color: "var(--cyan-1)" }} /> Copiar link da música
            </button>
          )}
          {creation.video_url && !busy && (
            <a
              href={creation.video_url}
              target="_blank"
              rel="noopener noreferrer"
              style={itemStyle}
              onClick={() => setOpen(false)}
            >
              <Icon name="download" size={15} style={{ color: "var(--cyan-1)" }} /> Baixar último vídeo salvo
            </a>
          )}
          <button onClick={baixarCapaComLetra} disabled={busy} style={itemStyle}>
            <Icon name="mic" size={15} style={{ color: "var(--cyan-1)" }} /> {busy ? "Gerando…" : "Baixar capa com letra"}
          </button>

          <div style={{ height: 1, background: "var(--border-soft)", margin: "4px 6px" }} />

          <button
            onClick={excluir}
            disabled={deleting}
            style={{ ...itemStyle, color: "#f87171", cursor: deleting ? "default" : "pointer" }}
          >
            <Icon name="trash" size={15} style={{ color: "#f87171" }} /> {deleting ? "Excluindo…" : "Excluir"}
          </button>

          {msg && (
            <div style={{ fontSize: 11, color: "var(--text-3)", padding: "6px 12px", lineHeight: 1.4 }}>
              {msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
