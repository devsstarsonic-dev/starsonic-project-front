"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { metaForPath } from "@/lib/nav";
import { memo } from "react";
import type { Preset } from "@/lib/types";

export type DashStats = {
  totalCreations: number;
  totalPlays: number;
  inCatalog: number;
  royalties: string;
};

const MusicIcon = () => (
  <svg className="panel-stat-icon" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </svg>
);
const PlayIcon = () => (
  <svg className="panel-stat-icon" viewBox="0 0 24 24" fill="none" stroke="var(--cyan-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);
const CatalogIcon = () => (
  <svg className="panel-stat-icon" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M3 12h18M3 18h12" />
  </svg>
);
const DollarIcon = () => (
  <svg className="panel-stat-icon" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const TipIcon = () => (
  <svg className="panel-tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);
const MicIcon = () => (
  <svg className="panel-news-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);
const ImageIcon = () => (
  <svg className="panel-news-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);

function formatPlaysPanel(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function DashboardPanel({ stats }: { stats?: DashStats }) {
  return (
    <div className="panel-section active">
      {/* Resumo */}
      <div className="panel-label" style={{ paddingTop: 4 }}>RESUMO</div>
      <div className="panel-stats-grid">
        <div className="panel-stat-card">
          <div className="panel-stat-top">
            <span className="panel-stat-value">{stats?.totalCreations ?? 0}</span>
            <MusicIcon />
          </div>
          <div className="panel-stat-label">Criações</div>
        </div>
        <div className="panel-stat-card">
          <div className="panel-stat-top">
            <span className="panel-stat-value">{formatPlaysPanel(stats?.totalPlays ?? 0)}</span>
            <PlayIcon />
          </div>
          <div className="panel-stat-label">Total de plays</div>
        </div>
        <div className="panel-stat-card">
          <div className="panel-stat-top">
            <span className="panel-stat-value">{stats?.inCatalog ?? 0}</span>
            <CatalogIcon />
          </div>
          <div className="panel-stat-label">No catálogo</div>
        </div>
        <div className="panel-stat-card">
          <div className="panel-stat-top">
            <span className="panel-stat-value" style={{ fontSize: 14 }}>{stats?.royalties ?? "R$ 0,00"}</span>
            <DollarIcon />
          </div>
          <div className="panel-stat-label">Royalties</div>
        </div>
      </div>

      {/* Dica do dia */}
      <div className="panel-label">DICA DO DIA</div>
      <div className="panel-tip-card">
        <div className="panel-tip-header">
          <TipIcon />
          <span className="panel-tip-title">Dica do dia</span>
        </div>
        <p className="panel-tip-text">
          Use o Letrista antes do Compositor para letras mais consistentes com o
          gênero escolhido.
        </p>
        <button className="panel-tip-btn">Saiba mais</button>
      </div>

      {/* Novidades */}
      <div className="panel-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>NOVIDADES</span>
        <Link href="#" style={{ fontSize: 10, color: "var(--cyan-1)", fontFamily: "Inter", fontWeight: 600, letterSpacing: 0, textTransform: "none" }}>
          Ver tudo
        </Link>
      </div>

      <div className="panel-news-item">
        <div className="panel-news-icon-wrap" style={{ background: "rgba(168,85,247,0.15)" }}>
          <MicIcon />
        </div>
        <div className="panel-news-body">
          <span className="panel-news-badge novo">Novo</span>
          <div className="panel-news-title">Vozes ainda mais realistas</div>
          <div className="panel-news-desc">Nova atualização de modelos de voz já disponível.</div>
        </div>
      </div>

      <div className="panel-news-item">
        <div className="panel-news-icon-wrap" style={{ background: "rgba(0,212,255,0.1)" }}>
          <ImageIcon />
        </div>
        <div className="panel-news-body">
          <span className="panel-news-badge dica">Dica</span>
          <div className="panel-news-title">Combine até 3 imagens</div>
          <div className="panel-news-desc">Use referências visuais para criações ainda melhores.</div>
        </div>
      </div>
    </div>
  );
}

function ContextualPanelComponent({
  presets,
  dashStats,
}: {
  presets: Preset[];
  dashStats?: DashStats;
}) {
  const pathname = usePathname();
  const panel = metaForPath(pathname).panel;

  return (
    <aside className="app-panel">
      {/* DASHBOARD */}
      {panel === "dashboard" && <DashboardPanel stats={dashStats} />}

      {/* CRIAR MÚSICA */}
      {panel === "criar-musica" && (
        <div className="panel-section active">
          <div className="panel-title">Compor</div>
          <div className="panel-sub">Atalho rápido</div>
          <div className="panel-label">PRESETS RECENTES</div>
          {presets.map((p) => (
            <div className="panel-item" key={p.id}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="panel-item-icon">{p.emoji}</span> {p.label}
              </span>
            </div>
          ))}
          <div className="panel-label">FERRAMENTAS</div>
          <Link href="/letrista" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="panel-item-icon">✍️</span> Letrista
            </span>
          </Link>
          <Link href="/cover-studio" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="panel-item-icon">🎨</span> Cover Studio
            </span>
          </Link>
        </div>
      )}

      {/* CATÁLOGO */}
      {panel === "catalogo" && (
        <div className="panel-section active">
          <div className="panel-title">Catálogo</div>
          <div className="panel-sub">Comunidade · descubra</div>
          <input type="text" className="panel-search" placeholder="Buscar..." />
          <div className="panel-label">FILTRAR</div>
          <div className="panel-item active"><span>Em alta</span></div>
          <div className="panel-item"><span>Recentes</span></div>
          <div className="panel-item"><span>Mais curtidas</span></div>
          <div className="panel-item"><span>Pra você</span></div>
          <div className="panel-label">GÊNERO</div>
          <div className="panel-item"><span>Sertanejo</span></div>
          <div className="panel-item"><span>Pop</span></div>
          <div className="panel-item"><span>Gospel</span></div>
          <div className="panel-item"><span>Funk</span></div>
          <div className="panel-item"><span>MPB</span></div>
        </div>
      )}

      {/* CRIAÇÕES */}
      {panel === "criacoes" && (
        <div className="panel-section active">
          <div className="panel-title">Criações</div>
          <div className="panel-sub">Sua biblioteca pessoal</div>
          <input type="text" className="panel-search" placeholder="Buscar..." />
          <div className="panel-label">FERRAMENTA</div>
          <div className="panel-item active"><span>Todas</span></div>
          <div className="panel-item"><span>Músicas</span></div>
          <div className="panel-item"><span>Letras</span></div>
          <div className="panel-item"><span>Vídeos</span></div>
          <div className="panel-item"><span>Capas</span></div>
          <div className="panel-label">STATUS</div>
          <div className="panel-item"><span>Em processo</span></div>
          <div className="panel-item"><span>Finalizadas</span></div>
          <div className="panel-label">ORDENAR</div>
          <div className="panel-item active"><span>Mais recentes</span></div>
          <div className="panel-item"><span>A-Z</span></div>
        </div>
      )}

      {/* SONIC LAB */}
      {panel === "sonic-lab" && (
        <div className="panel-section active">
          <div className="panel-title">Sonic Lab</div>
          <div className="panel-sub">Ferramentas profissionais</div>
          <div className="panel-label">CRIAÇÃO</div>
          <Link href="/compositor" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="panel-item-icon">🎼</span> Compositor</span>
          </Link>
          <Link href="/letrista" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="panel-item-icon">✍️</span> Letrista</span>
          </Link>
          <Link href="/vocalista" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="panel-item-icon">🎤</span> Vocalista</span>
          </Link>
          <Link href="/cover-studio" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="panel-item-icon">🎨</span> Cover Studio</span>
          </Link>
          <div className="panel-label">PRODUÇÃO</div>
          <Link href="/mixer" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="panel-item-icon">🎚️</span> Mixer</span>
            <span className="cnt">soon</span>
          </Link>
        </div>
      )}

      {/* DISTRIBUIÇÃO */}
      {panel === "distribuicao" && (
        <div className="panel-section active">
          <div className="panel-title">Distribuição</div>
          <div className="panel-sub">Em breve · 2026 Q3</div>
          <div className="panel-label">PRINCIPAIS DSPs</div>
          <div className="panel-item"><span>Spotify</span></div>
          <div className="panel-item"><span>Apple Music</span></div>
          <div className="panel-item"><span>YouTube Music</span></div>
          <div className="panel-item"><span>Amazon Music</span></div>
          <div className="panel-item"><span>Deezer</span></div>
          <div className="panel-item"><span>TikTok</span></div>
          <div className="panel-label">OUTRAS</div>
          <div className="panel-item"><span>+ 143 plataformas</span></div>
        </div>
      )}

      {/* PLANOS */}
      {panel === "planos" && (
        <div className="panel-section active">
          <div className="panel-title">Planos</div>
          <div className="panel-sub">Escolha o melhor pra você</div>
          <div className="panel-label">COMPARAR</div>
          <div className="panel-item"><span>Free</span><span className="cnt">R$0</span></div>
          <div className="panel-item"><span>Starter</span><span className="cnt">R$19</span></div>
          <div className="panel-item active"><span>Plus</span><span className="cnt">R$32</span></div>
          <div className="panel-item"><span>Creator</span><span className="cnt">R$54</span></div>
        </div>
      )}

      {/* PERFIL / CONTA */}
      {panel === "perfil" && (
        <div className="panel-section active">
          <div className="panel-title">Minha Conta</div>
          <div className="panel-sub">Gerencie seu perfil</div>
          <div className="panel-label">PERFIL</div>
          <Link href="/meu-perfil" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="panel-item-icon">👤</span> Meu Perfil</span>
          </Link>
          <Link href="/editar-perfil" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="panel-item-icon">✏️</span> Editar Perfil</span>
          </Link>
          <div className="panel-label">CONFIGURAÇÕES</div>
          <Link href="/configuracoes" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="panel-item-icon">⚙️</span> Configurações</span>
          </Link>
          <div className="panel-label">EVOLUIR</div>
          <Link href="/tornar-se-persona" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="panel-item-icon">⭐</span> Tornar-se Artista</span>
            <span className="cnt">NEW</span>
          </Link>
          <Link href="/planos" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="panel-item-icon">💎</span> Upgrade do plano</span>
          </Link>
        </div>
      )}
    </aside>
  );
}

const contextualPanelComparator = (
  prev: { presets: Preset[]; dashStats?: DashStats },
  next: { presets: Preset[]; dashStats?: DashStats }
) => {
  if (prev.presets === next.presets && prev.dashStats === next.dashStats) return true;
  if (prev.dashStats !== next.dashStats) return false;
  if (prev.presets.length !== next.presets.length) return false;
  return prev.presets.every((p, i) => p.id === next.presets[i]?.id);
};

const ContextualPanel = memo(ContextualPanelComponent, contextualPanelComparator);
export default ContextualPanel;
