import { StatCard } from "@/components/store/StatCard";
import { MiniBarChart } from "@/components/store/MiniBarChart";
import { EmptyState } from "@/components/store/EmptyState";
import { Icon } from "@/components/store/Icon";
import { formatBRL } from "@/lib/format";
import { getSales } from "@/lib/data";
import type { Sale } from "@/lib/types";

const ORIGIN_LABEL: Record<Sale["origin"], string> = {
  star_card: "Star Card",
  marketplace: "Marketplace",
  commission: "Encomenda",
};
const LICENSE_LABEL: Record<Sale["license"], string> = {
  pessoal: "Pessoal",
  comercial: "Comercial",
  exclusivo: "Exclusivo",
};

export default async function VendasPage() {
  const sales = await getSales();

  // Métricas derivadas das vendas reais (vazias até o Supabase alimentar).
  const totalHistorico = sales.reduce((s, v) => s + v.netCents, 0);
  const salesLast30 = sales.length;
  const thisMonth = totalHistorico;
  const ticketMedio = salesLast30 ? totalHistorico / salesLast30 / 100 : 0;

  // 14 barras de faturamento por dia — vazio até haver vendas.
  const chartHeights = new Array(14).fill(0);

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <div className="page-title">Vendas</div>
          <div className="page-sub">Histórico completo e origem de cada venda</div>
        </div>
      </div>

      {/* KPIs */}
      <div className="store-kpis">
        <StatCard label="Este mês" value={formatBRL(thisMonth)} icon="receipt" color="var(--cyan-1)" sub="últimos 30 dias" index={0} />
        <StatCard label="Vendas · 30d" value={salesLast30} icon="coins" color="var(--green)" sub="transações" index={1} />
        <StatCard label="Ticket médio" value={`R$ ${ticketMedio.toFixed(2)}`} icon="ticket" color="var(--yellow)" sub="por venda" index={2} />
        <StatCard label="Total histórico" value={formatBRL(totalHistorico)} icon="wallet" color="var(--purple)" sub="desde o início" index={3} />
      </div>

      {/* Gráfico + Origem */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="card store-rise" style={{ padding: "20px 24px", animationDelay: "240ms" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, color: "var(--white)" }}>Faturamento · últimos 30 dias</h3>
            <select
              aria-label="Período do gráfico"
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

        <div className="card store-rise" style={{ padding: "20px 24px", animationDelay: "300ms" }}>
          <h3 style={{ fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Origem das vendas</h3>
          {sales.length === 0 ? (
            <EmptyState
              compact
              icon="link"
              title="Ainda sem vendas"
              description="Quando você vender, mostramos aqui de onde cada compra veio — Star Card, marketplace ou encomenda."
            />
          ) : null}
          <div
            style={{
              marginTop: 14,
              padding: "12px 14px",
              borderRadius: 10,
              background: "rgba(0, 212, 255, 0.08)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span style={{ color: "var(--cyan-1)", flexShrink: 0, marginTop: 1 }}>
              <Icon name="sparkles" size={16} />
            </span>
            <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
              Comissão menor no link direto: <strong style={{ color: "var(--cyan-1)" }}>5%</strong> na Star Card contra{" "}
              <strong>30%</strong> no marketplace. Divulgue seu link para receber mais.
            </p>
          </div>
        </div>
      </div>

      {/* Últimas transações */}
      <div className="card-glow store-table-card store-rise" style={{ animationDelay: "360ms" }}>
        <div className="store-table-head">
          <h3>Últimas transações</h3>
          {sales.length > 0 && (
            <button className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", fontSize: 12 }}>
              <Icon name="download" size={14} />
              Exportar CSV
            </button>
          )}
        </div>
        {sales.length === 0 ? (
          <EmptyState
            icon="receipt"
            title="Nenhuma venda ainda"
            description="Assim que alguém comprar uma música pela sua loja, a transação aparece aqui em tempo real."
            cta={{ label: "Compartilhar minha loja", href: "/minha-loja" }}
          />
        ) : (
          <div className="store-table-wrap">
            <table className="store-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Música</th>
                  <th>Cliente</th>
                  <th>Origem</th>
                  <th>Licença</th>
                  <th className="col-right">Recebido</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td className="num" style={{ color: "var(--text-3)", fontSize: 12 }}>
                      {new Date(s.date).toLocaleDateString("pt-BR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ color: "var(--white)", fontWeight: 600 }}>{s.songTitle}</td>
                    <td style={{ color: "var(--text-3)", fontSize: 12 }}>{s.customer}</td>
                    <td>
                      <span className={`store-pill ${s.origin === "star_card" ? "green" : "neutral"}`}>{ORIGIN_LABEL[s.origin]}</span>
                    </td>
                    <td>
                      <span className="store-pill neutral">{LICENSE_LABEL[s.license]}</span>
                    </td>
                    <td className="num col-right" style={{ color: "var(--green)", fontWeight: 600 }}>
                      {formatBRL(s.netCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
