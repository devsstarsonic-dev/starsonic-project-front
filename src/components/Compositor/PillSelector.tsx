"use client";

import { memo } from "react";

interface Props {
  options: readonly string[];
  selected: string | string[];
  onChange: (value: string | string[]) => void;
  maxSelect?: number;
  multiSelect?: boolean;
  autoOption?: boolean;
  variant?: "grid" | "flex";
}

function PillSelectorComponent({
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
  const limitReached = multiSelect && selectedArray.filter(Boolean).length >= (maxSelect || 99);

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
          flexWrap: "wrap" as const,
          gap: 6,
        };

  return (
    <div>
      {multiSelect && maxSelect > 1 && (
        <div style={{
          fontSize: 12,
          color: limitReached ? "var(--cyan-1)" : "var(--text-3)",
          fontFamily: "var(--font-mono)",
          marginBottom: 8,
          fontWeight: limitReached ? 600 : 400,
        }}>
          {selectedArray.filter(Boolean).length}/{maxSelect} selecionados
          {limitReached && " · limite atingido"}
        </div>
      )}

      <div style={containerStyle}>
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
              fontFamily: "var(--font-editorial)",
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

        {options.map((option) => {
          const sel = isSelected(option);
          const disabled = !sel && limitReached;
          return (
            <button
              key={option}
              onClick={() => handleClick(option)}
              className={sel ? "btn-pill active" : "btn-pill"}
              disabled={disabled}
              style={{
                padding: variant === "grid" ? "10px" : "10px 14px",
                background: sel
                  ? "linear-gradient(135deg, #00d4ff, #3b9eff)"
                  : "var(--bg-card)",
                color: sel ? "var(--bg-deep)" : disabled ? "var(--text-4)" : "var(--text-1)",
                border: sel ? "none" : "1px solid var(--border-soft)",
                borderRadius: "100px",
                fontFamily: "var(--font-editorial)",
                fontSize: 12,
                fontWeight: sel ? 700 : 600,
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                textAlign: "center",
                whiteSpace: "nowrap",
                opacity: disabled ? 0.4 : 1,
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const PillSelector = memo(PillSelectorComponent);
