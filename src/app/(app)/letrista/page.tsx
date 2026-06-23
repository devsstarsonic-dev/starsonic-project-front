import { getCreations, getProfile } from "@/lib/data";
import { Letrista } from "@/components/Letrista";
import { Icon } from "@/components/Icon";

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
            color: "var(--cyan-1)",
            filter: "drop-shadow(0 0 60px rgba(0,212,255,0.45))",
            opacity: 0.9,
            zIndex: 1,
          }}
        >
          <Icon name="lyrics" size={150} strokeWidth={1.4} />
        </div>
        <div className="hero-banner-content">
          <span className="badge cyan" style={{ marginBottom: 12, width: "fit-content" }}>
            SONIC LAB · LETRISTA
          </span>
          <div className="hero-title-line1">Escreva e guarde</div>
          <div className="hero-title-line2">as letras das suas músicas</div>
          <p className="hero-subtitle">
            Crie letras do zero ou com IA, salve sua coleção e, quando quiser,
            transforme qualquer letra em música com um clique.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge cyan"><Icon name="sparkle" size={11} /> Geração com IA</span>
            <span className="badge cyan"><Icon name="save" size={11} /> Salva na sua conta</span>
            <span className="badge cyan"><Icon name="music" size={11} /> Vira música</span>
          </div>
        </div>
      </div>

      <div className="page-title-row" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="lyrics" size={22} style={{ color: "var(--cyan-1)" }} /> Letrista
          </div>
          <div className="page-sub">Projete letras e transforme em música.</div>
        </div>
      </div>

      <Letrista lyrics={lyrics} profileId={profile?.id ?? null} />
    </section>
  );
}
