import Link from "next/link";

const LightningIcon = () => (
  <svg className="hero-cta-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L4.09 12.97L11 13L11 22L19.91 11.03L13 11L13 2Z" />
  </svg>
);

export default function HeroBanner() {
  return (
    <div className="hero-banner">
      {/* Background photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/mulher com headset.png"
        alt=""
        className="hero-banner-bg-img"
      />

      {/* 3D logo decoration */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo da herobanner.png"
        alt=""
        className="hero-logo-3d"
      />

      {/* Gradient overlay */}
      <div className="hero-banner-overlay" />

      {/* Content */}
      <div className="hero-banner-content">
        <p className="hero-title-line1">Crie sua próxima</p>
        <p className="hero-title-line2">música em segundos</p>
        <p className="hero-subtitle">
          Use o poder da IA para compor, escrever letras, gerar vozes e produzir
          músicas completas.
        </p>
        <Link href="/criar-musica" className="hero-cta">
          <LightningIcon />
          Criar música agora
        </Link>
      </div>
    </div>
  );
}
