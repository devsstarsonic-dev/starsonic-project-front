"use client";

export function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      style={{
        width: 40,
        height: 22,
        borderRadius: 100,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: checked ? "linear-gradient(135deg, var(--cyan-1), var(--purple))" : "rgba(148, 163, 184, 0.2)",
        transition: "all 0.2s",
        position: "relative",
        padding: 0,
        flexShrink: 0,
      }}
      aria-pressed={checked}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 20 : 2,
          width: 18,
          height: 18,
          background: "#fff",
          borderRadius: "50%",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}
