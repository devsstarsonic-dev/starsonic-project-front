import { getProfile } from "@/lib/data";
import { Vocalista } from "@/components/Vocalista";

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
            fontSize: 150,
            filter: "drop-shadow(0 0 60px rgba(0,212,255,0.5))",
            opacity: 0.9,
            zIndex: 1,
          }}
        >
          🎙️
        </div>
        <div className="hero-banner-content">
          <span className="badge cyan" style={{ marginBottom: 12, width: "fit-content" }}>
            ✦ SONIC LAB · VOCALISTA
          </span>
          <div className="hero-title-line1">Seu banco de</div>
          <div className="hero-title-line2">vocais e vozes</div>
          <p className="hero-subtitle">
            Faça upload do vocal das suas músicas e das vozes (timbres) que você
            quer usar. Tudo salvo e organizado na sua conta.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge cyan">🎙️ Vocais</span>
            <span className="badge purple">🗣️ Vozes</span>
            <span className="badge green">☁️ Salvo na conta</span>
          </div>
        </div>
      </div>

      <div className="page-title-row" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-title">🎙️ Vocalista</div>
          <div className="page-sub">Suba e gerencie vocais e vozes.</div>
        </div>
      </div>

      <Vocalista userId={profile?.id ?? null} />
    </section>
  );
}
