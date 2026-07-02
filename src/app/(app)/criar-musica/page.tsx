import dynamic from "next/dynamic";
import Image from "next/image";
import React from "react";
import type { ReactNode } from "react";

const ModoCard = dynamic(() => import("@/components/ModoCard"), { ssr: false });

const MODES: { href: string; icon: ReactNode; title: string; tag: string; desc: string; bullets: string[]; featured: boolean; comingSoon: boolean }[] = [
  {
    href: "/compositor?modo=instrumental",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="26" height="26">
        <path fill="currentColor" d="M6.07.402C6.283.236 6.602 0 7.059 0h.031c.39 0 .71.155.922.298C8.225.155 8.543 0 8.934 0h.032c.457 0 .775.236.989.402l.077.06c.19.15.32.252.504.315a19 19 0 0 0 1.24.376l.123.033l.008.002a.5.5 0 0 1 .37.504l-.468 11a.5.5 0 0 1-.334.451l-.01.004l-.046.018a4 4 0 0 0-.717.38c-.417.286-.673.608-.673.938v1a.5.5 0 0 1-1 0v-1c0-.855.635-1.44 1.11-1.76c.252-.173.5-.3.685-.386h.002l.438-10.3l-.098-.029c-.279-.08-.64-.188-.955-.297c-.353-.122-.62-.334-.802-.479l-.067-.053c-.2-.157-.283-.19-.375-.19a.7.7 0 0 0-.386.142a1 1 0 0 0-.164.144l-.005.005a.5.5 0 0 1-.382.177h-.032a.5.5 0 0 1-.382-.177l-.004-.005l-.032-.033c-.03-.03-.076-.07-.133-.11A.7.7 0 0 0 7.06.987c-.091 0-.173.035-.375.191l-.067.053c-.181.144-.448.357-.802.48c-.315.108-.676.216-.955.296l-.098.028l.438 10.3l.003.001c.184.085.433.214.685.386c.473.324 1.11.908 1.11 1.76v1a.5.5 0 0 1-1 0v-1c0-.33-.256-.652-.673-.938a4 4 0 0 0-.764-.398l-.01-.004a.5.5 0 0 1-.334-.451l-.469-11a.5.5 0 0 1 .371-.504l.131-.035l.336-.095c.273-.078.615-.18.905-.28c.182-.064.313-.166.504-.316l.077-.06zM13.4 4.77a.5.5 0 0 1-.414-.492v-.56c0-.243.174-.45.414-.492l1.29-.227c.39 0 .39 2 0 2l-1.29-.227zm-.6 2.51c0 .243.174.45.414.492l1.29.227c.39 0 .39-2 0-2l-1.29.227a.5.5 0 0 0-.414.492v.56zm.1 3.52a.5.5 0 0 1-.414-.492v-.56c0-.243.174-.45.414-.492l1.29-.227c.39 0 .39 2 0 2l-1.29-.227zM1.29 5l1.29-.227a.5.5 0 0 0 .414-.492v-.56a.5.5 0 0 0-.414-.492l-1.29-.227c-.39 0-.39 2 0 2zm1.5 2.77l-1.29.227c-.39 0-.39-2 0-2l1.29.227a.5.5 0 0 1 .414.492v.56c0 .243-.174.45-.414.492zm.3 3.03l-1.29.227c-.39 0-.39-2 0-2l1.29.227a.5.5 0 0 1 .414.492v.56c0 .243-.174.45-.414.492z" />
        <path fill="currentColor" d="M6.48 4a.5.5 0 0 1 .518.481l.3 6a.5.5 0 1 1-.999.037l-.3-6A.5.5 0 0 1 6.48 4M9 4.48a.5.5 0 0 1 .999.037l-.3 6a.5.5 0 0 1-.999-.037z" />
      </svg>
    ),
    title: "Instrumental",
    tag: "6 PERGUNTAS · 1 MIN",
    desc: "Produza trilhas sem vocal. Ideal para vídeos, podcasts e ambientação.",
    bullets: ["Sem letra, foco no arranjo", "Escolha de instrumentos livres", "Exportação sem voz"],
    featured: false,
    comingSoon: true,
  },
  {
    href: "/compositor?modo=jingle",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="112,176 112,336 192,336 320,432 320,80 192,176" fill="none"/>
        <path d="M368,176 C400,204 420,229 420,256 C420,283 400,308 368,336" fill="none"/>
        <path d="M416,128 C464,164 492,208 492,256 C492,304 464,348 416,384" fill="none"/>
      </svg>
    ),
    title: "Jingle Comercial",
    tag: "8 PERGUNTAS · 2 MIN",
    desc: "Crie jingles memoráveis para marcas, produtos e campanhas publicitárias.",
    bullets: ["Focado em identidade de marca", "Versões curtas (15s, 30s, 60s)", "Letras com slogan integrado"],
    featured: false,
    comingSoon: true,
  },
  {
    href: "/compositor",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26">
        <path fill="currentColor" fillRule="evenodd" d="M8.544 1.056a3 3 0 0 1-3 3v1a3 3 0 0 1 3 3h1a3 3 0 0 1 3-3v-1a3 3 0 0 1-3-3zm-4.1 7.056v1.944H6.39v2H4.445V14h-2v-1.944H.5v-2h1.944V8.112zm4.579 1.444v5.979a4 4 0 1 0 2 3.465v-8.28l10-3.333v5.148a4 4 0 1 0 2 3.465V1.113l-8.979 2.992v2.451h-1.5a1.5 1.5 0 0 0-1.5 1.5v1.5z" clipRule="evenodd" />
      </svg>
    ),
    title: "Modo Studio",
    tag: "15 PERGUNTAS · 3 MIN",
    desc: "Controle total. Defina voz, instrumentos, restrições e palavras obrigatórias.",
    bullets: ["15 perguntas em 4 etapas", "Letra editável antes de gerar", "6 idiomas suportados"],
    featured: true,
    comingSoon: false,
  },
];

