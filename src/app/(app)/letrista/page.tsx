import { getCreations, getProfile } from "@/lib/data";
import { Letrista } from "@/components/Letrista";

export default async function LetristaPage() {
  const [creations, profile] = await Promise.all([getCreations(), getProfile()]);

  const lyrics = creations.filter(
    (c) => c.kind === "lyric" && (!profile || c.profile_id === profile.id),
  );

  return (
    <section className="page">
      {/* HERO — apresenta o Letrista */}
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
            filter: "drop-shadow(0 0 60px rgba(168,85,247,0.5))",
            opacity: 0.9,
            zIndex: 1,
          }}
        >
          ✍️
        </div>
        <div className="hero-banner-content">
          <span className="badge purple" style={{ marginBottom: 12, width: "fit-content" }}>
            ✦ SONIC LAB · LETRISTA
          </span>
          <div className="hero-title-line1">Escreva e guarde</div>
          <div className="hero-title-line2">as letras das suas músicas</div>
          <p className="hero-subtitle">
            Crie letras do zero ou com IA, salve sua coleção e, quando quiser,
            transforme qualquer letra em música com um clique.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge cyan">✨ Geração com IA</span>
            <span className="badge green">💾 Salva na sua conta</span>
            <span className="badge pink">🎵 Vira música</span>
          </div>
        </div>
      </div>

      <div className="page-title-row" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-title">✍️ Letrista</div>
          <div className="page-sub">Projete letras e transforme em música.</div>
        </div>
      </div>

      <Letrista lyrics={lyrics} profileId={profile?.id ?? null} />
    </section>
  );
}
