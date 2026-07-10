import type { ReactNode } from "react";

export type KpiAccent = "cyan" | "purple" | "pink" | "emerald";

export function KpiCard({
  accent,
  hero,
  icon,
  pill,
  label,
  value,
  sub,
  barPct,
}: {
  accent: KpiAccent;
  hero?: boolean;
  icon: ReactNode;
  /** Etiqueta à direita do ícone (ex: "de 84"). */
  pill?: string;
  label: string;
  /** Já formatado. Use "—" quando não houver dado. */
  value: string;
  sub?: ReactNode;
  /** 0–100. Só desenha a barra quando definido. */
  barPct?: number;
}) {
  return (
    <div className={`kpi acc-${accent}${hero ? " kpi-hero" : ""}`}>
      <div className="kpi-top">
        <div className="kpi-icon">{icon}</div>
        {pill && <span className="kpi-pill">{pill}</span>}
      </div>
      <p className="kpi-label">{label}</p>
      <p className="kpi-val">{value}</p>
      {sub && <p className="kpi-sub">{sub}</p>}
      {barPct !== undefined && (
        <div className="kpi-bar">
          <span style={{ width: `${Math.min(100, Math.max(0, barPct))}%` }} />
        </div>
      )}
    </div>
  );
}
