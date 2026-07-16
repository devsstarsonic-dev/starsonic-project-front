"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Icon, type IconName } from "@/components/Icon";

// Banco de vozes do usuário ("Sua Voz"): envia áudios (acapelas, timbres) e os
// guarda no Supabase Storage via /api/vocalista/upload (service role, modo demo
// sem login). Lista, toca e exclui os arquivos já salvos.

type Cat = "vocais" | "vozes";
type Item = { name: string; url: string };

const CATS: { key: Cat; title: string; icon: IconName; desc: string }[] = [
  { key: "vocais", title: "Vocais da música", icon: "mic", desc: "Faça upload do vocal isolado de uma música (acapela, stem vocal)." },
  { key: "vozes", title: "Vozes", icon: "speaker", desc: "Faça upload de amostras de voz (timbres) para usar nas criações." },
];

export function Vocalista() {
  const [lists, setLists] = useState<Record<Cat, Item[]>>({ vocais: [], vozes: [] });
  const [busy, setBusy] = useState<Cat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (cat: Cat) => {
    try {
      const res = await fetch(`/api/vocalista/upload?cat=${cat}`);
      const data = await res.json();
      if (!res.ok) return;
      setLists((l) => ({ ...l, [cat]: (data.items as Item[]) ?? [] }));
    } catch {
      // falha transitória de rede: mantém a lista atual
    }
  }, []);

  useEffect(() => {
    load("vocais");
    load("vozes");
  }, [load]);

  async function upload(cat: Cat, file: File) {
    setError(null);
    setBusy(cat);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("cat", cat);
      const res = await fetch("/api/vocalista/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(`Erro no upload: ${data.error ?? "tente novamente."}`);
        return;
      }
      await load(cat);
    } catch {
      setError("Falha de conexão ao enviar o áudio.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(cat: Cat, name: string) {
    setError(null);
    try {
      const res = await fetch(
        `/api/vocalista/upload?cat=${cat}&name=${encodeURIComponent(name)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(`Erro ao excluir: ${data.error ?? "tente novamente."}`);
        return;
      }
      setLists((l) => ({ ...l, [cat]: l[cat].filter((i) => i.name !== name) }));
    } catch {
      setError("Falha de conexão ao excluir o áudio.");
    }
  }

  return (
    <div className="stack-mobile" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start", maxWidth: 900, margin: "0 auto" }}>
      {CATS.map((c) => (
        <div key={c.key} className="card-glow upload-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name={c.icon} size={22} style={{ color: "var(--cyan-1)" }} />
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 15, color: "var(--white)" }}>{c.title}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>{c.desc}</div>
            </div>
          </div>

          <UploadZone busy={busy === c.key} onFile={(f) => upload(c.key, f)} />

          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginTop: 4 }}>
            {lists[c.key].length} arquivo(s)
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 420, overflowY: "auto" }}>
            {lists[c.key].length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text-3)", padding: "12px 0", textAlign: "center" }}>
                Nenhum arquivo ainda.
              </div>
            ) : (
              lists[c.key].map((it) => (
                <div key={it.name} style={{ padding: 10, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-soft)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Icon name="music" size={14} style={{ color: "var(--cyan-1)" }} />
                    <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: "var(--white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {it.name.replace(/^\d+-/, "")}
                    </div>
                    <button
                      onClick={() => remove(c.key, it.name)}
                      title="Excluir"
                      style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", display: "flex" }}
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio controls src={it.url} style={{ width: "100%", height: 34 }} />
                </div>
              ))
            )}
          </div>
        </div>
      ))}

      {error && (
        <div style={{ gridColumn: "1 / -1", padding: 12, borderRadius: 10, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", color: "var(--orange)", fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

function UploadZone({ busy, onFile }: { busy: boolean; onFile: (f: File) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div
      onClick={() => !busy && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (busy) return;
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
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
        accept="audio/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 6, color: "var(--cyan-1)" }}>
        <Icon name={busy ? "clock" : "upload"} size={26} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--white)" }}>
        {busy ? "Enviando…" : "Clique ou arraste um áudio"}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>MP3, WAV, M4A…</div>
    </div>
  );
}
