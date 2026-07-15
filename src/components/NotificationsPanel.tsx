"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/format";
import type { Notification } from "@/lib/types";

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const KIND_DOT: Record<string, string> = {
  cyan: "var(--cyan-1)",
  green: "#22c55e",
  orange: "#fb923c",
};

// Painel de notificações: abre no sino do Header. Notificações do tipo
// "transfer_request" ganham botões pra confirmar/recusar o recebimento de
// uma música transferida por outro usuário (ver TransferModal.tsx).
export function NotificationsPanel({
  notifications,
  profileId,
}: {
  notifications: Notification[];
  profileId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  async function responder(n: Notification, aceitar: boolean) {
    if (busyId || !n.creation_id) return;
    setBusyId(n.id);
    const sb = createClient();

    const { data: creation } = await sb
      .from("creations")
      .select("profile_id, title")
      .eq("id", n.creation_id)
      .maybeSingle();

    if (aceitar && creation) {
      await sb.from("creations").update({ profile_id: profileId }).eq("id", n.creation_id);
    }

    await sb
      .from("notifications")
      .update({ type: aceitar ? "transfer_accepted" : "transfer_rejected", is_read: true })
      .eq("id", n.id);

    if (aceitar && creation) {
      await sb.from("notifications").insert({
        profile_id: creation.profile_id,
        title: "Transferência confirmada",
        message: `Sua música "${creation.title}" foi confirmada pelo destinatário.`,
        kind: "green",
        type: "info",
      });
    }

    setBusyId(null);
    router.refresh();
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="notif-btn"
        title="Notificações"
        aria-label="Notificações"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="notif-badge" aria-label={`${unreadCount} notificações`}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            zIndex: 60,
            width: 320,
            maxHeight: 420,
            overflowY: "auto",
            background: "linear-gradient(180deg, rgba(22,22,77,0.98), rgba(10,10,46,0.98))",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 6,
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          }}
        >
          {notifications.length === 0 && (
            <div style={{ padding: "14px 12px", fontSize: 13, color: "var(--text-3)" }}>
              Nenhuma notificação por enquanto.
            </div>
          )}

          {notifications.map((n) => (
            <div key={n.id} style={{ padding: "10px 12px", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: KIND_DOT[n.kind] ?? "var(--cyan-1)",
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{n.title}</div>
                  {n.message && (
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{n.message}</div>
                  )}
                  <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 4 }}>{timeAgo(n.created_at)}</div>

                  {n.type === "transfer_request" && (
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => responder(n, true)}
                        disabled={busyId === n.id}
                        className="btn-primary"
                        style={{ padding: "5px 12px", fontSize: 12 }}
                      >
                        {busyId === n.id ? "…" : "Confirmar"}
                      </button>
                      <button
                        onClick={() => responder(n, false)}
                        disabled={busyId === n.id}
                        className="btn-secondary"
                        style={{ padding: "5px 12px", fontSize: 12 }}
                      >
                        Recusar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
