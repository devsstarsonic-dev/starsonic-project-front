"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

// Botão + modal para ver a letra completa de uma criação (kind = "lyric").
export function LyricsModal({ title, lyrics, trigger }: { title: string; lyrics: string; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={trigger ? undefined : "btn-pill"}
        style={trigger ? { background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", font: "inherit", textAlign: "left", width: "100%" } : { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", fontSize: 11 }}
      >
        {trigger ?? (<><Icon name="lyrics" size={11} /> Ver letra</>)}
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(180deg, rgba(22,22,77,0.98), rgba(10,10,46,0.98))",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 24,
              maxWidth: 560,
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15, color: "var(--white)" }}>
                <Icon name="lyrics" size={16} style={{ color: "var(--cyan-1)" }} /> {title}
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-3)", fontSize: 16, flexShrink: 0 }}
              >
                ×
              </button>
            </div>
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13, color: "var(--text-1)", lineHeight: 1.65, margin: 0 }}>
              {lyrics || "—"}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
