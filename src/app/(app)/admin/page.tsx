import { redirect } from "next/navigation";
import { getProfile, getAllProfiles, getPlans } from "@/lib/data";
import { AdminUsersTable } from "@/components/AdminUsersTable";

// ponytail: "é admin" = full_name exatamente "Admininstrador" (o nome da
// conta admin cadastrada, com esse typo mesmo) — sem coluna de role ainda.
// Upgrade natural: profiles.role + checar no servidor também nas rotas de
// escrita (src/app/api/admin/users/route.ts já isola por lá).
export default async function AdminPage() {
  const profile = await getProfile();
  if (profile?.full_name !== "Admininstrador") redirect("/dashboard");

  const [users, plans] = await Promise.all([getAllProfiles(), getPlans()]);

  const totalCredits = users.reduce((sum, u) => sum + (u.credits ?? 0), 0);
  const planCounts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.plan] = (acc[u.plan] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <div className="page-title">👑 Administrador</div>
          <div className="page-sub">Gerencie os usuários da plataforma: créditos, plano e conta</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 20 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Usuários</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--white)" }}>{users.length}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Créditos em circulação</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--cyan-1)" }}>{totalCredits}</div>
        </div>
        {Object.entries(planCounts).map(([plan, count]) => (
          <div className="card" key={plan} style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Plano {plan}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--white)" }}>{count}</div>
          </div>
        ))}
      </div>

      <AdminUsersTable users={users} plans={plans} />
    </section>
  );
}
