import { formatBRL } from "@/lib/format";
import { getProfile, getWithdrawals } from "@/lib/data";
import { EmptyState } from "@/components/store/EmptyState";
import { Icon } from "@/components/store/Icon";

export default async function SaquesPage() {
  const [profile, withdrawals] = await Promise.all([getProfile(), getWithdrawals()]);

  const saldoDisponivel = 0; // Alimentado pelo Supabase quando a tabela existir.
  const emProcessamento = 0;
  const podeSacar = saldoDisponivel > 0;

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <div className="page-title">Saques</div>
          <div className="page-sub">Retire seu saldo para sua conta via Pix</div>
        </div>
      </div>

      {/* Saldo em destaque */}
      <div className="card-glow store-rise" style={{ maxWidth: 560, margin: "0 auto 16px", padding: "22px 24px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-grid",
            placeItems: "center",
            width: 40,
            height: 40,
            borderRadius: 12,
            margin: "0 auto 10px",
            color: "var(--cyan-1)",
            background: "radial-gradient(circle at 50% 40%, rgba(0,212,255,0.16), rgba(168,85,247,0.06))",
            border: "1px solid var(--border-soft)",
          }}
        >
          <Icon name="wallet" size={20} />
        </div>
        <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 6 }}>Saldo disponível para saque</div>
        <div
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 800,
            fontSize: 34,
            color: "var(--cyan-1)",
            marginBottom: 6,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatBRL(saldoDisponivel)}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 14 }}>
          + {formatBRL(emProcessamento)} em processamento (liberação em D+2)
        </div>
        <button
          className="btn-primary"
          disabled={!podeSacar}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 22px",
            minWidth: 200,
            justifyContent: "center",
            opacity: podeSacar ? 1 : 0.5,
            cursor: podeSacar ? "pointer" : "not-allowed",
          }}
        >
          <Icon name="wallet" size={15} />
          Solicitar saque via Pix
        </button>
        <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 10 }}>
          {podeSacar
            ? "Aprovação instantânea · sem taxas até R$ 5.000/mês"
            : "Você poderá sacar assim que tiver saldo disponível"}
        </p>
      </div>

      {/* Chave Pix */}
      <div className="card store-rise" style={{ maxWidth: 560, margin: "0 auto 16px", padding: "16px 20px", animationDelay: "60ms" }}>
        <h3 style={{ fontWeight: 700, color: "var(--white)", marginBottom: 10, fontSize: 14 }}>Sua chave Pix cadastrada</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(0,0,0,0.3)",
            border: "1px solid var(--border-soft)",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--cyan-1), var(--purple))",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              color: "#0a0a2e",
            }}
          >
            <Icon name="mail" size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>E-mail</div>
            <div
              style={{
                fontSize: 13,
                color: "var(--white)",
                fontFamily: "'JetBrains Mono', monospace",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {profile?.email || "Nenhuma chave cadastrada"}
            </div>
          </div>
          <button className="btn-secondary" aria-label="Alterar chave Pix" style={{ padding: "6px 12px", fontSize: 12 }}>
            Alterar
          </button>
        </div>
      </div>

      {/* Histórico */}
      <div className="card-glow store-table-card store-rise" style={{ maxWidth: 560, margin: "0 auto", animationDelay: "120ms" }}>
        <div className="store-table-head" style={{ padding: "12px 16px" }}>
          <h3 style={{ fontSize: 14 }}>Histórico de saques</h3>
        </div>
        {withdrawals.length === 0 ? (
          <EmptyState
            compact
            icon="inbox"
            title="Nenhum saque ainda"
            description="Seus saques via Pix aparecem aqui com data, valor e status de aprovação."
          />
        ) : (
          <div className="store-table-wrap">
            <table className="store-table" style={{ minWidth: 420 }}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Método</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td style={{ color: "var(--text-3)" }}>{w.date}</td>
                    <td className="num" style={{ fontWeight: 600, color: "var(--white)" }}>
                      {formatBRL(w.amountCents)}
                    </td>
                    <td style={{ color: "var(--text-3)", fontSize: 12 }}>{w.method}</td>
                    <td>
                      <span className={`store-pill ${w.status === "pago" ? "green" : "yellow"}`}>
                        {w.status === "pago" ? "Pago" : "Pendente"}
                      </span>
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
