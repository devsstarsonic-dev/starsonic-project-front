import Link from "next/link";
import { getAllCreations, getPlaylists, getProfile } from "@/lib/data";
import { formatPlays, timeAgo, slugify } from "@/lib/format";
import { CreationPlayButton } from "@/components/CreationPlayButton";
import { CreatePlaylistButton } from "@/components/playlist/CreatePlaylistButton";
import { PlaylistMenu } from "@/components/playlist/PlaylistMenu";
import { CopyPlaylistLinkButton } from "@/components/playlist/CopyPlaylistLinkButton";
import { StopClick } from "@/components/playlist/StopClick";
import { Icon } from "@/components/Icon";

// Estilo Spotify (dark, content-first) — injetado aqui pois o globals.css é
// reescrito pelo linter. Hover suave (200ms), play verde, cursor-pointer.
const SP_CSS = `
.sp-chips { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:24px; }
.sp-chip { padding:7px 16px; border-radius:999px; font-size:13px; font-weight:600;
  background: var(--bg-card); color: var(--text-1); border:1px solid var(--border-soft); cursor:pointer; transition: all .18s; }
.sp-chip:hover { background: var(--bg-card-2); }
.sp-chip.active { background:#fff; color:#0a0a2e; border-color:#fff; }

.sp-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap:16px; }
.sp-card { position:relative; background: rgba(22,22,77,0.45); border:1px solid transparent; border-radius:12px;
  padding:14px; cursor:pointer; transition: background .2s, border-color .2s; }
.sp-card:hover { background: rgba(29,29,94,0.85); border-color: var(--border-soft); }
.sp-cover { position:relative; aspect-ratio:1; border-radius:8px; overflow:hidden; margin-bottom:12px;
  display:flex; align-items:center; justify-content:center; color:#fff; box-shadow:0 8px 24px rgba(0,0,0,.35); }
.sp-play { position:absolute; right:8px; bottom:8px; opacity:0; transform: translateY(8px); transition: opacity .2s, transform .2s; }
.sp-card:hover .sp-play { opacity:1; transform: translateY(0); }
.sp-menu { position:absolute; top:8px; right:8px; opacity:0; transition: opacity .2s; z-index:2; }
.sp-card:hover .sp-menu { opacity:1; }

/* botão de play estilo Spotify (verde) dentro do catálogo */
.sp-scope .music-play-btn { width:46px; height:46px; background:#0ED8FF; border:none; color:#04130a;
  box-shadow:0 8px 18px rgba(0,0,0,.45); transition: transform .15s, background .15s; }
.sp-scope .music-play-btn:hover { background:#0ED8FF; transform: scale(1.06); color:#04130a; }

.sp-row { display:flex; align-items:center; gap:14px; padding:8px 10px; border-radius:8px; transition: background .15s; }
.sp-row:hover { background: rgba(29,29,94,0.6); }
.sp-lead { width:30px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.sp-idx { color: var(--text-3); font-family:'JetBrains Mono', monospace; font-size:13px; }
.sp-rowplay { display:none; }
.sp-row:hover .sp-idx { display:none; }
.sp-row:hover .sp-rowplay { display:block; }
.sp-row .music-play-btn { width:30px; height:30px; background:transparent; border:none; color:var(--white); box-shadow:none; }
.sp-row .music-play-btn:hover { background:transparent; color:#0ED8FF; transform:none; }
.sp-plchips { display:flex; gap:14px; overflow-x:auto; padding-bottom:6px; }
@media (max-width: 640px){ .sp-grid { grid-template-columns: repeat(auto-fill, minmax(140px,1fr)); } }
`;

