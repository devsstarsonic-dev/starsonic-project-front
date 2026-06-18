"use client";

import { useMemo, memo } from "react";

interface Props {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  rows?: number;
  type?: "text" | "textarea";
  required?: boolean;
  helpText?: string;
}

function QuestionFieldComponent({
  label,
  placeholder,
  value,
  onChange,
  maxLength = 500,
  rows = 3,
  type = "text",
  required = false,
  helpText,
}: Props) {
  const charCount = value.length;
  const percentage = useMemo(
    () => (charCount / maxLength) * 100,
    [charCount, maxLength]
  );

  return (
    <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", height: "100%" }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 13,
          color: "var(--white)",
          marginBottom: 10,
        }}
      >
        {label}
        {required && <span style={{ color: "var(--cyan-1)" }}>*</span>}
      </label>

      {type === "text" ? (
        <input
          className="wiz-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
        />
      ) : (
        <textarea
          className="wiz-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
        />
      )}

      {/* Rodapé empurrado pra baixo → contadores alinham entre colunas */}
      <div style={{ marginTop: "auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            fontSize: 11,
            color: "var(--text-3)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <div>{helpText}</div>
          <div>
            {charCount}/{maxLength}
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: 4,
            background: "var(--bg-card-2)",
            borderRadius: 10,
            overflow: "hidden",
            marginTop: 6,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, percentage)}%`,
              background:
                percentage < 70
                  ? "var(--grad-brand)"
                  : percentage < 90
                    ? "var(--orange)"
                    : "var(--red)",
              transition: "all 0.2s",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export const QuestionField = memo(QuestionFieldComponent);
