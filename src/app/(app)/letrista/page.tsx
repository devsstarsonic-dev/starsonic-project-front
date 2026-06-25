import { getCreations, getProfile } from "@/lib/data";
import { Letrista } from "@/components/Letrista";
import { Icon } from "@/components/Icon";

export default async function LetristaPage() {
  const [creations, profile] = await Promise.all([getCreations(), getProfile()]);

  const lyrics = creations.filter(
    (c) => c.kind === "lyric" && (!profile || c.profile_id === profile.id),
  );

  return (
    <section className="page" style={{ position: "relative", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Background fixo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/letrista.png"
        alt=""
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(5,5,26,0.78) 0%, rgba(5,5,26,0.70) 60%, rgba(5,5,26,0.88) 100%)",
        zIndex: 0,
        pointerEvents: "none",
      }} />

      {/* Layout principal: coluna esquerda (header + cards) | coluna direita (hero) */}
      <div style={{
        position: "relative",
        zIndex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gridTemplateRows: "auto 1fr",
        gap: "0 20px",
        height: "100%",
        minHeight: 0,
      }}>

        {/* Header (coluna esquerda, linha 1) */}
        <div style={{ gridColumn: 1, gridRow: 1, paddingBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(120,80,255,0.2))",
              border: "1px solid rgba(0,212,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="lyrics" size={18} style={{ color: "var(--cyan-1)" }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 18, color: "var(--white)", letterSpacing: "0.02em" }}>
                Letrista
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>
                Escreva, salve e transforme letras em música
              </div>
            </div>
          </div>
        </div>

        {/* Hero — coluna direita, ocupa as 2 linhas */}
        <div style={{
          gridColumn: 2,
          gridRow: "1 / 3",
          background: "rgba(8,10,36,0.60)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(0,212,255,0.20)",
          borderRadius: 20,
          padding: "24px 20px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}>
          {/* Label topo */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 99,
            background: "rgba(0,212,255,0.10)",
            border: "1px solid rgba(0,212,255,0.20)",
            fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700, letterSpacing: "0.12em",
            color: "var(--cyan-1)", marginBottom: 20, width: "fit-content",
          }}>
            <Icon name="sparkle" size={10} /> SONIC LAB · LETRISTA
          </div>

          {/* Título */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 20, color: "var(--white)", lineHeight: 1.25, marginBottom: 4 }}>
              Escreva e guarde
            </div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 20, color: "var(--cyan-1)", lineHeight: 1.25 }}>
              as letras das suas músicas
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(0,212,255,0.10)", margin: "16px 0" }} />

          {/* Descrição */}
          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65, marginBottom: 20 }}>
            Crie letras do zero ou com IA, salve sua coleção e transforme qualquer letra em música com um clique.
          </p>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "auto" }}>
            {[
              { icon: "sparkle", label: "Geração com IA" },
              { icon: "save",    label: "Salva na sua conta" },
              { icon: "music",   label: "Vira música" },
            ].map(({ icon, label }) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 12,
                background: "rgba(0,212,255,0.06)",
                border: "1px solid rgba(0,212,255,0.12)",
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(0,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={14} style={{ color: "var(--cyan-1)" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--white)" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(0,212,255,0.10)", margin: "20px 0 16px" }} />

          {/* Stat */}
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { value: "6", label: "Idiomas" },
              { value: "2", label: "Versões" },
              { value: "3min", label: "Tempo médio" },
            ].map(({ value, label }) => (
              <div key={label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 18, color: "var(--cyan-1)" }}>{value}</div>
                <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cards Letrista (coluna esquerda, linha 2) */}
        <div style={{ gridColumn: 1, gridRow: 2, minHeight: 0, overflow: "auto" }}>
          <Letrista lyrics={lyrics} profileId={profile?.id ?? null} />
        </div>

      </div>
    </section>
  );
}
