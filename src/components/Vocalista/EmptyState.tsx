import { Icon, type IconName } from "@/components/Icon";

// Bloco usado nas telas do Vocalista que só ganham conteúdo quando a geração
// de voz estiver integrada (Suno + tabela artist_voices). Mantém o esqueleto da
// tela navegável sem inventar dado nenhum.
//
// Vive dentro do painel ciano (.e1-panel), então usa a paleta navy-sobre-ciano
// de vocalista.css — não os tokens do tema escuro.
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
    <div className="voc-empty">
      <div className="voc-empty-icon" aria-hidden="true">
        <Icon name={icon} size={28} />
      </div>
      <p className="voc-empty-title">{title}</p>
      <p className="voc-empty-text">{text}</p>
      {children && <div style={{ marginTop: 16 }}>{children}</div>}
    </div>
  );
}
