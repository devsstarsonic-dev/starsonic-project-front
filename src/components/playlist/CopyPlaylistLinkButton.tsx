"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

// Copia o link permanente da playlist (/playlist/[id]) — mesmo padrão do
// "Copiar link da música" (PlaylistMenu/CreationMenu), só que a playlist já
// usa o id (uuid) como slug, então não precisa de slugify.
export function CopyPlaylistLinkButton({
  id,
  variant = "icon",
}: {
  id: string;
  /** "icon": botão redondo pequeno (overlay do card) · "text": botão com rótulo (página da playlist) */
  variant?: "icon" | "text";
}) {
  const [msg, setMsg] = useState<string | null>(null);

  async function copiarLink() {
    const url = `${window.location.origin}/playlist/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setMsg("Link copiado ✓");
    } catch {
      setMsg("Não foi possível copiar.");
    }
    setTimeout(() => setMsg(null), 1500);
  }

  if (variant === "text") {
    return (
      <span style={{ position: "relative", display: "inline-flex" }}>
        <button
          className="btn-secondary"
          onClick={copiarLink}
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <Icon name="globe" size={14} /> Copiar link da playlist
        </button>
        {msg && (
          <span style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, fontSize: 11, color: "var(--green)", whiteSpace: "nowrap" }}>
            {msg}
          </span>
        )}
      </span>
    );
  }

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button
        className="btn-pill"
        onClick={copiarLink}
        title="Copiar link da playlist"
        aria-label="Copiar link da playlist"
        style={{ padding: "6px 10px" }}
      >
        <Icon name="globe" size={14} />
      </button>
      {msg && (
        <span style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, fontSize: 11, color: "var(--green)", whiteSpace: "nowrap", background: "rgba(10,10,46,0.9)", padding: "3px 7px", borderRadius: 6, border: "1px solid var(--border-soft)" }}>
          {msg}
        </span>
      )}
    </span>
  );
}
