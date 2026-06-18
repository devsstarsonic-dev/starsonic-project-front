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
            ✦ NOVO · COVER STUDIO
          </span>
          <div className="hero-title-line1">Sua música agora tem</div>
          <div className="hero-title-line2">vídeo clipe com IA</div>
          <p className="hero-subtitle">
            Escolha uma das suas criações e gere um vídeo clipe automático com a
            inteligência da Star Sonic. Pronto para postar e compartilhar.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge cyan">🎞️ MP4 em HD</span>
            <span className="badge green">⚡ Geração automática</span>
            <span className="badge pink">📲 Pronto pra redes</span>
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
