"use client";

import { useState } from "react";
import { DistTopNav } from "@/components/distribuicao/DistTopNav";
import { IcMoney, IcChart, IcDisc, IcGlobe, IcCalendar, IcDownload, IcClock } from "@/components/distribuicao/icons";
import { StatCard } from "@/components/distribuicao/StatCard";
import { EmptyBlock } from "@/components/distribuicao/EmptyBlock";

type Tab = "musica" | "plataforma" | "mes";

const EMPTY: Record<Tab, { Ico: typeof IcDisc; title: string; desc: string }> = {
  musica: { Ico: IcDisc, title: "Sem royalties por música", desc: "Quando suas músicas começarem a gerar streams, o ganho de cada uma aparece aqui." },
  plataforma: { Ico: IcChart, title: "Sem royalties por plataforma", desc: "A receita por DSP (Spotify, Apple, YouTube…) aparece aqui após o primeiro relatório." },
  mes: { Ico: IcCalendar, title: "Sem histórico mensal", desc: "A evolução mês a mês dos seus royalties aparece aqui conforme os repasses chegam." },
};

export default function RoyaltiesPage() {
  const [tab, setTab] = useState<Tab>("musica");
  const e = EMPTY[tab];

  return (
    <section className="page dist">
      <div className="page-title-row">
        <div>
          <div className="page-title">Royalties</div>
          <div className="page-sub">Acompanhe seus ganhos por música, plataforma e período</div>
        </div>
        <button type="button" className="btn-secondary"><IcDownload width={15} height={15} /> Exportar CSV</button>
      </div>

      <DistTopNav />

      <div className="stat-row">
        <StatCard accent="green" icon={<IcMoney />} label="Receita bruta (mês)" value="—" />
        <StatCard accent="purple" icon={<IcChart />} label="Fee Star Sonic (20%)" value="—" />
        <StatCard accent="cyan" icon={<IcMoney />} label="Sua parte líquida" value="—" />
        <StatCard accent="amber" icon={<IcDisc />} label="Total acumulado" value="—" />
      </div>

      <div className="d-tabs">
        <button type="button" className={`d-tab${tab === "musica" ? " active" : ""}`} onClick={() => setTab("musica")}><IcDisc width={15} height={15} /> Por música</button>
        <button type="button" className={`d-tab${tab === "plataforma" ? " active" : ""}`} onClick={() => setTab("plataforma")}><IcGlobe width={15} height={15} /> Por plataforma</button>
        <button type="button" className={`d-tab${tab === "mes" ? " active" : ""}`} onClick={() => setTab("mes")}><IcCalendar width={15} height={15} /> Por mês</button>
      </div>

      <div className="d-card">
        <EmptyBlock icon={<e.Ico width={28} height={28} />} title={e.title} desc={e.desc} />
      </div>

      <div className="banner warn">
        <span className="b-ico"><IcClock width={17} height={17} /></span>
        <div className="b-txt"><strong>Sobre os prazos:</strong> DSPs pagam a LabelGrid em ~60–90 dias após o mês. O saldo fica "pendente" por 30 dias (proteção contra chargeback) antes de liberar pra saque.</div>
      </div>
    </section>
  );
}
