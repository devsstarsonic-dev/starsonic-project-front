"use client";

import { useState } from "react";
import { DistTopNav } from "@/components/distribuicao/DistTopNav";
import { IcPlay, IcUsers, IcClock, IcHeart, IcGlobe, IcChart } from "@/components/distribuicao/icons";
import { StatCard } from "@/components/distribuicao/StatCard";
import { EmptyBlock } from "@/components/distribuicao/EmptyBlock";

type Tab = "streams" | "geo" | "audience";

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("streams");

  return (
    <section className="page dist">
      <div className="page-title-row">
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-sub">Streams, geografia e comportamento da audiência</div>
        </div>
        <select className="fselect" style={{ width: "auto" }}>
          <option>Últimos 30 dias</option>
          <option>Últimos 7 dias</option>
          <option>Últimos 90 dias</option>
          <option>Todo o período</option>
        </select>
      </div>

      <DistTopNav />

      <div className="d-tabs">
        <button type="button" className={`d-tab${tab === "streams" ? " active" : ""}`} onClick={() => setTab("streams")}><IcPlay width={15} height={15} /> Streams</button>
        <button type="button" className={`d-tab${tab === "geo" ? " active" : ""}`} onClick={() => setTab("geo")}><IcGlobe width={15} height={15} /> Geografia</button>
        <button type="button" className={`d-tab${tab === "audience" ? " active" : ""}`} onClick={() => setTab("audience")}><IcUsers width={15} height={15} /> Audiência</button>
      </div>

      {tab === "streams" && (
        <>
          <div className="stat-row">
            <StatCard accent="cyan" icon={<IcPlay />} label="Streams totais" value="—" />
            <StatCard accent="purple" icon={<IcUsers />} label="Ouvintes únicos" value="—" />
            <StatCard accent="green" icon={<IcClock />} label="Tempo médio escutado" value="—" />
            <StatCard accent="amber" icon={<IcHeart />} label="Saves / favoritos" value="—" />
          </div>
          <div className="d-card">
            <div className="d-card-title" style={{ marginBottom: 14 }}><span className="tico"><IcChart width={15} height={15} /></span> Streams diários</div>
            <div className="chart-empty"><div className="ce-ico"><IcChart width={26} height={26} /></div><div className="ce-txt">Sem dados de streams ainda</div></div>
          </div>
        </>
      )}

      {tab === "geo" && (
        <div className="d-card">
          <div className="d-card-title" style={{ marginBottom: 14 }}><span className="tico"><IcGlobe width={15} height={15} /></span> Onde te ouvem</div>
          <EmptyBlock icon={<IcGlobe width={28} height={28} />} title="Sem dados geográficos" desc="Países e cidades dos seus ouvintes aparecem aqui conforme os streams acontecem." />
        </div>
      )}

      {tab === "audience" && (
        <div className="d-card">
          <div className="d-card-title" style={{ marginBottom: 14 }}><span className="tico"><IcUsers width={15} height={15} /></span> Perfil da audiência</div>
          <EmptyBlock icon={<IcUsers width={28} height={28} />} title="Sem dados de audiência" desc="Dispositivos, faixa etária e comportamento (completude, skip, saves) aparecem aqui com o tempo." />
        </div>
      )}
    </section>
  );
}
