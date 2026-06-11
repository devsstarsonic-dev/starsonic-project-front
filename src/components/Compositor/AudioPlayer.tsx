"use client";

interface Props {
  audioUrl: string;
  title?: string;
}

export function AudioPlayer({ audioUrl, title }: Props) {
  return (
    <div style={{ marginBottom: 12 }}>
      <audio
        controls
        style={{
          width: "100%",
          height: 32,
          background: "var(--bg-card)",
          borderRadius: 10,
          padding: 10,
          border: "1px solid var(--border-soft)",
          accentColor: "var(--cyan-1)",
        }}
        src={audioUrl}
      >
        Seu navegador não suporta áudio.
      </audio>
    </div>
  );
}
