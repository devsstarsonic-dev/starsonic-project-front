"use client";

import { useState } from "react";
import { DistTopNav } from "@/components/distribuicao/DistTopNav";
import { IcShield, IcUser, IcCard, IcHome, IcCamera, IcSave, IcZap, IcBank, IcBriefcase } from "@/components/distribuicao/icons";

type Tab = "dados" | "metodos";

const PAY_METHODS = [
  { key: "pix", Ico: IcZap, name: "Pix", desc: "Instantâneo · Sem taxa" },
  { key: "ted", Ico: IcBank, name: "TED", desc: "1 dia útil · Sem taxa" },
  { key: "paypal", Ico: IcBriefcase, name: "PayPal", desc: "Internacional · Taxa 5%" },
];

export default function KycPage() {
  const [tab, setTab] = useState<Tab>("dados");
  const [payMethod, setPayMethod] = useState("pix");

  return (
    <section className="page dist">
      <div className="page-title-row">
        <div>
          <div className="page-title">Pagamento & KYC</div>
          <div className="page-sub">Configure sua conta pra receber royalties</div>
        </div>
        <span className="pill draft">Verificação pendente</span>
      </div>

      <DistTopNav />

      <div className="banner">
        <span className="b-ico"><IcShield width={17} height={17} /></span>
        <div className="b-txt"><strong>Por que pedimos esses dados?</strong> Obrigação fiscal (a Receita Federal exige identificar quem recebe). Tudo criptografado · LGPD compliant · nunca compartilhado.</div>
      </div>

      <div className="d-tabs">
        <button type="button" className={`d-tab${tab === "dados" ? " active" : ""}`} onClick={() => setTab("dados")}><IcUser width={15} height={15} /> Dados pessoais</button>
        <button type="button" className={`d-tab${tab === "metodos" ? " active" : ""}`} onClick={() => setTab("metodos")}><IcCard width={15} height={15} /> Métodos de pagamento</button>
      </div>

      {tab === "dados" && (
        <div className="d-grid-even">
          <div className="d-card">
            <div className="d-card-title" style={{ marginBottom: 16 }}><span className="tico"><IcUser width={15} height={15} /></span> Identificação</div>
            <div className="fgroup">
              <label className="flabel">Nome completo <span className="req">*</span></label>
              <input className="finput" placeholder="Seu nome completo" />
            </div>
            <div className="frow">
              <div className="fgroup"><label className="flabel">CPF <span className="req">*</span></label><input className="finput" placeholder="000.000.000-00" /></div>
              <div className="fgroup"><label className="flabel">Data de nascimento <span className="req">*</span></label><input type="date" className="finput" /></div>
            </div>
            <div className="fgroup"><label className="flabel">Email <span className="req">*</span></label><input className="finput" placeholder="voce@email.com" /></div>
            <div className="fgroup"><label className="flabel">Telefone</label><input className="finput" placeholder="(00) 00000-0000" /></div>
            <div className="fgroup">
              <label className="flabel">Tipo de conta</label>
              <select className="fselect"><option>Pessoa Física (PF)</option><option>Microempreendedor Individual (MEI)</option><option>Pessoa Jurídica (PJ)</option></select>
              <div className="fhelp">PF é o padrão · MEI/PJ permite emitir nota fiscal e reter menos imposto</div>
            </div>
          </div>
          <div className="d-card">
            <div className="d-card-title" style={{ marginBottom: 16 }}><span className="tico"><IcHome width={15} height={15} /></span> Endereço</div>
            <div className="fgroup"><label className="flabel">CEP</label><input className="finput" placeholder="00000-000" /></div>
            <div className="fgroup"><label className="flabel">Endereço completo</label><input className="finput" placeholder="Rua, número" /></div>
            <div className="frow">
              <div className="fgroup"><label className="flabel">Cidade</label><input className="finput" placeholder="Cidade" /></div>
              <div className="fgroup"><label className="flabel">UF</label><select className="fselect"><option>SP</option><option>RJ</option><option>MG</option></select></div>
            </div>
            <div className="banner warn" style={{ marginTop: 6 }}>
              <span className="b-ico"><IcCamera width={17} height={17} /></span>
              <div className="b-txt">Verificação biométrica pendente — documento + selfie serão solicitados antes do primeiro saque.</div>
            </div>
            <button type="button" className="btn-primary" style={{ width: "100%", marginTop: 6 }}><IcSave width={15} height={15} /> Salvar alterações</button>
          </div>
        </div>
      )}

      {tab === "metodos" && (
        <div className="d-card">
          <div className="d-card-title" style={{ marginBottom: 16 }}><span className="tico"><IcCard width={15} height={15} /></span> Método de recebimento principal</div>
          <div className="pay-methods" style={{ marginBottom: 20 }}>
            {PAY_METHODS.map((m) => (
              <div key={m.key} className={`pm-card${payMethod === m.key ? " selected" : ""}`} onClick={() => setPayMethod(m.key)}>
                <div className="pm-ico"><m.Ico width={26} height={26} /></div>
                <div className="pm-name">{m.name}</div>
                <div className="pm-desc">{m.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--white)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><IcZap width={15} height={15} /> Configurar Pix</div>
            <div className="frow">
              <div className="fgroup">
                <label className="flabel">Tipo de chave Pix <span className="req">*</span></label>
                <select className="fselect"><option>CPF</option><option>E-mail</option><option>Telefone</option><option>Chave aleatória (EVP)</option></select>
              </div>
              <div className="fgroup">
                <label className="flabel">Sua chave Pix <span className="req">*</span></label>
                <input className="finput" placeholder="Informe sua chave" />
              </div>
            </div>
            <button type="button" className="btn-primary" style={{ width: "100%" }}><IcSave width={15} height={15} /> Salvar configuração</button>
          </div>
        </div>
      )}
    </section>
  );
}
