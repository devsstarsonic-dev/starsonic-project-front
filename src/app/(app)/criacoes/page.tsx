import Link from "next/link";
import { getCreations } from "@/lib/data";
import { kindLabel } from "@/lib/format";
import { CreationPlayButton } from "@/components/CreationPlayButton";
import { CreationMenu } from "@/components/CreationMenu";
import { Icon, type IconName } from "@/components/Icon";
import StatusDot from "@/components/StatusDot";

// Mesma formatação de data da tabela do dashboard.
function formatCreationDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  if (diffDays === 0) return `Hoje, ${hh}:${mm}`;
  if (diffDays === 1) return `Ontem, ${hh}:${mm}`;
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}

function Badge({ label, color, bg, icon }: { label: string; color: string; bg: string; icon?: IconName }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: bg, color, padding: "1px 7px", borderRadius: 100, fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
      {icon && <Icon name={icon} size={10} />}
      {label}
    </span>
  );
}

// Abas de filtro com ícone azul.
const TABS: { icon: IconName; label: string; key: "todas" | "musicas" | "letras" | "videos" | "favoritas" | "processo" }[] = [
  { icon: "music", label: "Todas", key: "todas" },
  { icon: "guitar", label: "Músicas", key: "musicas" },
  { icon: "lyrics", label: "Letras", key: "letras" },
  { icon: "film", label: "Vídeos", key: "videos" },
  { icon: "star", label: "Favoritas", key: "favoritas" },
  { icon: "clock", label: "Em processo", key: "processo" },
];

