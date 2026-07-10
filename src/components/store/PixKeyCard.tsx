"use client";

import { useState } from "react";
import { PixKeyModal } from "./PixKeyModal";
import { PIX_TYPES, type PixKeyType } from "@/lib/store/pixKey";

export function PixKeyCard({ initialKey }: { initialKey: string | null }) {
  const [chave, setChave] = useState(initialKey);
  const [tipo, setTipo] = useState<PixKeyType | null>(null);
  const [aberto, setAberto] = useState(false);

  return (
    <div className="store-card" style={{ padding: 24 }}>
      <h3 style={{ color: "var(--white)", fontWeight: 700, marginBottom: 16 }}>Sua chave Pix</h3>

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" style={{ flexShrink: 0 }} aria-label="Pix">
          <path
            fill="#32BCAD"
            d="M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156"
          />
        </svg>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: "#94a3b8", fontSize: 12 }}>{tipo ? PIX_TYPES[tipo].label : "Nenhuma cadastrada"}</p>
          <p style={{ color: "var(--white)", fontSize: 14, fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {chave ?? "—"}
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, flexShrink: 0 }}
          onClick={() => setAberto(true)}
        >
          {chave ? "Alterar" : "Cadastrar"}
        </button>
      </div>

      <PixKeyModal
        open={aberto}
        currentKey={chave}
        onClose={() => setAberto(false)}
        onSave={(t, v) => {
          setTipo(t);
          setChave(v);
          setAberto(false);
        }}
      />
    </div>
  );
}
