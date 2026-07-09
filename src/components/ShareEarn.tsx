"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Créditos que o usuário ganha por indicação. Placeholder alinhável ao backend
// de referral (o mesmo valor precisa ser aplicado ao creditar quem indica).
// ponytail: constante única — trocar aqui quando o backend definir a regra.
const REFERRAL_REWARD = 50;

const GiftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8" />
    <path d="M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8" />
  </svg>
);

// Botão "Compartilhe e ganhe" + modal com o link de indicação do usuário.
// Quando alguém se cadastra pelo link (/cadastro?ref=<id>), o backend credita
// o indicador — o front só gera e compartilha o link.
export function ShareEarn({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // O link só é conhecido no cliente (precisa da origin do navegador).
  useEffect(() => {
    setLink(`${window.location.origin}/cadastro?ref=${profileId}`);
  }, [profileId]);

  // Esc fecha o modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Ao abrir, seleciona o link para facilitar a cópia manual.
  useEffect(() => {
    if (open) inputRef.current?.select();
  }, [open]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      inputRef.current?.select();
      document.execCommand("copy");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [link]);

  const share = useCallback(async () => {
    const data = {
      title: "Star Sonic",
      text: `Crie músicas com IA no Star Sonic e ganhe créditos! Use meu link:`,
      url: link,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        /* usuário cancelou */
      }
    } else {
      copy();
    }
  }, [link, copy]);

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        className="share-earn-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title="Compartilhe seu link e ganhe créditos"
      >
        <GiftIcon />
        <span className="share-earn-label">Compartilhe e ganhe</span>
      </button>

      {open && (
        <>
          {/* Clique fora fecha (sem escurecer a tela — é um popover, não modal) */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 290 }}
          />
          <div
            role="dialog"
            aria-modal="false"
            aria-label="Compartilhe e ganhe créditos"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              zIndex: 300,
              width: "min(380px, 92vw)",
              background: "linear-gradient(180deg, rgba(22,22,77,0.98), rgba(10,10,46,0.98))",
              border: "1px solid rgba(0,214,247,0.4)",
              borderRadius: 16, padding: "22px 22px 24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              style={{
                position: "absolute", top: 14, right: 14,
                width: 32, height: 32, borderRadius: 8,
                background: "var(--bg-card)", border: "1px solid var(--border-soft)",
                color: "var(--text-2)", cursor: "pointer", fontSize: 16, lineHeight: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>

            <div style={{
              width: 44, height: 44, borderRadius: 12, marginBottom: 14,
              background: "linear-gradient(135deg, #00D6F7, #a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            }}>
              <GiftIcon />
            </div>

            <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 19, color: "var(--white)", marginBottom: 8 }}>
              Compartilhe e ganhe
            </div>
            <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 18 }}>
              Ganhe <b style={{ color: "var(--cyan-1)" }}>{REFERRAL_REWARD} créditos</b> a cada amigo
              que se cadastrar pelo seu link. Sem limite de indicações.
            </div>

            <label style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Seu link de indicação
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                ref={inputRef}
                type="text"
                readOnly
                value={link}
                onFocus={(e) => e.target.select()}
                style={{
                  flex: 1, minWidth: 0,
                  background: "rgba(10,10,46,0.6)",
                  border: "1px solid var(--border)",
                  borderRadius: 10, padding: "10px 12px",
                  color: "var(--text-1)", fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
              <button
                onClick={copy}
                style={{
                  flexShrink: 0, padding: "10px 16px", borderRadius: 10, border: "none",
                  background: copied ? "var(--green, #22c55e)" : "#00D6F7",
                  color: "#0a0a2e", fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 12,
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>

            <button
              onClick={share}
              style={{
                width: "100%", padding: "12px 18px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                color: "#fff", fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 13,
                cursor: "pointer", boxShadow: "0 4px 20px rgba(168,85,247,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Compartilhar link
            </button>
          </div>
        </>
      )}
    </div>
  );
}