export default async function CatalogoPage() {
  const [songs, playlists, profile] = await Promise.all([
    getAllCreations(),
    getPlaylists(),
    getProfile(),
  ]);
  const profileId = profile?.id ?? null;
  const playlistOpts = playlists.map((p) => ({ id: p.id, name: p.name, creationsId: p.creationsId }));
  const trending = [...songs].sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0)).slice(0, 10);
  const author = (s: (typeof songs)[number]) => s.profiles?.full_name || "Artista";

  const cover = (s: (typeof songs)[number], radius = 8): React.CSSProperties => ({
    background: s.image_url ? `center / cover url(${s.image_url})` : `linear-gradient(135deg, ${s.gradient_from}, ${s.gradient_to})`,
    borderRadius: radius,
  });

  return (
    <section className="page sp-scope">
      <style>{SP_CSS}</style>

      {/* Header */}
      <div className="page-title-row">
        <div>
          <span className="badge cyan" style={{ marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="globe" size={11} /> DESCOBRIR · PÚBLICO
          </span>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="music" size={22} style={{ color: "var(--cyan-1)" }} /> Explorar
          </div>
          <div className="page-sub">Ouça a comunidade, monte playlists e descubra novas músicas.</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <CreatePlaylistButton profileId={profileId} />
          <Link href="/criar-musica" className="btn-primary"><Icon name="plus" size={15} /> Criar música</Link>
        </div>
      </div>

      {/* Chips de filtro (visual) */}
      <div className="sp-chips">
        <span className="sp-chip active">Tudo</span>
        <span className="sp-chip">Em alta</span>
        <span className="sp-chip">Recentes</span>
        {playlists.length > 0 && <span className="sp-chip">Playlists</span>}
      </div>

      {/* SUAS PLAYLISTS */}
      {playlists.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--white)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="library" size={16} style={{ color: "var(--cyan-1)" }} /> Suas playlists
          </h3>
          <div className="sp-grid">
            {playlists.map((pl) => {
              const c0 = pl.songs[0];
              return (
                <Link key={pl.id} href={`/playlist/${pl.id}`} className="sp-card" style={{ display: "block", textDecoration: "none" }}>
                  <div
                    className="sp-cover"
                    style={
                      c0
                        ? cover(c0)
                        : { background: "linear-gradient(135deg, var(--cyan-deep), var(--purple))", borderRadius: 8 }
                    }
                  >
                    {!c0?.image_url && <Icon name="library" size={44} />}
                    <div className="sp-menu">
                      <StopClick>
                        <CopyPlaylistLinkButton id={pl.id} />
                      </StopClick>
                    </div>
                    {c0 && (
                      <StopClick className="sp-play">
                        <CreationPlayButton creation={c0} round queue={pl.songs} />
                      </StopClick>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pl.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>{pl.songs.length} música(s)</div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {songs.length === 0 ? (
        <div className="card-glow" style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>
          Ainda não há músicas na comunidade. Seja o primeiro a criar!
        </div>
      ) : (
        <>
          {/* EM ALTA — grade de cards estilo Spotify */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--white)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="bolt" size={16} style={{ color: "var(--cyan-1)" }} /> Em alta
            </h3>
            <div className="sp-grid">
              {trending.map((s) => (
                <Link key={s.id} href={`/song/${slugify(s.title)}`} className="sp-card" style={{ display: "block", textDecoration: "none" }}>
                  <div className="sp-cover" style={cover(s)}>
                    {!s.image_url && <Icon name="music" size={44} />}
                    <div className="sp-menu">
                      <StopClick>
                        <PlaylistMenu creationId={s.id} title={s.title} playlists={playlistOpts} profileId={profileId} />
                      </StopClick>
                    </div>
                    <div className="sp-play">
                      <StopClick>
                        <CreationPlayButton creation={s} round />
                      </StopClick>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--white)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{author(s)}{s.genre ? ` · ${s.genre}` : ""}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* TODAS — lista estilo Spotify */}
          <div>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--white)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="library" size={16} style={{ color: "var(--cyan-1)" }} /> Todas as músicas
            </h3>
            {/* cabeçalho da lista */}
            <div className="sp-row" style={{ borderBottom: "1px solid var(--border-soft)", borderRadius: 0, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              <div className="sp-lead">#</div>
              <div style={{ width: 44 }} />
              <div style={{ flex: 1 }}>Título</div>
              <div style={{ width: 120 }}>Gênero</div>
              <div style={{ width: 70, textAlign: "right" }}>Plays</div>
              <div style={{ width: 36 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 4 }}>
              {songs.map((s, i) => (
                <div key={s.id} className="sp-row">
                  <div className="sp-lead">
                    <span className="sp-idx">{i + 1}</span>
                    <span className="sp-rowplay"><CreationPlayButton creation={s} round /></span>
                  </div>
                  <div style={{ width: 44, height: 44, flexShrink: 0, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", ...cover(s) }}>
                    {!s.image_url && <Icon name="music" size={18} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/song/${slugify(s.title)}`} style={{ fontWeight: 600, color: "var(--white)", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", textDecoration: "none" }}>{s.title}</Link>
                    <div style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{author(s)} · {timeAgo(s.created_at)}</div>
                  </div>
                  <div style={{ width: 120, fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.genre || "—"}</div>
                  <div style={{ width: 70, textAlign: "right", fontSize: 12, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>{formatPlays(s.plays ?? 0)}</div>
                  <div style={{ width: 36, display: "flex", justifyContent: "flex-end" }}>
                    <PlaylistMenu creationId={s.id} title={s.title} playlists={playlistOpts} profileId={profileId} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
