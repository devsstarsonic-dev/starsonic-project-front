"use client";

import { useEffect, useState } from "react";
import { Meteors } from "./Meteors";
import type { StoreSong } from "@/lib/types";

// Temas do cabeçalho do Star Card (céu estrelado colorido).
function bg(g1: string, g2: string, g3: string, b1: string, b2: string, b3: string) {
  return [
    `radial-gradient(ellipse 55% 48% at 22% 28%, ${g1}, transparent 62%)`,
    `radial-gradient(ellipse 50% 45% at 82% 16%, ${g2}, transparent 58%)`,
    `radial-gradient(ellipse 65% 55% at 62% 96%, ${g3}, transparent 62%)`,
    `linear-gradient(160deg, ${b1} 0%, ${b2} 45%, ${b3} 100%)`,
  ].join(",");
}

export const PHONE_THEMES: { id: string; title: string; swatch: string; bg: string }[] = [
  { id: "1", title: "Azul galáctico", swatch: "linear-gradient(135deg,#22d3ee,#a855f7)", bg: bg("rgba(70,120,240,0.60)", "rgba(140,95,240,0.45)", "rgba(36,80,200,0.55)", "#0b1440", "#0f1e56", "#05081f") },
  { id: "2", title: "Roxo neon",      swatch: "linear-gradient(135deg,#a855f7,#ec4899)", bg: bg("rgba(168,85,247,0.55)", "rgba(236,72,153,0.48)", "rgba(140,60,220,0.50)", "#1a0b3d", "#2a0f45", "#0d0518") },
  { id: "3", title: "Pôr do sol",     swatch: "linear-gradient(135deg,#ec4899,#f97316)", bg: bg("rgba(236,72,153,0.52)", "rgba(249,115,22,0.48)", "rgba(219,39,119,0.48)", "#3a0f2e", "#3d160f", "#180508") },
  { id: "4", title: "Verde água",     swatch: "linear-gradient(135deg,#10b981,#22d3ee)", bg: bg("rgba(16,185,129,0.52)", "rgba(34,211,238,0.48)", "rgba(13,148,136,0.50)", "#06251f", "#073042", "#04120f") },
  { id: "5", title: "Índigo",         swatch: "linear-gradient(135deg,#6366f1,#8b5cf6)", bg: bg("rgba(99,102,241,0.55)", "rgba(139,92,246,0.48)", "rgba(79,70,229,0.50)", "#120f3a", "#1a1250", "#070518") },
  { id: "6", title: "Fogo",           swatch: "linear-gradient(135deg,#f59e0b,#ef4444)", bg: bg("rgba(245,158,11,0.50)", "rgba(239,68,68,0.48)", "rgba(217,119,6,0.48)", "#2e1608", "#3a0f0f", "#180705") },
];