export default async function CriacoesPage() {
  const creations = await getCreations();
  const processing = creations.filter((c) => c.status === "processing");
  const done = creations.filter((c) => c.status !== "processing");

  const total = creations.length;
  const musicas = creations.filter((c) => c.kind === "music").length;
  const favoritas = creations.filter((c) => c.is_favorite).length;
  const videos = creations.filter((c) => c.kind === "video").length;
  const letras = creations.filter((c) => c.kind === "lyric").length;

  const counts: Record<string, number> = {
    todas: total,
    musicas,
    letras,
    videos,
    favoritas,
    processo: processing.length,
  };

  const stats = [
    { label: "TOTAL", value: total, color: "var(--cyan-1)", sub: "criações" },
    { label: "MÚSICAS", value: musicas, color: "var(--white)", sub: "2 versões cada" },
    { label: "FAVORITAS", value: favoritas, color: "var(--yellow)", sub: "marcadas" },
    { label: "VÍDEOS", value: videos, color: "var(--purple)", sub: "MP4 gerados" },
    { label: "LETRAS", value: letras, color: "var(--green)", sub: "escritas" },
  ];

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <span className="badge cyan" style={{ marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="folder" size={11} /> BIBLIOTECA PESSOAL · PRIVADO
          </span>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="palette" size={22} style={{ color: "var(--cyan-1)" }} /> Minhas Criações
          </div>
          <div className="page-sub">Tudo que você criou — músicas, vídeos, letras, podcasts e capas. Organizado em um só lugar.</div>
        </div>
        <Link href="/criar-musica" className="btn-primary"><Icon name="plus" size={15} /> Nova criação</Link>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        {stats.map((s) => (
          <div className="card-glow" style={{ padding: "14px 16px" }} key={s.label}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 28, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ABAS / FILTROS */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border-soft)", flexWrap: "wrap", alignItems: "center" }}>
        {TABS.map((t, i) => (
          <button key={t.key} className={`btn-pill${i === 0 ? " active" : ""}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name={t.icon} size={13} style={{ color: "var(--cyan-1)" }} /> {t.label} ({counts[t.key]})
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <select className="input-base" style={{ padding: "6px 12px", fontSize: 12, width: "auto" }}>
            <option>Mais recentes</option>
            <option>Mais antigas</option>
            <option>Por gênero</option>
          </select>
        </div>
      </div>

      {/* EM PROCESSO */}
      {processing.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "var(--orange)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
            <Icon name="clock" size={12} style={{ color: "var(--cyan-1)" }} /> EM PROCESSO
          </h3>
          {processing.map((c) => (
            <div key={c.id} className="card-glow" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, borderColor: "rgba(251, 146, 60, 0.3)", background: "linear-gradient(180deg, rgba(251, 146, 60, 0.08), rgba(22, 22, 77, 0.7))" }}>
              <div style={{ position: "relative", width: 48, height: 48, background: "var(--bg-card-2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--cyan-1)" }}>
                <div style={{ position: "absolute", inset: 0, border: "2px solid var(--orange)", borderTopColor: "transparent", borderRadius: 10, animation: "spin 1.2s linear infinite" }} />
                <Icon name="music" size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "var(--white)", fontSize: 14, marginBottom: 3 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>{c.genre} · {c.duration} · processando...</div>
                <div style={{ height: 4, background: "var(--bg-card)", borderRadius: 100, marginTop: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "var(--orange)", width: `${c.progress}%`, borderRadius: 100 }} />
                </div>
              </div>
              <span style={{ background: "rgba(251, 146, 60, 0.12)", color: "var(--orange)", padding: "4px 10px", borderRadius: 100, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>EM ANDAMENTO</span>
            </div>
          ))}
        </div>
      )}

      {/* FINALIZADAS */}
      <div>
          <table className="music-table">
            <thead className="music-table-head">
              <tr>
                <th style={{ paddingLeft: 20, width: 56 }}></th>
                <th style={{ width: 40 }}></th>
                <th>Nome</th>
                <th>Gênero</th>
                <th>Criada em</th>
                <th>Status</th>
                <th style={{ width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {done.map((c) => (
                <tr key={c.id} className="music-table-row">
                  {/* Thumbnail */}
                  <td style={{ paddingLeft: 20 }}>
                    <div
                      className="music-thumb"
                      style={{
                        color: "#fff",
                        background: c.image_url
                          ? `center / cover url(${c.image_url})`
                          : `linear-gradient(135deg, ${c.gradient_from}, ${c.gradient_to})`,
                      }}
                    >
                      {!c.image_url && <Icon name="music" size={18} />}
                    </div>
                  </td>

                  {/* Play */}
                  <td>
                    <CreationPlayButton creation={c} round />
                  </td>

                  {/* Nome + badges */}
                  <td>
                    <div className="music-title" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      {c.title}
                      {c.is_favorite && <Badge icon="star" label="FAVORITA" color="var(--green)" bg="rgba(34, 197, 94, 0.12)" />}
                      {c.has_video && <Badge icon="film" label="VÍDEO" color="var(--purple)" bg="rgba(168, 85, 247, 0.12)" />}
                      {c.is_public && <Badge icon="globe" label="PÚBLICA" color="var(--cyan-1)" bg="rgba(0, 212, 255, 0.12)" />}
                    </div>
                    <div className="music-version">{kindLabel(c.kind)}</div>
                  </td>

                  {/* Gênero */}
                  <td>
                    <span className="music-genre">{c.genre || "—"}</span>
                  </td>

                  {/* Data */}
                  <td>
                    <span className="music-date">{formatCreationDate(c.created_at)}</span>
                  </td>

                  {/* Status */}
                  <td>
                    <StatusDot status={c.status} />
                  </td>

                  {/* Menu */}
                  <td>
                    <CreationMenu creation={c} round />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: "center", marginTop: 20 }}>
          <button className="btn-pill">Carregar mais criações</button>
        </div>
      </div>

      {/* AÇÕES EM MASSA */}
      <div style={{ background: "rgba(0, 212, 255, 0.04)", border: "1px solid var(--border-soft)", borderRadius: 12, padding: "14px 18px", marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="bulb" size={22} style={{ color: "var(--cyan-1)" }} />
          <div>
            <div style={{ fontWeight: 700, color: "var(--white)", fontSize: 13 }}>Compartilhe suas criações</div>
            <div style={{ fontSize: 11, color: "var(--text-2)" }}>
              Torne públicas e elas aparecerão no <Link href="/catalogo" style={{ color: "var(--cyan-1)", fontWeight: 700 }}>Catálogo da Comunidade</Link>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-pill" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="folder" size={14} style={{ color: "var(--cyan-1)" }} /> Exportar todas</button>
          <Link href="/distribuicao" className="btn-primary"><Icon name="rocket" size={15} /> Distribuir</Link>
        </div>
      </div>
    </section>
  );
}
