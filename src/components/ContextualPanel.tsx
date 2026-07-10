"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { metaForPath } from "@/lib/nav";
import { memo } from "react";
import { useNowPlaying } from "@/lib/nowPlaying/NowPlayingContext";
import type { Preset, Plan } from "@/lib/types";

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

function fmtTime(t: number): string {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Ondas sonoras que vibram enquanto a música toca (visual, sincronizado ao play).
// Alturas/tempos determinísticos por índice → sem mismatch de hidratação.
function Waveform({ playing, primary }: { playing: boolean; primary?: boolean }) {
  const grad = primary
    ? "linear-gradient(180deg, #00d4ff, #3b9eff)"
    : "linear-gradient(180deg, #a855f7, #ec4899)";
  const bars = Array.from({ length: 36 });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        height: 44,
        marginBottom: 14,
        padding: "0 2px",
      }}
    >
      {bars.map((_, i) => {
        const dur = 0.55 + ((i * 7) % 6) * 0.11; // 0.55..1.1s
        const delay = -(((i * 13) % 10) * 0.1); // dessincroniza as barras
        return (
          <span
            key={i}
            style={{
              flex: 1,
              maxWidth: 5,
              height: "100%",
              borderRadius: 4,
              background: grad,
              transformOrigin: "center",
              transform: playing ? undefined : "scaleY(0.18)",
              animation: playing ? `np-wave ${dur}s ease-in-out ${delay}s infinite` : "none",
              transition: "transform 0.2s ease",
              opacity: playing ? 0.9 : 0.35,
            }}
          />
        );
      })}
    </div>
  );
}

