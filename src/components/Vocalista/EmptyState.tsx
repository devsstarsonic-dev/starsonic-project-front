import { Icon, type IconName } from "@/components/Icon";

// Bloco usado nas telas do Vocalista que só ganham conteúdo quando a geração
// de voz estiver integrada (Suno + tabela artist_voices). Mantém o esqueleto da
// tela navegável sem inventar dado nenhum.
export function EmptyState({
  icon = "clock",
  title,
  text,
  children,
}: {
  icon?: IconName;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 40,
        borderRadius: 14,
        textAlign: "center",
        background: "rgba(3,3,20,0.4)",
        border: "1px dashed var(--border-soft)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, color: "var(--text-3)" }}>
        <Icon name={icon} size={28} />
      </div>
      <p style={{ color: "var(--white)", fontWeight: 700, fontSize: 14, margin: "0 0 6px" }}>{title}</p>
      <p style={{ color: "var(--text-3)", fontSize: 12, margin: 0, lineHeight: 1.6, maxWidth: 440, marginInline: "auto" }}>
        {text}
      </p>
      {children && <div style={{ marginTop: 16 }}>{children}</div>}
    </div>
  );
}
