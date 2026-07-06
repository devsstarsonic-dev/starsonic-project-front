"use client";

import { StatCard } from "@/components/store/StatCard";
import { MiniBarChart } from "@/components/store/MiniBarChart";
import { ProgressBar } from "@/components/store/ProgressBar";
import { formatBRL } from "@/lib/format";
import { getSales, getStoreSongs } from "@/lib/store/mock";

export default function VendasPage() {
  const sales = getSales();
  const songs = getStoreSongs();

  const thisMonth = 84700; // R$ 847,00
  const salesLast30 = 42;
  const ticketMedio = 20.17;

  // Origem das vendas: star_card 68%, marketplace 28%, commission 4%
  const starCardSales = 68;
  const marketplaceSales = 28;
  const commissionSales = 4;

  // Gráfico: 14 barras aleatórias (0-100)
  const chartHeights = [25, 40, 30, 55, 45, 65, 50, 75, 60, 85, 70, 90, 100, 78];

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <div className="page-title">Vendas</div>
          <div className="page-sub">Histórico completo e origem de cada venda</div>
        </div>
      </div>

      {/* Stats — 4 cards com delta */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard
          label="Este mês"
          value={formatBRL(thisMonth)}
          delta={{ text: "24% vs mês anterior", positive: true }}
          color="var(--cyan-1)"
        />
        <StatCard
          label="Vendas · 30d"
          value={salesLast30}
          delta={{ text: "8 vs mês anterior", positive: true }}
          color="var(--green)"
        />
        <StatCard label="Ticket médio" value={`R$ ${ticketMedio.toFixed(2)}`} sub="últimos 30 dias" color="var(--yellow)" />
        <StatCard label="Total histórico" value={formatBRL(songs.reduce((s, song) => s + song.revenueCents, 0))} color="var(--purple)" />
      </div>

      {/* Grid 2:1 — Gráfico + Origem */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
        {/* Gráfico */}
        <div className="card" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, color: "var(--white)" }}>Faturamento · últimos 30 dias</h3>
            <select
              style={{
                background: "rgba(10, 10, 30, 0.6)",
                border: "1px solid rgba(148, 163, 184, 0.15)",
                borderRadius: 8,
                color: "var(--white)",
                padding: "6px 10px",
                fontSize: 12,
              }}
            >
              <option>30 dias</option>
              <option>60 dias</option>
              <option>90 dias</option>
            </select>
          </div>
          <MiniBarChart heights={chartHeights} />
        </div>

        {/* Origem das vendas */}
        <div className="card" style={{ padding: "20px 24px" }}>
          <h3 style={{ fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Origem das vendas</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Star Card (star.so/demetrio)", percent: starCardSales, text: "68%", commission: "5%" },
              { label: "Marketplace geral", percent: marketplaceSales, text: "28%", commission: "30%" },
              { label: "Encomendas personalizadas", percent: commissionSales, text: "4%", commission: "5%" },
            ].map(({ label, percent, text, commission }) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>{label}</span>
                  <span style={{ color: "var(--cyan-1)", fontWeight: 600, fontSize: 12 }}>{text}</span>
                </div>
                <ProgressBar percent={percent} />
                <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>
                  Comissão {commission} · você recebe {100 - parseInt(commission)}%
                </p>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 14,
              padding: "10px 12px",
              borderRadius: 8,
              background: "rgba(0, 212, 255, 0.08)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
            }}
          >
            <p style={{ fontSize: 11, color: "var(--text-2)" }}>
              💡 Divulgue mais sua Star Card pra reduzir a comissão que você paga
            </p>
          </div>
        </div>
      </div>

      {/* Tabela últimas transações */}
      <div className="card" style={{ padding: "6px 4px" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between" }}>
          <h3 style={{ fontWeight: 700, color: "var(--white)" }}>Últimas transações</h3>
          <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}>
            Exportar CSV
          </button>
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
                <th style={{ textAlign: "left", padding: "12px", fontSize: 12 }}>Música</th>
                <th style={{ textAlign: "left", padding: "12px", fontSize: 12 }}>Cliente</th>
                <th style={{ textAlign: "left", padding: "12px", fontSize: 12 }}>Origem</th>
                <th style={{ textAlign: "left", padding: "12px", fontSize: 12 }}>Licença</th>
                <th style={{ textAlign: "right", padding: "12px", fontSize: 12 }}>Recebido</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                  <td style={{ padding: "12px", color: "var(--text-3)", fontSize: 12 }}>{new Date(s.date).toLocaleDateString("pt-BR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                  <td style={{ padding: "12px", color: "var(--white)", fontWeight: 600 }}>{s.songTitle}</td>
                  <td style={{ padding: "12px", color: "var(--text-3)", fontSize: 12 }}>{s.customer}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 100,
                        fontSize: 11,
                        fontWeight: 600,
                        background:
                          s.origin === "star_card" ? "rgba(16, 185, 129, 0.15)" : "rgba(148, 163, 184, 0.1)",
                        color: s.origin === "star_card" ? "var(--green)" : "var(--text-3)",
                        border:
                          s.origin === "star_card" ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(148, 163, 184, 0.2)",
                      }}
                    >
                      {s.origin === "star_card" ? "Star Card" : "Marketplace"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 100,
                        fontSize: 11,
                        background: "rgba(148, 163, 184, 0.1)",
                        color: "var(--text-3)",
                      }}
                    >
                      {s.license === "pessoal" ? "Pessoal" : s.license === "comercial" ? "Comercial" : "Exclusivo"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "right", color: "var(--green)", fontWeight: 600 }}>
                    {formatBRL(s.netCents)}
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
