export function MiniBarChart({
  heights,
}: {
  heights: number[]; // 0-100
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 1,
        height: 160,
      }}
    >
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            minWidth: 0,
            height: `${h}%`,
            background: "linear-gradient(180deg, var(--cyan-1), var(--purple))",
            borderRadius: "4px 4px 0 0",
          }}
        />
      ))}
    </div>
  );
}
