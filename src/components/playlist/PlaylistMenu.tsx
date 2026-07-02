"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/Icon";

type PlaylistOpt = { id: string; name: string; creationsId: string[] };

// Menu "3 pontos" de uma música no catálogo: adicionar a uma playlist.
export function PlaylistMenu({
  creationId,
  playlists,
  profileId,
}: {
  creationId: string;
  playlists: PlaylistOpt[];
  profileId: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  async function addTo(pl: PlaylistOpt) {
    if (busy || !profileId) return;
    if (pl.creationsId.includes(creationId)) {
      setMsg(`Já está em "${pl.name}"`);
      return;
    }
    setBusy(true);
    setMsg(null);
    const sb = createClient();
    // Acrescenta o id ao array jsonb e atualiza a linha da playlist.
    const next = Array.from(new Set([...pl.creationsId, creationId]));
    const { error } = await sb.from("playlist").update({ creations_id: next }).eq("id", pl.id);
    setBusy(false);
    if (error) {
      setMsg("Erro: " + error.message);
      return;
    }
    setMsg(`Adicionada a "${pl.name}" ✓`);
    router.refresh();
    setTimeout(() => setOpen(false), 900);
  }

  async function novaPlaylist() {
    if (busy || !profileId) return;
    const name = window.prompt("Nome da nova playlist:")?.trim();
    if (!name) return;
    setBusy(true);
    setMsg(null);
    const sb = createClient();
    // Cria a playlist já com esta música no array.
    const { error } = await sb.from("playlist").insert({ profile_id: profileId, name, creations_id: [creationId] });
    setBusy(false);
    if (error) {
      setMsg("Erro: " + error.message);
      return;
    }
    setMsg(`Criada "${name}" ✓`);
    router.refresh();
    setTimeout(() => setOpen(false), 900);
  }

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        className="btn-pill"
        style={{ padding: "6px 10px" }}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); setMsg(null); }}
        title="Adicionar à playlist"
        aria-label="Adicionar à playlist"
      >
        ⋯
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
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, padding: "6px 10px" }}>
            Adicionar à playlist
          </div>

          {playlists.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--text-3)", padding: "4px 10px 8px" }}>
              Nenhuma playlist ainda.
            </div>
          )}

          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {playlists.map((p) => (
              <button
                key={p.id}
                onClick={() => addTo(p)}
                disabled={busy}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: "none", border: "none", color: "var(--text-1)", fontSize: 13, padding: "9px 10px", borderRadius: 8, cursor: "pointer" }}
              >
                <Icon name="library" size={14} style={{ color: "var(--cyan-1)" }} /> {p.name}
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: "var(--border-soft)", margin: "4px 6px" }} />
          <button
            onClick={novaPlaylist}
            disabled={busy}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: "none", border: "none", color: "var(--cyan-1)", fontSize: 13, padding: "9px 10px", borderRadius: 8, cursor: "pointer" }}
          >
            <Icon name="plus" size={14} /> Nova playlist…
          </button>

          {msg && (
            <div style={{ fontSize: 11, color: msg.startsWith("Erro") ? "var(--orange)" : "var(--green)", padding: "6px 10px" }}>
              {msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
