import Link from "next/link";
import { getCreations } from "@/lib/data";
import { CreationsBrowser } from "@/components/CreationsBrowser";
import { Icon } from "@/components/Icon";

export default async function CriacoesPage() {
  const creations = await getCreations();

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <span className="badge cyan" style={{ marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="folder" size={11} /> BIBLIOTECA PESSOAL · PRIVADO
          </span>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="palette" size={22} style={{ color: "var(--cyan-1)" }} /> Minhas Criações
          </div>
          <div className="page-sub">Tudo que você criou — músicas, vídeos, letras, podcasts e capas. Organizado em um só lugar.</div>
        </div>
        <Link href="/criar-musica" className="btn-primary"><Icon name="plus" size={15} /> Nova criação</Link>
      </div>

      <CreationsBrowser creations={creations} />

      {/* AÇÕES EM MASSA */}
      <div style={{ background: "rgba(0, 212, 255, 0.04)", border: "1px solid var(--border-soft)", borderRadius: 12, padding: "14px 18px", marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="bulb" size={22} style={{ color: "var(--cyan-1)" }} />
          <div>
            <div style={{ fontWeight: 700, color: "var(--white)", fontSize: 13 }}>Compartilhe suas criações</div>
            <div style={{ fontSize: 11, color: "var(--text-2)" }}>
              Torne públicas e elas aparecerão no <Link href="/catalogo" style={{ color: "var(--cyan-1)", fontWeight: 700 }}>Catálogo da Comunidade</Link>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-pill" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="folder" size={14} style={{ color: "var(--cyan-1)" }} /> Exportar todas</button>
          <Link href="/distribuicao" className="btn-primary"><Icon name="rocket" size={15} /> Distribuir</Link>
        </div>
      </div>
    </section>
  );
}
