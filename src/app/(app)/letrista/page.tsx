import { getCreations, getProfile } from "@/lib/data";
import { Letrista } from "@/components/Letrista";
import { Icon } from "@/components/Icon";


export default async function LetristaPage() {
  const [creations, profile] = await Promise.all([getCreations(), getProfile()]);

  const lyrics = creations.filter(
    (c) => c.kind === "lyric" && (!profile || c.profile_id === profile.id),
  );

  return (
    <section className="page" style={{ position: "relative" }}>
      {/* Background fixo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/letrista.png"
        alt=""
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(5,5,26,0.74) 0%, rgba(5,5,26,0.65) 45%, rgba(5,5,26,0.86) 100%)",
        zIndex: 0,
        pointerEvents: "none",
      }} />

      {/* Layout principal */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ paddingBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(120,80,255,0.2))",
              border: "1px solid rgba(0,212,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="lyrics" size={18} style={{ color: "var(--cyan-1)" }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 18, color: "var(--white)", letterSpacing: "0.02em" }}>
                Letrista
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>
                Escreva, salve e transforme letras em música
              </div>
            </div>
          </div>
        </div>

        <Letrista lyrics={lyrics} profileId={profile?.id ?? null} />
      </div>
    </section>
  );
}
