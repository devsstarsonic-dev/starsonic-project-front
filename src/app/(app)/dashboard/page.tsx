import Link from "next/link";
import { getProfile, getCreations, getNotifications } from "@/lib/data";
import { formatPlays, timeAgo, kindLabel } from "@/lib/format";

const NOTIF_STYLE: Record<string, { bg: string; border: string; color: string }> = {
  cyan: { bg: "rgba(0, 212, 255, 0.06)", border: "var(--border-soft)", color: "var(--cyan-1)" },
  green: { bg: "rgba(34, 197, 94, 0.06)", border: "rgba(34, 197, 94, 0.18)", color: "var(--green)" },
  orange: { bg: "rgba(251, 146, 60, 0.06)", border: "rgba(251, 146, 60, 0.18)", color: "var(--orange)" },
};

export default async function DashboardPage() {
  const [profile, creations, notifications] = await Promise.all([
    getProfile(),
    getCreations(),
    getNotifications(),
  ]);

  const firstName = (profile?.full_name ?? "Artista").split(" ")[0];
  const credits = profile?.credits ?? 0;
  const total = creations.length;
  const inCatalog = creations.filter((c) => c.is_public).length;
  const processing = creations.find((c) => c.status === "processing");
  const recent = creations.slice(0, 3);

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <div className="page-title">
            Bem-vinda, <span className="grad-text">{firstName}</span> ✨
          </div>
          <div className="page-sub">
            Você tem {credits} créditos hoje. Que tal começar uma nova composição?
          </div>
        </div>
        <Link href="/criar-musica" className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L4.09 12.97L11 13L11 22L19.91 11.03L13 11L13 2Z" />
          </svg>
          Criar agora
        </Link>
      </div>

      {/* Stats principais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>Criações totais</span>
            <span style={{ fontSize: 14 }}>🎨</span>
          </div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 30, fontWeight: 900, color: "var(--white)" }}>{total}</div>
          <div style={{ fontSize: 11, color: "var(--green)", marginTop: 4, fontWeight: 600 }}>biblioteca pessoal</div>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>No Catálogo</span>
            <span style={{ fontSize: 14 }}>💎</span>
          </div>
          <div className="grad-text" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 30, fontWeight: 900 }}>{inCatalog}</div>
          <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>públicas na comunidade</div>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>Total de plays</span>
            <span style={{ fontSize: 14 }}>▶</span>
          </div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 30, fontWeight: 900, color: "var(--white)" }}>{formatPlays(profile?.total_plays ?? 0)}</div>
          <div style={{ fontSize: 11, color: "var(--green)", marginTop: 4, fontWeight: 600 }}>somando suas obras</div>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>Royalties</span>
            <span style={{ fontSize: 14 }}>💰</span>
          </div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 30, fontWeight: 900, color: "var(--text-3)" }}>R$ —</div>
          <div style={{ fontSize: 11, color: "var(--orange)", marginTop: 4, fontWeight: 600 }}>Em breve</div>
        </div>
      </div>

      {/* Card destaque: processando */}
      {processing && (
        <div className="card-glow" style={{ marginBottom: 24, padding: 22, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ width: 64, height: 64, borderRadius: 12, background: "linear-gradient(135deg, #00d4ff, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
            <div style={{ position: "absolute", width: 16, height: 16, border: "2px solid #00d4ff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="badge orange">⏱️ PROCESSANDO</span>
              <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>{processing.progress}% concluído</span>
            </div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 16, color: "var(--white)" }}>{processing.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>🎼 Compositor · {processing.genre} · {processing.duration}</div>
          </div>
          <Link href="/criacoes" className="btn-secondary">Acompanhar →</Link>
        </div>
      )}

      {/* Sonic Lab atalhos */}
      <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 800, margin: "28px 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
        🧪 Sonic Lab
        <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 400, fontFamily: "'Sora', sans-serif" }}>acesso rápido às ferramentas</span>
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { href: "/compositor", icon: "🎼", title: "Compositor", desc: "Música completa em segundos", c: "rgba(0, 212, 255, 0.12)", color: "var(--cyan-1)" },
          { href: "/letrista", icon: "✍️", title: "Letrista", desc: "Letras originais sob medida", c: "rgba(168, 85, 247, 0.12)", color: "var(--purple)" },
          { href: "/vocalista", icon: "🎤", title: "Vocalista", desc: "Narração e voz natural", c: "rgba(236, 72, 153, 0.12)", color: "var(--pink)" },
          { href: "/cover-studio", icon: "🎨", title: "Cover Studio", desc: "Capas profissionais", c: "rgba(251, 146, 60, 0.12)", color: "var(--orange)" },
        ].map((t) => (
          <Link href={t.href} key={t.href} className="card-glow" style={{ cursor: "pointer", padding: 18 }}>
            <div style={{ width: 42, height: 42, background: t.c, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: t.color, fontSize: 20 }}>{t.icon}</div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{t.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{t.desc}</div>
          </Link>
        ))}
      </div>

      {/* Últimas criações + Notificações */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }} className="dash-cols">
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 800 }}>Últimas criações</h3>
            <Link href="/criacoes" style={{ fontSize: 12, cursor: "pointer" }}>Ver tudo →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recent.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, borderRadius: 10, background: "var(--bg-card-2)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: `linear-gradient(135deg, ${c.gradient_from}, ${c.gradient_to})`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{c.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {kindLabel(c.kind)}{c.genre ? ` · ${c.genre}` : ""} · {timeAgo(c.created_at)}
                  </div>
                </div>
                {c.is_public ? (
                  <span className="badge green">📤 DIST</span>
                ) : c.status === "processing" ? (
                  <span className="badge orange">⏱️</span>
                ) : (
                  <span className="badge cyan">📦 OK</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 800, marginBottom: 16 }}>🔔 Notificações</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {notifications.map((n) => {
              const s = NOTIF_STYLE[n.kind] ?? NOTIF_STYLE.cyan;
              return (
                <div key={n.id} style={{ padding: 10, borderRadius: 8, background: s.bg, border: `1px solid ${s.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: s.color, marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-2)" }}>{n.message}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 900px){ .dash-cols { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}
