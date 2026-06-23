import Link from "next/link";
import MusicalBg from "@/components/MusicalBg";
import Sidebar from "@/components/Sidebar";
import ContextualPanel from "@/components/ContextualPanel";
import Header from "@/components/Header";
import { BottomPlayer } from "@/components/BottomPlayer";
import { NowPlayingProvider } from "@/lib/nowPlaying/NowPlayingContext";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getPresets, getCreationStats, getNotifications } from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ===== MODO CONVIDADO (sem login): conteúdo + painel direito, sem sidebar =====
  if (!user) {
    return (
      <>
        <MusicalBg />
        <NowPlayingProvider>
          <div className="guest-app">
            <header
              style={{
                gridColumn: 1,
                gridRow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px",
                borderBottom: "1px solid var(--border-soft)",
                background: "var(--bg-sidebar)",
                backdropFilter: "blur(20px)",
                zIndex: 20,
              }}
            >
              <Link href="/" style={{ display: "flex", alignItems: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo sidebar (2).png"
                  alt="Star Sonic"
                  style={{ width: 150, height: "auto", filter: "drop-shadow(0 0 12px rgba(0,212,255,0.6))" }}
                />
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Link href="/login" className="btn-secondary">Entrar</Link>
                <Link href="/cadastro" className="btn-primary">Criar conta</Link>
              </div>
            </header>

            <main style={{ gridColumn: 1, gridRow: 2, overflowY: "auto", position: "relative" }}>
              <div
                className="guest-canvas"
                style={{
                  maxWidth: 1080,
                  margin: "0 auto",
                  padding: "clamp(20px, 4vw, 56px) clamp(20px, 5vw, 64px)",
                }}
              >
                {children}
              </div>
            </main>

            <ContextualPanel presets={[]} guest />
          </div>
          <BottomPlayer />
        </NowPlayingProvider>
      </>
    );
  }

  // ===== MODO LOGADO: app completo (sidebar + painel + header) =====
  const [profile, presets, stats, notifications] = await Promise.all([
    getProfile(),
    getPresets(),
    getCreationStats(),
    getNotifications(),
  ]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const dashStats = {
    totalCreations: stats.total,
    totalPlays: profile?.total_plays ?? 0,
    inCatalog: stats.inCatalog,
    royalties: "R$ 0,00",
  };

  return (
    <>
      <MusicalBg />
      <NowPlayingProvider>
        <div className="app" id="app-root">
          <Sidebar profile={profile} />
          <ContextualPanel presets={presets} dashStats={dashStats} />
          <Header profile={profile} notifCount={unreadCount} />
          <main className="app-main">{children}</main>
        </div>
        <BottomPlayer />
      </NowPlayingProvider>
    </>
  );
}
