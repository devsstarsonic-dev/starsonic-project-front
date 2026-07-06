"use client";

import { StatCard } from "@/components/store/StatCard";
import { formatBRL } from "@/lib/format";
import { getWithdrawals } from "@/lib/store/mock";

export default function SaquesPage() {
  const withdrawals = getWithdrawals();
  const saldoDisponivel = 84700; // R$ 847,00
  const emProcessamento = 23400; // R$ 234,00

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <div className="page-title">Saques</div>
          <div className="page-sub">Retire seu saldo para sua conta via Pix</div>
        </div>
      </div>

      {/* Card saldo em destaque */}
      <div
        className="card-glow"
        style={{
          maxWidth: "600px",
          margin: "0 auto 24px",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 8 }}>
          Saldo disponível pra saque
        </div>
        <div
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 800,
            fontSize: 48,
            color: "var(--cyan-1)",
            marginBottom: 8,
          }}
        >
          {formatBRL(saldoDisponivel)}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 20 }}>
          + {formatBRL(emProcessamento)} em processamento (liberação em D+2)
        </div>
        <button className="btn-primary" style={{ padding: "10px 24px", minWidth: "200px" }}>
          💰 Solicitar saque via Pix
        </button>
        <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 12 }}>
          Aprovação instantânea · sem taxas até R$ 5.000/mês
        </p>
      </div>

      {/* Chave Pix cadastrada */}
      <div className="card" style={{ maxWidth: "600px", margin: "0 auto 24px", padding: "20px 24px" }}>
        <h3 style={{ fontWeight: 700, color: "var(--white)", marginBottom: 14 }}>Sua chave Pix cadastrada</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(0,0,0,0.3)",
            border: "1px solid var(--border-soft)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--cyan-1), var(--purple))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ✉️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>E-mail</div>
            <div
              style={{
                fontSize: 13,
                color: "var(--white)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              demetrio@starsonic.cloud
            </div>
          </div>
          <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}>
            Alterar
          </button>
        </div>
      </div>

      {/* Histórico de saques */}
      <div className="card" style={{ maxWidth: "600px", margin: "0 auto", padding: "6px 4px" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-soft)" }}>
          <h3 style={{ fontWeight: 700, color: "var(--white)" }}>Histórico de saques</h3>
        </div>
        <div className="table-scroll">
          <table
            className="music-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead className="music-table-head">
              <tr>
                <th style={{ textAlign: "left", padding: "12px", fontSize: 12 }}>Data</th>
                <th style={{ textAlign: "left", padding: "12px", fontSize: 12 }}>Valor</th>
                <th style={{ textAlign: "left", padding: "12px", fontSize: 12 }}>Método</th>
                <th style={{ textAlign: "left", padding: "12px", fontSize: 12 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id} style={{ borderBottom: "1px solid var(--border-soft)", fontSize: 13 }}>
                  <td style={{ padding: "12px", color: "var(--text-3)" }}>{w.date}</td>
                  <td style={{ padding: "12px", fontWeight: 600, color: "var(--white)" }}>
                    {formatBRL(w.amountCents)}
                  </td>
                  <td style={{ padding: "12px", color: "var(--text-3)", fontSize: 12 }}>{w.method}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 100,
                        fontSize: 11,
                        fontWeight: 600,
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "var(--green)",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                      }}
                    >
                      {w.status === "pago" ? "PAGO" : "PENDENTE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
