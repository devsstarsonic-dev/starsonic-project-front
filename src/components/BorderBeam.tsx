interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
}

export function BorderBeam({
  className = "",
  size = 100,
  duration = 10,
  delay = 0,
  colorFrom = "#3b9eff",
  colorTo = "#3be6ff",
}: BorderBeamProps) {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        borderRadius: "inherit",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: `${size}px`,
          height: `${size}px`,
          background: `linear-gradient(45deg, ${colorFrom}, ${colorTo})`,
          borderRadius: "50%",
          filter: "blur(40px)",
          animation: `beam-rotate ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
          top: "-50%",
          left: "-50%",
        }}
      />
      <style jsx>{`
        @keyframes beam-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
