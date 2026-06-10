import MusicalBg from "@/components/MusicalBg";
import Sidebar from "@/components/Sidebar";
import ContextualPanel from "@/components/ContextualPanel";
import Header from "@/components/Header";
import { getProfile, getPresets } from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, presets] = await Promise.all([getProfile(), getPresets()]);

  return (
    <>
      <MusicalBg />
      <div className="app" id="app-root">
        <Sidebar />
        <ContextualPanel presets={presets} />
        <Header profile={profile} />
        <main className="app-main">{children}</main>
      </div>
    </>
  );
}
