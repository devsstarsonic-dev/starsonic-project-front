import { getCreations, getProfile } from "@/lib/data";
import { CoverStudio } from "@/components/CoverStudio";
import { Icon } from "@/components/Icon";

export default async function CoverStudioPage() {
  const [creations, profile] = await Promise.all([getCreations(), getProfile()]);

  // Só as músicas do usuário que têm áudio (podem virar vídeo).
  const musics = creations.filter(
    (c) =>
      c.kind === "music" &&
      !!c.audio_url &&
      (!profile || c.profile_id === profile.id),
  );

  return (
    <section className="page">
      {/* HERO — apresenta o recurso de vídeo */}
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
          <Icon name="film" size={150} strokeWidth={1.4} />
        </div>
        <div className="hero-banner-content">
          <span className="badge cyan" style={{ marginBottom: 12, width: "fit-content" }}>
            COVER STUDIO
          </span>
          <div className="hero-title-line1">Vídeos, capas e fotos</div>
          <div className="hero-title-line2">das suas músicas com IA</div>
          <p className="hero-subtitle">
            Crie videoclipes com cenas geradas por IA, capas cantadas em MP4 e
            imagens de capa — tudo a partir das músicas que você já criou.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge cyan"><Icon name="film" size={11} /> Videoclipe IA</span>
            <span className="badge cyan"><Icon name="image" size={11} /> Imagem</span>
          </div>
        </div>
      </div>

      <div className="page-title-row" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="film" size={22} style={{ color: "var(--cyan-1)" }} /> Cover Studio
          </div>
          <div className="page-sub">Transforme suas músicas em vídeo, capa e foto.</div>
        </div>
      </div>

      <CoverStudio musics={musics} />
    </section>
  );
}
