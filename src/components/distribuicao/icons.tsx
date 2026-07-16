// Ícones SVG (line style) usados nas telas de distribuição. Herdam currentColor.
const S = (p: React.SVGProps<SVGSVGElement>) => ({
  width: 18, height: 18, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const, ...p,
});

export const IcDisc = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
);
export const IcPlay = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
);
export const IcMoney = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
);
export const IcClock = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
);
export const IcChart = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M12 20V10M18 20V4M6 20v-4" /></svg>
);
export const IcGlobe = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
);
export const IcUsers = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
export const IcHeart = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
);
export const IcCheck = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M20 6 9 17l-5-5" /></svg>
);
export const IcAlert = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);
export const IcRocket = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
);
export const IcEdit = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>
);
export const IcBulb = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M9 18h6M10 22h4M15.09 14c.36-.68.9-1.25 1.41-1.83A6 6 0 1 0 7.5 12.17c.51.58 1.05 1.15 1.41 1.83.31.58.5 1.34.55 2h5.08c.05-.66.24-1.42.55-2z" /></svg>
);
export const IcBot = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M12 8V4" /><circle cx="12" cy="3" r="1" /><line x1="8" y1="14" x2="8" y2="15" /><line x1="16" y1="14" x2="16" y2="15" /><path d="M3 13H1v3h2" /><path d="M21 13h2v3h-2" /></svg>
);
export const IcImage = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
);
export const IcSparkles = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></svg>
);
export const IcUpload = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
export const IcDownload = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
export const IcSave = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>
);
export const IcLink = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1" /></svg>
);
export const IcBan = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><circle cx="12" cy="12" r="10" /><line x1="4.9" y1="4.9" x2="19.1" y2="19.1" /></svg>
);
export const IcSignal = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 20V4" /></svg>
);
export const IcHistory = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M3 3v5h5" /><path d="M3.05 13a9 9 0 1 0 2.13-6.36L3 8" /><path d="M12 7v5l4 2" /></svg>
);
export const IcCalendar = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);
export const IcZap = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);
export const IcKey = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0L19 4m-3.5 3.5L19 11" /></svg>
);
export const IcShield = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
export const IcCamera = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
);
export const IcHome = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></svg>
);
export const IcBank = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><line x1="3" y1="21" x2="21" y2="21" /><line x1="5" y1="21" x2="5" y2="10" /><line x1="10" y1="21" x2="10" y2="10" /><line x1="14" y1="21" x2="14" y2="10" /><line x1="19" y1="21" x2="19" y2="10" /><polygon points="12 2 20 8 4 8 12 2" /></svg>
);
export const IcBriefcase = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);
export const IcCard = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
);
export const IcUser = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
export const IcSearch = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...S(p)}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
