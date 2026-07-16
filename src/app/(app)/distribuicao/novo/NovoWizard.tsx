"use client";

import { useState } from "react";
import Link from "next/link";
import { DistTopNav } from "@/components/distribuicao/DistTopNav";
import { IcDisc, IcCheck, IcBulb, IcEdit, IcGlobe, IcBot, IcAlert, IcImage, IcUpload, IcSparkles, IcSave, IcRocket } from "@/components/distribuicao/icons";
import { EmptyBlock } from "@/components/distribuicao/EmptyBlock";
import { MusicPicker } from "@/components/distribuicao/MusicPicker";
import type { Creation, Dsp } from "@/lib/types";

const STEPS = ["Música", "Metadata", "Capa", "Plataformas", "Confirmar"];

const GENEROS = ["Gospel & Christian", "Pop", "Rock", "Sertanejo", "Funk", "MPB", "Eletrônica", "Forró"];

export function NovoWizard({ musicas, dsps }: { musicas: Creation[]; dsps: Dsp[] }) {
  const [step, setStep] = useState(1);
  const [selMusic, setSelMusic] = useState<string | null>(musicas[0]?.id ?? null);
  const [selDsps, setSelDsps] = useState<Set<string>>(() => new Set(dsps.map((d) => d.id)));

  const musica = musicas.find((m) => m.id === selMusic) ?? null;

  const go = (s: number) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toggleDsp = (id: string) =>
    setSelDsps((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <section className="page dist">
      <div className="page-title-row">
        <div>
          <div className="page-title">Novo lançamento</div>
          <div className="page-sub">Distribua sua música em 220+ plataformas em 5 passos</div>
        </div>
        <Link href="/distribuicao" className="btn-secondary">← Voltar</Link>
      </div>

      <DistTopNav />

      {/* Progresso */}
      <div className="wiz-prog">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "active" : "";
          return (
            <div key={label} style={{ display: "contents" }}>
              <div className={`wp-step ${state}`} onClick={() => go(n)}>
                <div>
                  <div className="wp-circle">{n < step ? <IcCheck width={15} height={15} /> : n}</div>
                  <div className="wp-lbl">{label}</div>
                </div>
              </div>
              {n < STEPS.length && <div className={`wp-bar${n < step ? " done" : ""}`} />}
            </div>
          );
        })}
      </div>

      {/* PASSO 1 — Música */}
      {step === 1 && (
        <>
          <div className="d-card">
            <div className="d-card-title" style={{ marginBottom: 6 }}><IcDisc width={16} height={16} /> Escolha a música pra distribuir</div>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 16 }}>Selecione uma das suas criações no Star Sonic</p>
            {musicas.length === 0 ? (
              <EmptyBlock icon={<IcDisc width={28} height={28} />} title="Você ainda não tem criações" desc="Crie uma música no Sonic Lab pra poder distribuí-la nas plataformas.">
                <Link href="/compositor" className="btn-primary" style={{ marginTop: 14, display: "inline-flex" }}>Criar música</Link>
              </EmptyBlock>
            ) : (
              <MusicPicker musicas={musicas} selected={selMusic} onSelect={setSelMusic} />
            )}
            <div className="banner" style={{ marginTop: 18 }}>
              <span className="b-ico"><IcBulb width={17} height={17} /></span>
              <div className="b-txt"><strong>Qualidade do áudio:</strong> Star Sonic envia MP3 192 kbps por padrão. Pra Hi-Res (WAV/FLAC) ative no plano Pro.</div>
            </div>
          </div>
          <div className="split-actions">
            <Link href="/distribuicao" className="btn-secondary">Cancelar</Link>
            <button type="button" className="btn-primary" onClick={() => go(2)} disabled={!musica}>Próximo: Metadata →</button>
          </div>
        </>
      )}

      {/* PASSO 2 — Metadata */}
      {step === 2 && (
        <>
          <div className="banner">
            <span className="b-ico"><IcEdit width={17} height={17} /></span>
            <div className="b-txt"><strong>Metadata DDEX ERN 4.3</strong> — campos obrigatórios pras DSPs. A LabelGrid valida tudo antes de aprovar.</div>
          </div>

          <div className="d-card">
            <div className="d-card-title" style={{ marginBottom: 16 }}><IcEdit width={16} height={16} /> Informações da gravação</div>
            <div className="frow">
              <div className="fgroup">
                <label className="flabel">Título oficial <span className="req">*</span></label>
                <input className="finput" defaultValue={musica?.title ?? ""} placeholder="Como vai aparecer nas DSPs" />
                <div className="fhelp">Exatamente como vai aparecer no Spotify, Apple, etc</div>
              </div>
              <div className="fgroup">
                <label className="flabel">Versão / subtítulo</label>
                <input className="finput" placeholder="ex: Acústico, Remix, Ao Vivo" />
              </div>
            </div>
            <div className="frow">
              <div className="fgroup">
                <label className="flabel">Artista principal <span className="req">*</span></label>
                <input className="finput" placeholder="Nome do artista" />
              </div>
              <div className="fgroup">
                <label className="flabel">Artistas adicionais</label>
                <input className="finput" placeholder="Separe por vírgula" />
              </div>
            </div>
            <div className="frow-3">
              <div className="fgroup">
                <label className="flabel">Tipo de release <span className="req">*</span></label>
                <select className="fselect"><option>Single</option><option>EP</option><option>Álbum</option></select>
              </div>
              <div className="fgroup">
                <label className="flabel">Gênero principal <span className="req">*</span></label>
                <select className="fselect" defaultValue={musica?.genre}>
                  {GENEROS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="fgroup">
                <label className="flabel">Subgênero</label>
                <input className="finput" placeholder="opcional" />
              </div>
            </div>
          </div>

          <div className="d-card">
            <div className="d-card-title" style={{ marginBottom: 16 }}><IcGlobe width={16} height={16} /> Idioma & lançamento</div>
            <div className="frow-3">
              <div className="fgroup">
                <label className="flabel">Idioma do título</label>
                <select className="fselect"><option>Português (Brasil)</option><option>English</option><option>Español</option></select>
              </div>
              <div className="fgroup">
                <label className="flabel">Idioma das letras</label>
                <select className="fselect"><option>Português (Brasil)</option><option>English</option><option>Instrumental</option></select>
              </div>
              <div className="fgroup">
                <label className="flabel">Data de lançamento <span className="req">*</span></label>
                <input type="date" className="finput" />
                <div className="fhelp">Mínimo 7 dias a partir de hoje</div>
              </div>
            </div>
          </div>

          <div className="d-card">
            <div className="d-card-title" style={{ marginBottom: 16 }}><IcBot width={16} height={16} /> Declaração de uso de IA (obrigatório 2026)</div>
            <div className="banner warn">
              <span className="b-ico"><IcAlert width={17} height={17} /></span>
              <div className="b-txt">DSPs como Spotify, Apple Music e YouTube exigem essa declaração. Informação incorreta pode resultar em remoção da música.</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              <label className="cbox-row"><input type="checkbox" name="ia" /><div className="ctext"><strong>Sem IA</strong> — Música feita 100% por humano</div></label>
              <label className="cbox-row"><input type="checkbox" name="ia" /><div className="ctext"><strong>IA-Assistida</strong> — Humano usou IA como ferramenta (arranjo, mix)</div></label>
              <label className="cbox-row"><input type="checkbox" name="ia" defaultChecked /><div className="ctext"><strong>IA-Gerada</strong> — Áudio/letra criados por IA (Star Sonic)<br /><span style={{ fontSize: 11, color: "var(--text-3)" }}>Opção padrão pras criações Star Sonic</span></div></label>
            </div>
          </div>

          <div className="split-actions">
            <button type="button" className="btn-secondary" onClick={() => go(1)}>← Anterior</button>
            <button type="button" className="btn-primary" onClick={() => go(3)}>Próximo: Capa →</button>
          </div>
        </>
      )}

      {/* PASSO 3 — Capa */}
      {step === 3 && (
        <>
          <div className="d-card">
            <div className="d-card-title" style={{ marginBottom: 16 }}><IcImage width={16} height={16} /> Capa do release</div>
            <div className="frow" style={{ gridTemplateColumns: "1fr 1.5fr" }}>
              <div>
                <div className="detail-cover" style={{ width: 180, height: 180, margin: "0 auto 12px", fontSize: 60, background: musica ? `linear-gradient(135deg, ${musica.gradient_from}, ${musica.gradient_to})` : undefined }}>
                  {musica?.emoji ?? <IcDisc width={40} height={40} />}
                </div>
                <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-3)" }}>3000 × 3000 px · JPG</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { Ico: IcCheck, color: "var(--green)", title: "Capa atual (Cover Studio)", desc: "Gerada pela Star Sonic · Validada DDEX", active: true },
                  { Ico: IcUpload, color: "var(--cyan-1)", title: "Upload personalizado", desc: "JPG/PNG · mínimo 3000×3000px · máx 10MB" },
                  { Ico: IcSparkles, color: "var(--purple)", title: "Gerar nova com Cover Studio", desc: "3 modos: Homenagem, Lyrics, Mascote" },
                ].map((o) => (
                  <div key={o.title} style={{ background: "var(--bg-elev)", border: `1px solid ${o.active ? "var(--green)" : "var(--border)"}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                    <div style={{ color: o.color, display: "flex" }}><o.Ico width={22} height={22} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "var(--white)" }}>{o.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)" }}>{o.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="d-card">
            <div className="d-card-title" style={{ marginBottom: 14 }}><IcCheck width={16} height={16} /> Validações automáticas DDEX</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {["Dimensões 3000×3000 px", "Formato JPG (RGB)", "Sem texto irregular ou logos de terceiros", "Tamanho do arquivo < 10 MB"].map((v) => (
                <div key={v} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: "var(--text-2)" }}>
                  <span style={{ color: "var(--green)", display: "flex" }}><IcCheck width={16} height={16} /></span>{v}
                </div>
              ))}
            </div>
          </div>
          <div className="split-actions">
            <button type="button" className="btn-secondary" onClick={() => go(2)}>← Anterior</button>
            <button type="button" className="btn-primary" onClick={() => go(4)}>Próximo: Plataformas →</button>
          </div>
        </>
      )}

      {/* PASSO 4 — Plataformas */}
      {step === 4 && (
        <>
          <div className="banner">
            <span className="b-ico"><IcGlobe width={17} height={17} /></span>
            <div className="b-txt"><strong>{selDsps.size} plataformas selecionadas.</strong> Aparece nas principais globais + regionais (China, Índia, África, MENA).</div>
          </div>
          <div className="d-card">
            <div className="d-card-head">
              <div className="d-card-title"><span className="tico"><IcGlobe width={15} height={15} /></span> Plataformas de destino</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setSelDsps(new Set(dsps.map((d) => d.id)))}>Selecionar todas</button>
                <button type="button" className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setSelDsps(new Set())}>Limpar</button>
              </div>
            </div>
            {dsps.length === 0 ? (
              <EmptyBlock icon={<IcGlobe width={28} height={28} />} title="Nenhuma plataforma cadastrada" desc="A lista de DSPs será carregada do catálogo." />
            ) : (
              <div className="dsp-grid">
                {dsps.map((d) => (
                  <div key={d.id} className={`dsp-card${selDsps.has(d.id) ? " selected" : ""}`} onClick={() => toggleDsp(d.id)}>
                    <div className="dsp-logo">{d.emoji}</div>
                    <div className="dsp-name">{d.name}</div>
                    <div className="dsp-region">{d.reach}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="split-actions">
            <button type="button" className="btn-secondary" onClick={() => go(3)}>← Anterior</button>
            <button type="button" className="btn-primary" onClick={() => go(5)}>Próximo: Confirmar →</button>
          </div>
        </>
      )}

      {/* PASSO 5 — Confirmar */}
      {step === 5 && (
        <>
          <div className="banner success">
            <span className="b-ico"><IcCheck width={17} height={17} /></span>
            <div className="b-txt"><strong>Tudo pronto pra submeter.</strong> Após confirmar, a LabelGrid valida em 24–48h e a música começa a aparecer nas DSPs entre 24h e 7 dias.</div>
          </div>
          <div className="d-card">
            <div className="d-card-title" style={{ marginBottom: 14 }}><IcEdit width={16} height={16} /> Resumo do release</div>
            <div className="info-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="info-item"><div className="label">Música</div><div className="value">{musica?.title ?? "—"}</div></div>
              <div className="info-item"><div className="label">Gênero</div><div className="value">{musica?.genre ?? "—"}</div></div>
              <div className="info-item"><div className="label">Duração</div><div className="value">{musica?.duration ?? "—"}</div></div>
              <div className="info-item"><div className="label">Plataformas</div><div className="value">{selDsps.size} DSPs</div></div>
              <div className="info-item"><div className="label">Label</div><div className="value">Star Sonic</div></div>
              <div className="info-item"><div className="label">Disclosure IA</div><div className="value" style={{ color: "var(--orange)" }}>IA-Gerada</div></div>
            </div>
          </div>
          <div className="d-card">
            <div className="d-card-title" style={{ marginBottom: 14 }}><IcEdit width={16} height={16} /> Termos e cessões</div>
            {[
              <><strong>Cessão de direitos de gravação</strong> — Autorizo a Star Sonic e a LabelGrid a distribuir esta música nas DSPs selecionadas.</>,
              <><strong>Confirmo a declaração de IA</strong> — A música é IA-Gerada e isso será enviado às DSPs via DDEX.</>,
              <><strong>Split de royalties</strong> — Aceito a divisão padrão: 80% pra mim · 20% pra Star Sonic.</>,
              <><strong>Termos LabelGrid</strong> — Ciente das políticas de distribuição e UGC (20% retido em YouTube CID).</>,
            ].map((t, i) => (
              <label className="cbox-row" key={i}><input type="checkbox" defaultChecked /><div className="ctext">{t}</div></label>
            ))}
          </div>
          <div className="split-actions">
            <button type="button" className="btn-secondary" onClick={() => go(4)}>← Anterior</button>
            <div className="row-actions">
              <button type="button" className="btn-secondary"><IcSave width={15} height={15} /> Salvar rascunho</button>
              <button type="button" className="btn-primary"><IcRocket width={15} height={15} /> Submeter agora</button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
