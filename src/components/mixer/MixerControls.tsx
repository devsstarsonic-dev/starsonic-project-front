"use client";

// Controles do StarMix: Knob (anel de progresso), ControlSlider (reverb/pan,
// arrastável) e VerticalFader (fader + VU real com peak-hold). Acessíveis:
// pointer + teclado + ARIA. Portado do design de referência (v0 DJ mixer),
// com as cores trocadas pelos tokens da Star Sonic.

import { useEffect, useRef, useState } from "react";
import { useDragValue } from "./useDragValue";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

// ---- KNOB rotativo com anel de progresso (conic-gradient) ----
export function Knob({
  value,
  onChange,
  ariaLabel,
  accent,
  min = -12,
  max = 12,
}: {
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
  accent: string;
  min?: number;
  max?: number;
}) {
  const { dragging, onPointerDown, onPointerMove, onPointerUp } = useDragValue({
    min,
    max,
    value,
    onChange,
    axis: "vertical",
    sensitivity: 130,
  });

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next = value;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") next = value + 1;
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") next = value - 1;
    else return;
    e.preventDefault();
    onChange(clamp(next, min, max));
  };

  const pct = (value - min) / (max - min);
  const angle = -135 + pct * 270;
  const sweep = pct * 270;

  return (
    <div
      className="mx-knob"
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      onDoubleClick={() => onChange(0)}
      title="Arraste para ajustar · duplo-clique zera"
    >
      <div
        className="mx-knob-ring"
        style={{
          background: `conic-gradient(from -135deg, ${accent} ${sweep}deg, rgba(255,255,255,0.08) ${sweep}deg 270deg, transparent 270deg)`,
          filter: dragging ? `drop-shadow(0 0 6px ${accent})` : "none",
        }}
      />
      <div className="mx-knob-face">
        <div className="mx-knob-indicator" style={{ transform: `rotate(${angle}deg)` }}>
          <span className="mx-knob-tick" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
        </div>
      </div>
    </div>
  );
}

// ---- SLIDER horizontal arrastável (reverb / pan) ----
export function ControlSlider({
  value,
  min,
  max,
  accent,
  ariaLabel,
  fromCenter = false,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  accent: string;
  ariaLabel: string;
  fromCenter?: boolean;
  onChange: (v: number) => void;
}) {
  const { dragging, onPointerDown, onPointerMove, onPointerUp } = useDragValue({
    min,
    max,
    value,
    onChange,
    axis: "horizontal",
    sensitivity: 150,
  });

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next = value;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = value + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = value - 1;
    else return;
    e.preventDefault();
    onChange(clamp(next, min, max));
  };

  const pct = ((value - min) / (max - min)) * 100;
  const fillLeft = fromCenter ? Math.min(50, pct) : 0;
  const fillWidth = fromCenter ? Math.abs(pct - 50) : pct;

  return (
    <div
      className="mx-cslider"
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <div
        className="mx-cslider-fill"
        style={{ left: `${fillLeft}%`, width: `${fillWidth}%`, background: `linear-gradient(90deg, ${accent}, var(--purple))` }}
      />
      {fromCenter && <span className="mx-cslider-center" />}
      <div
        className="mx-cslider-thumb"
        style={{ left: `${pct}%`, boxShadow: dragging ? `0 0 0 4px ${accent}40, 0 2px 6px rgba(0,0,0,0.6)` : undefined }}
      />
    </div>
  );
}

// ---- FADER vertical + VU real (peak-hold, reage ao volume) ----
export function VerticalFader({
  value,
  accent,
  active,
  onChange,
  ariaLabel,
}: {
  value: number;
  accent: string;
  active: boolean;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  const { dragging, onPointerDown, onPointerMove, onPointerUp } = useDragValue({
    min: 0,
    max: 100,
    value,
    onChange,
    axis: "vertical",
    sensitivity: 220,
  });

  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const raf = useRef(0);
  const phase = useRef(0);
  const peakRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      phase.current += 0.08;
      const base = active ? value : 0;
      const wobble = active ? Math.sin(phase.current) * 6 + Math.sin(phase.current * 2.7) * 4 + 6 : 0;
      const target = clamp(base * 0.9 + wobble, 0, 100);
      setLevel((prev) => {
        const next = prev + (target - prev) * 0.25;
        peakRef.current = next > peakRef.current ? next : Math.max(next, peakRef.current - 0.6);
        setPeak(peakRef.current);
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") onChange(clamp(value + 2, 0, 100));
    else if (e.key === "ArrowDown") onChange(clamp(value - 2, 0, 100));
  };

  return (
    <div className="mx-vfader-row">
      <div
        className="mx-vfader-track"
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <div className="mx-vfader-fill" style={{ height: `${value}%`, background: `linear-gradient(180deg, ${accent}, transparent)`, opacity: active ? 0.5 : 0.15 }} />
        <div
          className="mx-vfader-handle"
          style={{
            bottom: `${value}%`,
            boxShadow: dragging ? `0 0 0 2px ${accent}80, 0 6px 14px rgba(0,0,0,0.7)` : undefined,
          }}
        />
      </div>

      <div className="mx-vfader-meter" aria-hidden="true">
        <div
          className="mx-vfader-level"
          style={{ height: `${level}%`, boxShadow: `0 0 ${6 + level / 8}px rgba(0,212,255,0.5)` }}
        />
        <div
          className="mx-vfader-peak"
          style={{
            bottom: `calc(${peak}% - 1px)`,
            background: peak > 78 ? "var(--red)" : "var(--white)",
            color: peak > 78 ? "var(--red)" : "var(--white)",
            opacity: active ? 0.9 : 0,
          }}
        />
      </div>
    </div>
  );
}

// ---- Waveform determinística + playhead (clicável pra buscar posição) ----
export function Waveform({
  seed = 1,
  playheadPct = 0,
  bars = 90,
  onSeek,
}: {
  seed?: number;
  playheadPct?: number;
  bars?: number;
  onSeek?: (pct: number) => void;
}) {
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const heights = Array.from({ length: bars }, (_, i) => 14 + Math.abs(Math.sin(i * 0.3)) * 18 + rand() * 12);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    onSeek(pct);
  }

  return (
    <div className={`mx-wave${onSeek ? " mx-wave-seekable" : ""}`} onClick={handleClick}>
      {heights.map((h, i) => (
        <div key={i} className="mx-wave-bar" style={{ height: `${h}px` }} />
      ))}
      {playheadPct > 0 && <div className="mx-playhead" style={{ left: `${playheadPct}%` }} />}
    </div>
  );
}
