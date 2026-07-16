import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SuaVozTab } from "@/components/Vocalista/SuaVozTab";
import { VozesArtistaTab } from "@/components/Vocalista/VozesArtistaTab";

type Aba = "sua-voz" | "artistas";

// A aba padrão é "Vozes de Artista": é a que está disponível no MVP.
// "Sua Voz" é o placeholder da V2 e não deve ser a primeira coisa que o usuário vê.
export default async function VocalistaPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const { aba } = await searchParams;
  const active: Aba = aba === "sua-voz" ? "sua-voz" : "artistas";

  return (
    <section className="vocalista-section" style={{ position: "relative", minHeight: "calc(100vh - 56px)" }}>
      {/* Fundo da seção — cobre sem recortar */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image
          src="https://pub-c0844d8534c94020b91073881d016491.r2.dev/imgs/vocalista.png"
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
              "linear-gradient(to bottom, rgba(10,10,46,0.78) 0%, rgba(10,10,46,0.62) 40%, rgba(10,10,46,0.78) 80%, rgba(10,10,46,0.94) 100%)",
          }}
        />
      </div>

      <div
        className="vocalista-hero"
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Hero banner compacto */}
        <div
          style={{
            background: "rgba(8,10,36,0.72)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(0,212,255,0.18)",
            borderRadius: 16,
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            gap: 18,
            boxShadow: "0 6px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
            maxWidth: 560,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              flexShrink: 0,
              background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(120,80,255,0.2))",
              border: "1px solid rgba(0,212,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="mic" size={26} style={{ color: "var(--cyan-1)" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: "var(--white)",
                lineHeight: 1.25,
              }}
            >
              Seu banco de <span style={{ color: "var(--cyan-1)" }}>vozes</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, margin: "4px 0 0" }}>
              Crie coleções de vozes pra usar nas suas músicas: clone da sua própria voz ou vozes de
              artistas fictícios.
            </p>
          </div>
        </div>

        {/* Abas */}
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: 4,
            borderRadius: 12,
            background: "rgba(8,10,36,0.72)",
            border: "1px solid var(--border-soft)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <TabLink href="/vocalista?aba=sua-voz" active={active === "sua-voz"} icon="mic" label="Sua Voz">
            <span className="badge" style={{ fontSize: 8, padding: "2px 6px" }}>
              EM BREVE
            </span>
          </TabLink>
          <TabLink href="/vocalista" active={active === "artistas"} icon="music" label="Vozes de Artista" />
        </div>

        <div style={{ width: "100%", maxWidth: 1040 }}>
          {active === "sua-voz" ? <SuaVozTab /> : <VozesArtistaTab />}
        </div>
      </div>
    </section>
  );
}

function TabLink({
  href,
  active,
  icon,
  label,
  children,
}: {
  href: string;
  active: boolean;
  icon: "mic" | "music";
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
        color: active ? "#c084fc" : "var(--text-2)",
        background: active
          ? "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.1))"
          : "transparent",
        border: active ? "1px solid rgba(168,85,247,0.35)" : "1px solid transparent",
      }}
    >
      <Icon name={icon} size={15} />
      {label}
      {children}
    </Link>
  );
}
