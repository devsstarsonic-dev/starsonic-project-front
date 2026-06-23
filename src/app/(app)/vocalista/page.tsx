import { getProfile } from "@/lib/data";
import { Vocalista } from "@/components/Vocalista";
import { Icon } from "@/components/Icon";

export default async function VocalistaPage() {
  const profile = await getProfile();

  return (
    <section className="page">
      {/* HERO */}
      <div className="hero-banner">
        <div className="hero-banner-overlay" />
        <div className="hero-banner-grid" />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "48%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--cyan-1)",
            filter: "drop-shadow(0 0 60px rgba(0,212,255,0.45))",
            opacity: 0.9,
            zIndex: 1,
          }}
        >
          <Icon name="mic" size={150} strokeWidth={1.4} />
        </div>
        <div className="hero-banner-content">
          <span className="badge cyan" style={{ marginBottom: 12, width: "fit-content" }}>
            SONIC LAB · VOCALISTA
          </span>
          <div className="hero-title-line1">Seu banco de</div>
          <div className="hero-title-line2">vocais e vozes</div>
          <p className="hero-subtitle">
            Faça upload do vocal das suas músicas e das vozes (timbres) que você
            quer usar. Tudo salvo e organizado na sua conta.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge cyan"><Icon name="mic" size={11} /> Vocais</span>
            <span className="badge cyan"><Icon name="speaker" size={11} /> Vozes</span>
            <span className="badge cyan"><Icon name="check" size={11} /> Salvo na conta</span>
          </div>
        </div>
      </div>

      <div className="page-title-row" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="mic" size={22} style={{ color: "var(--cyan-1)" }} /> Vocalista
          </div>
          <div className="page-sub">Suba e gerencie vocais e vozes.</div>
        </div>
      </div>

      <Vocalista userId={profile?.id ?? null} />
    </section>
  );
}
