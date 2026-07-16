"use client";

// Estúdio StarMix — casca visual navegável (Fase 1, sem áudio real).
// Telas 3/4/7 do protótipo compartilham esta sessão (aba básico/avançado +
// overlay comparar); loading/processing/success são estados internos daqui.
// Quando entrar áudio real (Fase 2), o estado dos canais alimenta um
// MixerEngine (Web Audio) — a UI abaixo não muda.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChannelStrip } from "./ChannelStrip";
import { Waveform } from "./MixerControls";
import {
  CHANNELS,
  PRESETS,
  PRESET_VALUES,
  MASTER_TARGETS,
  initialChannelState,
  type ChannelId,
  type ChannelState,
  type PresetId,
} from "./mixerData";
import {
  IcSliders, IcSparkles, IcTarget, IcRotateCcw, IcSave, IcCheck, IcCircle, IcLoader,
  IcHeadphones, IcRocket, IcStore, IcDownload, IcLink, IcGem, IcBarChart, IcMusic,
} from "./icons";

type Screen = "loading" | "mixer" | "advanced" | "processing" | "success";
type Modal = null | "saveDraft" | "share";

type Track = { id: string; title: string; genre: string; duration: string; emoji: string; from: string; to: string; audioUrl: string };

const LOADING_STEPS = [
  { title: "Enviando pro Sonic Engine", done: "Transferida com segurança" },
  { title: "Separando instrumentos", done: "5 canais isolados" },
  { title: "Preparando canais", done: "Mesa montada" },
  { title: "Pronto pra mixar", done: "Tudo certo" },
];
const PROCESSING_STEPS = [
  { title: "Ajustes capturados", done: "Volume, EQ, reverb e pan" },
  { title: "Aplicando efeitos", done: "Processado" },
  { title: "Mixando 5 canais em WAV", done: "Renderizado" },
  { title: "Salvando na biblioteca", done: "Salvo" },
];

