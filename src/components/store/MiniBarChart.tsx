import { Icon } from "./Icon";

export function MiniBarChart({
  heights,
}: {
  heights: number[]; // 0-100
}) {
  const hasData = heights.some((h) => h > 0);

  if (!hasData) {
    return (
      <div className="store-chart-empty">
        <span className="ic">
          <Icon name="bar-chart" size={30} />
        </span>
        <span style={{ fontSize: 13 }}>Sem faturamento nos últimos 30 dias</span>
        <span style={{ fontSize: 11 }}>O gráfico aparece assim que sua primeira venda cair</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, height: 160 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          title={`${h}%`}
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
