import type { ReactNode } from "react";

export type StatAccent = "cyan" | "purple" | "pink" | "green" | "amber";

export function StatCard({
  accent,
  icon,
  label,
  value,
  sub,
}: {
  accent: StatAccent;
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-ico ${accent}`}>{icon}</div>
      <div className="stat-lbl">{label}</div>
      <div className="stat-val">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
