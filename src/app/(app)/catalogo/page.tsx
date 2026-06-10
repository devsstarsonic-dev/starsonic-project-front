import Link from "next/link";
import { getCatalogSongs } from "@/lib/data";
import { formatPlays, timeAgo } from "@/lib/format";

export default async function CatalogoPage() {
  const songs = await getCatalogSongs();
  const trending = songs.filter((s) => s.is_trending);
  const recommended = songs.filter((s) => !s.is_trending);

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <span className="badge" style={{ background: "rgba(34, 197, 94, 0.12)", borderColor: "rgba(34, 197, 94, 0.3)", color: "var(--green)", marginBottom: 6, display: "inline-block" }}>🌍 DESCOBRIR · PÚBLICO</span>
          <div className="page-title">🎵 Catálogo da Comunidade</div>
          <div className="page-sub">Descubra músicas criadas por outros artistas da plataforma. Inspire-se, ouça, curta.</div>
        </div>
        <button className="btn-pill">🔍 Buscar artistas</button>
      </div>

      {/* FILTROS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn-pill active">🔥 Em alta</button>
          <button className="btn-pill">🆕 Recentes</button>
          <button className="btn-pill">⭐ Mais curtidas</button>
          <button className="btn-pill">🎯 Pra você</button>
        </div>
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          <select className="input-base" style={{ padding: "6px 12px", fontSize: 12, width: "auto" }}>
            <option>Todos os gêneros</option>
            <option>Sertanejo</option>
            <option>Pop</option>
            <option>Gospel</option>
            <option>Funk</option>
            <option>MPB</option>
          </select>
          <select className="input-base" style={{ padding: "6px 12px", fontSize: 12, width: "auto" }}>
            <option>Esta semana</option>
            <option>Este mês</option>
            <option>Todos os tempos</option>
          </select>
        </div>
      </div>

      {/* DESTAQUES */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--white)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>🔥 Em alta esta semana</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {trending.map((s) => (
            <div key={s.id} className="card-glow" style={{ padding: 14, cursor: "pointer" }}>
              <div style={{ position: "relative", aspectRatio: "1", borderRadius: 10, background: `linear-gradient(135deg, ${s.gradient_from}, ${s.gradient_to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, marginBottom: 10 }}>
                {s.emoji}
                <button style={{ position: "absolute", bottom: 8, right: 8, width: 36, height: 36, borderRadius: "50%", background: "var(--white)", color: "var(--bg-deep)", border: "none", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>▶</button>
              </div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 13, color: "var(--white)", marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>{s.artist} · {s.genre}</div>
              <div style={{ display: "flex", gap: 8, fontSize: 10, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                <span>▶ {formatPlays(s.plays)}</span>
                <span>⭐ {s.likes}</span>
                <span>🔗 {s.shares}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECOMENDADAS */}
      <div>
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--white)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>🎯 Recomendadas pra você</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recommended.map((s) => (
            <div key={s.id} className="card-glow" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: `linear-gradient(135deg, ${s.gradient_from}, ${s.gradient_to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{s.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "var(--white)", fontSize: 13 }}>{s.title} · {s.artist}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{s.genre}{s.duration ? ` · ${s.duration}` : ""}</div>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>▶ {formatPlays(s.plays)}</div>
              <button className="btn-pill" style={{ padding: "6px 12px" }}>▶ Ouvir</button>
              <button className="btn-pill" style={{ padding: "6px 12px" }}>⭐ Curtir</button>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button className="btn-pill">Ver mais músicas da comunidade</button>
        </div>
      </div>

      <div style={{ background: "rgba(0, 212, 255, 0.05)", border: "1px solid var(--border-soft)", borderRadius: 12, padding: 16, marginTop: 24, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 28 }}>💡</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "var(--white)", fontSize: 13, marginBottom: 4 }}>Quer aparecer aqui?</div>
          <div style={{ fontSize: 12, color: "var(--text-2)" }}>
            Torne sua música pública em <Link href="/criacoes" style={{ color: "var(--cyan-1)", fontWeight: 700 }}>Minhas Criações</Link> e ela vai aparecer no catálogo da comunidade.
          </div>
        </div>
        <Link href="/criar-musica" className="btn-primary">+ Criar música</Link>
      </div>
    </section>
  );
}
