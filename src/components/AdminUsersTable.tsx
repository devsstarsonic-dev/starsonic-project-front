"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import type { Profile, Plan } from "@/lib/types";

type Props = {
  users: Profile[];
  plans: Plan[];
};

type Draft = { full_name: string; plan: string; credits: string };

export function AdminUsersTable({ users, plans }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ full_name: "", plan: "", credits: "" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const planOptions = plans.length ? plans.map((p) => p.name) : ["Free", "Starter", "Plus", "Creator"];

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return u.full_name.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q);
  });

  function startEdit(u: Profile) {
    setError(null);
    setEditingId(u.id);
    setDraft({ full_name: u.full_name, plan: u.plan, credits: String(u.credits) });
  }

  function cancelEdit() {
    setEditingId(null);
    setError(null);
  }

  async function saveEdit(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          full_name: draft.full_name,
          plan: draft.plan,
          credits: Number(draft.credits),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar.");
        return;
      }
      setEditingId(null);
      router.refresh();
    } catch {
      setError("Falha de conexão ao salvar.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(u: Profile) {
    if (!confirm(`Excluir a conta de "${u.full_name}" (${u.email ?? "sem e-mail"})? Essa ação não pode ser desfeita.`)) return;
    setBusyId(u.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível excluir.");
        return;
      }
      router.refresh();
    } catch {
      setError("Falha de conexão ao excluir.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="card-glow store-table-card" style={{ marginBottom: 24 }}>
      <div className="store-table-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h3>{filtered.length} usuário{filtered.length === 1 ? "" : "s"}</h3>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou e-mail…"
          style={{
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8,
            padding: "8px 12px", fontSize: 13, color: "var(--text-1)", minWidth: 220,
          }}
        />
      </div>

      {error && (
        <div style={{ margin: "0 16px", padding: "10px 14px", borderRadius: 10, background: "rgba(251, 146, 60, 0.08)", border: "1px solid rgba(251, 146, 60, 0.25)", color: "var(--orange)", fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <div className="store-table-wrap">
        <table className="store-table">
          <thead>
            <tr>
              <th style={{ width: "30%" }}>Usuário</th>
              <th style={{ width: "16%" }}>Plano</th>
              <th style={{ width: "14%" }}>Créditos</th>
              <th style={{ width: "18%" }}>Cadastro</th>
              <th style={{ width: "22%" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const editing = editingId === u.id;
              const busy = busyId === u.id;
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div
                        style={{
                          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                          background: "linear-gradient(135deg, var(--cyan-1), var(--purple))",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: 13, color: "#0a0a2e",
                        }}
                      >
                        {u.avatar_initial || u.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        {editing ? (
                          <input
                            value={draft.full_name}
                            onChange={(e) => setDraft((d) => ({ ...d, full_name: e.target.value }))}
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", fontSize: 13, color: "var(--text-1)", width: "100%" }}
                          />
                        ) : (
                          <div style={{ fontWeight: 600, color: "var(--white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {u.full_name}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {u.email || "sem e-mail"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {editing ? (
                      <select
                        value={draft.plan}
                        onChange={(e) => setDraft((d) => ({ ...d, plan: e.target.value }))}
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", fontSize: 13, color: "var(--text-1)" }}
                      >
                        {planOptions.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="store-pill cyan">{u.plan}</span>
                    )}
                  </td>
                  <td className="num" style={{ color: "var(--white)" }}>
                    {editing ? (
                      <input
                        type="number"
                        min={0}
                        value={draft.credits}
                        onChange={(e) => setDraft((d) => ({ ...d, credits: e.target.value }))}
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", fontSize: 13, color: "var(--text-1)", width: 90 }}
                      />
                    ) : (
                      u.credits
                    )}
                  </td>
                  <td style={{ color: "var(--text-3)", fontSize: 12 }}>
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {editing ? (
                        <>
                          <button
                            className="btn-secondary"
                            disabled={busy}
                            onClick={() => saveEdit(u.id)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", fontSize: 12, borderRadius: 7, background: "linear-gradient(135deg, var(--cyan-1), var(--purple))", color: "#0a0a2e", opacity: busy ? 0.6 : 1 }}
                          >
                            <Icon name="check" size={13} />
                            {busy ? "Salvando…" : "Salvar"}
                          </button>
                          <button
                            className="btn-secondary"
                            disabled={busy}
                            onClick={cancelEdit}
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", fontSize: 12, borderRadius: 7 }}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-secondary"
                            disabled={busy}
                            onClick={() => startEdit(u)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", fontSize: 12, borderRadius: 7 }}
                          >
                            <Icon name="pencil" size={13} />
                            Editar
                          </button>
                          <button
                            className="btn-secondary"
                            disabled={busy}
                            onClick={() => handleDelete(u)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", fontSize: 12, borderRadius: 7, color: "#f87171", opacity: busy ? 0.6 : 1 }}
                          >
                            <Icon name="trash" size={13} />
                            {busy ? "Excluindo…" : "Excluir"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
