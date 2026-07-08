import Link from "next/link";
import { Icon, type IconName } from "./Icon";

// Estado vazio padrão da Minha Loja. Usado quando ainda não há vendas,
// saques ou criações no catálogo. Ícone translúcido + copy + CTA opcional.

export function EmptyState({
  icon,
  title,
  description,
  cta,
  compact = false,
}: {
  icon: IconName;
  title: string;
  description: string;
  cta?: { label: string; href: string };
  compact?: boolean;
}) {
  return (
    <div className="store-empty" style={compact ? { padding: "20px 20px", gap: 4 } : undefined}>
      <div className="store-empty-icon" style={compact ? { width: 44, height: 44, marginBottom: 4 } : undefined}>
        <Icon name={icon} size={compact ? 20 : 28} />
      </div>
      <div className="store-empty-title" style={compact ? { fontSize: 13 } : undefined}>{title}</div>
      <p className="store-empty-desc" style={compact ? { fontSize: 11.5 } : undefined}>{description}</p>
      {cta && (
        <Link href={cta.href} className="btn-primary store-empty-cta">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
