import dynamic from "next/dynamic";
import Image from "next/image";

const ModoCard = dynamic(() => import("@/components/ModoCard"), { ssr: false });

const MODES = [
  {
    href: "/compositor?modo=instrumental",
    icon: "🎸",
    title: "Instrumental",
    tag: "6 PERGUNTAS · 1 MIN",
    desc: "Produza trilhas sem vocal. Ideal para vídeos, podcasts e ambientação.",
    bullets: ["Sem letra, foco no arranjo", "Escolha de instrumentos livres", "Exportação sem voz"],
    featured: false,
    comingSoon: true,
  },
  {
    href: "/compositor?modo=jingle",
    icon: "📣",
    title: "Jingle Comercial",
    tag: "8 PERGUNTAS · 2 MIN",
    desc: "Crie jingles memoráveis para marcas, produtos e campanhas publicitárias.",
    bullets: ["Focado em identidade de marca", "Versões curtas (15s, 30s, 60s)", "Letras com slogan integrado"],
    featured: false,
    comingSoon: true,
  },
  {
    href: "/compositor",
    icon: "🎯",
    title: "Modo Detalhado",
    tag: "15 PERGUNTAS · 3 MIN",
    desc: "Controle total. Defina voz, instrumentos, restrições e palavras obrigatórias.",
    bullets: ["15 perguntas em 4 etapas", "Letra editável antes de gerar", "6 idiomas suportados"],
    featured: true,
    comingSoon: false,
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
    <>
      {/* suprime scroll do app-main apenas nesta página */}
      <style>{`.app-main:has(.criar-musica-section){overflow:hidden!important}`}</style>

    <section className="criar-musica-section" style={{ position: "relative", height: "100%", minHeight: "calc(100vh - 56px)", overflow: "hidden", margin: "-24px -32px" }}>

      {/* BACKGROUND IMAGE */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image
          src="/images/criar-musica.jpeg"
          alt=""
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(10,10,46,0.72) 0%, rgba(10,10,46,0.45) 40%, rgba(10,10,46,0.62) 80%, rgba(10,10,46,0.88) 100%)",
        }} />
      </div>

      {/* CONTEÚDO */}
      <div style={{ position: "relative", zIndex: 1, padding: "150px 32px 32px" }}>

        {/* TÍTULO */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="page-title" style={{ marginBottom: 8 }}>Criar Música</div>
        </div>

        {/* CARDS — centralizados, largura contida */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 280px))",
          gap: 16,
          justifyContent: "center",
          marginBottom: 28,
        }}>
          {MODES.map((m) => (
            <ModoCard
              key={m.href}
              href={m.href}
              icon={m.icon}
              title={m.title}
              tag={m.tag}
              desc={m.desc}
              bullets={m.bullets}
              featured={m.featured}
              comingSoon={m.comingSoon}
            />
          ))}
        </div>

        {/* FEATURES EXTRAS */}
        <div style={{
          maxWidth: 860,
          margin: "0 auto 20px",
          background: "rgba(10,10,46,0.65)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0,197,228,0.15)",
          borderRadius: 16,
          padding: "18px 22px",
        }}>
          <h4 style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 13, color: "var(--white)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            🚀 Depois de gerar sua música você pode:
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {EXTRAS.map((e) => (
              <div key={e.title} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 18 }}>{e.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--white)" }}>{e.title}</div>
                  <div style={{ fontSize: 10, color: e.color, fontFamily: "'JetBrains Mono', monospace" }}>{e.cost}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RODAPÉ INFO */}
        <div style={{
          maxWidth: 860,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          background: "rgba(0,197,228,0.06)",
          borderRadius: 10,
          border: "1px solid rgba(0,197,228,0.15)",
          backdropFilter: "blur(8px)",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00c5e4" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span style={{ fontSize: 12, color: "var(--text-2)" }}>
            Cada composição entrega <b style={{ color: "#00c5e4" }}>2 versões</b>. Tempo médio: 2-3 minutos. Composição em <b style={{ color: "#00c5e4" }}>6 idiomas</b>: 🇧🇷 🇺🇸 🇪🇸 🇫🇷 🇮🇹 🇩🇪
          </span>
        </div>
      </div>
    </section>
    </>
  );
}
