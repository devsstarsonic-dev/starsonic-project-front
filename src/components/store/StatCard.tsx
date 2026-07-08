import { Icon, type IconName } from "./Icon";

export type StatTrend = {
  value: string;
  direction: "up" | "down" | "flat";
};

// KPI card da Minha Loja. Valor em Orbitron com algarismos tabulares,
// ícone temático translúcido e chip de tendência opcional.
// `delta` é mantido por compatibilidade; prefira `trend`.
export function StatCard({
  label,
  value,
  sub,
  color = "var(--cyan-1)",
  icon,
  trend,
  delta,
  index = 0,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: IconName;
  trend?: StatTrend;
  delta?: { text: string; positive?: boolean };
  index?: number;
}) {
  const effectiveTrend: StatTrend | undefined =
    trend ?? (delta ? { value: delta.text, direction: delta.positive ? "up" : "flat" } : undefined);

  return (
    <div
      className="card-glow kpi-card store-rise"
      style={{ ["--kpi-accent" as string]: color, animationDelay: `${index * 60}ms` }}
    >
      {icon && (
        <span className="kpi-icon">
          <Icon name={icon} size={22} />
        </span>
      )}
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">
        {effectiveTrend ? (
          <span className={`kpi-trend ${effectiveTrend.direction}`}>
            {effectiveTrend.direction !== "flat" && (
              <Icon name={effectiveTrend.direction === "up" ? "trending-up" : "trending-down"} size={13} />
            )}
            {effectiveTrend.value}
          </span>
        ) : (
          sub && <span>{sub}</span>
        )}
      </div>
    </div>
  );
}
