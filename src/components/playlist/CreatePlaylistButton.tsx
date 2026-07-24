"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/Icon";

export function CreatePlaylistButton({ profileId }: { profileId: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function criar() {
    const n = name.trim();
    if (!n) {
      setError("Dê um nome para a playlist.");
      return;
    }
    if (!profileId) {
      setError("Faça login para criar playlists.");
      return;
    }
    setSaving(true);
    setError(null);
    const sb = createClient();
    // creations_id = [] → playlist vazia (registra a playlist).
    const { error } = await sb.from("playlist").insert({ profile_id: profileId, name: n, creations_id: [], is_public: false });
    setSaving(false);
    if (error) {
      setError("Erro ao criar: " + error.message);
      return;
    }
    setOpen(false);
    setName("");
    router.refresh();
  }

  return (
    <>
      <button className="btn-secondary" onClick={() => { setOpen(true); setError(null); }} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Icon name="plus" size={15} /> Criar playlist
      </button>

      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setOpen(false)}
        >
          <div className="card-glow" style={{ width: "100%", maxWidth: 420, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Icon name="library" size={20} style={{ color: "var(--cyan-1)" }} />
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 16, color: "var(--white)" }}>Nova playlist</div>
            </div>
            <input
              className="wiz-input"
              placeholder="Nome da playlist (ex.: Treino, Foco, Sertanejo…)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") criar(); }}
            />
            {error && <div style={{ fontSize: 12, color: "var(--orange)", marginTop: 8 }}>⚠️ {error}</div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
              <button className="btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={criar} disabled={saving}>{saving ? "Criando…" : "Criar"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
