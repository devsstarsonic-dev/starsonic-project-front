"use client";

import { useMemo, useRef, useState } from "react";
import { formatBRL } from "@/lib/format";
import type { Sale } from "@/lib/types";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const fmtDay = (d: Date) => `${d.getDate()} ${MESES[d.getMonth()]}`;

function niceMax(m: number) {
  if (m <= 0) return 100;
  if (m <= 50) return Math.ceil(m / 10) * 10;
  if (m <= 200) return Math.ceil(m / 20) * 20;
  return Math.ceil(m / 50) * 50;
}

/** Agrega as vendas em um balde por dia, dos últimos `days` dias até hoje. */
function agruparPorDia(sales: Sale[], days: number) {
  const buckets: { date: Date; cents: number }[] = [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const indices = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    indices.set(d.toDateString(), buckets.length);
    buckets.push({ date: d, cents: 0 });
  }

  for (const s of sales) {
    const d = new Date(s.date);
    if (Number.isNaN(d.getTime())) continue;
    d.setHours(0, 0, 0, 0);
    const idx = indices.get(d.toDateString());
    if (idx !== undefined) buckets[idx].cents += s.netCents;
  }
  return buckets;
}

export function RevenueChart({ sales }: { sales: Sale[] }) {
  const [days, setDays] = useState(30);
  const [tip, setTip] = useState<{ x: number; y: number; cents: number; date: Date } | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);

  const { buckets, total, max, peakIdx, avg } = useMemo(() => {
    const b = agruparPorDia(sales, days);
    let t = 0;
    let m = 0;
    let p = -1;
    b.forEach((o, i) => {
      t += o.cents;
      if (o.cents > m) {
        m = o.cents;
        p = i;
      }
    });
    return { buckets: b, total: t, max: m, peakIdx: p, avg: t / days };
  }, [sales, days]);

  const vazio = total === 0;
  const top = niceMax(max / 100);

  function mostrarTip(el: HTMLElement, o: { date: Date; cents: number }) {
    const pr = plotRef.current?.getBoundingClientRect();
    const br = el.getBoundingClientRect();
    if (!pr) return;
    setTip({ x: br.left - pr.left + br.width / 2, y: br.top - pr.top, cents: o.cents, date: o.date });
  }

  const xLabels = [0, Math.floor(days * 0.25), Math.floor(days * 0.5), Math.floor(days * 0.75), days - 1];

  return (
    <div className="store-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h3 style={{ color: "var(--white)", fontWeight: 700, lineHeight: 1.2 }}>Faturamento</h3>
          <p style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>Últimos {days} dias</p>
        </div>
        <select
          className="input-star"
          style={{ width: "auto", fontSize: 12, padding: "6px 10px" }}
          aria-label="Período do gráfico"
          value={days}
          onChange={(e) => {
            setDays(Number(e.target.value));
            setTip(null);
          }}
        >
          <option value={30}>30 dias</option>
          <option value={60}>60 dias</option>
          <option value={90}>90 dias</option>
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 20 }}>
        <p className="chart-head-total" style={{ color: "var(--white)", fontSize: 30, fontWeight: 700 }}>
          {formatBRL(total)}
        </p>
        <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>
          {vazio ? "—" : `média ${formatBRL(avg)}/dia`}
        </p>
      </div>

      <div className="chart-plot" ref={plotRef}>
        <div className="chart-grid">
          {[0, 1, 2, 3, 4].map((g) => (
            <div key={g} className="gline" style={{ bottom: `${(g / 4) * 100}%` }}>
              <b>{Math.round((top * g) / 4).toLocaleString("pt-BR")}</b>
            </div>
          ))}
        </div>

        {vazio ? (
          <div className="chart-empty">Sem vendas no período.</div>
        ) : (
          <>
            <div className="chart-avg" style={{ bottom: `${(avg / 100 / top) * 100}%` }}>
              <b>média</b>
            </div>
            <div className="chart-bars" style={{ gap: days > 45 ? 1 : days > 30 ? 2 : 3 }} onMouseLeave={() => setTip(null)}>
              {buckets.map((o, i) => (
                <button
                  key={o.date.toISOString()}
                  type="button"
                  className={`bar${i === peakIdx ? " peak" : ""}`}
                  style={{ height: `${((o.cents / 100 / top) * 100).toFixed(2)}%`, animationDelay: `${((i * 0.5) / days).toFixed(3)}s` }}
                  aria-label={`${fmtDay(o.date)}: ${formatBRL(o.cents)}`}
                  onMouseEnter={(e) => mostrarTip(e.currentTarget, o)}
                  onFocus={(e) => mostrarTip(e.currentTarget, o)}
                  onBlur={() => setTip(null)}
                />
              ))}
            </div>
          </>
        )}

        {tip && (
          <div className="chart-tip show" style={{ left: tip.x, top: tip.y }}>
            <div className="t-val">{formatBRL(tip.cents)}</div>
            <div className="t-date">{fmtDay(tip.date)}</div>
          </div>
        )}
      </div>

      <div className="chart-xaxis">
        {xLabels.map((pi, n) => (
          <span key={pi}>{n === xLabels.length - 1 ? "hoje" : fmtDay(buckets[pi].date)}</span>
        ))}
      </div>
    </div>
  );
}
