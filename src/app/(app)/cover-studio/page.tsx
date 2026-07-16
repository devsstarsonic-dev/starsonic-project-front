import Image from "next/image";
import { getCreations, getProfile } from "@/lib/data";
import { VideoStudio } from "@/components/VideoStudio";
import { Icon } from "@/components/Icon";

export default async function CoverStudioPage() {
  const [creations, profile] = await Promise.all([getCreations(), getProfile()]);

  const musics = creations.filter(
    (c) =>
      (c.kind === "music" || c.kind === "instrumental" || c.kind === "jingle") &&
      !!c.audio_url &&
      (!profile || c.profile_id === profile.id),
  );

  return (
    <section className="page" style={{ position: "relative" }}>
      {/* mobile: backdrop ocupa toda a largura quando não há sidebar/painel */}
      <style>{`@media (max-width:768px){.cs-backdrop{left:0!important;right:0!important}}`}</style>

      {/* BACKDROP — imagem de fundo fixa, escopada à área de conteúdo (não cobre sidebar/header/painel) */}
      <div
        className="cs-backdrop"
        aria-hidden
        style={{
          position: "fixed",
          top: "var(--header-h)",
          left: "var(--sidebar-w)",
          right: "var(--panel-w)",
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Image
          src="https://pub-c0844d8534c94020b91073881d016491.r2.dev/imgs/cover-studio.png"
          alt=""
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(8,8,32,0.78) 0%, rgba(8,8,32,0.55) 38%, rgba(8,8,32,0.8) 78%, rgba(8,8,32,0.94) 100%)",
          }}
        />
      </div>

      {/* CONTEÚDO */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* HERO — painel glass sobre o backdrop */}
        <div
          style={{
            position: "relative",
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 28,
            padding: "38px 44px",
            width: "fit-content",
            maxWidth: 680,
            minHeight: 260,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background:
              "linear-gradient(105deg, rgba(6,6,28,0.9) 0%, rgba(8,6,32,0.7) 45%, rgba(8,6,32,0.28) 100%)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            border: "1px solid rgba(0,212,255,0.16)",
            boxShadow:
              "0 10px 44px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div className="hero-banner-grid" style={{ opacity: 0.6 }} />
          <div className="hero-banner-content" style={{ padding: 0, position: "relative", zIndex: 3 }}>
            <span className="badge cyan" style={{ marginBottom: 14, width: "fit-content" }}>
              COVER STUDIO
            </span>
            <div className="hero-title-line1">Transforme sua música</div>
            <div className="hero-title-line2">em videoclipe com IA</div>
            <p className="hero-subtitle">
              Gere um videoclipe com cenas criadas por IA a partir da letra, do
              nome e do estilo da sua música.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="badge cyan"><Icon name="film" size={11} /> Videoclipe IA</span>
              <span className="badge cyan"><Icon name="lyrics" size={11} /> Baseado na letra</span>
              <span className="badge cyan"><Icon name="bolt" size={11} /> Pronto pra postar</span>
            </div>
          </div>
        </div>

        <VideoStudio musics={musics} />
      </div>
    </section>
  );
}
