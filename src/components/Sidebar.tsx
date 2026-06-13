"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StarLogo, StarLogoBig } from "./Logo";
import { metaForPath, type SidebarKey } from "@/lib/nav";

type Item = {
  key: SidebarKey;
  href: string;
  label: string;
  icon: React.ReactNode;
  style?: React.CSSProperties;
};

const ITEMS: Item[] = [
  {
    key: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    key: "criar-musica",
    href: "/criar-musica",
    label: "Criar Música",
    icon: (
      <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    key: "catalogo",
    href: "/catalogo",
    label: "Catálogo",
    icon: (
      <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 7h18M3 12h18M3 17h12" />
      </svg>
    ),
  },
  {
    key: "criacoes",
    href: "/criacoes",
    label: "Criações",
    icon: (
      <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const active = metaForPath(pathname).sidebar;

  return (
    <aside className="app-sidebar">
      <StarLogoBig className="sidebar-big-logo" />

      {ITEMS.map((it) => (
        <Link
          key={it.key}
          href={it.href}
          className={`icon-btn${active === it.key ? " active" : ""}`}
        >
          {it.icon}
          <span className="tooltip">{it.label}</span>
        </Link>
      ))}

      <div className="sidebar-divider" />

      <Link
        href="/compositor"
        className={`icon-btn${active === "compositor" ? " active" : ""}`}
      >
        <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3h6l-3 7 3 7H9l3-7-3-7z" />
          <circle cx="12" cy="12" r="9" />
        </svg>
        <span className="tooltip">Sonic Lab</span>
      </Link>

      <div className="sidebar-divider" />

      <Link
        href="/distribuicao"
        className={`icon-btn${active === "distribuicao" ? " active" : ""}`}
      >
        <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
        </svg>
        <span className="tooltip">Distribuição</span>
      </Link>

      <Link
        href="/planos"
        className={`icon-btn${active === "planos" ? " active" : ""}`}
        style={{ marginTop: "auto" }}
      >
        <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 3h12l4 6-10 13L2 9z" />
          <path d="M11 3 8 9l4 13 4-13-3-6" />
          <path d="M2 9h20" />
        </svg>
        <span className="tooltip">Planos</span>
      </Link>

      <Link href="/configuracoes" className="icon-btn">
        <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1 0 2.8 2 2 0 0 1-2.8 0l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8 0 2 2 0 0 1 0-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 0-2.8 2 2 0 0 1 2.8 0l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 0 2 2 0 0 1 0 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
        <span className="tooltip">Configurações</span>
      </Link>
    </aside>
  );
}
