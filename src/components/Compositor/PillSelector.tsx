"use client";

interface Props {
  options: string[];
  selected: string | string[];
  onChange: (value: string | string[]) => void;
  maxSelect?: number;
  multiSelect?: boolean;
  autoOption?: boolean;
  variant?: "grid" | "flex";
}

export function PillSelector({
  options,
  selected,
  onChange,
  maxSelect = 1,
  multiSelect = false,
  autoOption = false,
  variant = "grid",
}: Props) {
  const selectedArray = Array.isArray(selected) ? selected : [selected];
  const isSelected = (option: string) => selectedArray.includes(option);

  const handleClick = (option: string) => {
    if (multiSelect) {
      const updated = isSelected(option)
        ? selectedArray.filter((s) => s !== option)
        : selectedArray.length < (maxSelect || 99)
          ? [...selectedArray, option]
          : selectedArray;
      onChange(updated);
    } else {
      onChange(isSelected(option) ? "" : option);
    }
  };

  const containerStyle =
    variant === "grid"
      ? {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: 8,
        }
      : {
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
        };

  return (
    <div style={containerStyle as any}>
      {autoOption && (
        <button
          onClick={() => onChange(multiSelect ? [] : "")}
          style={{
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            justifyContent: variant === "flex" ? "flex-start" : "center",
            border: "1.5px dashed rgba(34, 197, 94, 0.4)",
            background: "rgba(34, 197, 94, 0.04)",
            borderRadius: "100px",
            color: "var(--green)",
            fontFamily: "'Sora', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <span>⚨</span>
          <span>Star Sonic escolhe</span>
        </button>
      )}

      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleClick(option)}
          className={isSelected(option) ? "btn-pill active" : "btn-pill"}
          style={{
            padding: variant === "grid" ? "10px" : "10px 14px",
            background: isSelected(option)
              ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
              : "var(--bg-card)",
            color: isSelected(option) ? "var(--bg-deep)" : "var(--text-1)",
            border: isSelected(option) ? "none" : "1px solid var(--border-soft)",
            borderRadius: "100px",
            fontFamily: "'Sora', sans-serif",
            fontSize: 12,
            fontWeight: isSelected(option) ? 700 : 600,
            cursor: "pointer",
            transition: "all 0.15s",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
