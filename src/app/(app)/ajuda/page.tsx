import { AjudaChat } from "@/components/ajuda/AjudaChat";
import { Icon } from "@/components/Icon";

export default function AjudaPage() {
  return (
    <section className="page" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="page-title-row">
        <div>
          <span className="badge cyan" style={{ marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="robot" size={11} /> SUPORTE · IA
          </span>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="robot" size={22} style={{ color: "var(--cyan-1)" }} /> Central de Ajuda
          </div>
          <div className="page-sub">Tire suas dúvidas sobre a Star Sonic com a nossa assistente.</div>
        </div>
      </div>

      <AjudaChat />
    </section>
  );
}
