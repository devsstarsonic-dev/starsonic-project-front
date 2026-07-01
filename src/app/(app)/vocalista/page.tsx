import Image from "next/image";
import { getProfile } from "@/lib/data";
import { Vocalista } from "@/components/Vocalista";
import { Icon } from "@/components/Icon";

export default async function VocalistaPage() {
  const profile = await getProfile();

  return (
    <>
      {/* suprime scroll do app-main apenas nesta página */}
      <style>{`.app-main:has(.vocalista-section){overflow:hidden!important}`}</style>

      <section className="vocalista-section" style={{ position: "relative", height: "100%", minHeight: "calc(100vh - 56px)", overflow: "hidden", margin: "-24px -32px" }}>

        {/* BACKGROUND IMAGE — de fundo, cobre sem recortar */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image
            src="/images/vocalista.png"
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

        {/* CONTEÚDO — banner + blocos empilhados e centralizados no meio da seção */}
        <div style={{ position: "relative", zIndex: 1, height: "100%", minHeight: "calc(100vh - 56px)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "24px 32px" }}>

          <div style={{ width: "100%", maxWidth: 900, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Hero banner compacto — acima dos blocos */}
            <div style={{
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
              maxWidth: 480,
              alignSelf: "center",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(120,80,255,0.2))",
                border: "1px solid rgba(0,212,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="mic" size={26} style={{ color: "var(--cyan-1)" }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 18, color: "var(--white)", lineHeight: 1.25 }}>
                  Seu banco de <span style={{ color: "var(--cyan-1)" }}>vocais e vozes</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, margin: "4px 0 0" }}>
                  Faça upload do vocal das suas músicas e das vozes (timbres) que você quer usar.
                </p>
              </div>
            </div>

            {/* Blocos Vocais + Vozes — lado a lado */}
            <Vocalista userId={profile?.id ?? null} />
          </div>
        </div>
      </section>
    </>
  );
}
