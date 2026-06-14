import MusicalBg from "@/components/MusicalBg";
import Sidebar from "@/components/Sidebar";
import ContextualPanel from "@/components/ContextualPanel";
import Header from "@/components/Header";
import { getProfile, getPresets, getCreationStats, getNotifications } from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <div className="app" id="app-root">
        <Sidebar profile={profile} />
        <ContextualPanel presets={presets} dashStats={dashStats} />
        <Header profile={profile} notifCount={unreadCount} />
        <main className="app-main">{children}</main>
      </div>
    </>
  );
}
