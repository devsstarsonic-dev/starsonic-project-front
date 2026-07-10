"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import type { Plan } from "@/lib/types";

type Props = {
  plans: Plan[];
};

type Draft = {
  slug: string;
  name: string;
  tagline: string;
  price_label: string;
  price_cents: string;
  sort_order: string;
  is_popular: boolean;
};

const NEW_ID = "new";
const EMPTY_DRAFT: Draft = {
  slug: "",
  name: "",
  tagline: "",
  price_label: "",
  price_cents: "0",
  sort_order: "0",
  is_popular: false,
};

function toDraft(p: Plan): Draft {
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    price_label: p.price_label,
    price_cents: String(p.price_cents),
    sort_order: String(p.sort_order),
    is_popular: p.is_popular,
  };
}

export function AdminPlansTable({ plans }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sorted = [...plans].sort((a, b) => a.sort_order - b.sort_order);

  function startCreate() {
    setError(null);
    setEditingId(NEW_ID);
    setDraft({ ...EMPTY_DRAFT, sort_order: String(plans.length) });
  }

  function startEdit(p: Plan) {
    setError(null);
    setEditingId(p.id);
    setDraft(toDraft(p));
  }

  function cancelEdit() {
    setEditingId(null);
    setError(null);
  }

  async function saveNew() {
    setBusyId(NEW_ID);
    setError(null);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: draft.slug,
          name: draft.name,
          tagline: draft.tagline,
          price_label: draft.price_label,
          price_cents: Number(draft.price_cents) || 0,
          sort_order: Number(draft.sort_order) || 0,
          is_popular: draft.is_popular,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível criar o plano.");
        return;
      }
      setEditingId(null);
      router.refresh();
    } catch {
      setError("Falha de conexão ao criar o plano.");
    } finally {
      setBusyId(null);
    }
  }

  async function saveEdit(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          slug: draft.slug,
          name: draft.name,
          tagline: draft.tagline,
          price_label: draft.price_label,
          price_cents: Number(draft.price_cents) || 0,
          sort_order: Number(draft.sort_order) || 0,
          is_popular: draft.is_popular,
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

  async function handleDelete(p: Plan) {
    if (!confirm(`Excluir o plano "${p.name}"? Usuários já nesse plano não são afetados, mas ele deixa de aparecer em /planos.`)) return;
    setBusyId(p.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id }),
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

  const inputStyle = {
    background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6,
    padding: "4px 8px", fontSize: 13, color: "var(--text-1)", width: "100%",
  };

  return (
    <div className="card-glow store-table-card" style={{ marginBottom: 24 }}>
      <div className="store-table-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h3>{plans.length} plano{plans.length === 1 ? "" : "s"}</h3>
        <button
          className="btn-secondary"
          disabled={editingId === NEW_ID}
          onClick={startCreate}
          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", fontSize: 12, borderRadius: 7, opacity: editingId === NEW_ID ? 0.6 : 1 }}
        >
          <Icon name="plus" size={13} />
          Novo plano
        </button>
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
              <th style={{ width: "7%" }}>Ordem</th>
              <th style={{ width: "16%" }}>Nome</th>
              <th style={{ width: "12%" }}>Slug</th>
              <th style={{ width: "18%" }}>Tagline</th>
              <th style={{ width: "16%" }}>Preço</th>
              <th style={{ width: "9%" }}>Destaque</th>
              <th style={{ width: "22%" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {editingId === NEW_ID && (
              <tr>
                <td>
                  <input type="number" value={draft.sort_order} onChange={(e) => setDraft((d) => ({ ...d, sort_order: e.target.value }))} style={{ ...inputStyle, width: 60 }} />
                </td>
                <td>
                  <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Ex.: Plus" style={inputStyle} />
                </td>
                <td>
                  <input value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))} placeholder="Ex.: plus" style={inputStyle} />
                </td>
                <td>
                  <input value={draft.tagline} onChange={(e) => setDraft((d) => ({ ...d, tagline: e.target.value }))} placeholder="Pra quem já cria toda semana" style={inputStyle} />
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={draft.price_label} onChange={(e) => setDraft((d) => ({ ...d, price_label: e.target.value }))} placeholder="R$ 32,90" style={inputStyle} />
                    <input type="number" min={0} value={draft.price_cents} onChange={(e) => setDraft((d) => ({ ...d, price_cents: e.target.value }))} title="Preço em centavos" style={{ ...inputStyle, width: 80 }} />
                  </div>
                </td>
                <td style={{ textAlign: "center" }}>
                  <input type="checkbox" checked={draft.is_popular} onChange={(e) => setDraft((d) => ({ ...d, is_popular: e.target.checked }))} />
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="btn-secondary"
                      disabled={busyId === NEW_ID}
                      onClick={saveNew}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", fontSize: 12, borderRadius: 7, background: "linear-gradient(135deg, var(--cyan-1), var(--purple))", color: "#0a0a2e", opacity: busyId === NEW_ID ? 0.6 : 1 }}
                    >
                      <Icon name="check" size={13} />
                      {busyId === NEW_ID ? "Salvando…" : "Salvar"}
                    </button>
                    <button
                      className="btn-secondary"
                      disabled={busyId === NEW_ID}
                      onClick={cancelEdit}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", fontSize: 12, borderRadius: 7 }}
                    >
                      Cancelar
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {sorted.map((p) => {
              const editing = editingId === p.id;
              const busy = busyId === p.id;
              return (
                <tr key={p.id}>
                  <td className="num" style={{ color: "var(--white)" }}>
                    {editing ? (
                      <input type="number" value={draft.sort_order} onChange={(e) => setDraft((d) => ({ ...d, sort_order: e.target.value }))} style={{ ...inputStyle, width: 60 }} />
                    ) : (
                      p.sort_order
                    )}
                  </td>
                  <td>
                    {editing ? (
                      <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} style={inputStyle} />
                    ) : (
                      <div style={{ fontWeight: 600, color: "var(--white)" }}>{p.name}</div>
                    )}
                  </td>
                  <td style={{ color: "var(--text-3)", fontSize: 12 }}>
                    {editing ? (
                      <input value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))} style={inputStyle} />
                    ) : (
                      p.slug
                    )}
                  </td>
                  <td style={{ color: "var(--text-2)", fontSize: 12 }}>
                    {editing ? (
                      <input value={draft.tagline} onChange={(e) => setDraft((d) => ({ ...d, tagline: e.target.value }))} style={inputStyle} />
                    ) : (
                      p.tagline
                    )}
                  </td>
                  <td>
                    {editing ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <input value={draft.price_label} onChange={(e) => setDraft((d) => ({ ...d, price_label: e.target.value }))} style={inputStyle} />
                        <input type="number" min={0} value={draft.price_cents} onChange={(e) => setDraft((d) => ({ ...d, price_cents: e.target.value }))} title="Preço em centavos" style={{ ...inputStyle, width: 80 }} />
                      </div>
                    ) : (
                      <span style={{ color: "var(--white)", fontWeight: 600 }}>{p.price_label}</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {editing ? (
                      <input type="checkbox" checked={draft.is_popular} onChange={(e) => setDraft((d) => ({ ...d, is_popular: e.target.checked }))} />
                    ) : p.is_popular ? (
                      <span className="store-pill cyan">🔥 sim</span>
                    ) : (
                      <span style={{ color: "var(--text-3)" }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {editing ? (
                        <>
                          <button
                            className="btn-secondary"
                            disabled={busy}
                            onClick={() => saveEdit(p.id)}
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
                            disabled={busy || editingId === NEW_ID}
                            onClick={() => startEdit(p)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", fontSize: 12, borderRadius: 7 }}
                          >
                            <Icon name="pencil" size={13} />
                            Editar
                          </button>
                          <button
                            className="btn-secondary"
                            disabled={busy || editingId === NEW_ID}
                            onClick={() => handleDelete(p)}
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
