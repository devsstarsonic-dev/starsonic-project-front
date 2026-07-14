"use client";

import { useState } from "react";
import Link from "next/link";
import { IcChart, IcGlobe, IcMoney, IcSignal, IcHistory, IcDisc, IcPlay, IcLink, IcBan } from "@/components/distribuicao/icons";
import { EmptyBlock } from "@/components/distribuicao/EmptyBlock";
import { StatCard, type StatAccent } from "@/components/distribuicao/StatCard";

type Tab = "overview" | "platforms" | "roy" | "history";

const TABS: { key: Tab; label: string; Ico: typeof IcChart; cnt?: string }[] = [
  { key: "overview", label: "Overview", Ico: IcChart },
  { key: "platforms", label: "Plataformas", Ico: IcGlobe },
  { key: "roy", label: "Royalties", Ico: IcMoney },
  { key: "history", label: "Histórico", Ico: IcHistory },
];

export default function ReleaseDetailPage({ params }: { params: { id: string } }) {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <section className="page dist">
      <div className="page-title-row">
        <Link href="/distribuicao/lancamentos" className="btn-secondary">← Voltar pra lançamentos</Link>
      </div>

      <div className="detail-hero">
        <div className="detail-cover"><IcDisc width={40} height={40} /></div>
        <div>
          <div className="detail-metarow">
            <span className="detail-tag">Release</span>
            <span className="pill draft">Sem dados</span>
          </div>
          <h1 className="detail-title">Release {params.id}</h1>
          <p className="detail-artist">As informações deste release serão carregadas do banco.</p>
          <div className="info-grid">
            {["ISRC", "UPC", "Label", "Declaração IA", "Duração", "Distribuidora"].map((l) => (
              <div className="info-item" key={l}><div className="label">{l}</div><div className="value">—</div></div>
            ))}
          </div>
          <div className="row-actions">
            <button type="button" className="btn-primary"><IcPlay width={15} height={15} /> Reproduzir</button>
            <button type="button" className="btn-secondary"><IcLink width={15} height={15} /> Smart Link</button>
            <button type="button" className="btn-danger"><IcBan width={15} height={15} /> Remover</button>
          </div>
        </div>
      </div>

      <div className="d-tabs">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={`d-tab${tab === t.key ? " active" : ""}`} onClick={() => setTab(t.key)}>
            <t.Ico width={15} height={15} /> {t.label}{t.cnt && <span className="cnt">{t.cnt}</span>}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="stat-row">
            {(
              [
                { Ico: IcPlay, c: "cyan", l: "Streams totais" },
                { Ico: IcMoney, c: "green", l: "Receita" },
                { Ico: IcGlobe, c: "purple", l: "Países" },
                { Ico: IcSignal, c: "pink", l: "DSPs ativas" },
              ] as { Ico: typeof IcPlay; c: StatAccent; l: string }[]
            ).map((s) => (
              <StatCard key={s.l} accent={s.c} icon={<s.Ico width={16} height={16} />} label={s.l} value="—" />
            ))}
          </div>
          <div className="d-card">
            <div className="d-card-title" style={{ marginBottom: 14 }}><span className="tico"><IcChart width={15} height={15} /></span> Streams nos últimos 30 dias</div>
            <div className="chart-empty"><div className="ce-ico"><IcChart width={26} height={26} /></div><div className="ce-txt">Sem dados de streams ainda</div></div>
          </div>
        </>
      )}

      {tab === "platforms" && (
        <div className="d-card">
          <div className="d-card-title" style={{ marginBottom: 14 }}><span className="tico"><IcSignal width={15} height={15} /></span> Status por DSP</div>
          <EmptyBlock icon={<IcGlobe width={28} height={28} />} title="Sem plataformas ativas" desc="Quando o release for entregue às DSPs, o status de cada plataforma aparece aqui." />
        </div>
      )}

      {tab === "roy" && (
        <div className="d-card">
          <div className="d-card-title" style={{ marginBottom: 14 }}><span className="tico"><IcMoney width={15} height={15} /></span> Histórico de royalties</div>
          <EmptyBlock icon={<IcMoney width={28} height={28} />} title="Sem royalties ainda" desc="Os relatórios mensais de royalty deste release aparecem aqui após o primeiro repasse das DSPs." />
        </div>
      )}

      {tab === "history" && (
        <div className="d-card">
          <div className="d-card-title" style={{ marginBottom: 14 }}><span className="tico"><IcHistory width={15} height={15} /></span> Linha do tempo do release</div>
          <EmptyBlock icon={<IcHistory width={28} height={28} />} title="Sem histórico" desc="Cada etapa (submissão, fingerprinting, aprovação, delivery) aparece aqui conforme o release avança." />
        </div>
      )}
    </section>
  );
}
