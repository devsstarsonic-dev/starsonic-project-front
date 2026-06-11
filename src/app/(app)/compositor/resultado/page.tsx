"use client";

import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { VersionCard } from "@/components/Compositor/VersionCard";
import { FeaturesGrid } from "@/components/Compositor/FeaturesGrid";
import { useState, useEffect } from "react";

export default function ResultadoPage() {
  const router = useRouter();
  const { state, reset } = useComposition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const result = state.result;

  if (!result) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <h2>Nenhuma composição encontrada</h2>
        <button
          onClick={() => router.push("/criar-musica")}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            background: "linear-gradient(135deg, #a855f7, #ec4899)",
            color: "var(--bg-deep)",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          Voltar para Criar Música
        </button>
      </div>
    );
  }

  const handleNewComposition = () => {
    reset();
    router.push("/criar-musica");
  };

  return (
    <div className="page">
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00d4ff, #3b9eff)",
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              boxShadow: "0 0 40px rgba(0, 212, 255, 0.4)",
            }}
          >
            🎵
          </div>
          <h1
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 36,
              fontWeight: 800,
              color: "var(--white)",
              marginBottom: 10,
            }}
          >
            {result.title}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-2)",
              marginBottom: 20,
            }}
          >
            Sua composição está pronta! Ouça as versões geradas abaixo.
          </p>
        </div>

        {/* Versões */}
        <div
          style={{
            marginBottom: 40,
          }}
        >
          <h2
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 18,
              fontWeight: 800,
              color: "var(--white)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            🎸 {result.versions.length} Versões Geradas
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {result.versions.map((version, idx) => (
              <VersionCard
                key={version.id}
                version={version}
                title={result.title}
                isPrimary={idx === 0}
                onDownload={() => alert("Download: " + version.id)}
                onFavorite={() => alert("Favoritado: " + version.id)}
                onShare={() => alert("Compartilhar: " + version.id)}
              />
            ))}
          </div>
        </div>

        {/* Letra */}
        <div
          style={{
            marginBottom: 40,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 24,
          }}
        >
          <h2
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 18,
              fontWeight: 800,
              color: "var(--white)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            📝 Letra da Música
          </h2>

          <pre
            style={{
              background: "var(--bg-card-2)",
              padding: 16,
              borderRadius: 10,
              color: "var(--text-1)",
              fontFamily: "'Sora', monospace",
              fontSize: 12,
              lineHeight: 1.8,
              overflow: "auto",
              maxHeight: 400,
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
          >
            {result.lyrics}
          </pre>

          <button
            style={{
              marginTop: 12,
              padding: "8px 16px",
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              color: "var(--bg-deep)",
              border: "none",
              borderRadius: 8,
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            ✏️ Editar Letra
          </button>
        </div>

        {/* Features */}
        <FeaturesGrid />

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid var(--border-soft)",
          }}
        >
          <button
            onClick={() => router.push("/criacoes")}
            style={{
              flex: 1,
              padding: "12px 24px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-soft)",
              borderRadius: 10,
              color: "var(--text-1)",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            📚 Ver Minhas Criações
          </button>
          <button
            onClick={handleNewComposition}
            style={{
              flex: 1,
              padding: "12px 24px",
              background: "linear-gradient(135deg, #00d4ff, #3b9eff)",
              border: "none",
              borderRadius: 10,
              color: "var(--bg-deep)",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: "0 4px 20px rgba(0, 212, 255, 0.3)",
            }}
          >
            🎵 Compor Outra Música
          </button>
        </div>
      </div>
    </div>
  );
}
