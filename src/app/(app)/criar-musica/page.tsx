import Link from "next/link";

const MODES = [
  {
    href: "/compositor/quick",
    icon: "⚡",
    title: "Modo Rápido",
    tag: "3 PERGUNTAS · 30 SEG",
    desc: "Para quem quer testar ou já tem a ideia clara. Apenas o essencial.",
    bullets: ["Tema + Gênero + Emoção", "Sistema decide o resto", "Ideal para começar"],
    featured: false,
  },
  {
    href: "/compositor",
    icon: "🎯",
    title: "Modo Detalhado",
    tag: "15 PERGUNTAS · 3 MIN",
    desc: "Controle total. Defina voz, instrumentos, restrições e palavras obrigatórias.",
    bullets: ["15 perguntas em 4 etapas", "Letra editável antes de gerar", "6 idiomas suportados"],
    featured: true,
  },
  {
    href: "/compositor/manual",
    icon: "✍️",
    title: "Modo Manual",
    tag: "PROMPT LIVRE · AVANÇADO",
    desc: "Para quem já sabe compor. Escreva direto o estilo e a letra.",
    bullets: ["Campo livre profissional", "Letra escrita por você", "Para usuários experientes"],
    featured: false,
  },
];

const EXTRAS = [
  { icon: "🎬", title: "Gerar Vídeo MP4", cost: "⚡ 10 créditos", color: "var(--cyan-1)" },
  { icon: "🔄", title: "Tentar em 5 Estilos", cost: "⚡ 375 créditos", color: "var(--cyan-1)" },
  { icon: "✏️", title: "Editar Música", cost: "⚡ 75 créditos", color: "var(--cyan-1)" },
  { icon: "🔗", title: "Link Compartilhável", cost: "⚡ Grátis", color: "var(--green)" },
];

export default function CriarMusicaPage() {
  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <div className="page-title">Criar Música</div>
          <div className="page-sub">Escolha como quer compor. Cada modo é otimizado para diferentes necessidades.</div>
        </div>
        <span className="badge cyan" style={{ padding: "6px 12px", fontSize: 11 }}>⚡ 75 créditos</span>
      </div>

      {/* 3 MODOS DE CRIAÇÃO */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {MODES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="card-glow"
            style={{
              padding: 24,
              cursor: "pointer",
              position: "relative",
              ...(m.featured
                ? { border: "1.5px solid var(--cyan-1)", background: "linear-gradient(180deg, rgba(0, 212, 255, 0.08), rgba(22, 22, 77, 0.7))" }
                : {}),
            }}
          >
            {m.featured && (
              <span style={{ position: "absolute", top: 12, right: 12, background: "var(--cyan-1)", color: "var(--bg-deep)", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 4, letterSpacing: "0.1em" }}>⭐ RECOMENDADO</span>
            )}
            <div style={{ width: 52, height: 52, borderRadius: 14, background: m.featured ? "var(--grad-brand)" : "rgba(0, 212, 255, 0.08)", border: m.featured ? "none" : "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 14 }}>{m.icon}</div>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 18, color: "var(--white)", marginBottom: 4 }}>{m.title}</h3>
            <div style={{ color: "var(--cyan-1)", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>{m.tag}</div>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 12 }}>{m.desc}</p>
            <div style={{ paddingTop: 12, borderTop: "1px solid var(--border-soft)", fontSize: 12, color: "var(--text-2)", lineHeight: 1.8 }}>
              {m.bullets.map((b) => (
                <div key={b}>✓ {b}</div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* FEATURES EXTRAS */}
      <div style={{ background: "linear-gradient(180deg, rgba(22, 22, 77, 0.5), rgba(10, 10, 46, 0.5))", border: "1px solid var(--border-soft)", borderRadius: 16, padding: 22, marginBottom: 20 }}>
        <h4 style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 14, color: "var(--white)", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>🚀 Depois de gerar sua música você pode:</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {EXTRAS.map((e) => (
            <div key={e.title} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--bg-card)", borderRadius: 10 }}>
              <div style={{ fontSize: 20 }}>{e.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--white)" }}>{e.title}</div>
                <div style={{ fontSize: 10, color: e.color, fontFamily: "'JetBrains Mono', monospace" }}>{e.cost}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: "rgba(0, 212, 255, 0.06)", borderRadius: 10, border: "1px solid var(--border-soft)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan-1)" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span style={{ fontSize: 12, color: "var(--text-2)" }}>
          Cada composição entrega <b style={{ color: "var(--cyan-1)" }}>2 versões</b>. Tempo médio: 2-3 minutos. Composição em <b style={{ color: "var(--cyan-1)" }}>6 idiomas</b>: 🇧🇷 🇺🇸 🇪🇸 🇫🇷 🇮🇹 🇩🇪
        </span>
      </div>
    </section>
  );
}
