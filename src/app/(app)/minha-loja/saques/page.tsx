import { KpiCard } from "@/components/store/KpiCard";
import { PixKeyCard } from "@/components/store/PixKeyCard";
import { EmptyState } from "@/components/store/EmptyState";
import { formatBRL } from "@/lib/format";
import { getWithdrawals } from "@/lib/data";
import { getStoreBalance } from "@/lib/store/mock";

const ICONS = {
  calendario: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  barras: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10M18 20V4M6 20v-4" />
    </svg>
  ),
  taxa: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
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

const MES_ATUAL = new Intl.DateTimeFormat("pt-BR", { month: "long" });

export default async function SaquesPage() {
  const withdrawals = await getWithdrawals();
  const saldo = getStoreBalance();

  const totalSacado = withdrawals.reduce((s, w) => s + w.amountCents, 0);
  const qtd = withdrawals.length;
  const saqueMedio = qtd ? totalSacado / qtd : 0;
  const podeSacar = saldo.availableCents > 0;

  const limitePct = Math.round((saldo.freeLimitUsedCents / saldo.freeLimitCents) * 100);
  const restante = saldo.freeLimitCents - saldo.freeLimitUsedCents;
  const mes = MES_ATUAL.format(new Date());

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <div className="page-title">Saques</div>
          <div className="page-sub">Retire seu saldo para sua conta via Pix</div>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard accent="cyan" icon={ICONS.calendario} label="Sacado · 30 dias" value={formatBRL(totalSacado)} sub={`${qtd} saques no período`} />
        <KpiCard accent="purple" icon={ICONS.barras} label="Saque médio" value={formatBRL(saqueMedio)} sub="por solicitação" />
        <KpiCard accent="pink" icon={ICONS.taxa} label="Taxas pagas" value={formatBRL(0)} sub={`grátis até ${formatBRL(saldo.freeLimitCents)}/mês`} />
        <KpiCard accent="emerald" hero icon={ICONS.carteira} label="Total sacado" value={formatBRL(totalSacado)} sub={`${qtd} saques concluídos`} />
      </div>

      <div className="store-split-2" style={{ marginBottom: 24 }}>
        <div className="withdraw-hero">
          <div className="wh-inner">
            <p className="wh-label">Saldo disponível pra saque</p>
            <p className="wh-value">{formatBRL(saldo.availableCents)}</p>
            <div>
              <span className="wh-proc">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4l2.5 2.5" />
                </svg>
                + {formatBRL(saldo.processingCents)} em processamento <span className="wh-dim">(liberação em D+2)</span>
              </span>
            </div>
            <div>
              <button
                type="button"
                className="btn-primary wh-btn"
                disabled={!podeSacar}
                style={!podeSacar ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 9 }}>
                  <path d="M12 3v13m0 0 4-4m-4 4-4-4M5 21h14" />
                </svg>
                Solicitar saque via Pix
              </button>
            </div>
            <p className="wh-foot">
              {podeSacar
                ? `Aprovação instantânea · sem taxas até ${formatBRL(saldo.freeLimitCents)}/mês`
                : "Você ainda não tem saldo. Venda pela sua loja pra liberar saques."}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <PixKeyCard initialKey={saldo.pixKey} />

          <div className="store-card" style={{ padding: 24, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <h3 style={{ color: "var(--white)", fontWeight: 700 }}>Limite sem taxa</h3>
              <span className="wl-badge" style={{ textTransform: "capitalize" }}>{mes}</span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16 }}>Saques via Pix são gratuitos até o limite mensal</p>

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ color: "var(--white)", fontSize: 22, fontWeight: 700 }}>
                {formatBRL(saldo.freeLimitUsedCents)}{" "}
                <span style={{ color: "#64748b", fontSize: 14, fontWeight: 500 }}>/ {formatBRL(saldo.freeLimitCents)}</span>
              </p>
              <span style={{ color: "var(--cyan-1)", fontSize: 14, fontWeight: 700 }}>{limitePct}%</span>
            </div>
            <div className="progress-track" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: `${limitePct}%` }} />
            </div>
            <p style={{ color: "#64748b", fontSize: 11, marginTop: 12 }}>
              Ainda dá pra sacar <span style={{ color: "var(--text-2)", fontWeight: 600 }}>{formatBRL(restante)}</span> sem taxa
              neste mês.
            </p>
          </div>
        </div>
      </div>

      <div className="store-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 style={{ color: "var(--white)", fontWeight: 700 }}>Histórico de saques</h3>
        </div>

        {qtd === 0 ? (
          <EmptyState
            icon="wallet"
            title="Nenhum saque ainda"
            description="Quando você solicitar seu primeiro saque via Pix, ele aparece aqui com data, valor e status."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="store-tbl">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Método</th>
                  <th style={{ textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td style={{ color: "var(--text-2)", fontSize: 12, whiteSpace: "nowrap" }}>
                      {new Date(w.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td style={{ color: "var(--white)", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>{formatBRL(w.amountCents)}</td>
                    <td style={{ color: "#94a3b8", fontSize: 12, whiteSpace: "nowrap" }}>{w.method}</td>
                    <td style={{ textAlign: "right" }}>
                      <span className={w.status === "pago" ? "badge-paid" : "badge-off"}>{w.status.toUpperCase()}</span>
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
