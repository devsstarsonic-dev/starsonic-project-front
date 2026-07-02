"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icon, type IconName } from "@/components/Icon";

const BUCKET = "vocals";

type Cat = "vocais" | "vozes";
type Item = { name: string; url: string };

const CATS: { key: Cat; title: string; icon: IconName; desc: string }[] = [
  { key: "vocais", title: "Vocais da música", icon: "mic", desc: "Faça upload do vocal isolado de uma música (acapela, stem vocal)." },
  { key: "vozes", title: "Vozes", icon: "speaker", desc: "Faça upload de amostras de voz (timbres) para usar nas criações." },
];

export function Vocalista({ userId }: { userId: string | null }) {
  const supabase = createClient();
  const [lists, setLists] = useState<Record<Cat, Item[]>>({ vocais: [], vozes: [] });
  const [busy, setBusy] = useState<Cat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (cat: Cat) => {
      if (!userId) return;
      const { data, error } = await supabase.storage.from(BUCKET).list(`${userId}/${cat}`, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) return;
      const items: Item[] = (data ?? [])
        .filter((f) => f.name && f.name !== ".emptyFolderPlaceholder")
        .map((f) => {
          const path = `${userId}/${cat}/${f.name}`;
          const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
          return { name: f.name, url: pub.publicUrl };
        });
      setLists((l) => ({ ...l, [cat]: items }));
    },
    [supabase, userId],
  );

  useEffect(() => {
    load("vocais");
    load("vozes");
  }, [load]);

  async function upload(cat: Cat, file: File) {
    if (!userId) return;
    setError(null);
    setBusy(cat);
    const safe = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${userId}/${cat}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
    setBusy(null);
    if (error) {
      setError(`Erro no upload: ${error.message}`);
      return;
    }
    load(cat);
  }

  async function remove(cat: Cat, name: string) {
    if (!userId) return;
    const path = `${userId}/${cat}/${name}`;
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) {
      setError(`Erro ao excluir: ${error.message}`);
      return;
    }
    setLists((l) => ({ ...l, [cat]: l[cat].filter((i) => i.name !== name) }));
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
