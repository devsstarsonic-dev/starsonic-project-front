import { getProfile } from "@/lib/data";
import { AvatarCreator } from "@/components/AvatarCreator";
import { AvatarVideoUpload } from "@/components/AvatarVideoUpload";
import { Icon } from "@/components/Icon";

export default async function AvatarStudioPage() {
  const profile = await getProfile();
  const name = profile?.full_name ?? "Artista";
  const initial = profile?.avatar_initial ?? name.charAt(0).toUpperCase();

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
          <Icon name="users" size={150} strokeWidth={1.4} />
        </div>
        <div className="hero-banner-content">
          <span className="badge cyan" style={{ marginBottom: 12, width: "fit-content" }}>
            SONIC LAB · AVATAR STUDIO
          </span>
          <div className="hero-title-line1">Crie seu avatar</div>
          <div className="hero-title-line2">com inteligência artificial</div>
          <p className="hero-subtitle">
            Gere um avatar único para o seu perfil com a IA da HeyGen. Descreva
            como ele deve ser e use como sua foto na plataforma.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge cyan"><Icon name="sparkle" size={11} /> Avatar com IA</span>
            <span className="badge cyan"><Icon name="users" size={11} /> Foto do perfil</span>
            <span className="badge cyan"><Icon name="check" size={11} /> Salvo na conta</span>
          </div>
        </div>
      </div>

      <div className="page-title-row" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="users" size={22} style={{ color: "var(--cyan-1)" }} /> Avatar Studio
          </div>
          <div className="page-sub">Crie e salve o avatar do seu perfil.</div>
        </div>
      </div>

      {/* Opção 1: avatar por descrição (foto IA) */}
      <div className="card-glow" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(0,212,255,0.12)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cyan-1)" }}>
            <Icon name="sparkle" size={18} />
          </span>
          <div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 15, color: "var(--white)" }}>Avatar por descrição</div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>Gere uma foto de avatar com IA e use no seu perfil.</div>
          </div>
        </div>
        <AvatarCreator initial={initial} currentAvatarUrl={profile?.avatar_url ?? null} />
      </div>

      {/* Opção 2: avatar por vídeo do rosto (upload HeyGen) */}
      <div className="card-glow" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(0,212,255,0.12)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cyan-1)" }}>
            <Icon name="video" size={18} />
          </span>
          <div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 15, color: "var(--white)" }}>Avatar por vídeo do rosto</div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>Envie um vídeo do seu rosto para a HeyGen criar seu avatar em vídeo.</div>
          </div>
        </div>
        <AvatarVideoUpload />
      </div>
    </section>
  );
}
