"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { metaForPath, type SidebarKey } from "@/lib/nav";
import type { Profile } from "@/lib/types";

type NavItem = {
  key: SidebarKey;
  href: string;
  label: string;
  icon: React.ReactNode;
};

type NavGroup = {
  label?: string;
  items: NavItem[];
};

const IC = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    className="sidebar-nav-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  />
);

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        key: "dashboard",
        href: "/dashboard",
        label: "Dashboard",
        icon: (
          <IC>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </IC>
        ),
      },
    ],
  },
  {
    label: "Criar",
    items: [
      {
        key: "criar-musica",
        href: "/criar-musica",
        label: "Nova música",
        icon: (
          <IC>
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </IC>
        ),
      },
      {
        key: "compositor",
        href: "/compositor",
        label: "Compositor",
        icon: (
          <IC>
            <path d="M9 3h6l-3 7 3 7H9l3-7-3-7z" />
            <circle cx="12" cy="12" r="9" />
          </IC>
        ),
      },
      {
        key: "letrista",
        href: "/letrista",
        label: "Letrista",
        icon: (
          <IC>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </IC>
        ),
      },
      {
        key: "vocalista",
        href: "/vocalista",
        label: "Vocalista",
        icon: (
          <IC>
            <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </IC>
        ),
      },
      {
        key: "cover-studio",
        href: "/cover-studio",
        label: "Cover Studio",
        icon: (
          <IC>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </IC>
        ),
      },
    ],
  },
  {
    label: "Gerenciar",
    items: [
      {
        key: "projetos",
        href: "/projetos",
        label: "Projetos",
        icon: (
          <IC>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </IC>
        ),
      },
      {
        key: "catalogo",
        href: "/catalogo",
        label: "Catálogo",
        icon: (
          <IC>
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </IC>
        ),
      },
      {
        key: "playlists",
        href: "/criacoes",
        label: "Playlists",
        icon: (
          <IC>
            <path d="M21 15V6" />
            <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
            <path d="M12 12H3" />
            <path d="M16 6H3" />
            <path d="M12 18H3" />
          </IC>
        ),
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        key: "analytics",
        href: "/analytics",
        label: "Analytics",
        icon: (
          <IC>
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </IC>
        ),
      },
      {
        key: "royalties",
        href: "/royalties",
        label: "Royalties",
        icon: (
          <IC>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </IC>
        ),
      },
    ],
  },
  {
    label: "Configurações",
    items: [
      {
        key: "configuracoes",
        href: "/configuracoes",
        label: "Configurações",
        icon: (
          <IC>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1 0 2.8 2 2 0 0 1-2.8 0l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8 0 2 2 0 0 1 0-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 0-2.8 2 2 0 0 1 2.8 0l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 0 2 2 0 0 1 0 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </IC>
        ),
      },
      {
        key: "conta",
        href: "/meu-perfil",
        label: "Conta",
        icon: (
          <IC>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </IC>
        ),
      },
    ],
  },
];

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const activeKey = metaForPath(pathname).sidebar;

  const name = profile?.full_name ?? "Artista";
  const plan = profile?.plan ?? "Free";
  const initial = profile?.avatar_initial ?? name.charAt(0).toUpperCase();

  return (
    <aside className="app-sidebar">
      <Link href="/dashboard" className="sidebar-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo sidebar (2).png"
          alt="Star Sonic logo"
          className="sidebar-logo-icon"
        />
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">Star Sonic</span>
          <span className="sidebar-logo-sub">Plataforma</span>
        </div>
      </Link>

      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group, gi) => (
          <div className="sidebar-group" key={gi}>
            {group.label && (
              <div className="sidebar-group-label">{group.label}</div>
            )}
            {group.items.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`sidebar-nav-item${activeKey === item.key ? " active" : ""}`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-avatar">{initial}</div>
        <div className="sidebar-footer-info">
          <div className="sidebar-footer-name">{name} ✨</div>
          <div className="sidebar-footer-plan">Plano {plan}</div>
        </div>
        <svg
          className="sidebar-footer-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </aside>
  );
}
