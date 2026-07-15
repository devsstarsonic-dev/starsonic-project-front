"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/Icon";
import type { Creation } from "@/lib/types";

// Modal de "Transferir música": pede o e-mail do destinatário e cria uma
// notificação pra ele confirmar o recebimento (ver NotificationsPanel.tsx).
export function TransferModal({
  creation,
  open,
  onClose,
}: {
  creation: Creation;
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!open) return null;

  async function enviar() {
    const alvo = email.trim();
    if (!alvo) {
      setMsg("Informe um e-mail.");
      return;
    }
    setBusy(true);
    setMsg(null);

    const sb = createClient();
    const { data: recipient, error: findErr } = await sb
      .from("profiles")
      .select("id, full_name")
      .ilike("email", alvo)
      .limit(1)
      .maybeSingle();

    if (findErr || !recipient) {
      setBusy(false);
      setMsg("E-mail não encontrado.");
      return;
    }
    if (recipient.id === creation.profile_id) {
      setBusy(false);
      setMsg("Essa música já é sua.");
      return;
    }

    const { data: sender } = await sb
      .from("profiles")
      .select("full_name")
      .eq("id", creation.profile_id)
      .maybeSingle();

    const { error: notifErr } = await sb.from("notifications").insert({
      profile_id: recipient.id,
      title: "Nova música para confirmar",
      message: `${sender?.full_name ?? "Alguém"} quer te transferir "${creation.title}".`,
      kind: "cyan",
      type: "transfer_request",
      creation_id: creation.id,
    });

    if (notifErr) {
      setBusy(false);
      setMsg("Erro ao enviar: " + notifErr.message);
      return;
    }

    setBusy(false);
    setMsg("Convite enviado ✓");
    setTimeout(() => {
      onClose();
      setEmail("");
      setMsg(null);
    }, 1200);
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg, rgba(22,22,77,0.98), rgba(10,10,46,0.98))",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 24,
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15, color: "var(--white)" }}>
            <Icon name="send" size={16} style={{ color: "var(--cyan-1)" }} /> Transferir música
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-3)", fontSize: 16, flexShrink: 0 }}
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 12px" }}>
          Digite o e-mail de quem vai receber &quot;{creation.title}&quot;. A música só muda de dono quando a pessoa confirmar o recebimento.
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !busy && enviar()}
          placeholder="email@exemplo.com"
          disabled={busy}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.05)",
            color: "var(--text-1)",
            fontSize: 13,
            marginBottom: 12,
          }}
        />

        <button onClick={enviar} disabled={busy} className="btn-primary" style={{ width: "100%" }}>
          {busy ? "Enviando…" : "Enviar"}
        </button>

        {msg && (
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 10, textAlign: "center" }}>{msg}</div>
        )}
      </div>
    </div>
  );
}
