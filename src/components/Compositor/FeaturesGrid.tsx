"use client";

interface Feature {
  icon: string;
  title: string;
  description: string;
  cost: string;
}

interface Props {
  features?: Feature[];
  onFeatureClick?: (feature: Feature) => void;
}

export function FeaturesGrid({
  features,
  onFeatureClick
}: Props) {
  const defaultFeatures: Feature[] = [
    {
      icon: "✏️",
      title: "Editar Música",
      description: "Refine a letra, ajuste estilo ou regenere uma das versões.",
      cost: "⚡ 75 créditos",
    },
    {
      icon: "🎬",
      title: "Gerar Vídeo MP4",
      description: "Crie um vídeo visualizer com sua música. Perfeito para redes sociais.",
      cost: "⚡ 10 créditos",
    },
    {
      icon: "🎶",
      title: "Gerar em 5 Estilos",
      description: "Mesma letra em 5 gêneros diferentes. Encontre o ritmo perfeito.",
      cost: "⚡ 375 créditos",
    },
    {
      icon: "🔗",
      title: "Link Compartilhável",
      description: "Gere um link público pra qualquer pessoa ouvir sua música.",
      cost: "⚡ Grátis",
    },
  ];

  const featuresToShow = features || defaultFeatures;

  return (
    <div style={{ marginBottom: 24 }}>
      <h3
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 16,
          fontWeight: 800,
          color: "var(--white)",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        ✨ Faça mais com sua música
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {featuresToShow.map((feature, idx) => (
          <div
            key={idx}
            onClick={() => onFeatureClick?.(feature)}
            style={{
              background: "linear-gradient(180deg, rgba(22, 22, 77, 0.85), rgba(10, 10, 46, 0.85))",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 16,
              cursor: onFeatureClick ? "pointer" : "default",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (onFeatureClick) {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 8px 24px rgba(0, 212, 255, 0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (onFeatureClick) {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "rgba(0, 212, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                marginBottom: 12,
              }}
            >
              {feature.icon}
            </div>

            <h4
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "var(--white)",
                marginBottom: 4,
              }}
            >
              {feature.title}
            </h4>

            <p
              style={{
                fontSize: 12,
                color: "var(--text-2)",
                lineHeight: 1.5,
                marginBottom: 12,
              }}
            >
              {feature.description}
            </p>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "rgba(0, 212, 255, 0.08)",
                border: "1px solid var(--border)",
                color: "var(--cyan-1)",
                padding: "3px 10px",
                borderRadius: "100px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {feature.cost}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
