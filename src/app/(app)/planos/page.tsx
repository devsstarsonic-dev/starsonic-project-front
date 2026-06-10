import { getPlans, getProfile } from "@/lib/data";

const FAQ = [
  {
    q: "Posso usar as músicas comercialmente?",
    a: "Sim, nos planos pagos (Starter, Plus e Creator). Para casos comerciais avançados, recomendamos o plano Creator.",
  },
  {
    q: "Como funcionam os créditos?",
    a: "Cada criação consome créditos conforme a ferramenta e configuração. Ex: música completa = 75 créditos. Letras = 5 créditos. Capas = 10 créditos. Vídeo MP4 = 10 créditos. Veja a tabela completa antes de gerar.",
  },
  {
    q: "A distribuição em plataformas está inclusa?",
    a: "Ainda não. A Distribuição está em desenvolvimento (previsão 2026 Q3). Quando disponível, terá cobrança separada por release ou estará inclusa em planos premium superiores.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Não há fidelidade. Cancelando, você mantém seus créditos até o fim do ciclo já pago.",
  },
];

export default async function PlanosPage() {
  const [plans, profile] = await Promise.all([getPlans(), getProfile()]);
  const currentPlan = profile?.plan ?? "Free";

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <div className="page-title">💎 Planos</div>
          <div className="page-sub">Escolha o que combina com você. Sem fidelidade — cancele quando quiser.</div>
        </div>
        <div className="pill-group" style={{ display: "inline-flex", gap: 4 }}>
          <button className="btn-pill active">Mensal</button>
          <button className="btn-pill">Anual <span style={{ color: "var(--green)", fontWeight: 800, marginLeft: 4 }}>-17%</span></button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        {plans.map((p) => {
          const isCurrent = p.name === currentPlan;
          const cls = p.is_popular ? "card-glow" : "card";
          return (
            <div
              key={p.id}
              className={cls}
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                ...(p.is_popular
                  ? { border: "1px solid var(--cyan-1)", boxShadow: "0 6px 32px rgba(0, 212, 255, 0.2)" }
                  : {}),
              }}
            >
              {p.is_popular && (
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)" }}>
                  <span className="badge cyan" style={{ padding: "3px 10px", fontSize: 9 }}>🔥 MAIS POPULAR</span>
                </div>
              )}
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 800 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{p.tagline}</div>
              <div style={{ margin: "18px 0" }}>
                <span className={p.is_popular ? "grad-text" : ""} style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 32, fontWeight: 900 }}>{p.price_label}</span>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>/mês</span>
              </div>
              <button
                className={p.is_popular ? "btn-primary" : "btn-secondary"}
                style={{ padding: 10, fontSize: 12, ...(p.is_popular ? {} : { width: "100%" }) }}
              >
                {isCurrent ? "Plano atual" : `Assinar ${p.name}`}
              </button>
              <div style={{ borderTop: "1px solid var(--border)", marginTop: 18, paddingTop: 14 }}>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
                  {p.features.map((f, i) => (
                    <li key={i} style={{ color: f.included ? "var(--text-1)" : "var(--text-3)" }}>
                      {f.included ? "✓" : "✗"} {f.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div>
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Perguntas frequentes</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQ.map((item, i) => (
            <details key={i} className="card" style={{ cursor: "pointer", padding: 16 }}>
              <summary style={{ fontWeight: 700, fontSize: 14, outline: "none" }}>{item.q}</summary>
              <p style={{ marginTop: 10, color: "var(--text-2)", fontSize: 13 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
