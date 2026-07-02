"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";

// Tela de loading futurista exibida a cada troca de página: uma grade de
// quadrados neon que "se montam" (voam para a posição), no tema do app.
// Dispara tanto por clique em links internos (imediato) quanto pela mudança
// de rota (garante que aparece em qualquer navegação, inclusive router.push).

const HOLD_MS = 750; // tempo com a tela cheia antes de começar a sumir
const FADE_MS = 400; // duração do fade-out

// Grade 3x3 de quadrados. Cada um entra de uma direção/rotação diferente.
const SQUARES = Array.from({ length: 9 }, (_, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const dx = (col - 1) * 120; // espalha na horizontal
  const dy = (row - 1) * 120; // e na vertical
  const rot = (i % 2 === 0 ? 1 : -1) * (90 + i * 20);
  const delay = i * 55;
  return { dx, dy, rot, delay };
});

export function PageTransition() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [closing, setClosing] = useState(false);
  const first = useRef(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function show() {
    clearTimers();
    setClosing(false);
    setActive(true);
    timers.current.push(setTimeout(() => setClosing(true), HOLD_MS));
    timers.current.push(
      setTimeout(() => {
        setActive(false);
        setClosing(false);
      }, HOLD_MS + FADE_MS),
    );
  }

  // Clique em link interno → mostra imediatamente (sensação de transição).
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = (e.target as HTMLElement | null)?.closest("a");
      if (!el) return;
      const href = el.getAttribute("href");
      const target = el.getAttribute("target");
      if (!href || target === "_blank" || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:")) return;
      // Só quando a rota realmente muda.
      if (href === pathname) return;
      show();
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  // Mudança de rota concluída → garante a animação (cobre router.push).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    show();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => clearTimers, []);

  if (!active) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 34,
        background:
          "radial-gradient(1200px 800px at 50% 40%, rgba(0,214,247,0.10), transparent), linear-gradient(180deg, #05061f, #0a0a2e)",
        backdropFilter: "blur(6px)",
        opacity: closing ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: closing ? "none" : "auto",
      }}
    >
      <style>{`
        @keyframes pt-assemble {
          0%   { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.2) rotate(var(--rot)); }
          55%  { opacity: 1; }
          100% { opacity: 1; transform: translate(0,0) scale(1) rotate(0deg); }
        }
        @keyframes pt-glow {
          0%,100% { box-shadow: 0 0 10px rgba(0,214,247,0.5), inset 0 0 6px rgba(255,255,255,0.25); }
          50%     { box-shadow: 0 0 22px rgba(85, 169, 247, 0.8), inset 0 0 10px rgba(255,255,255,0.45); }
        }
        @keyframes pt-scan {
          0% { transform: translateY(-140%); } 100% { transform: translateY(140%); }
        }
        .pt-sq {
          width: 26px; height: 26px; border-radius: 6px;
          background: linear-gradient(135deg, #00d4ff,rgb(85, 123, 247));
          animation: pt-assemble .55s cubic-bezier(.2,.9,.25,1) both, pt-glow 1.6s ease-in-out infinite;
        }
        @keyframes pt-bar { 0% { left: -40%; } 100% { left: 100%; } }
      `}</style>

      {/* Grade de quadrados se montando */}
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(3, 26px)", gridTemplateRows: "repeat(3, 26px)", gap: 10 }}>
        {SQUARES.map((s, i) => (
          <span
            key={i}
            className="pt-sq"
            style={{ ["--dx" as string]: `${s.dx}px`, ["--dy" as string]: `${s.dy}px`, ["--rot" as string]: `${s.rot}deg`, animationDelay: `${s.delay}ms, ${s.delay}ms` } as CSSProperties}
          />
        ))}
        {/* Linha de varredura futurista */}
        <span
          style={{
            position: "absolute",
            left: -8,
            right: -8,
            height: 2,
            top: 0,
            background: "linear-gradient(90deg, transparent, #00d4ff, transparent)",
            animation: "pt-scan 1.1s ease-in-out infinite",
            opacity: 0.7,
          }}
        />
      </div>

      {/* Marca + barra de progresso */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: "0.32em",
            color: "#fff",
            textShadow: "0 0 14px rgba(0,214,247,0.6)",
            marginBottom: 12,
          }}
        >
          STARSONIC
        </div>
        <div style={{ position: "relative", width: 160, height: 3, borderRadius: 100, background: "rgba(255,255,255,0.1)", overflow: "hidden", margin: "0 auto" }}>
          <span style={{ position: "absolute", top: 0, height: "100%", width: "40%", borderRadius: 100, background: "linear-gradient(90deg, #00d4ff, #a855f7)", animation: "pt-bar 1s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}
