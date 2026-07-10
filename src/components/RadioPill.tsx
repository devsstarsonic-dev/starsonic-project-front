"use client";

import { memo } from "react";

// Cápsula branca de seleção, padrão visual das etapas do Modo Studio.
// ponytail: /compositor/page.tsx e /compositor/step-2/page.tsx ainda têm cópias
// locais idênticas — convergir pra cá quando alguma delas for mexida.
export const RadioPill = memo(function RadioPill({
  label,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="e1-radio-row"
      onClick={onClick}
      aria-pressed={selected}
      disabled={disabled}
      style={disabled ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
    >
      <span className={selected ? "e1-radio e1-radio--on" : "e1-radio"}>
        {selected && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span className="e1-radio-label">{label}</span>
    </button>
  );
});
