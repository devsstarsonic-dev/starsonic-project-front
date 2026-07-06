"use client";

import { useState } from "react";

export function PriceInput({
  initialCents,
  onChange,
}: {
  initialCents: number;
  onChange?: (cents: number) => void;
}) {
  const [value, setValue] = useState(String((initialCents / 100).toFixed(2)));
  const [editing, setEditing] = useState(false);

  const handleBlur = () => {
    const num = parseFloat(value) || 0;
    const cents = Math.round(num * 100);
    onChange?.(cents);
    setValue(String(num.toFixed(2)));
    setEditing(false);
  };

  return (
    <input
      type="number"
      step="0.01"
      min="0"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onFocus={() => setEditing(true)}
      onBlur={handleBlur}
      placeholder="0,00"
      style={{
        background: "rgba(10, 10, 30, 0.6)",
        border: "1px solid rgba(148, 163, 184, 0.15)",
        borderRadius: 8,
        color: "var(--white)",
        padding: "6px 10px",
        fontSize: 13,
        fontFamily: "'JetBrains Mono', monospace",
        width: "100px",
        textAlign: "right",
      }}
    />
  );
}
