"use client";

import { useState } from "react";
import Link from "next/link";
import { DistTopNav } from "@/components/distribuicao/DistTopNav";
import { IcUpload, IcHistory, IcZap, IcKey, IcCalendar, IcMoney } from "@/components/distribuicao/icons";
import { EmptyBlock } from "@/components/distribuicao/EmptyBlock";

type Tab = "sacar" | "historico";

export default function SaldoPage() {
  const [tab, setTab] = useState<Tab>("sacar");

  return (
    <section className="page dist">
      <div className="page-title-row">
        <div>
          <div className="page-title">Saldo & saques</div>
          <div className="page-sub">Receba seus royalties via Pix instantâneo</div>
        </div>
      </div>

      <DistTopNav />

      <div className="balance-card">
        <div className="bal-item primary"><div className="bal-lbl">Saldo disponível</div><div className="bal-val">—</div><div className="bal-help">Pronto pra saque imediato</div></div>
        <div className="bal-item"><div className="bal-lbl">Em processamento</div><div className="bal-val">—</div><div className="bal-help">Liberação em ~30 dias</div></div>
        <div className="bal-item"><div className="bal-lbl">Total ganho (lifetime)</div><div className="bal-val">—</div><div className="bal-help">Desde o primeiro release</div></div>
      </div>

      <div className="d-tabs">
        <button type="button" className={`d-tab${tab === "sacar" ? " active" : ""}`} onClick={() => setTab("sacar")}><IcUpload width={15} height={15} /> Solicitar saque</button>
        <button type="button" className={`d-tab${tab === "historico" ? " active" : ""}`} onClick={() => setTab("historico")}><IcHistory width={15} height={15} /> Histórico de saques</button>
      </div>

      {tab === "sacar" && (
        <div className="d-grid-even">
          <div className="d-card">
            <div className="d-card-title" style={{ marginBottom: 16 }}><span className="tico"><IcZap width={15} height={15} /></span> Saque rápido via Pix</div>
            <div className="fgroup">
              <label className="flabel">Valor a sacar <span className="req">*</span></label>
              <input className="finput" placeholder="R$ 0,00" />
              <div className="fhelp">Mínimo R$ 50,00 · Disponível: —</div>
            </div>
            <div className="fgroup">
              <label className="flabel">Chave Pix cadastrada</label>
              <div style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "var(--text-3)", display: "flex" }}><IcKey width={18} height={18} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "var(--white)" }}>Nenhuma chave cadastrada</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>Cadastre sua chave em Pagamento & KYC</div>
                </div>
                <Link href="/distribuicao/kyc" className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>Configurar</Link>
              </div>
            </div>
            <div className="banner">
              <span className="b-ico"><IcZap width={17} height={17} /></span>
              <div className="b-txt"><strong>Pix instantâneo:</strong> cai na sua conta em até 30 segundos. Sem taxas.</div>
            </div>
            <button type="button" className="btn-primary" style={{ width: "100%", marginTop: 8 }} disabled><IcUpload width={15} height={15} /> Solicitar saque</button>
          </div>

          <div className="d-card">
            <div className="d-card-title" style={{ marginBottom: 16 }}><span className="tico"><IcCalendar width={15} height={15} /></span> Próximas liberações</div>
            <EmptyBlock icon={<IcCalendar width={28} height={28} />} title="Nenhuma liberação prevista" desc="Quando você tiver royalties em processamento, as datas de liberação aparecem aqui." />
          </div>
        </div>
      )}

      {tab === "historico" && (
        <div className="d-card">
          <div className="d-card-title" style={{ marginBottom: 14 }}><span className="tico"><IcHistory width={15} height={15} /></span> Todos os saques realizados</div>
          <EmptyBlock icon={<IcMoney width={28} height={28} />} title="Nenhum saque ainda" desc="Quando você solicitar seu primeiro saque via Pix, ele aparece aqui com data, valor, transação e status." />
        </div>
      )}
    </section>
  );
}
