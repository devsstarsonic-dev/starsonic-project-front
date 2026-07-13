"use client";

import { useState } from "react";
import { kindLabel } from "@/lib/format";
import { CreationPlayButton } from "@/components/CreationPlayButton";
import { CreationMenu } from "@/components/CreationMenu";
import { LyricsModal } from "@/components/LyricsModal";
import { Icon, type IconName } from "@/components/Icon";
import StatusDot from "@/components/StatusDot";
import type { Creation } from "@/lib/types";

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

// Lista estilo Spotify (mesma do Catálogo → "Todas as músicas").
const ROW_CSS = `
.sp-row { display:flex; align-items:center; gap:14px; padding:8px 10px; border-radius:8px; transition: background .15s; }
.sp-row:hover { background: rgba(29,29,94,0.6); }
.sp-lead { width:30px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.sp-idx { color: var(--text-3); font-family:'JetBrains Mono', monospace; font-size:13px; }
.sp-rowplay { display:none; }
.sp-row:hover .sp-idx { display:none; }
.sp-row:hover .sp-rowplay { display:block; }
.sp-row .music-play-btn { width:30px; height:30px; background:transparent; border:none; color:var(--white); box-shadow:none; }
.sp-row .music-play-btn:hover { background:transparent; color:var(--cyan-1); }

.stat-filter { cursor: pointer; text-align: left; width: 100%; font: inherit; box-shadow: 0 0 0 1px rgba(0,212,255,0.12); }
.stat-filter:hover { border-color: var(--cyan-1); box-shadow: 0 0 0 1px rgba(0,212,255,0.5), 0 10px 26px rgba(0,212,255,0.18); }
.stat-filter:active { transform: translateY(-2px); }
`;

type FilterKey = "musicas" | "instrumental" | "jingle" | "letras" | "videos" | "imagens";

// Cada box de estatística é, ao mesmo tempo, o filtro da lista abaixo.
const FILTERS: { key: FilterKey; label: string; sub: string; color: string; match: (c: Creation) => boolean }[] = [
  { key: "musicas", label: "MÚSICAS", sub: "2 versões cada", color: "var(--white)", match: (c) => c.kind === "music" || c.kind === "instrumental" || c.kind === "jingle" },
  { key: "instrumental", label: "INSTRUMENTAL", sub: "sem voz", color: "var(--cyan-1)", match: (c) => c.kind === "instrumental" },
  { key: "jingle", label: "JINGLE", sub: "comercial", color: "var(--yellow)", match: (c) => c.kind === "jingle" },
  { key: "letras", label: "LETRAS", sub: "escritas", color: "var(--green)", match: (c) => !!c.lyrics?.trim() },
  { key: "videos", label: "VÍDEOS", sub: "MP4 gerados", color: "var(--purple)", match: (c) => c.kind === "video" },
  { key: "imagens", label: "IMAGENS", sub: "capturadas", color: "var(--orange)", match: (c) => c.kind === "cover" },
];

export function CreationsBrowser({ creations }: { creations: Creation[] }) {
  const [selected, setSelected] = useState<FilterKey>("musicas");

  const processing = creations.filter((c) => c.status === "processing");
  const doneAll = creations.filter((c) => c.status !== "processing");
  const activeFilter = FILTERS.find((f) => f.key === selected) ?? FILTERS[0];
  const done = doneAll.filter(activeFilter.match);

  return (
    <>
      <style>{ROW_CSS}</style>

      {/* STATS / FILTRO */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        {FILTERS.map((f) => {
          const isActive = f.key === selected;
          const count = doneAll.filter(f.match).length;
          return (
            <button
              key={f.key}
              onClick={() => setSelected(f.key)}
              className="card-glow stat-filter"
              style={{
                padding: "14px 16px",
                background: isActive ? "rgba(0, 212, 255, 0.12)" : undefined,
                borderColor: isActive ? "var(--cyan-1)" : undefined,
              }}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 28, color: f.color }}>{count}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{f.sub}</div>
            </button>
          );
        })}
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
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--white)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="check" size={16} style={{ color: "var(--cyan-1)" }} /> Finalizadas
        </h3>
        {/* cabeçalho da lista */}
        <div className="sp-row" style={{ borderBottom: "1px solid var(--border-soft)", borderRadius: 0, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <div className="sp-lead">#</div>
          <div style={{ width: 44 }} />
          <div style={{ flex: 1 }}>Nome</div>
          <div style={{ width: 120 }}>Gênero</div>
          <div style={{ width: 110 }}>Criada em</div>
          <div style={{ width: 70 }}>Status</div>
          <div style={{ width: 36 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 4 }}>
          {done.length === 0 && (
            <div style={{ padding: "24px 10px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>Nenhuma criação nesse filtro ainda.</div>
          )}
          {done.map((c, i) => (
            <div key={c.id} className="sp-row">
              <div className="sp-lead">
                <span className="sp-idx">{i + 1}</span>
                <span className="sp-rowplay"><CreationPlayButton creation={c} round /></span>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: 6,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: c.image_url
                    ? `center / cover url(${c.image_url})`
                    : `linear-gradient(135deg, ${c.gradient_from}, ${c.gradient_to})`,
                }}
              >
                {!c.image_url && <Icon name="music" size={18} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="music-title" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {c.title}
                  {c.is_favorite && <Badge icon="star" label="FAVORITA" color="var(--green)" bg="rgba(34, 197, 94, 0.12)" />}
                  {c.has_video && <Badge icon="film" label="VÍDEO" color="var(--purple)" bg="rgba(168, 85, 247, 0.12)" />}
                  {c.is_public && <Badge icon="globe" label="PÚBLICA" color="var(--cyan-1)" bg="rgba(0, 212, 255, 0.12)" />}
                </div>
                {c.lyrics?.trim() && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                    <div style={{ fontSize: 11, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}>
                      {c.lyrics.replace(/\s+/g, " ").trim()}
                    </div>
                    <LyricsModal title={c.title} lyrics={c.lyrics} />
                  </div>
                )}
              </div>
              <div style={{ width: 120, fontSize: 12, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.genre || "—"}</div>
              <div style={{ width: 110, fontSize: 12, color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>{formatCreationDate(c.created_at)}</div>
              <div style={{ width: 70 }}>
                <StatusDot status={c.status} />
              </div>
              <div style={{ width: 36, display: "flex", justifyContent: "flex-end" }}>
                <CreationMenu creation={c} round />
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button className="btn-pill">Carregar mais criações</button>
        </div>
      </div>
    </>
  );
}
