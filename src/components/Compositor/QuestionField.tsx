"use client";

import { useMemo } from "react";

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

export function QuestionField({
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
    <div style={{ marginBottom: 16 }}>
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
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-soft)",
            borderRadius: 10,
            color: "var(--text-1)",
            fontFamily: "var(--font-editorial)",
            fontSize: 14,
            transition: "all 0.15s",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-soft)",
            borderRadius: 10,
            color: "var(--text-1)",
            fontFamily: "var(--font-editorial)",
            fontSize: 14,
            resize: "vertical",
            transition: "all 0.15s",
            boxSizing: "border-box",
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
          fontSize: 12,
          color: "var(--text-3)",
        }}
      >
        <div>{helpText}</div>
        <div>
          {charCount}/{maxLength}
        </div>
      </div>

      {maxLength && (
        <div
          style={{
            width: "100%",
            height: 4,
            background: "var(--bg-card-2)",
            borderRadius: 2,
            overflow: "hidden",
            marginTop: 6,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${percentage}%`,
              background:
                percentage < 70
                  ? "var(--cyan-1)"
                  : percentage < 90
                    ? "var(--orange)"
                    : "var(--red)",
              transition: "all 0.2s",
            }}
          />
        </div>
      )}
    </div>
  );
}
