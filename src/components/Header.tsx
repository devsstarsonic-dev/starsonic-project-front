"use client";

import type { Profile } from "@/lib/types";

const LightningIcon = () => (
  <svg className="credit-btn-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L4.09 12.97L11 13L11 22L19.91 11.03L13 11L13 2Z" />
  </svg>
);

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-4)", pointerEvents: "none" }}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function Header({
  profile,
  notifCount = 0,
}: {
  profile: Profile | null;
  notifCount?: number;
}) {
  const credits = profile?.credits ?? 0;

  return (
    <header className="app-header">
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <SearchIcon />
        <input
          type="text"
          className="header-search"
          placeholder="Buscar (Ctrl K)"
          style={{ paddingLeft: 32 }}
        />
      </div>

      <div className="header-right">
        <button className="notif-btn" title="Notificações" aria-label="Notificações">
          <BellIcon />
          {notifCount > 0 && (
            <span className="notif-badge" aria-label={`${notifCount} notificações`}>
              {notifCount}
            </span>
          )}
        </button>

        <button className="credit-btn">
          <LightningIcon />
          {credits} créditos
        </button>

      </div>
    </header>
  );
}
