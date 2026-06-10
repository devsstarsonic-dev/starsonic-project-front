"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { metaForPath } from "@/lib/nav";
import type { Profile } from "@/lib/types";

export default function Header({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const breadcrumb = metaForPath(pathname).breadcrumb;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const name = profile?.full_name ?? "Artista";
  const email = profile?.email ?? "";
  const plan = profile?.plan ?? "Free";
  const credits = profile?.credits ?? 0;
  const initial = profile?.avatar_initial ?? name.charAt(0).toUpperCase();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <header className="app-header">
      <div className="breadcrumb">
        Star Sonic <span className="sep">›</span>{" "}
        <span className="curr">{breadcrumb}</span>
      </div>
      <div className="header-right">
        <input
          type="text"
          className="header-search"
          placeholder="🔍 Buscar (Ctrl K)"
        />
        <button className="notif-btn" title="Notificações">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </button>
        <span className="credit-badge">⚡ {credits} créditos</span>
        <div
          className={`avatar-wrap${open ? " open" : ""}`}
          ref={wrapRef}
        >
          <div
            className="avatar"
            title={name}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            {initial}
          </div>
          <div className="avatar-dropdown">
            <div className="avatar-dd-header">
              <div className="avatar-dd-avatar">{initial}</div>
              <div className="avatar-dd-info">
                <div className="avatar-dd-name">{name}</div>
                <div className="avatar-dd-email">{email}</div>
                <span className="avatar-dd-plan">
                  ⚡ {plan} · {credits} créditos
                </span>
              </div>
            </div>

            <Link className="dd-item" href="/meu-perfil" onClick={() => setOpen(false)}>
              <svg className="dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Meu Perfil
            </Link>
            <Link className="dd-item" href="/editar-perfil" onClick={() => setOpen(false)}>
              <svg className="dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar Perfil
            </Link>
            <Link className="dd-item" href="/configuracoes" onClick={() => setOpen(false)}>
              <svg className="dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1 0 2.8 2 2 0 0 1-2.8 0l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8 0 2 2 0 0 1 0-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 0-2.8 2 2 0 0 1 2.8 0l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 0 2 2 0 0 1 0 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
              </svg>
              Configurações
            </Link>

            <div className="dd-divider" />

            <Link className="dd-item" href="/tornar-se-persona" onClick={() => setOpen(false)}>
              <svg className="dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Tornar-se Artista
              <span className="badge-mini">NEW</span>
            </Link>
            <Link className="dd-item" href="/planos" onClick={() => setOpen(false)}>
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
          </div>
        </div>
      </div>
    </header>
  );
}
