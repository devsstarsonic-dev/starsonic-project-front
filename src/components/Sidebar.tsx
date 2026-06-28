"use client";

import Link from "next/link";
import { useEffect, useRef, useState, memo, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { metaForPath, type SidebarKey } from "@/lib/nav";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

type NavItem = {
  key: SidebarKey;
  href: string;
  label: string;
  icon: React.ReactNode;
  soon?: boolean;
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
      {
        key: "criar-musica",
        href: "/criar-musica",
        label: "Criar Música",
        icon: (
          <IC>
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </IC>
        ),
      },
    ],
  },
  {
    label: "Biblioteca",
    items: [
      {
        key: "criacoes",
        href: "/criacoes",
        label: "Criações",
        icon: (
          <IC>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </IC>
        ),
      },
      {
        key: "catalogo",
        href: "/catalogo",
        label: "Explorar",
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
    ],
  },
  {
    label: "Sonic Lab",
    items: [
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
            <rect x="2" y="6" width="14" height="12" rx="2" />
            <path d="m22 8-6 4 6 4V8z" />
          </IC>
        ),
      },
      {
        key: "midia",
        href: "/midia",
        label: "Mídia",
        icon: (
          <IC>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </IC>
        ),
      },
      {
        key: "compositor",
        href: "/mixer",
        label: "Mixer",
        soon: true,
        icon: (
          <IC>
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </IC>
        ),
      },
      {
        key: "compositor",
        href: "/podcast-studio",
        label: "Podcast Studio",
        soon: true,
        icon: (
          <IC>
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <circle cx="19" cy="6" r="3" />
          </IC>
        ),
      },
      {
        key: "avatar-studio",
        href: "/avatar-studio",
        label: "Avatar Studio",
        icon: (
          <IC>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </IC>
        ),
      },
      {
        key: "compositor",
        href: "/promotor",
        label: "Promotor",
        soon: true,
        icon: (
          <IC>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </IC>
        ),
      },
    ],
  },
  {
    label: "Monetizar",
    items: [
      {
        key: "distribuicao",
        href: "/distribuicao",
        label: "Distribuição",
        icon: (
          <IC>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </IC>
        ),
      },
      {
        key: "planos",
        href: "/planos",
        label: "Planos",
        icon: (
          <IC>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </IC>
        ),
      },
    ],
  },
];

function SidebarComponent({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeKey = metaForPath(pathname).sidebar;
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setMenuOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  const footerRef = useRef<HTMLDivElement>(null);
  const onClickHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);

  const name = profile?.full_name ?? "Artista";
  const email = profile?.email ?? "";
  const plan = profile?.plan ?? "Free";
  const credits = profile?.credits ?? 0;
  const initial = profile?.avatar_initial ?? name.charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url ?? null;
  const avatarBg: React.CSSProperties = avatarUrl
    ? { background: `center / cover url(${avatarUrl})`, color: "transparent" }
    : {};

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (footerRef.current && !footerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    onClickHandlerRef.current = onClick;
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      onClickHandlerRef.current = null;
    };
  }, []);

  return (
    <aside className="app-sidebar">
      <Link href="/dashboard" className="sidebar-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-login.png"
          alt="Star Sonic logo"
          className="sidebar-logo-icon"
        />
      </Link>

      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group, gi) => (
          <div className="sidebar-group" key={gi}>
            {group.label && (
              <div className="sidebar-group-label">{group.label}</div>
            )}
            {group.items.map((item, ii) =>
              item.soon ? (
                <div
                  key={`${item.key}-${ii}`}
                  className="sidebar-nav-item sidebar-nav-soon"
                  aria-disabled="true"
                >
                  {item.icon}
                  <span className="sidebar-soon-label">{item.label}</span>
                  <span className="sidebar-soon-badge">em breve</span>
                </div>
              ) : (
                <Link
                  key={`${item.key}-${ii}`}
                  href={item.href}
                  className={`sidebar-nav-item${activeKey === item.key ? " active" : ""}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer" ref={footerRef} style={{ position: "relative" }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, cursor: "pointer" }}
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
        >
          <div className="sidebar-footer-avatar" style={avatarBg}>{!avatarUrl && initial}</div>
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
            style={{ transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {menuOpen && (
          <div className="avatar-dropdown" style={{ bottom: "calc(100% + 8px)", top: "auto", left: 0, right: 0, minWidth: 220, opacity: 1, visibility: "visible", transform: "translateY(0)" }}>
            <div className="avatar-dd-header">
              <div className="avatar-dd-avatar" style={avatarBg}>{!avatarUrl && initial}</div>
              <div className="avatar-dd-info">
                <div className="avatar-dd-name">{name}</div>
                <div className="avatar-dd-email">{email}</div>
                <span className="avatar-dd-plan">⚡ {plan} · {credits} créditos</span>
              </div>
            </div>

            <Link className="dd-item" href="/meu-perfil" onClick={() => setMenuOpen(false)}>
              <svg className="dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              Meu Perfil
            </Link>
            <Link className="dd-item" href="/editar-perfil" onClick={() => setMenuOpen(false)}>
              <svg className="dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar Perfil
            </Link>
            <Link className="dd-item" href="/configuracoes" onClick={() => setMenuOpen(false)}>
              <svg className="dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1 0 2.8 2 2 0 0 1-2.8 0l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8 0 2 2 0 0 1 0-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 0-2.8 2 2 0 0 1 2.8 0l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 0 2 2 0 0 1 0 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
              </svg>
              Configurações
            </Link>

            <div className="dd-divider" />

            <Link className="dd-item" href="/tornar-se-persona" onClick={() => setMenuOpen(false)}>
              <svg className="dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Tornar-se Artista
              <span className="badge-mini">NEW</span>
            </Link>
            <Link className="dd-item" href="/planos" onClick={() => setMenuOpen(false)}>
              <svg className="dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 3h12l4 6-10 13L2 9z" />
              </svg>
              Upgrade do plano
            </Link>

            <div className="dd-divider" />

            <button className="dd-item">
              <svg className="dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Central de Ajuda
            </button>

            <div className="dd-divider" />

            <button className="dd-item" onClick={handleLogout} style={{ color: "#f87171" }}>
              <svg className="dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sair
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

const profileComparator = (prev: { profile: Profile | null }, next: { profile: Profile | null }) => {
  if (prev.profile === next.profile) return true;
  if (prev.profile === null && next.profile === null) return true;
  if (prev.profile === null || next.profile === null) return false;
  return (
    prev.profile.id === next.profile.id &&
    prev.profile.full_name === next.profile.full_name &&
    prev.profile.email === next.profile.email &&
    prev.profile.plan === next.profile.plan &&
    prev.profile.credits === next.profile.credits &&
    prev.profile.avatar_initial === next.profile.avatar_initial
  );
};

const Sidebar = memo(SidebarComponent, profileComparator);
export default Sidebar;
