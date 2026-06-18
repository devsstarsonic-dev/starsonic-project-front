import Link from "next/link";
import { getCreations } from "@/lib/data";
import { timeAgo, kindIcon, kindLabel } from "@/lib/format";
import { CreationPlayButton } from "@/components/CreationPlayButton";
import type { Creation } from "@/lib/types";

function downloadHref(c: Creation): string {
  return `/api/criar-musica/download?url=${encodeURIComponent(c.audio_url)}&title=${encodeURIComponent(c.title)}`;
}

function metaLine(c: Creation): string {
  const parts: string[] = [`${kindIcon(c.kind)} ${kindLabel(c.kind)}`];
  if (c.genre) parts.push(c.genre);
  if (c.kind === "lyric" && c.words) parts.push(`${c.words} palavras`);
  if (c.duration) parts.push(c.duration);
  if (c.resolution) parts.push(c.resolution);
  parts.push(timeAgo(c.created_at));
  return parts.join(" · ");
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ background: bg, color, padding: "1px 7px", borderRadius: 100, fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
      {label}
    </span>
  );
}

function actions(c: Creation) {
  const pill = { padding: "6px 10px" } as const;
  if (c.kind === "lyric")
    return (
      <>
        <button className="btn-pill" style={pill}>👁 Ler</button>
        <Link href="/criar-musica" className="btn-pill" style={pill}>🎵 Compor música</Link>
        <button className="btn-pill" style={pill}>⋯</button>
      </>
    );
  if (c.kind === "video")
    return (
      <>
        <button className="btn-pill" style={pill}>▶ Ver</button>
        <button className="btn-pill" style={pill}>⬇ MP4</button>
        <button className="btn-pill" style={pill}>⋯</button>
      </>
    );
  if (c.kind === "cover")
    return (
      <>
        <button className="btn-pill" style={pill}>👁 Ver</button>
        <button className="btn-pill" style={pill}>⬇ PNG</button>
        <button className="btn-pill" style={pill}>⋯</button>
      </>
    );
  if (c.kind === "podcast")
    return (
      <>
        <CreationPlayButton creation={c} />
        {c.audio_url && <a href={downloadHref(c)} className="btn-pill" style={pill}>⬇ MP3</a>}
        <button className="btn-pill" style={pill}>⋯</button>
      </>
    );
  return (
    <>
      <CreationPlayButton creation={c} />
      {c.audio_url && <a href={downloadHref(c)} className="btn-pill" style={pill}>⬇ MP3</a>}
      <button className="btn-pill" style={pill}>⭐</button>
      <button className="btn-pill" style={pill}>⋯</button>
    </>
  );
}

export default async function CriacoesPage() {
  const creations = await getCreations();
  const processing = creations.filter((c) => c.status === "processing");
  const done = creations.filter((c) => c.status !== "processing");

  const total = creations.length;
  const musicas = creations.filter((c) => c.kind === "music").length;
  const favoritas = creations.filter((c) => c.is_favorite).length;
  const videos = creations.filter((c) => c.kind === "video").length;
  const letras = creations.filter((c) => c.kind === "lyric").length;

  const stats = [
    { label: "TOTAL", value: total, color: "var(--cyan-1)", sub: "criações" },
    { label: "MÚSICAS", value: musicas, color: "var(--white)", sub: "2 versões cada" },
    { label: "FAVORITAS", value: favoritas, color: "var(--yellow)", sub: "⭐ marcadas" },
    { label: "VÍDEOS", value: videos, color: "var(--purple)", sub: "MP4 gerados" },
    { label: "LETRAS", value: letras, color: "var(--green)", sub: "📝 escritas" },
  ];

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <span className="badge cyan" style={{ marginBottom: 6, display: "inline-block" }}>📁 BIBLIOTECA PESSOAL · PRIVADO</span>
          <div className="page-title">🎨 Minhas Criações</div>
          <div className="page-sub">Tudo que você criou — músicas, vídeos, letras, podcasts e capas. Organizado em um só lugar.</div>
        </div>
        <Link href="/criar-musica" className="btn-primary">+ Nova criação</Link>
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
        <button className="btn-pill active">🎵 Todas ({total})</button>
        <button className="btn-pill">🎼 Músicas ({musicas})</button>
        <button className="btn-pill">📝 Letras ({letras})</button>
        <button className="btn-pill">🎬 Vídeos ({videos})</button>
        <button className="btn-pill">⭐ Favoritas ({favoritas})</button>
        <button className="btn-pill">⏳ Em processo ({processing.length})</button>
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
          <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "var(--orange)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>⏳ EM PROCESSO</h3>
          {processing.map((c) => (
            <div key={c.id} className="card-glow" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, borderColor: "rgba(251, 146, 60, 0.3)", background: "linear-gradient(180deg, rgba(251, 146, 60, 0.08), rgba(22, 22, 77, 0.7))" }}>
              <div style={{ position: "relative", width: 48, height: 48, background: "var(--bg-card-2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ position: "absolute", inset: 0, border: "2px solid var(--orange)", borderTopColor: "transparent", borderRadius: 10, animation: "spin 1.2s linear infinite" }} />
                <span style={{ fontSize: 20 }}>{c.emoji}</span>
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
        <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>✅ FINALIZADAS</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {done.map((c) => (
            <div key={c.id} className="card-glow" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: c.image_url ? `center / cover url(${c.image_url})` : `linear-gradient(135deg, ${c.gradient_from}, ${c.gradient_to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{!c.image_url && c.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 700, color: "var(--white)", fontSize: 14 }}>{c.title}</div>
                  {c.status === "draft" && <Badge label="RASCUNHO" color="var(--orange)" bg="rgba(251, 146, 60, 0.12)" />}
                  {c.is_favorite && <Badge label="⭐ FAVORITA" color="var(--green)" bg="rgba(34, 197, 94, 0.12)" />}
                  {c.has_video && <Badge label="🎬 COM VÍDEO" color="var(--purple)" bg="rgba(168, 85, 247, 0.12)" />}
                  {c.is_public && <Badge label="🌍 PÚBLICA" color="var(--cyan-1)" bg="rgba(0, 212, 255, 0.12)" />}
                  {!c.is_favorite && !c.has_video && !c.is_public && c.status !== "draft" && c.badge_label && (
                    <Badge label={c.badge_label} color="var(--cyan-1)" bg="rgba(0, 212, 255, 0.12)" />
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>{metaLine(c)}</div>
              </div>
              {actions(c)}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button className="btn-pill">Carregar mais criações</button>
        </div>
      </div>

      {/* AÇÕES EM MASSA */}
      <div style={{ background: "rgba(0, 212, 255, 0.04)", border: "1px solid var(--border-soft)", borderRadius: 12, padding: "14px 18px", marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>💡</span>
          <div>
            <div style={{ fontWeight: 700, color: "var(--white)", fontSize: 13 }}>Compartilhe suas criações</div>
            <div style={{ fontSize: 11, color: "var(--text-2)" }}>
              Torne públicas e elas aparecerão no <Link href="/catalogo" style={{ color: "var(--cyan-1)", fontWeight: 700 }}>Catálogo da Comunidade</Link>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-pill">📁 Exportar todas</button>
          <Link href="/distribuicao" className="btn-primary">🚀 Distribuir</Link>
        </div>
      </div>
    </section>
  );
}
