"use client";

import { useState } from "react";
import Link from "next/link";
import { DistTopNav } from "@/components/distribuicao/DistTopNav";
import { IcCheck, IcClock, IcRocket, IcAlert, IcEdit, IcDisc } from "@/components/distribuicao/icons";
import { EmptyBlock } from "@/components/distribuicao/EmptyBlock";

type Filter = "todos" | "live" | "review" | "processing" | "rejected" | "draft";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "live", label: "Ao vivo" },
  { key: "review", label: "Em análise" },
  { key: "processing", label: "Processando" },
  { key: "rejected", label: "Rejeitados" },
  { key: "draft", label: "Rascunhos" },
];

const BANNERS: Record<Filter, { variant: string; Ico: typeof IcCheck; text: React.ReactNode } | null> = {
  todos: null,
  live: { variant: "success", Ico: IcCheck, text: <>Releases <strong>ao vivo</strong> aparecem aqui, distribuídos pras 218 DSPs e gerando streams e royalties.</> },
  review: { variant: "warn", Ico: IcClock, text: <><strong>Em análise pela LabelGrid.</strong> Validação de metadata (DDEX ERN 4.3), audio fingerprinting e direitos. Tempo médio: 24–48h.</> },
  processing: { variant: "info", Ico: IcRocket, text: <><strong>Em delivery via DDEX.</strong> Spotify e Apple costumam ficar live em 24–72h. Outras DSPs até 7 dias.</> },
  rejected: { variant: "error", Ico: IcAlert, text: <>Releases rejeitados pela LabelGrid ou por uma DSP aparecem aqui com o motivo e as instruções de correção.</> },
  draft: { variant: "info", Ico: IcEdit, text: <>Rascunhos são releases salvos mas ainda não submetidos. Você pode terminar a qualquer momento.</> },
};

const EMPTY: Record<Filter, { title: string; desc: string }> = {
  todos: { title: "Nenhum lançamento ainda", desc: "Quando você distribuir uma música, ela aparece aqui com status, ISRC, UPC e receita." },
  live: { title: "Nenhum release ao vivo", desc: "Assim que um release for aprovado e entregue às DSPs, ele aparece aqui." },
  review: { title: "Nada em análise", desc: "Releases submetidos e aguardando validação da LabelGrid aparecem aqui." },
  processing: { title: "Nada em processamento", desc: "Releases aprovados em delivery pras DSPs aparecem aqui com o progresso." },
  rejected: { title: "Nenhum lançamento rejeitado", desc: "Quando um release for rejeitado, aparece aqui com o motivo e como corrigir." },
  draft: { title: "Nenhum rascunho ativo", desc: "Comece um novo lançamento e salve a qualquer momento pra continuar depois." },
};

export default function LancamentosPage() {
  const [filter, setFilter] = useState<Filter>("todos");
  const banner = BANNERS[filter];
  const empty = EMPTY[filter];

  return (
    <section className="page dist">
      <div className="page-title-row">
        <div>
          <div className="page-title">Meus lançamentos</div>
          <div className="page-sub">Acompanhe o status na LabelGrid e em cada DSP</div>
        </div>
        <Link href="/distribuicao/novo" className="btn-primary">+ Novo lançamento</Link>
      </div>

      <DistTopNav />

      <div className="d-card">
        <div className="d-card-head">
          <div className="filter-pills">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`fpill${filter === f.key ? " active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {banner && (
          <div className={`banner ${banner.variant}`}>
            <span className="b-ico"><banner.Ico width={17} height={17} /></span>
            <div className="b-txt">{banner.text}</div>
          </div>
        )}

        <EmptyBlock
          icon={filter === "rejected" ? <IcCheck width={28} height={28} /> : <IcDisc width={28} height={28} />}
          title={empty.title}
          desc={empty.desc}
        >
          {filter === "draft" && (
            <Link href="/distribuicao/novo" className="btn-primary" style={{ marginTop: 14, display: "inline-flex" }}>
              + Começar novo lançamento
            </Link>
          )}
        </EmptyBlock>
      </div>
    </section>
  );
}