const FX = [
  { name: "Compressor", on: true, a: ["Threshold", "-12dB"], b: ["Ratio", "4:1"] },
  { name: "Chorus", on: false, a: ["Depth", "0%"], b: ["Rate", "0Hz"] },
  { name: "Delay", on: true, a: ["Time", "250ms"], b: ["Feedback", "35%"] },
  { name: "Distorção", on: false, a: ["Drive", "0%"], b: ["Tone", "50%"] },
  { name: "Phaser", on: false, a: ["Rate", "0Hz"], b: ["Depth", "0%"] },
];
export function MixerStudio({ track }: { track: Track }) {
  const [screen, setScreen] = useState<Screen>("loading");
  const [preset, setPreset] = useState<PresetId>("original");
  const [channels, setChannels] = useState<Record<ChannelId, ChannelState>>(initialChannelState);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [master, setMaster] = useState("Streaming");
  const [fxOn, setFxOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(FX.map((f) => [f.name, f.on]))
  );

  // Simulação de "separando instrumentos" ao abrir.
  const [loadProg, setLoadProg] = useState(0);
  useEffect(() => {
    if (screen !== "loading") return;
    setLoadProg(0);
    const t = setInterval(() => {
      setLoadProg((p) => {
        const next = p + Math.random() * 14 + 6;
        if (next >= 100) {
          clearInterval(t);
          setTimeout(() => setScreen("mixer"), 500);
          return 100;
        }
        return next;
      });
    }, 420);
    return () => clearInterval(t);
  }, [screen]);

  // Simulação de renderização.
  const [procProg, setProcProg] = useState(0);
  useEffect(() => {
    if (screen !== "processing") return;
    setProcProg(0);
    const t = setInterval(() => {
      setProcProg((p) => {
        const next = p + Math.random() * 12 + 5;
        if (next >= 100) {
          clearInterval(t);
          setTimeout(() => setScreen("success"), 700);
          return 100;
        }
        return next;
      });
    }, 380);
    return () => clearInterval(t);
  }, [screen]);

  // Player de áudio real: acompanha o progresso e permite buscar posição.
  // `playing` reflete os eventos reais do <audio>, não uma troca otimista —
  // se play() falhar (autoplay bloqueado, fonte inválida), a UI não fica
  // presa em "Reproduzindo" com a barra parada.
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setPlayhead(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onEnd = () => setPlayhead(0);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => showToast("Não foi possível reproduzir o áudio"));
    } else {
      audio.pause();
    }
  }

  function seekTo(pct: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = (pct / 100) * audio.duration;
    setCurrentTime(audio.currentTime);
    setPlayhead(pct);
  }

  function formatTime(s: number) {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  // ESC fecha modal/compare.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModal(null);
        setCompareOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const [compareOpen, setCompareOpen] = useState(false);

  function applyPreset(id: PresetId) {
    setPreset(id);
    setChannels((prev) => {
      const next = { ...prev };
      for (const ch of CHANNELS) {
        const p = PRESET_VALUES[id][ch.id];
        next[ch.id] = { ...prev[ch.id], volume: p.volume, eq: { ...p.eq }, reverb: p.reverb };
      }
      return next;
    });
  }

  function patchChannel(id: ChannelId, patch: Partial<ChannelState>) {
    setChannels((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  const soloActive = Object.values(channels).some((c) => c.solo);

  function resetMixer() {
    applyPreset("original");
    showToast("Configurações resetadas");
  }

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }

  // ---------- Telas de estágio (loading / processing) ----------
  function Stage({ steps, prog, kind }: { steps: typeof LOADING_STEPS; prog: number; kind: "load" | "proc" }) {
    const perStep = 100 / steps.length;
    const activeIdx = Math.min(steps.length - 1, Math.floor(prog / perStep));
    return (
      <div className="mx-stage">
        <div className="mx-orb" />
        <h1 className="mx-title" style={{ fontSize: 30 }}>
          {kind === "load" ? "Preparando seu StarMix..." : "Renderizando com Sonic Engine..."}
        </h1>
        <p className="mx-sub" style={{ marginBottom: 6 }}>{track.title}</p>
        <p style={{ color: "var(--text-4)", fontSize: 13, marginBottom: 32 }}>
          {kind === "load"
            ? "Separando cada instrumento pra você poder mexer"
            : "Aplicando seus ajustes e gerando o arquivo final"}
        </p>
        <div className="mx-steps">
          {steps.map((s, i) => {
            const state = i < activeIdx ? "done" : i === activeIdx ? "active" : "";
            return (
              <div className={`mx-step ${state}`} key={s.title}>
                <span className={`mx-step-ico${state === "active" ? " spin" : ""}`} style={{ color: state === "done" ? "var(--green)" : state === "active" ? "var(--cyan-1)" : "var(--text-4)" }}>
                  {state === "done" ? <IcCheck width={16} height={16} /> : state === "active" ? <IcLoader width={16} height={16} /> : <IcCircle width={16} height={16} />}
                </span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: state ? "var(--white)" : "var(--text-3)" }}>{s.title}</h4>
                  <p>{state === "done" ? s.done : state === "active" ? "Processando…" : "Aguardando…"}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mx-progress">
          <div className="mx-progress-track">
            <div className="mx-progress-fill" style={{ width: `${Math.min(100, prog)}%` }} />
          </div>
          <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 8 }}>{Math.floor(Math.min(100, prog))}% concluído</p>
        </div>
      </div>
    );
  }

  if (screen === "loading") return <div className="mixer"><Stage steps={LOADING_STEPS} prog={loadProg} kind="load" /></div>;
  if (screen === "processing") return <div className="mixer"><Stage steps={PROCESSING_STEPS} prog={procProg} kind="proc" /></div>;

  // ---------- Sucesso ----------
  if (screen === "success") {
    return (
      <div className="mixer">
        <div className="mx-stage">
          <div className="mx-success-check"><IcCheck width={40} height={40} strokeWidth={3} /></div>
          <h1 className="mx-title" style={{ fontSize: 30 }}>Prontinho!</h1>
          <p className="mx-sub" style={{ marginBottom: 4 }}>Sua nova versão foi salva com sucesso</p>
          <p style={{ color: "var(--text-4)", fontSize: 13, marginBottom: 28 }}>Você pode ouvir, comparar ou distribuir</p>

          <div className="mx-card" style={{ maxWidth: 560, margin: "0 auto 24px", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div className="mx-track-cover" style={{ background: `linear-gradient(135deg, ${track.from}, ${track.to})`, width: 48, height: 48 }}>
                {track.emoji || <IcMusic width={20} height={20} color="#fff" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--white)", fontWeight: 700 }}>{track.title}</span>
                  <span className="mx-badge green">STARMIX {PRESETS.find((p) => p.id === preset)?.name}</span>
                </div>
                <p style={{ color: "var(--text-3)", fontSize: 12 }}>Você · {track.duration} · WAV 48kHz</p>
              </div>
            </div>
            <Waveform seed={track.id.length + 7} />
          </div>

          <div className="mx-success-actions">
            <button type="button" className="mx-success-action" onClick={() => setCompareOpen(true)}>
              <div className="mx-success-ico"><IcHeadphones width={24} height={24} /></div><h4>Comparar</h4><p>Original × StarMix</p>
            </button>
            <button type="button" className="mx-success-action" onClick={() => setModal("share")}>
              <div className="mx-success-ico"><IcRocket width={24} height={24} /></div><h4>Compartilhar</h4><p>Loja ou distribuição</p>
            </button>
            <Link href="/mixer" className="mx-success-action" style={{ textDecoration: "none", display: "block" }}>
              <div className="mx-success-ico"><IcSliders width={24} height={24} /></div><h4>Novo remix</h4><p>Outra música</p>
            </Link>
          </div>

          <div className="mx-success-stats">
            <div className="mx-stat"><p className="mx-stat-lbl">Processado em</p><p className="mx-stat-val">12s</p></div>
            <div className="mx-stat"><p className="mx-stat-lbl">Estilo</p><p className="mx-stat-val">{PRESETS.find((p) => p.id === preset)?.name}</p></div>
            <div className="mx-stat"><p className="mx-stat-lbl">Formato</p><p className="mx-stat-val">WAV</p></div>
          </div>

          <button type="button" className="btn-secondary" onClick={() => setScreen("mixer")}>← Voltar ao mixer</button>
        </div>

        {compareOpen && <CompareOverlay track={track} channels={channels} onClose={() => setCompareOpen(false)} />}
        {modal === "share" && <ShareModal onClose={() => setModal(null)} />}
        {toast && <Toast msg={toast} />}
      </div>
    );
  }

  // ---------- Mixer / Avançado ----------
  return (
    <div className="mixer">
      <div className="mx-head">
        <div>
          <h1 className="mx-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IcSliders width={24} height={24} /> Sua mesa de mixagem
          </h1>
          <p className="mx-sub">{track.title} · {track.genre} · {track.duration}</p>
        </div>
        <div className="mx-live"><span className="mx-live-dot" /><span className="mx-live-txt">STARMIX ATIVO</span></div>
      </div>

      {/* Abas básico / avançado */}
      <div className="mx-tabs">
        <button type="button" className={`mx-tab${screen === "mixer" ? " active" : ""}`} onClick={() => setScreen("mixer")}>Mixer</button>
        <button type="button" className={`mx-tab${screen === "advanced" ? " active" : ""}`} onClick={() => setScreen("advanced")}>
          Avançado
        </button>
      </div>

      {/* Player */}
      <div className="mx-card" style={{ marginBottom: 16 }}>
        <audio ref={audioRef} src={track.audioUrl} preload="metadata" />
        <div className="mx-player">
          <button type="button" className="mx-play" onClick={togglePlay} aria-label={playing ? "Pausar" : "Reproduzir"}>
            {playing ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "var(--white)", fontWeight: 600, fontSize: 13 }}>{playing ? "Reproduzindo preview…" : "Ouvir preview"}</span>
              <span style={{ color: "var(--cyan-2)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{formatTime(currentTime)} / {track.duration}</span>
            </div>
            <Waveform seed={track.id.length + 3} playheadPct={playhead} onSeek={seekTo} />
          </div>
        </div>
      </div>

      {screen === "mixer" ? (
        <>
          {/* Presets */}
          <div className="mx-card" style={{ marginBottom: 16 }}>
            <div className="mx-card-title" style={{ marginBottom: 12 }}><IcSparkles width={14} height={14} /> Estilos rápidos · um clique aplica</div>
            <div className="mx-presets">
              {PRESETS.map((p, i) => {
                const isActive = preset === p.id;
                const motion = p.id === "party" ? " mx-flame" : p.id === "vintage" ? " mx-spin-slow" : "";
                return (
                  <button
                    type="button"
                    key={p.id}
                    className={`mx-preset${isActive ? " active" : ""}`}
                    style={{ animationDelay: `${i * 55}ms` }}
                    onClick={() => applyPreset(p.id)}
                  >
                    <div className={`mx-preset-emoji${motion}`}><p.Icon width={20} height={20} /></div>
                    <h4>{p.name}</h4>
                    <p>{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Canais */}
          <div className="mx-card" style={{ marginBottom: 16 }}>
            <div className="mx-card-title" style={{ marginBottom: 14 }}><IcSliders width={14} height={14} /> Canais individuais</div>
            <div className="mx-channels">
              {CHANNELS.map((ch, i) => (
                <ChannelStrip key={ch.id} id={ch.id} index={i} state={channels[ch.id]} soloActive={soloActive} onChange={(patch) => patchChannel(ch.id, patch)} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Rack de efeitos */}
          <div className="mx-card" style={{ marginBottom: 16 }}>
            <div className="mx-card-title" style={{ marginBottom: 14 }}><IcSparkles width={14} height={14} /> Efeitos extras · <span className="mx-badge purple">PRO+</span></div>
            <div className="mx-fx-grid">
              {FX.map((f) => (
                <div className="mx-fx" key={f.name}>
                  <div className="mx-fx-head">
                    <span className="mx-fx-name">{f.name}</span>
                    <button
                      type="button"
                      className={`mx-toggle${fxOn[f.name] ? " on" : ""}`}
                      role="switch"
                      aria-checked={fxOn[f.name]}
                      aria-label={f.name}
                      onClick={() => setFxOn((s) => ({ ...s, [f.name]: !s[f.name] }))}
                    >
                      <span className="mx-toggle-dot" />
                    </button>
                  </div>
                  {[f.a, f.b].map(([lbl, val]) => (
                    <div key={lbl} style={{ marginBottom: 8 }}>
                      <div className="mx-slider-head"><span className="mx-slider-lbl">{lbl}</span><span className="mx-slider-val">{val}</span></div>
                      <input type="range" className="mx-range" defaultValue={40} aria-label={`${f.name} ${lbl}`} disabled={!fxOn[f.name]} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Mastering */}
          <div className="mx-card" style={{ marginBottom: 16 }}>
            <div className="mx-card-title" style={{ marginBottom: 14 }}><IcTarget width={14} height={14} /> Mastering final · preparação pra publicação</div>
            <div className="mx-master">
              {MASTER_TARGETS.map((m) => (
                <button type="button" key={m.name} className={`mx-master-card${master === m.name ? " sel" : ""}`} onClick={() => setMaster(m.name)}>
                  <div className="mx-master-ico"><m.Icon width={26} height={26} /></div>
                  <h4>{m.name}</h4>
                  <p>{m.lufs}</p>
                  <p style={{ color: master === m.name ? "var(--cyan-2)" : "var(--text-4)" }}>{m.note}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Ações */}
      <div className="mx-actions">
        <div className="mx-upsell">
          <div className="mx-upsell-ico"><IcGem width={18} height={18} /></div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "var(--white)", fontWeight: 700, fontSize: 12 }}>Export multitrack disponível no Ultra</p>
            <p style={{ color: "var(--text-3)", fontSize: 10 }}>Baixe cada faixa separada em WAV</p>
          </div>
          <Link href="/planos" className="btn-secondary" style={{ fontSize: 12 }}>Ultra</Link>
        </div>
        <button type="button" className="btn-secondary" onClick={resetMixer} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><IcRotateCcw width={14} height={14} /> Resetar</button>
        <button type="button" className="btn-secondary" onClick={() => setModal("saveDraft")} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><IcSave width={14} height={14} /> Rascunho</button>
        <button type="button" className="btn-primary" onClick={() => setScreen("processing")} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><IcSparkles width={14} height={14} /> Aplicar e salvar</button>
      </div>

      {modal === "saveDraft" && <SaveDraftModal track={track} onClose={() => setModal(null)} onSave={() => { setModal(null); showToast("Rascunho salvo!"); }} />}
      {modal === "share" && <ShareModal onClose={() => setModal(null)} />}
      {compareOpen && <CompareOverlay track={track} channels={channels} onClose={() => setCompareOpen(false)} />}
      {toast && <Toast msg={toast} />}
    </div>
  );
}

// ---------- Overlay: comparar A/B ----------
function CompareOverlay({ track, channels, onClose }: { track: Track; channels: Record<ChannelId, ChannelState>; onClose: () => void }) {
  const orig = PRESET_VALUES.original;
  const diffs: { label: string; from: number; to: number }[] = [
    { label: "Bateria", from: orig.drums.volume, to: channels.drums.volume },
    { label: "Baixo", from: orig.bass.volume, to: channels.bass.volume },
    { label: "Vocal", from: orig.vocals.volume, to: channels.vocals.volume },
    { label: "Teclado", from: orig.keys.volume, to: channels.keys.volume },
  ];
  return (
    <div className="mx-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mx-modal" style={{ maxWidth: 640 }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <h2 className="mx-title" style={{ fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
            <IcHeadphones width={20} height={20} /> Compare as versões
          </h2>
          <p className="mx-sub">Original × sua StarMix</p>
        </div>

        <div className="mx-compare-track" style={{ marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ color: "var(--white)", fontWeight: 700 }}>{track.title}</span>
            <span className="mx-badge" style={{ background: "rgba(107,122,163,0.2)", color: "var(--text-2)" }}>ORIGINAL</span>
          </div>
          <Waveform seed={2} />
        </div>

        <div className="mx-vs"><div className="mx-vs-line" /><div className="mx-vs-badge">VS</div><div className="mx-vs-line" /></div>

        <div className="mx-compare-track starmix" style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ color: "var(--white)", fontWeight: 700 }}>{track.title}</span>
            <span className="mx-badge cyan">STARMIX</span>
          </div>
          <Waveform seed={track.id.length + 5} />
        </div>

        <div className="mx-card" style={{ marginBottom: 18 }}>
          <div className="mx-card-title" style={{ marginBottom: 12 }}><IcBarChart width={14} height={14} /> O que mudou</div>
          <div className="mx-diff">
            {diffs.map((d) => {
              const delta = d.to - d.from;
              const pct = d.from ? Math.round((delta / d.from) * 100) : 0;
              const up = delta >= 0;
              return (
                <div key={d.label}>
                  <p className="mx-diff-lbl">{d.label}</p>
                  <div className="mx-diff-row">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-3)" }}>{d.from}</span>
                    <span style={{ color: "var(--cyan-1)" }}>→</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--cyan-2)", fontWeight: 700 }}>{d.to}</span>
                    <span className="mx-badge" style={{ marginLeft: "auto", background: up ? "rgba(34,197,94,0.15)" : "rgba(251,146,60,0.15)", color: up ? "var(--green)" : "var(--amber)" }}>
                      {up ? "+" : ""}{pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button type="button" className="btn-primary" style={{ width: "100%" }} onClick={onClose}>Continuar</button>
      </div>
    </div>
  );
}

// ---------- Modal: salvar rascunho ----------
function SaveDraftModal({ track, onClose, onSave }: { track: Track; onClose: () => void; onSave: () => void }) {
  return (
    <div className="mx-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mx-modal">
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="mx-orb" style={{ width: 60, height: 60, marginBottom: 14 }} />
          <h2 className="mx-title" style={{ fontSize: 20 }}>Salvar rascunho?</h2>
          <p className="mx-sub">Continue de onde parou quando quiser</p>
        </div>
        <label style={{ display: "block", color: "var(--text-2)", fontSize: 12, marginBottom: 8 }}>Nome do rascunho</label>
        <input className="mx-input" defaultValue={`${track.title} - Mix 1`} style={{ marginBottom: 18 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button type="button" className="btn-primary" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }} onClick={onSave}><IcSave width={14} height={14} /> Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Modal: compartilhar ----------
function ShareModal({ onClose }: { onClose: () => void }) {
  const opts = [
    { Icon: IcStore, from: "var(--cyan-1)", to: "var(--purple)", title: "Publicar na Minha Loja", desc: "Venda essa versão pros seus fãs", href: "/minha-loja", badge: "RECOMENDADO" },
    { Icon: IcHeadphones, from: "var(--green)", to: "var(--cyan-1)", title: "Distribuir em streaming", desc: "Spotify, Apple, Deezer, YouTube", href: "/distribuicao/novo" },
    { Icon: IcDownload, from: "var(--purple)", to: "var(--pink)", title: "Baixar arquivo", desc: "WAV, MP3 ou multitrack (Ultra)", href: null },
    { Icon: IcLink, from: "var(--amber)", to: "var(--red)", title: "Copiar link privado", desc: "Compartilhe sem publicar", href: null },
  ];
  return (
    <div className="mx-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mx-modal">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div className="mx-share-ico" style={{ background: "linear-gradient(135deg, var(--pink), var(--amber))" }}><IcRocket width={19} height={19} color="#fff" /></div>
          <div>
            <h2 className="mx-title" style={{ fontSize: 18 }}>Compartilhar StarMix</h2>
            <p className="mx-sub">Escolha como publicar</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          {opts.map((o) => {
            const inner = (
              <>
                <div className="mx-share-ico" style={{ background: `linear-gradient(135deg, ${o.from}, ${o.to})` }}><o.Icon width={19} height={19} color="#fff" /></div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "var(--white)", fontWeight: 700, fontSize: 14 }}>{o.title}</p>
                  <p style={{ color: "var(--text-3)", fontSize: 12 }}>{o.desc}</p>
                </div>
                {o.badge && <span className="mx-badge green">{o.badge}</span>}
              </>
            );
            return o.href ? (
              <Link key={o.title} href={o.href} className="mx-share-opt">{inner}</Link>
            ) : (
              <button type="button" key={o.title} className="mx-share-opt" onClick={onClose}>{inner}</button>
            );
          })}
        </div>
        <button type="button" className="btn-secondary" style={{ width: "100%" }} onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

function Toast({ msg }: { msg: string }) {
  return (
    <div className="mx-toast">
      <span style={{ color: "var(--green)", display: "flex" }}><IcCheck width={18} height={18} /></span>
      <span style={{ color: "var(--white)", fontSize: 14, fontWeight: 700 }}>{msg}</span>
    </div>
  );
}
