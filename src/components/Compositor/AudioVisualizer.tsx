"use client";

interface Props {
  isAnimating?: boolean;
}

export function AudioVisualizer({ isAnimating = true }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 8,
        height: 120,
        margin: "20px 0",
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: "30%",
            background: `linear-gradient(180deg, #00d4ff, #3b9eff)`,
            borderRadius: 4,
            animation: isAnimating
              ? `bounce 0.8s ease-in-out ${i * 0.1}s infinite`
              : "none",
          }}
        />
      ))}

      <style>{`
        @keyframes bounce {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
