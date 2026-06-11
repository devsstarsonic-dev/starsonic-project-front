"use client";

interface Props {
  progress?: number;
  onContinue?: () => void;
}

export function LoadingMusic({ progress = 45, onContinue }: Props) {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #3be6ff, #00d4ff)",
          position: "relative",
          marginBottom: 32,
          boxShadow: "0 0 80px rgba(0, 212, 255, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          animation: "pulse 2s ease-in-out infinite",
        }}
      >
        🎵
      </div>

      <h2
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 28,
          fontWeight: 800,
          color: "var(--white)",
          marginBottom: 10,
        }}
      >
        Compondo sua música...
      </h2>

      <p
        style={{
          fontSize: 14,
          color: "var(--text-2)",
          maxWidth: 480,
          lineHeight: 1.6,
          marginBottom: 30,
        }}
      >
        Estamos transformando sua letra em <b style={{ color: "var(--cyan-1)" }}>2 versões musicais completas</b>. Isso leva entre 2 e 3 minutos.
      </p>

      {/* Audio Visualizer */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 4,
          height: 40,
          marginBottom: 24,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: `${40 * (0.3 + Math.random() * 0.7)}%`,
              background: "linear-gradient(180deg, var(--cyan-1), var(--purple))",
              borderRadius: 2,
              animation: `bounce 0.8s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{ maxWidth: 500, width: "100%", marginBottom: 20 }}>
        <div
          style={{
            height: 8,
            background: "var(--bg-card)",
            border: "1px solid var(--border-soft)",
            borderRadius: "100px",
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: "100%",
              background: "linear-gradient(135deg, var(--cyan-1), var(--purple))",
              width: `${progress}%`,
              borderRadius: "100px",
              boxShadow: "0 0 12px rgba(0, 212, 255, 0.5)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "var(--text-3)",
          }}
        >
          <span>
            <b style={{ color: "var(--cyan-1)" }}>Processando sua música...</b>
          </span>
          <span>~{Math.floor(progress / 15)}/3:00</span>
        </div>
      </div>

      <button
        onClick={onContinue}
        style={{
          marginTop: 24,
          background: "linear-gradient(135deg, #3be6ff, #00d4ff)",
          color: "var(--bg-deep)",
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 800,
          fontSize: 13,
          padding: "10px 24px",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          letterSpacing: "0.3px",
          boxShadow: "0 4px 20px rgba(0, 212, 255, 0.3)",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.15s",
        }}
      >
        Continuar →
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(0, 212, 255, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 100px rgba(0, 212, 255, 0.7); }
        }
        @keyframes bounce {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.4); }
        }
      `}</style>
    </div>
  );
}
