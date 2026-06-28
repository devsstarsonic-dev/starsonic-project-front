import Link from "next/link";
import { getAllCreations } from "@/lib/data";
import { formatPlays, timeAgo } from "@/lib/format";
import { CreationPlayButton } from "@/components/CreationPlayButton";
import { Icon } from "@/components/Icon";

export default async function CatalogoPage() {
  const songs = await getAllCreations();
  const trending = [...songs].sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0)).slice(0, 8);

  const author = (s: (typeof songs)[number]) => s.profiles?.full_name || "Artista";

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <span className="badge cyan" style={{ marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="globe" size={11} /> DESCOBRIR · PÚBLICO
          </span>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="music" size={22} style={{ color: "var(--cyan-1)" }} /> Explorar
          </div>
          <div className="page-sub">Todas as músicas criadas pela comunidade. Ouça e inspire-se.</div>
        </div>
        <Link href="/criar-musica" className="btn-primary"><Icon name="plus" size={15} /> Criar música</Link>
      </div>

      {songs.length === 0 ? (
        <div className="card-glow" style={{ padding: 32, textAlign: "center", color: "var(--text-2)" }}>
          Ainda não há músicas na comunidade. Seja o primeiro a criar!
        </div>
      ) : (
        <>
          {/* EM ALTA */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--white)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="bolt" size={16} style={{ color: "var(--cyan-1)" }} /> Em alta
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              {trending.map((s) => (
                <div key={s.id} className="card-glow" style={{ padding: 14 }}>
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      borderRadius: 10,
                      overflow: "hidden",
                      color: "#fff",
                      background: s.image_url ? `center / cover url(${s.image_url})` : `linear-gradient(135deg, ${s.gradient_from}, ${s.gradient_to})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 10,
                    }}
                  >
                    {!s.image_url && <Icon name="music" size={42} />}
                    <div style={{ position: "absolute", bottom: 8, right: 8 }}>
                      <CreationPlayButton creation={s} round />
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 13, color: "var(--white)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{author(s)}{s.genre ? ` · ${s.genre}` : ""}</div>
                  <div style={{ display: "flex", gap: 8, fontSize: 10, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Icon name="play" size={10} /> {formatPlays(s.plays ?? 0)}</span>
                    <span>{timeAgo(s.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TODAS */}
          <div>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--white)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="library" size={16} style={{ color: "var(--cyan-1)" }} /> Todas as criações ({songs.length})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {songs.map((s) => (
                <div key={s.id} className="card-glow" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      flexShrink: 0,
                      color: "#fff",
                      background: s.image_url ? `center / cover url(${s.image_url})` : `linear-gradient(135deg, ${s.gradient_from}, ${s.gradient_to})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {!s.image_url && <Icon name="music" size={18} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "var(--white)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title} · {author(s)}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{s.genre || "—"}{s.duration ? ` · ${s.duration}` : ""} · {timeAgo(s.created_at)}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <Icon name="play" size={11} /> {formatPlays(s.plays ?? 0)}
                  </div>
                  <CreationPlayButton creation={s} round />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
