"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CreationPlayButton } from "@/components/CreationPlayButton";
import { Icon } from "@/components/Icon";
import type { Creation } from "@/lib/types";

export function PlaylistDetail({
  id,
  initialName,
  initialSongs,
}: {
  id: string;
  initialName: string;
  initialSongs: Creation[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [draftName, setDraftName] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const [songs, setSongs] = useState<Creation[]>(initialSongs);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function salvarNome() {
    const n = draftName.trim();
    if (!n) return;
    setBusy(true);
    setError(null);
    const sb = createClient();
    const { error } = await sb.from("playlist").update({ name: n }).eq("id", id);
    setBusy(false);
    if (error) {
      setError("Erro ao renomear: " + error.message);
      return;
    }
    setName(n);
    setEditing(false);
    router.refresh();
  }

  async function removerMusica(songId: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    const nextIds = songs.filter((s) => s.id !== songId).map((s) => s.id);
    const sb = createClient();
    const { error } = await sb.from("playlist").update({ creations_id: nextIds }).eq("id", id);
    setBusy(false);
    if (error) {
      setError("Erro ao remover: " + error.message);
      return;
    }
    setSongs((prev) => prev.filter((s) => s.id !== songId));
    router.refresh();
  }

  async function excluirPlaylist() {
    if (!window.confirm(`Excluir a playlist "${name}"?`)) return;
    setBusy(true);
    const sb = createClient();
    const { error } = await sb.from("playlist").delete().eq("id", id);
    if (error) {
      setBusy(false);
      setError("Erro ao excluir: " + error.message);
      return;
    }
    router.push("/catalogo");
    router.refresh();
  }

  return (
    <section className="page">
      <div style={{ marginBottom: 16 }}>
        <Link href="/catalogo" style={{ fontSize: 12, color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
          ← Voltar para Explorar
        </Link>
      </div>

      {/* Cabeçalho da playlist */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 24 }}>
        <div
          style={{
            width: 150, height: 150, borderRadius: 14, flexShrink: 0, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 12px 40px rgba(0,0,0,.45)",
            background: songs[0]?.image_url
              ? `center / cover url(${songs[0].image_url})`
              : "linear-gradient(135deg, var(--cyan-deep), var(--purple))",
          }}
        >
          {!songs[0]?.image_url && <Icon name="library" size={56} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Playlist</div>
          {editing ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input
                className="wiz-input"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") salvarNome(); }}
                style={{ maxWidth: 360, fontSize: 20 }}
              />
              <button className="btn-primary" onClick={salvarNome} disabled={busy}>Salvar</button>
              <button className="btn-secondary" onClick={() => { setEditing(false); setDraftName(name); }}>Cancelar</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 34, color: "var(--white)", margin: 0 }}>{name}</h1>
              <button className="btn-secondary" onClick={() => setEditing(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="pencil" size={14} /> Editar nome
              </button>
            </div>
          )}
          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 8 }}>{songs.length} música(s)</div>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 14, padding: 12, borderRadius: 10, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", color: "var(--orange)", fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Lista de músicas */}
      {songs.length === 0 ? (
        <div className="card-glow" style={{ padding: 32, textAlign: "center", color: "var(--text-2)" }}>
          Playlist vazia. Adicione músicas pelo menu (⋯) no Explorar.
        </div>
      ) : (
        <div className="card-glow" style={{ padding: 8 }}>
          {songs.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 10px", borderRadius: 8 }}>
              <span style={{ width: 24, textAlign: "center", color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{i + 1}</span>
              <div
                style={{
                  width: 44, height: 44, borderRadius: 8, flexShrink: 0, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: s.image_url ? `center / cover url(${s.image_url})` : `linear-gradient(135deg, ${s.gradient_from}, ${s.gradient_to})`,
                }}
              >
                {!s.image_url && <Icon name="music" size={18} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "var(--white)", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{s.genre || "—"}</div>
              </div>
              <CreationPlayButton creation={s} round queue={songs} />
              <button
                onClick={() => removerMusica(s.id)}
                disabled={busy}
                title="Remover da playlist"
                aria-label="Remover da playlist"
                className="btn-pill"
                style={{ padding: "6px 10px", display: "inline-flex", alignItems: "center", color: "#f87171" }}
              >
                <Icon name="trash" size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={excluirPlaylist} disabled={busy} className="btn-pill" style={{ color: "#f87171", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="trash" size={15} /> Excluir playlist
        </button>
      </div>
    </section>
  );
}
