"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/Icon";

// Envia um vídeo do rosto para a HeyGen (upload de asset).
export function AvatarVideoUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setDone(false);
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setBusy(true);
    try {
      const res = await fetch("/api/heygen/upload", {
        method: "POST",
        headers: { "Content-Type": file.type || "video/mp4" },
        body: file,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha ao enviar o vídeo.");
        return;
      }
      setDone(true);
    } catch {
      setError("Falha de conexão ao enviar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
        <Icon name="video" size={13} style={{ color: "var(--cyan-1)" }} /> Enviar vídeo do rosto (HeyGen)
      </div>

      <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
        Grave um vídeo curto do seu rosto (boa luz, olhando para a câmera) e envie
        para a HeyGen criar seu avatar em vídeo.
      </div>

      {previewUrl && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          src={previewUrl}
          controls
          style={{ width: "100%", maxHeight: 240, borderRadius: 12, background: "#000", border: "1px solid var(--border)" }}
        />
      )}

      <div
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) upload(f);
        }}
        style={{
          cursor: busy ? "default" : "pointer",
          border: `1.5px dashed ${drag ? "var(--cyan-1)" : "var(--border-soft)"}`,
          borderRadius: 14,
          padding: "26px 16px",
          textAlign: "center",
          background: drag ? "rgba(0,212,255,0.08)" : "rgba(10,10,46,0.4)",
          transition: "all 0.15s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6, color: "var(--cyan-1)" }}>
          <Icon name={busy ? "clock" : "upload"} size={26} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--white)" }}>
          {busy ? "Enviando para a HeyGen…" : fileName || "Clique ou arraste um vídeo"}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>MP4, MOV, WEBM…</div>
      </div>

      {done && (
        <div style={{ fontSize: 13, color: "var(--green)", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="check" size={15} /> Vídeo enviado para a HeyGen com sucesso!
        </div>
      )}
      {error && (
        <div style={{ padding: 12, borderRadius: 10, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", color: "var(--orange)", fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