const EXTRAS: { icon: React.ReactNode; title: string; cost: string; color: string }[] = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="16" height="16" rx="2" />
        <path d="m22 8-4 4 4 4V8Z" />
      </svg>
    ),
    title: "Gerar Vídeo MP4", cost: "⚡ 10 créditos", color: "var(--cyan-1)",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
      </svg>
    ),
    title: "Tentar em 5 Estilos", cost: "⚡ 375 créditos", color: "var(--cyan-1)",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
      </svg>
    ),
    title: "Editar Música", cost: "⚡ 75 créditos", color: "var(--cyan-1)",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    title: "Link Compartilhável", cost: "⚡ Grátis", color: "var(--green)",
  },
];

export default function CriarMusicaPage() {
  return (
    <>
      {/* suprime scroll do app-main apenas nesta página */}
      <style>{`.app-main:has(.criar-musica-section){overflow:hidden!important}`}</style>

    <section className="criar-musica-section" style={{ position: "relative", height: "100%", minHeight: "calc(100vh - 56px)", overflow: "hidden", margin: "-24px -32px" }}>

      {/* BACKGROUND IMAGE */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image
          src="/images/criar-musica.jpeg"
          alt=""
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(10,10,46,0.72) 0%, rgba(10,10,46,0.45) 40%, rgba(10,10,46,0.62) 80%, rgba(10,10,46,0.88) 100%)",
        }} />
      </div>

      {/* CONTEÚDO */}
      <div style={{ position: "relative", zIndex: 1, padding: "150px 32px 32px" }}>

        {/* TÍTULO */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="page-title" style={{ marginBottom: 8 }}>Criar Música</div>
        </div>

        {/* CARDS — centralizados, largura contida */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 280px))",
          gap: 16,
          justifyContent: "center",
          marginBottom: 28,
        }}>
          {MODES.map((m, i) => (
            <ModoCard
              key={m.href}
              index={i}
              href={m.href}
              icon={m.icon}
              title={m.title}
              tag={m.tag}
              desc={m.desc}
              bullets={m.bullets}
              featured={m.featured}
              comingSoon={m.comingSoon}
            />
          ))}
        </div>

        {/* FEATURES EXTRAS */}
        <div style={{
          maxWidth: 860,
          margin: "0 auto 20px",
          background: "rgba(10,10,46,0.65)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0,197,228,0.15)",
          borderRadius: 16,
          padding: "18px 22px",
        }}>
          <h4 style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 13, color: "var(--white)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2l6.5-6.5" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            </svg>
            Depois de gerar sua música você pode:
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {EXTRAS.map((e) => (
              <div key={e.title} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ color: e.color, flexShrink: 0, display: "flex" }}>{e.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--white)" }}>{e.title}</div>
                  <div style={{ fontSize: 10, color: e.color, fontFamily: "'JetBrains Mono', monospace" }}>{e.cost}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RODAPÉ INFO */}
        <div style={{
          maxWidth: 860,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          background: "rgba(0,197,228,0.06)",
          borderRadius: 10,
          border: "1px solid rgba(0,197,228,0.15)",
          backdropFilter: "blur(8px)",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00c5e4" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span style={{ fontSize: 12, color: "var(--text-2)" }}>
            Cada composição entrega <b style={{ color: "#00c5e4" }}>2 versões</b>. Tempo médio: 2-3 minutos. Composição em <b style={{ color: "#00c5e4" }}>6 idiomas</b>: PT · EN · ES · FR · IT · DE
          </span>
        </div>
      </div>
    </section>
    </>
  );
}