/** Relógio do celular no horário de Brasília. */
function StatusClock() {
  const [hora, setHora] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const tick = () => setHora(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  // Vazio no servidor: evita divergência de hidratação.
  return <span className="sb-time">{hora || " "}</span>;
}

export function PhonePreview({
  name,
  city,
  username,
  bio,
  themeId,
  songs,
  photoUrl,
}: {
  name: string;
  city: string;
  username: string;
  bio: string;
  themeId: string;
  songs: StoreSong[];
  photoUrl?: string | null;
}) {
  const theme = PHONE_THEMES.find((t) => t.id === themeId) ?? PHONE_THEMES[0];
  const iniciais = name.trim().slice(0, 2).toUpperCase() || "SS";

  return (
    <div className="phone-mockup">
      <span className="phone-btn phone-btn-silent" />
      <span className="phone-btn phone-btn-volup" />
      <span className="phone-btn phone-btn-voldn" />
      <span className="phone-btn phone-btn-power" />

      <div className="phone-inner">
        <div className="phone-camera" />
        <div className="phone-glass" />

        <div className="phone-statusbar">
          <StatusClock />
          <div className="sb-icons">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="#fff" aria-hidden="true">
              <rect x="0" y="7.5" width="3.1" height="4.5" rx="1" />
              <rect x="4.9" y="5" width="3.1" height="7" rx="1" />
              <rect x="9.9" y="2.5" width="3.1" height="9.5" rx="1" />
              <rect x="14.9" y="0" width="3.1" height="12" rx="1" />
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="#fff" aria-hidden="true">
              <path d="M8 2.4c2.55 0 4.87.98 6.6 2.58a.6.6 0 0 1 .03.86l-.63.66a.58.58 0 0 1-.82.02A8.06 8.06 0 0 0 8 4.35 8.06 8.06 0 0 0 2.82 6.52a.58.58 0 0 1-.82-.02l-.63-.66a.6.6 0 0 1 .03-.86A9.55 9.55 0 0 1 8 2.4z" />
              <path d="M8 5.85c1.53 0 2.92.59 3.96 1.55a.6.6 0 0 1 .03.86l-.67.7a.57.57 0 0 1-.8.02A3.62 3.62 0 0 0 8 8.05c-.94 0-1.8.33-2.48.93a.57.57 0 0 1-.8-.02l-.67-.7a.6.6 0 0 1 .03-.86A5.83 5.83 0 0 1 8 5.85z" />
              <path d="M8 9.15c.86 0 1.55.7 1.55 1.55 0 .17-.14.3-.3.3H6.75a.3.3 0 0 1-.3-.3c0-.85.69-1.55 1.55-1.55z" />
            </svg>
            <svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden="true">
              <rect x="0.5" y="0.5" width="22" height="12" rx="3.6" stroke="#fff" strokeOpacity="0.45" />
              <rect x="2" y="2" width="19" height="9" rx="2.1" fill="#fff" />
              <rect x="23.4" y="4.2" width="1.7" height="4.6" rx="0.85" fill="#fff" fillOpacity="0.5" />
            </svg>
          </div>
        </div>

        <div className="phone-header" style={{ ["--phone-bg" as string]: theme.bg }}>
          <Meteors />

          <div className="phone-appbar">
            <span className="pa-icon pa-left" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </span>
            <span className="phone-brand">STAR SONIC</span>
            <span className="pa-icon pa-right" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
            </span>
          </div>

          <div className="phone-profile">
            <div className="phone-avatar">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>{iniciais}</span>
              )}
            </div>
            <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1.2 }}>
              {name || "Seu nome"}
              <svg className="phone-verified" viewBox="0 0 24 24" aria-label="Perfil verificado">
                <circle cx="12" cy="12" r="10" fill="#22d3ee" />
                <path d="M8 12.4l2.6 2.6 5.2-5.6" fill="none" stroke="#05081f" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 2 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                <path d="M12 21s-6-5.686-6-10a6 6 0 1112 0c0 4.314-6 10-6 10z" />
                <circle cx="12" cy="11" r="2" />
              </svg>
              {city || "Cidade, UF"}
            </p>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 10, marginTop: 2 }}>star.so/{username || "voce"}</p>
            {bio && (
              <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 10, lineHeight: 1.4, padding: "4px 8px 0" }}>{bio}</p>
            )}

            <div className="phone-stats">
              <span><b>—</b> vendas</span>
              <span className="dot" />
              <span><b>—</b> fãs</span>
              <span className="dot" />
              <span><span className="star">★</span> <b>—</b></span>
            </div>

            <button type="button" className="phone-follow">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Seguir
            </button>
          </div>
        </div>

        <div className="phone-songs" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 4px" }}>
            <p style={{ color: "#64748b", fontSize: 9, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
              Músicas à venda
            </p>
            <span style={{ color: "#22d3ee", fontSize: 9, fontWeight: 700, background: "rgba(34,211,238,0.1)", padding: "1px 6px", borderRadius: 999 }}>
              {songs.length}
            </span>
          </div>

          {songs.length === 0 ? (
            <div className="phone-empty">
              Nenhuma música à venda ainda.
              <br />
              Publique uma criação no Catálogo à venda.
            </div>
          ) : (
            songs.map((s) => (
              <div key={s.id} className="phone-info">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 4,
                    flexShrink: 0,
                    background: `linear-gradient(135deg, ${s.gradientFrom}, ${s.gradientTo})`,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#fff", fontSize: 10, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.title}
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: 9 }}>
                    {(s.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="phone-navbar">
          <button type="button" className="nav-btn" aria-label="Voltar">
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round">
              <path d="M12.6 4 L5.2 10 L12.6 16 Z" />
            </svg>
          </button>
          <button type="button" className="nav-btn" aria-label="Início">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.7">
              <circle cx="10" cy="10" r="6.6" />
            </svg>
          </button>
          <button type="button" className="nav-btn" aria-label="Recentes">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.7">
              <rect x="3.8" y="3.8" width="12.4" height="12.4" rx="1.6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
