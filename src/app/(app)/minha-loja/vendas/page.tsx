import { KpiCard } from "@/components/store/KpiCard";
import { RevenueChart } from "@/components/store/RevenueChart";
import { EmptyState } from "@/components/store/EmptyState";
import { Icon } from "@/components/store/Icon";
import { formatBRL } from "@/lib/format";
import { getSales } from "@/lib/data";
import type { Sale, SaleOrigin } from "@/lib/types";

const ORIGIN_LABEL: Record<SaleOrigin, string> = {
  star_card: "Star Card (link direto)",
  marketplace: "Marketplace geral",
  commission: "Encomendas personalizadas",
};
const ORIGIN_NOTE: Partial<Record<SaleOrigin, string>> = {
  star_card: "Comissão 5% · você recebe 95%",
  marketplace: "Comissão 30% · você recebe 70%",
};
const ORIGIN_BADGE: Record<SaleOrigin, string> = {
  star_card: "Star Card",
  marketplace: "Marketplace",
  commission: "Encomenda",
};
const LICENSE_LABEL: Record<Sale["license"], string> = {
  pessoal: "Pessoal",
  comercial: "Comercial",
  exclusivo: "Exclusivo",
};

const ICONS = {
  tendencia: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 6l-9.5 9.5-5-5L1 18" />
      <path d="M17 6h6v6" />
    </svg>
  ),
  sacola: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  cartao: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
  carteira: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" />
      <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
    </svg>
  ),
};

export default async function VendasPage() {
  const sales = await getSales();

  const totalHistorico = sales.reduce((s, v) => s + v.netCents, 0);
  const qtd = sales.length;
  const ticketMedio = qtd ? totalHistorico / qtd : 0;

  const porOrigem = (["star_card", "marketplace", "commission"] as SaleOrigin[]).map((o) => {
    const n = sales.filter((s) => s.origin === o).length;
    return { origin: o, pct: qtd ? Math.round((n / qtd) * 100) : 0 };
  });

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <div className="page-title">Vendas</div>
          <div className="page-sub">Histórico completo e origem de cada venda</div>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard accent="cyan" icon={ICONS.tendencia} label="Este mês" value={formatBRL(totalHistorico)} sub="últimos 30 dias" />
        <KpiCard accent="purple" icon={ICONS.sacola} label="Vendas · 30d" value={String(qtd)} sub="transações" />
        <KpiCard accent="pink" icon={ICONS.cartao} label="Ticket médio" value={formatBRL(ticketMedio)} sub="últimos 30 dias" />
        <KpiCard accent="emerald" hero icon={ICONS.carteira} label="Total histórico" value={formatBRL(totalHistorico)} sub={`${qtd} vendas concluídas`} />
      </div>

      <div className="store-split-2" style={{ marginBottom: 24 }}>
        <RevenueChart sales={sales} />

        <div className="store-card" style={{ padding: 24 }}>
          <h3 style={{ color: "var(--white)", fontWeight: 700, marginBottom: 16 }}>Origem das vendas</h3>

          {qtd === 0 ? (
            <EmptyState
              compact
              icon="link"
              title="Ainda sem vendas"
              description="Quando você vender, mostramos aqui de onde cada compra veio — Star Card, marketplace ou encomenda."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {porOrigem.map(({ origin, pct }) => (
                <div key={origin}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "var(--text-2)" }}>{ORIGIN_LABEL[origin]}</span>
                    <span style={{ color: "var(--cyan-1)", fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  {ORIGIN_NOTE[origin] && <p style={{ color: "#64748b", fontSize: 10, marginTop: 4 }}>{ORIGIN_NOTE[origin]}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="store-card-highlight" style={{ padding: 12, marginTop: 16 }}>
            <p style={{ color: "var(--text-2)", fontSize: 11, lineHeight: 1.5 }}>
              💡 Divulgue mais sua Star Card pra reduzir a comissão que você paga
            </p>
          </div>
        </div>
      </div>

      <div className="store-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ color: "var(--white)", fontWeight: 700 }}>Últimas transações</h3>
          {qtd > 0 && (
            <button type="button" className="btn-secondary" style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name="download" size={14} /> Exportar CSV
            </button>
          )}
        </div>

        {qtd === 0 ? (
          <EmptyState
            icon="receipt"
            title="Nenhuma transação ainda"
            description="Cada compra da sua loja aparece aqui, com origem, licença e o valor líquido que caiu no seu saldo."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="store-tbl">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Música</th>
                  <th>Cliente</th>
                  <th>Origem</th>
                  <th>Licença</th>
                  <th style={{ textAlign: "right" }}>Recebido</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td style={{ color: "var(--text-2)", fontSize: 12 }}>
                      {new Date(s.date).toLocaleDateString("pt-BR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ color: "var(--white)", fontSize: 14 }}>{s.songTitle}</td>
                    <td style={{ color: "#94a3b8", fontSize: 12 }}>{s.customer}</td>
                    <td>
                      <span className={s.origin === "star_card" ? "badge-paid" : "badge-off"}>{ORIGIN_BADGE[s.origin]}</span>
                    </td>
                    <td>
                      <span className="badge-soft">{LICENSE_LABEL[s.license]}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span style={{ color: "var(--green)", fontWeight: 700 }}>+{formatBRL(s.netCents)}</span>
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
