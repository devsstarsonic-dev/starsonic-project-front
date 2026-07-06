export function StatCard({
  label,
  value,
  sub,
  color = "var(--cyan-1)",
  delta,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  delta?: { text: string; positive?: boolean };
}) {
  return (
    <div className="card-glow" style={{ padding: "14px 16px" }}>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: "var(--text-3)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 800,
          fontSize: 28,
          color,
        }}
      >
        {value}
      </div>
      {delta && (
        <div style={{ fontSize: 11, color: delta.positive ? "var(--green)" : "var(--text-3)", marginTop: 4 }}>
          {delta.positive ? "↑" : ""} {delta.text}
        </div>
      )}
      {sub && !delta && (
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
