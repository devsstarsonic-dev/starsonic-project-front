"use client";

import { useEffect, useRef } from "react";

// Estrelas cadentes cruzando o topo do Star Card. Puramente decorativo:
// desligado para quem prefere menos movimento e pausado com a aba em segundo plano.
export function Meteors() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const rnd = (min: number, max: number) => Math.random() * (max - min) + min;
    let timer: ReturnType<typeof setTimeout> | null = null;

    function dispararMeteoro() {
      if (!layer) return;
      const w = layer.clientWidth || 278;
      const h = layer.clientHeight || 210;

      // Cai do topo em diagonal para a esquerda-baixo (rotação CSS = sentido horário).
      const ang = rnd(148, 166);
      const rad = (ang * Math.PI) / 180;
      const dist = rnd(w * 0.9, w * 1.5);

      const m = document.createElement("span");
      m.className = "meteor";
      m.style.width = `${rnd(42, 96).toFixed(0)}px`; // comprimento da cauda
      m.style.left = `${rnd(w * 0.35, w * 1.05).toFixed(1)}px`;
      m.style.top = `${rnd(-h * 0.15, h * 0.35).toFixed(1)}px`;
      layer.appendChild(m);

      const pico = rnd(0.55, 1);
      const anim = m.animate(
        [
          { transform: `translate(0,0) rotate(${ang}deg)`, opacity: 0, offset: 0 },
          { opacity: pico, offset: 0.12 },
          { opacity: pico, offset: 0.72 },
          {
            transform: `translate(${(Math.cos(rad) * dist).toFixed(1)}px,${(Math.sin(rad) * dist).toFixed(1)}px) rotate(${ang}deg)`,
            opacity: 0,
            offset: 1,
          },
        ],
        { duration: rnd(750, 1500), easing: "linear", fill: "forwards" },
      );
      anim.onfinish = () => m.remove();
    }

    function agendar() {
      timer = setTimeout(() => {
        dispararMeteoro();
        if (Math.random() < 0.22) dispararMeteoro(); // rajada dupla ocasional
        agendar();
      }, rnd(850, 2500));
    }

    function onVisibility() {
      if (document.hidden) {
        if (timer) clearTimeout(timer);
        timer = null;
      } else if (!timer) {
        agendar();
      }
    }

    const first = setTimeout(dispararMeteoro, 400);
    agendar();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearTimeout(first);
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      layer.replaceChildren();
    };
  }, []);

  return <div ref={layerRef} className="phone-stars-layer" aria-hidden="true" />;
}
