"use client";

import { ReactNode, useState, useMemo } from "react";

interface Props {
  title: string;
  lyrics: string;
  selectedAnswers: Record<string, any>;
  totalCost: number;
  saldo: number;
  onEdit?: () => void;
  onCompose?: () => void;
  statsInfo?: ReactNode;
}

export function ReviewPanel({
  title,
  lyrics,
  selectedAnswers,
  totalCost,
  saldo,
  onEdit,
  onCompose,
  statsInfo,
}: Props) {
  const [editedLyrics, setEditedLyrics] = useState(lyrics);

  const lyricsStats = useMemo(
    () => ({
      words: editedLyrics.split(/\s+/).length,
      choruses: (editedLyrics.match(/\[Chorus\]/g) || []).length,
    }),
    [editedLyrics]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 20 }}>
      {/* Seção Superior: Grid 2x2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Card 1: Sua Música (reduzido) */}
        <div
          style={{
            background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--border-soft)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              📝
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  color: "var(--white)",
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                Clique para editar
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
            <textarea
              value={editedLyrics}
              onChange={(e) => setEditedLyrics(e.target.value)}
              style={{
                width: "100%",
                fontFamily: "'Caveat', cursive",
                fontSize: 13,
                lineHeight: 1.6,
                height: 180,
                background: "rgba(10, 10, 46, 0.6)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "8px 10px",
                color: "var(--text-1)",
                resize: "none",
                cursor: "text",
              }}
            />

            {/* Stats */}
            <div
              style={{
                marginTop: 10,
                padding: "8px 10px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-soft)",
                borderRadius: 8,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: "var(--text-3)",
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <div>📝 <b style={{ color: "var(--cyan-1)" }}>{lyricsStats.words}</b></div>
              <div>🎵 <b style={{ color: "var(--cyan-1)" }}>{lyricsStats.choruses}</b></div>
            </div>
          </div>
        </div>

        {/* Card 2: Suas Escolhas */}
        <div
          style={{
            background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: "var(--text-3)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            📋 Suas escolhas
            <span
              style={{
                marginLeft: "auto",
                color: "var(--cyan-1)",
                cursor: "pointer",
                fontSize: 10,
              }}
              onClick={onEdit}
            >
              editar
            </span>
          </div>

          <div
            style={{
              fontSize: 10,
              lineHeight: 1.7,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              overflowY: "auto",
              maxHeight: 280,
            }}
          >
            {Object.entries(selectedAnswers).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "4px 0",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <span style={{ color: "var(--text-3)", fontSize: 9 }}>{key}</span>
                <span style={{ color: "var(--white)", fontWeight: 600, fontSize: 9, textAlign: "right" }}>
                  {String(Array.isArray(value) ? value.join(", ") : value).substring(0, 20)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Custo Total */}
        <div
          style={{
            background: "linear-gradient(180deg, rgba(168, 85, 247, 0.08), rgba(236, 72, 153, 0.04))",
            border: "1px solid rgba(168, 85, 247, 0.25)",
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: "var(--purple)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              💰 Custo total
            </div>

            <div style={{ fontSize: 10, lineHeight: 1.8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <span style={{ color: "var(--text-2)", fontSize: 9 }}>⚡ Letra</span>
                <span style={{ color: "var(--green)", fontWeight: 600, fontSize: 9 }}>incluso</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <span style={{ color: "var(--text-2)", fontSize: 9 }}>🎵 Composição</span>
                <span style={{ color: "var(--white)", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}>
                  {totalCost} créditos
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <span style={{ color: "var(--text-2)", fontSize: 9 }}>🎶 Versões</span>
                <span style={{ color: "var(--white)", fontWeight: 600, fontSize: 9 }}>2 músicas</span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0 0",
              marginTop: 8,
              borderTop: "1px dashed rgba(168, 85, 247, 0.3)",
              fontSize: 12,
            }}
          >
            <span style={{ color: "var(--text-1)", fontWeight: 700 }}>TOTAL</span>
            <span
              style={{
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              {totalCost}
            </span>
          </div>

          <div
            style={{
              fontSize: 10,
              color: "var(--text-3)",
              fontFamily: "'JetBrains Mono', monospace",
              padding: "10px 10px",
              background: "rgba(10, 10, 46, 0.4)",
              borderRadius: 8,
              marginTop: 10,
              textAlign: "center",
            }}
          >
            Saldo: <b style={{ color: "var(--cyan-1)" }}>{saldo}</b>
          </div>
        </div>
      </div>

      {/* Seção Média: Pré-visualizações lado a lado */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Pré-visualização da Música */}
        <div
          style={{
            background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "20px",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "var(--text-3)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            🎵 Pré-visualização da Música
          </div>

          <div
            style={{
              background: "rgba(10, 10, 46, 0.4)",
              border: "1px dashed var(--border-soft)",
              borderRadius: 10,
              padding: "20px",
              textAlign: "center",
              color: "var(--text-3)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
            }}
          >
            [Pré-visualização da música aparecerá aqui após composição]
          </div>
        </div>

        {/* Pré-visualização do Vídeo */}
        <div
          style={{
            background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "20px",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "var(--text-3)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            🎬 Pré-visualização do Vídeo
          </div>

          <div
            style={{
              background: "rgba(10, 10, 46, 0.4)",
              border: "1px dashed var(--border-soft)",
              borderRadius: 10,
              padding: "20px",
              textAlign: "center",
              color: "var(--text-3)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
            }}
          >
            [Vídeo será gerado após composição da música]
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          background: "var(--grad-card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
          ⚡ Saldo: <b style={{ color: "var(--cyan-1)" }}>{saldo} créditos</b>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={onEdit}
            style={{
              background: "var(--bg-card)",
              color: "var(--text-1)",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              padding: "9px 16px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            ⬅ Editar respostas
          </button>
          <button
            onClick={onCompose}
            style={{
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              color: "var(--bg-deep)",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 800,
              fontSize: 13,
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.3px",
            }}
          >
            🎵 COMPOR MÚSICA · {totalCost} CRÉDITOS
          </button>
        </div>
      </div>
    </div>
  );
}
