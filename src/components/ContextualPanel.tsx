"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { metaForPath } from "@/lib/nav";
import type { Preset } from "@/lib/types";

export default function ContextualPanel({ presets }: { presets: Preset[] }) {
  const pathname = usePathname();
  const panel = metaForPath(pathname).panel;

  return (
    <aside className="app-panel">
      {/* DASHBOARD */}
      {panel === "dashboard" && (
        <div className="panel-section active">
          <div className="panel-title">🏠 Início</div>
          <div className="panel-sub">Sua visão geral</div>
          <div className="panel-label">ATALHOS</div>
          <div className="panel-item active">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="panel-item-icon">📊</span> Visão geral
            </span>
          </div>
          <Link href="/criar-musica" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="panel-item-icon">🎼</span> Criar agora
            </span>
          </Link>
          <Link href="/catalogo" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="panel-item-icon">💎</span> Meu catálogo
            </span>
          </Link>
          <div className="panel-label">ATIVIDADE</div>
          <div className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="panel-item-icon">⏱️</span> Em processamento
            </span>
            <span className="cnt">2</span>
          </div>
          <div className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="panel-item-icon">🔔</span> Notificações
            </span>
            <span className="cnt">3</span>
          </div>
          <div className="panel-label">SAUDAÇÃO</div>
          <div style={{ background: "rgba(0,212,255,0.06)", border: "1px solid var(--border-soft)", borderRadius: 10, padding: 12, marginTop: 8 }}>
            <div style={{ fontSize: 12, color: "var(--cyan-1)", fontWeight: 700, marginBottom: 4 }}>💡 Dica do dia</div>
            <div style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.5 }}>
              Use o Letrista antes do Compositor para letras mais consistentes com o gênero escolhido.
            </div>
          </div>
        </div>
      )}

      {/* CRIAR MÚSICA */}
      {panel === "criar-musica" && (
        <div className="panel-section active">
          <div className="panel-title">🎼 Compor</div>
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
          <div className="panel-title">💎 Catálogo</div>
          <div className="panel-sub">Comunidade · descubra</div>
          <input type="text" className="panel-search" placeholder="🔍 Buscar..." />
          <div className="panel-label">FILTRAR</div>
          <div className="panel-item active"><span>🔥 Em alta</span></div>
          <div className="panel-item"><span>🆕 Recentes</span></div>
          <div className="panel-item"><span>⭐ Mais curtidas</span></div>
          <div className="panel-item"><span>🎯 Pra você</span></div>
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
          <div className="panel-title">🎨 Criações</div>
          <div className="panel-sub">Sua biblioteca pessoal</div>
          <input type="text" className="panel-search" placeholder="🔍 Buscar..." />
          <div className="panel-label">FERRAMENTA</div>
          <div className="panel-item active"><span>📁 Todas</span></div>
          <div className="panel-item"><span>🎼 Músicas</span></div>
          <div className="panel-item"><span>✍️ Letras</span></div>
          <div className="panel-item"><span>🎬 Vídeos</span></div>
          <div className="panel-item"><span>🎨 Capas</span></div>
          <div className="panel-label">STATUS</div>
          <div className="panel-item"><span>⏱️ Em processo</span></div>
          <div className="panel-item"><span>✓ Finalizadas</span></div>
          <div className="panel-label">ORDENAR</div>
          <div className="panel-item active"><span>⏱️ Mais recentes</span></div>
          <div className="panel-item"><span>A-Z</span></div>
        </div>
      )}

      {/* SONIC LAB */}
      {panel === "sonic-lab" && (
        <div className="panel-section active">
          <div className="panel-title">🧪 Sonic Lab</div>
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
          <div className="panel-label">CONTEÚDO</div>
          <Link href="/podcast-studio" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="panel-item-icon">🎙️</span> Podcast Studio</span>
          </Link>
          <Link href="/avatar-studio" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="panel-item-icon">🎬</span> Avatar Studio</span>
          </Link>
          <div className="panel-label">CARREIRA</div>
          <Link href="/promotor" className="panel-item">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="panel-item-icon">📢</span> Promotor</span>
            <span className="cnt">soon</span>
          </Link>
        </div>
      )}

      {/* DISTRIBUIÇÃO */}
      {panel === "distribuicao" && (
        <div className="panel-section active">
          <div className="panel-title">🌍 Distribuição</div>
          <div className="panel-sub">Em breve · 2026 Q3</div>
          <div className="panel-label">PRINCIPAIS DSPs</div>
          <div className="panel-item"><span>🎵 Spotify</span></div>
          <div className="panel-item"><span>🍎 Apple Music</span></div>
          <div className="panel-item"><span>▶️ YouTube Music</span></div>
          <div className="panel-item"><span>🎶 Amazon Music</span></div>
          <div className="panel-item"><span>🎧 Deezer</span></div>
          <div className="panel-item"><span>📻 Tidal</span></div>
          <div className="panel-item"><span>📱 TikTok</span></div>
          <div className="panel-label">OUTRAS</div>
          <div className="panel-item"><span>+ 143 plataformas</span></div>
        </div>
      )}

      {/* PLANOS */}
      {panel === "planos" && (
        <div className="panel-section active">
          <div className="panel-title">💎 Planos</div>
          <div className="panel-sub">Escolha o melhor pra você</div>
          <div className="panel-label">COMPARAR</div>
          <div className="panel-item"><span>Free</span><span className="cnt">R$0</span></div>
          <div className="panel-item"><span>Starter</span><span className="cnt">R$19</span></div>
          <div className="panel-item active"><span>Plus 🔥</span><span className="cnt">R$32</span></div>
          <div className="panel-item"><span>Creator</span><span className="cnt">R$54</span></div>
        </div>
      )}

      {/* PERFIL / CONTA */}
      {panel === "perfil" && (
        <div className="panel-section active">
          <div className="panel-title">👤 Minha Conta</div>
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
