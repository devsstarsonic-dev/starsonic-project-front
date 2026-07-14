import Link from "next/link";
import { DistTopNav } from "@/components/distribuicao/DistTopNav";
import { StatCard } from "@/components/distribuicao/StatCard";
import { EmptyBlock } from "@/components/distribuicao/EmptyBlock";
import { IcDisc, IcPlay, IcMoney, IcClock } from "@/components/distribuicao/icons";
import { getDsps } from "@/lib/data";

export default async function DistribuicaoPage() {
  const dsps = await getDsps();

  return (
    <section className="page dist">
      <div className="page-title-row">
        <div>
          <div className="page-title">Distribuição</div>
          <div className="page-sub">Suas músicas em 220+ plataformas globais via LabelGrid</div>
        </div>
        <Link href="/distribuicao/novo" className="btn-primary">
          + Novo lançamento
        </Link>
      </div>

      <DistTopNav />

      <div className="stat-row">
        <StatCard accent="cyan" icon={<IcDisc />} label="No catálogo" value="—" sub="total de lançamentos" />
        <StatCard accent="purple" icon={<IcPlay />} label="Streams totais" value="—" sub="todas as plataformas" />
        <StatCard accent="green" icon={<IcMoney />} label="Royalties do mês" value="—" sub="disponível pra saque" />
        <StatCard accent="amber" icon={<IcClock />} label="Em análise" value="—" sub="aguardando aprovação" />
      </div>

      <div className="d-grid-2">
        <div className="d-card">
          <div className="d-card-head">
            <div className="d-card-title"><span className="tico"><IcDisc width={15} height={15} /></span> Últimos lançamentos</div>
            <Link href="/distribuicao/lancamentos" className="btn-secondary" style={{ fontSize: 12 }}>Ver todos →</Link>
          </div>
          <EmptyBlock
            icon={<IcDisc width={28} height={28} />}
            title="Nenhum lançamento ainda"
            desc="Distribua sua primeira música e acompanhe aqui o status na LabelGrid e em cada DSP."
          >
            <Link href="/distribuicao/novo" className="btn-primary" style={{ marginTop: 14, display: "inline-flex" }}>
              + Começar distribuição
            </Link>
          </EmptyBlock>
        </div>

        <div className="d-card">
          <div className="d-card-title" style={{ marginBottom: 14 }}>
            <span className="tico"><IcPlay width={15} height={15} /></span> Principais plataformas
          </div>
          {dsps.slice(0, 6).map((dsp) => (
            <div className="plat-bar" key={dsp.id}>
              <div className="plat-ico">{dsp.emoji}</div>
              <div className="plat-info">
                <div className="plat-name">{dsp.name}</div>
                <div className="plat-meta">{dsp.reach}</div>
              </div>
              <div className="plat-val">—</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
