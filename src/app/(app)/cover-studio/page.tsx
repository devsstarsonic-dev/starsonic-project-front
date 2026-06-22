import { getCreations, getProfile } from "@/lib/data";
import { CoverStudio } from "@/components/CoverStudio";

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
            fontSize: 160,
            filter: "drop-shadow(0 0 60px rgba(124,80,255,0.5))",
            opacity: 0.9,
            zIndex: 1,
          }}
        >
          🎬
        </div>
        <div className="hero-banner-content">
          <span className="badge purple" style={{ marginBottom: 12, width: "fit-content" }}>
            ✦ COVER STUDIO
          </span>
          <div className="hero-title-line1">Vídeos, capas e fotos</div>
          <div className="hero-title-line2">das suas músicas com IA</div>
          <p className="hero-subtitle">
            Crie videoclipes com cenas geradas por IA, capas cantadas em MP4 e
            imagens de capa — tudo a partir das músicas que você já criou.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge cyan">🎬 Videoclipe IA</span>
            <span className="badge pink">🎤 Capa com letra</span>
            <span className="badge green">🖼️ Capa / Foto</span>
          </div>
        </div>
      </div>

      <div className="page-title-row" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-title">🎬 Cover Studio</div>
          <div className="page-sub">Transforme suas músicas em vídeo clipe.</div>
        </div>
      </div>

      <CoverStudio musics={musics} />
    </section>
  );
}