// Mini-player "tocando agora" (estilo Spotify): capa, título, play/pause e
// barra de progresso da faixa que o usuário clicou para ouvir em qualquer tela.
function NowPlayingCard() {
  const player = useNowPlaying();
  const track = player?.track;
  if (!player || !track) return null;

  const { playing, current, duration } = player;
  const grad = track.primary
    ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
    : "linear-gradient(135deg, #a855f7, #ec4899)";
  const accent = track.primary ? "var(--cyan-1)" : "var(--purple)";
  const glow = track.primary ? "rgba(0, 212, 255, 0.35)" : "rgba(168, 85, 247, 0.35)";
  const progress = duration ? (current / duration) * 100 : 0;

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    player!.seekTo(ratio * duration);
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <div
        className="panel-label"
        style={{ paddingTop: 4, display: "flex", alignItems: "center", gap: 6 }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: playing ? "var(--green)" : "var(--text-3)",
            boxShadow: playing ? "0 0 8px var(--green)" : "none",
          }}
        />
        Tocando agora
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 14,
          borderRadius: 16,
          background: "linear-gradient(180deg, rgba(22,22,77,0.9), rgba(5,6,32,0.9))",
          border: `1px solid ${playing ? accent : "var(--border)"}`,
          boxShadow: playing ? `0 0 28px ${glow}` : "none",
          transition: "box-shadow .3s ease, border-color .3s ease",
        }}
      >
        {/* Capa grande */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: 12,
            overflow: "hidden",
            background: track.imageUrl ? `center / cover url(${track.imageUrl})` : grad,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 8px 28px ${glow}`,
          }}
        >
          {!track.imageUrl && (
            <span style={{ fontSize: 56, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))" }}>
              🎵
            </span>
          )}

          {/* Botão play/pause central */}
          <button
            type="button"
            onClick={() => player.toggle()}
            aria-label={playing ? "Pausar" : "Reproduzir"}
            style={{
              position: "absolute",
              width: 54,
              height: 54,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: "rgba(5,6,32,0.55)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 18px ${glow}`,
            }}
          >
            {playing ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                <rect x="6" y="5" width="4" height="14" rx="1.5" />
                <rect x="14" y="5" width="4" height="14" rx="1.5" />
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
                <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.79-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14z" />
              </svg>
            )}
          </button>

          {/* Equalizer animado quando tocando */}
          {playing && (
            <div
              style={{
                position: "absolute",
                bottom: 10,
                right: 10,
                display: "flex",
                alignItems: "flex-end",
                gap: 3,
                height: 22,
                padding: "4px 6px",
                borderRadius: 8,
                background: "rgba(5,6,32,0.55)",
                backdropFilter: "blur(4px)",
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 3,
                    borderRadius: 2,
                    background: "#fff",
                    animation: "eq 0.9s ease-in-out infinite",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Ondas sonoras (vibram com a música) */}
        <Waveform playing={playing} primary={track.primary} />

        {/* Título + subtítulo */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--white)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {track.title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-3)",
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: 3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {track.subtitle || "Star Sonic"}
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", minWidth: 30 }}>
            {fmtTime(current)}
          </span>
          <div
            onClick={seek}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 100,
              background: "rgba(0,212,255,0.12)",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${progress}%`,
                borderRadius: 100,
                background: grad,
              }}
            />
          </div>
          <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", minWidth: 30, textAlign: "right" }}>
            {fmtTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
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

// Painel fixo do convidado (sem login): explica o fluxo e chama pro cadastro.
function GuestPanel() {
  return (
    <div className="panel-section active">
      <div className="panel-title">Modo convidado</div>
      <div className="panel-sub">Componha sem conta</div>

      <div className="panel-label">COMO FUNCIONA</div>
      <div className="panel-item"><span>1 · Preencha as etapas</span></div>
      <div className="panel-item"><span>2 · Gere 1 música grátis</span></div>
      <div className="panel-item"><span>3 · Crie conta p/ baixar e salvar</span></div>

      <div
        style={{
          marginTop: 16,
          padding: 16,
          borderRadius: 14,
          background: "linear-gradient(180deg, rgba(0,212,255,0.08), rgba(168,85,247,0.06))",
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "var(--white)", marginBottom: 6 }}>
          Crie sua conta
        </div>
        <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 12 }}>
          Ganhe créditos, baixe seus MP3 e salve suas criações.
        </div>
        <Link href="/cadastro" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}>
          Criar conta
        </Link>
        <Link href="/login" className="btn-secondary" style={{ display: "block", textAlign: "center" }}>
          Entrar
        </Link>
      </div>
    </div>
  );
}

function ContextualPanelComponent({
  presets,
  dashStats,
  plans = [],
  guest = false,
}: {
  presets: Preset[];
  dashStats?: DashStats;
  plans?: Plan[];
  guest?: boolean;
}) {
  const pathname = usePathname();
  const panel = metaForPath(pathname).panel;

  // Convidado: painel fixo (sempre visível) + card tocando agora.
  if (guest) {
    return (
      <aside className="app-panel">
        <NowPlayingCard />
        <GuestPanel />
      </aside>
    );
  }

  return (
    <aside className="app-panel">
      {/* TOCANDO AGORA (aparece quando o usuário dá play numa faixa) */}
      <NowPlayingCard />

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
          {plans
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((p) => (
              <div key={p.id} className={`panel-item${p.is_popular ? " active" : ""}`}>
                <span>{p.name}</span>
                <span className="cnt">{p.price_label}</span>
              </div>
            ))}
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
  prev: { presets: Preset[]; dashStats?: DashStats; plans?: Plan[]; guest?: boolean },
  next: { presets: Preset[]; dashStats?: DashStats; plans?: Plan[]; guest?: boolean }
) => {
  if (prev.guest !== next.guest) return false;
  if (prev.plans !== next.plans) return false;
  if (prev.presets === next.presets && prev.dashStats === next.dashStats) return true;
  if (prev.dashStats !== next.dashStats) return false;
  if (prev.presets.length !== next.presets.length) return false;
  return prev.presets.every((p, i) => p.id === next.presets[i]?.id);
};

const ContextualPanel = memo(ContextualPanelComponent, contextualPanelComparator);
export default ContextualPanel;
