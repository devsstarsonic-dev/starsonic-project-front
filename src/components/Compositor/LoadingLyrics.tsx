"use client";

interface Props {
  onContinue?: () => void;
}

export function LoadingLyrics({ onContinue }: Props) {
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
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #a855f7, #ec4899)",
          position: "relative",
          marginBottom: 32,
          boxShadow: "0 0 60px rgba(168, 85, 247, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 56,
          animation: "pulse 2s ease-in-out infinite",
        }}
      >
        ✨
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
        Compondo sua letra...
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
        Nosso compositor inteligente está transformando suas respostas em versos, refrões e
        estrutura musical. Isso leva apenas alguns segundos.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 380,
          width: "100%",
          marginBottom: 30,
        }}
      >
        {[
          "Analisando seu briefing musical",
          "Estruturando versos e refrão",
          "Aplicando palavras obrigatórias",
          "Refinando rimas e métrica",
          "Validando restrições",
        ].map((step, i) => (
          <div
            key={step}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              background:
                i < 3
                  ? "rgba(34, 197, 94, 0.06)"
                  : i === 2
                    ? "rgba(0, 212, 255, 0.06)"
                    : "rgba(34, 197, 94, 0.06)",
              border:
                i < 3
                  ? "1px solid rgba(34, 197, 94, 0.3)"
                  : i === 2
                    ? "1px solid var(--cyan-1)"
                    : "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: 10,
              textAlign: "left",
              fontSize: 13,
            }}
          >
            <span style={{ fontSize: 16, color: i < 3 ? "var(--green)" : "var(--cyan-1)" }}>
              {i < 2 ? "✓" : i === 2 ? "⏳" : "○"}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "rgba(0, 212, 255, 0.04)",
          border: "1px solid var(--border-soft)",
          borderRadius: 12,
          padding: "14px 18px",
          maxWidth: 480,
          fontSize: 12,
          color: "var(--text-2)",
          lineHeight: 1.6,
        }}
      >
        <b style={{ color: "var(--cyan-1)" }}>💡 Você sabia?</b> Nosso sistema processa milhares
        de músicas em português que ajudam a criar versos que rimam naturalmente e respeitam a
        métrica musical.
      </div>

      <button
        onClick={onContinue}
        style={{
          marginTop: 24,
          background: "linear-gradient(135deg, #a855f7, #ec4899)",
          color: "var(--bg-deep)",
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 800,
          fontSize: 13,
          padding: "10px 24px",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          letterSpacing: "0.3px",
          boxShadow: "0 4px 20px rgba(168, 85, 247, 0.3)",
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
          0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(168, 85, 247, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 80px rgba(168, 85, 247, 0.7); }
        }
      `}</style>
    </div>
  );
}
