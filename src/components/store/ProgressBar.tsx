export function ProgressBar({
  percent,
  color = "linear-gradient(90deg, var(--cyan-1), var(--purple))",
}: {
  percent: number;
  color?: string;
}) {
  return (
    <div
      style={{
        height: 4,
        background: "rgba(148, 163, 184, 0.15)",
        borderRadius: 100,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          background: color,
          borderRadius: 100,
          width: `${Math.min(100, Math.max(0, percent))}%`,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}
