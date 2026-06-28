import { getProfile } from "@/lib/data";
import { AvatarCreator } from "@/components/AvatarCreator";
import { Icon } from "@/components/Icon";

export default async function MeuPerfilPage() {
  const profile = await getProfile();
  const name = profile?.full_name ?? "Artista";
  const initial = profile?.avatar_initial ?? name.charAt(0).toUpperCase();

  return (
    <section className="page">
      <div className="page-title-row" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="users" size={22} style={{ color: "var(--cyan-1)" }} /> Meu Perfil
          </div>
          <div className="page-sub">Gerencie seu perfil e crie seu avatar com IA.</div>
        </div>
      </div>

      {/* Avatar */}
      <div className="card-glow" style={{ padding: 24, marginBottom: 20 }}>
        <AvatarCreator initial={initial} currentAvatarUrl={profile?.avatar_url ?? null} />
      </div>

      {/* Dados do perfil */}
      <div className="card-glow" style={{ padding: 24 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 14 }}>
          Dados da conta
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <Field label="Nome" value={name} />
          <Field label="E-mail" value={profile?.email || "—"} />
          <Field label="Plano" value={profile?.plan || "Free"} />
          <Field label="Créditos" value={String(profile?.credits ?? 0)} />
          <Field label="Localização" value={profile?.location || "—"} />
          <Field label="Website" value={profile?.website || "—"} />
        </div>
        {profile?.bio && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>BIO</div>
            <div style={{ fontSize: 14, color: "var(--text-1)" }}>{profile.bio}</div>
          </div>
        )}
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: "var(--white)", fontWeight: 600 }}>{value}</div>
    </div>
  );
}
