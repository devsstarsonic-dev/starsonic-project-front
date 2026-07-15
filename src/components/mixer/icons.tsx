// Ícones SVG (line style) do StarMix. Herdam currentColor — mesmo padrão de
// src/components/distribuicao/icons.tsx.
const S = (p: React.SVGProps<SVGSVGElement>) => ({
  width: 18, height: 18, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const, ...p,
});

export const IcSliders = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}>
    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);
export const IcZap = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);
export const IcSparkles = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></svg>
);
export const IcMusic = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
);
export const IcFlame = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}>
    <path d="M12 22c3.4 0 6.2-2.6 6.2-6 0-2.5-1.5-4.5-2.8-5.9-.3 1.3-1 2-1.9 2.4.6-2.6-.7-5.4-2.8-7.3-.4 2.6-1.9 3.8-3.2 5.3C6.3 11.9 5.8 13.7 5.8 16c0 3.4 2.8 6 6.2 6Z" />
    <path d="M12 18.5c1.4 0 2.5-1 2.5-2.4 0-1-.6-1.8-1.2-2.4-.4 1.1-1 1.3-1.6 1.5.2-1-.4-1.9-1-2.4-.3 1.1-1.2 1.7-1.2 3.3 0 1.4 1.1 2.4 2.5 2.4Z" opacity="0.55" />
  </svg>
);
export const IcRadio = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}>
    <path d="M17 3.5 6.5 7.5" />
    <rect x="2.5" y="7.5" width="19" height="12.5" rx="2" />
    <circle cx="8" cy="14" r="3.2" />
    <circle cx="8" cy="14" r="0.6" fill="currentColor" stroke="none" />
    <path d="M14.5 11.5h4M14.5 14h4M14.5 16.5h4" />
  </svg>
);
// Baixo: guitarra baixo com corpo, braço e tarraxas (headstock).
export const IcGuitar = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}>
    <path d="M9 13.5a4.5 4.5 0 1 0 4.2 6.1c.4-1 .1-1.9.6-2.6.5-.7 1.4-.7 2.1-1.2a3 3 0 0 0-3.5-4.8c-.9.4-1.2 1.3-2 1.8-.6.4-1 .5-1.4.7Z" />
    <circle cx="8.5" cy="17.5" r="1.4" />
    <path d="M13.5 12 19 6.5" strokeWidth={2.1} />
    <path d="M18 5.5 20.5 3" />
    <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="19" cy="9" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);
// Disco de vinil com trilha e reflexo.
export const IcDiscVinyl = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" opacity="0.55" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <path d="M12 3a9 9 0 0 1 6.4 2.6" opacity="0.6" />
  </svg>
);
// Bateria: bumbo com pele, aros e duas baquetas cruzadas.
export const IcDrum = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}>
    <path d="M4 3.5 10.5 10" strokeWidth={2.2} />
    <path d="M20 3.5 13.5 10" strokeWidth={2.2} />
    <circle cx="3.4" cy="3" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="20.6" cy="3" r="1.1" fill="currentColor" stroke="none" />
    <ellipse cx="12" cy="12" rx="8" ry="4" />
    <path d="M4 12v4c0 2.2 3.6 4 8 4s8-1.8 8-4v-4" />
    <path d="M6 14.4v3.4M12 16v4M18 14.4v3.4" opacity="0.55" />
  </svg>
);
// Vocal: microfone com grade e base.
export const IcMic = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}>
    <rect x="8.5" y="2.5" width="7" height="12" rx="3.5" />
    <path d="M11 6h2M11 9h2" opacity="0.6" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
    <path d="M12 18v3.5" />
    <path d="M8 21.5h8" />
  </svg>
);
// Teclado: piano com teclas pretas preenchidas.
export const IcPiano = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="1.8" />
    <path d="M2.5 13.5h19" />
    <path d="M6.5 5.5v8M10.5 5.5v8M14.5 5.5v8M18.5 5.5v8" />
    <rect x="5.3" y="5.5" width="2.4" height="5" rx="0.5" fill="currentColor" stroke="none" opacity="0.9" />
    <rect x="9.3" y="5.5" width="2.4" height="5" rx="0.5" fill="currentColor" stroke="none" opacity="0.9" />
    <rect x="13.3" y="5.5" width="2.4" height="5" rx="0.5" fill="currentColor" stroke="none" opacity="0.9" />
    <rect x="17.3" y="5.5" width="2.4" height="5" rx="0.5" fill="currentColor" stroke="none" opacity="0.9" />
  </svg>
);
// Outros: barras de equalizador (cordas/sopros diversos).
export const IcViolin = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}>
    <path d="M4 9v6" strokeWidth={2.3} />
    <path d="M8 5v14" strokeWidth={2.3} />
    <path d="M12 8v8" strokeWidth={2.3} />
    <path d="M16 3v18" strokeWidth={2.3} />
    <path d="M20 9v6" strokeWidth={2.3} />
  </svg>
);
// Lua crescente — preset Acústico.
export const IcMoon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}>
    <path d="M20.5 14A8.5 8.5 0 1 1 10 3.5 6.7 6.7 0 0 0 20.5 14Z" />
    <path d="M16 6.5h.01M18.5 9h.01" opacity="0.7" />
  </svg>
);
// Mic de mão com ondas sonoras — preset Karaokê (sem barra cruzando).
export const IcKaraoke = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}>
    <circle cx="8.5" cy="8.5" r="4.5" />
    <path d="M8.5 6.5v4M6.5 8.5h4" opacity="0.55" />
    <path d="m11.7 11.7 8 8a1.6 1.6 0 0 1-2.3 2.3l-8-8" />
    <path d="M18 4c1.2 1 1.2 2.6 0 3.6M20.2 2c2.2 1.8 2.2 5 0 6.8" opacity="0.6" />
  </svg>
);
export const IcHeadphones = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><rect x="1" y="15" width="6" height="7" rx="2" /><rect x="17" y="15" width="6" height="7" rx="2" /></svg>
);
export const IcRocket = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
);
export const IcStore = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="m2 7 1.5-4.5A2 2 0 0 1 5.4 1h13.2a2 2 0 0 1 1.9 1.5L22 7" /><path d="M2 7v13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7" /><path d="M2 7h20" /><path d="M9 22V13h6v9" /></svg>
);
export const IcDownload = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
export const IcLink = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1" /></svg>
);
export const IcGem = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M2 9h20M8 3l4 6-4 12M16 3l-4 6 4 12" /></svg>
);
export const IcCheck = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M20 6 9 17l-5-5" /></svg>
);
export const IcSave = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>
);
export const IcClock = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
);
export const IcTarget = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg>
);
export const IcRotateCcw = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M3 12a9 9 0 1 0 3-6.7" /><polyline points="3 4 3 9 8 9" /></svg>
);
export const IcBarChart = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M12 20V10M18 20V4M6 20v-4" /></svg>
);
export const IcLoader = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M12 2a10 10 0 0 1 10 10" /></svg>
);
export const IcCircle = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><circle cx="12" cy="12" r="9" /></svg>
);
