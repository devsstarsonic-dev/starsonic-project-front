"use client";

import { useState } from "react";
import { KpiCard } from "@/components/store/KpiCard";
import { PhonePreview, PHONE_THEMES } from "@/components/store/PhonePreview";
import { StoreModal } from "@/components/store/StoreModal";
import { CopyLinkButton } from "@/components/store/CopyLinkButton";
import { Toggle } from "@/components/store/Toggle";
import { Icon } from "@/components/store/Icon";
import { formatBRL } from "@/lib/format";
import { getStoreProfile, getStoreSongs, getStoreOverviewStats } from "@/lib/store/mock";

type Aba = "personalizar" | "preview" | "divulgar";

const SOCIAIS = [
  { key: "instagram", label: "Instagram", placeholder: "@seu_instagram" },
  { key: "tiktok", label: "TikTok", placeholder: "@seu_tiktok" },
  { key: "youtube", label: "YouTube", placeholder: "cole seu link" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "para encomendas" },
] as const;

const KPI_ICONS = {
  olho: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  link: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  alvo: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  ),
  sacola: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
};

export default function MinhaLojaPage() {
  const profile = getStoreProfile();
  const songs = getStoreSongs();
  const stats = getStoreOverviewStats();

  const [aba, setAba] = useState<Aba>("personalizar");
  const [username, setUsername] = useState(profile.username);
  const [nome, setNome] = useState(profile.name);
  const [cidade, setCidade] = useState("");
  const [bio, setBio] = useState(profile.bio);
  const [tema, setTema] = useState("1");
  const [foto, setFoto] = useState<string | null>(null);
  const [contador, setContador] = useState(true);
  const [encomendas, setEncomendas] = useState(true);
  const [marketplace, setMarketplace] = useState(false);
  const [socials, setSocials] = useState<Record<string, string>>({});

  const shareUrl = `https://star.so/${username}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  const num = (v: number | null) => (v === null ? "—" : v.toLocaleString("pt-BR"));

  function handleFoto(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  const phone = (
    <PhonePreview name={nome} city={cidade} username={username} bio={bio} themeId={tema} songs={songs} photoUrl={foto} />
  );

  const divulgar = (
    <div className="store-card" style={{ padding: 24 }}>
      <h3 style={{ color: "var(--white)", fontWeight: 700, marginBottom: 16 }}>Divulgar</h3>
      <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.05)", textAlign: "center", marginBottom: 12 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrUrl}
          alt={`QR code de ${shareUrl}`}
          width={112}
          height={112}
          style={{ margin: "0 auto 8px", background: "#fff", borderRadius: 8, padding: 8 }}
        />
        <p style={{ color: "var(--white)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>star.so/{username}</p>
      </div>
      <div style={{ display: "grid" }}>
        <CopyLinkButton link={shareUrl} />
      </div>
    </div>
  );

  return (
    <section className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span className="badge-new">NOVO</span>
        <span style={{ color: "#94a3b8", fontSize: 12 }}>Configure sua loja pública em star.so</span>
      </div>
      <h1 className="page-title">Minha Loja · Star Card</h1>
      <p className="page-sub" style={{ marginBottom: 24 }}>
        Sua vitrine pública em <span style={{ color: "var(--cyan-1)" }}>star.so/{username}</span> — o link que você
        compartilha com seus fãs pra vender suas músicas
      </p>

      <div className="kpi-grid">
        <KpiCard accent="cyan" icon={KPI_ICONS.olho} label="Visitas · 30d" value={num(stats.visits30d)} sub="sem dados ainda" />
        <KpiCard accent="purple" icon={KPI_ICONS.link} label="Cliques no link" value={num(stats.linkClicks)} sub={`star.so/${username}`} />
        <KpiCard accent="pink" icon={KPI_ICONS.alvo} label="Conversão" value={stats.conversionPct === null ? "—" : `${stats.conversionPct}%`} sub="visita → venda" />
        <KpiCard accent="emerald" hero icon={KPI_ICONS.sacola} label="Vendas pela loja" value={formatBRL(stats.storeRevenueCents)} sub="nenhuma venda ainda" />
      </div>

      <div className="tab-row">
        <button type="button" className={`tab-btn${aba === "personalizar" ? " active" : ""}`} onClick={() => setAba("personalizar")}>
          Personalizar
        </button>
        <button type="button" className={`tab-btn${aba === "preview" ? " active" : ""}`} onClick={() => setAba("preview")}>
          Preview
        </button>
        <button type="button" className={`tab-btn${aba === "divulgar" ? " active" : ""}`} onClick={() => setAba("divulgar")}>
          Divulgar
        </button>
      </div>

      <div className="store-split">
        {/* Editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* URL */}
          <div className="store-card" style={{ padding: 24 }}>
            <h3 style={{ color: "var(--white)", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="link" size={16} /> URL da sua loja
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, borderRadius: 8, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span style={{ color: "#64748b", fontSize: 14 }}>star.so/</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                aria-label="Nome de usuário da loja"
                style={{ background: "transparent", border: "none", outline: "none", color: "var(--white)", fontSize: 14, flex: 1, fontFamily: "'JetBrains Mono', monospace" }}
              />
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--green)", fontSize: 12 }}>
                <Icon name="check" size={12} /> Disponível
              </span>
            </div>
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 8 }}>
              Este é o link que você compartilha nas redes sociais e QR code
            </p>
          </div>

          {/* Sobre você */}
          <div className="store-card" style={{ padding: 24 }}>
            <h3 style={{ color: "var(--white)", fontWeight: 700, marginBottom: 16 }}>Sobre você</h3>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>Foto de perfil</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    flexShrink: 0,
                    overflow: "hidden",
                    background: "linear-gradient(135deg, var(--cyan-1), var(--purple))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "#fff", fontWeight: 700 }}>{(nome.trim().slice(0, 2) || "SS").toUpperCase()}</span>
                  )}
                </div>
                <label className="btn-secondary" style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
                  {foto ? "Trocar foto" : "Adicionar foto"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFoto(e.target.files?.[0])}
                    style={{ display: "none" }}
                  />
                </label>
                {foto && (
                  <button type="button" className="btn-secondary" style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12 }} onClick={() => setFoto(null)}>
                    Remover
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label htmlFor="fm-nome" style={{ display: "block", color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>Nome artístico</label>
                <input id="fm-nome" className="input-star" value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div>
                <label htmlFor="fm-cidade" style={{ display: "block", color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>Cidade / Estado</label>
                <input id="fm-cidade" className="input-star" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Itanhaém, SP" />
              </div>
            </div>

            <label htmlFor="fm-bio" style={{ display: "block", color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>Bio (descrição curta)</label>
            <textarea id="fm-bio" className="input-star" rows={3} value={bio} onChange={(e) => setBio(e.target.value.slice(0, 200))} />
            <p style={{ color: "#64748b", fontSize: 10, marginTop: 4 }}>
              {bio.length}/200 · aparece logo abaixo do seu nome na loja
            </p>
          </div>

          {/* Aparência */}
          <div className="store-card" style={{ padding: 24 }}>
            <h3 style={{ color: "var(--white)", fontWeight: 700, marginBottom: 16 }}>Aparência da Star Card</h3>

            <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>Cor principal</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {PHONE_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`color-swatch${tema === t.id ? " selected" : ""}`}
                  style={{ background: t.swatch }}
                  title={t.title}
                  aria-label={`Tema ${t.title}`}
                  aria-pressed={tema === t.id}
                  onClick={() => setTema(t.id)}
                />
              ))}
            </div>

            <SwitchRow
              titulo="Mostrar contador de vendas"
              desc="Passa credibilidade pra novos clientes"
              checked={contador}
              onChange={setContador}
            />
            <SwitchRow
              titulo="Aceitar encomendas personalizadas"
              desc="Clientes podem solicitar músicas sob medida"
              checked={encomendas}
              onChange={setEncomendas}
            />
            <SwitchRow
              titulo="Aparecer no marketplace geral"
              desc="Suas músicas ficam visíveis na home do star.so (comissão 30%)"
              checked={marketplace}
              onChange={setMarketplace}
            />
          </div>

          {/* Redes sociais */}
          <div className="store-card" style={{ padding: 24 }}>
            <h3 style={{ color: "var(--white)", fontWeight: 700, marginBottom: 16 }}>Redes sociais</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {SOCIAIS.map((s) => (
                <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <label htmlFor={`soc-${s.key}`} style={{ color: "#94a3b8", fontSize: 12, width: 80, flexShrink: 0 }}>
                    {s.label}
                  </label>
                  <input
                    id={`soc-${s.key}`}
                    placeholder={s.placeholder}
                    value={socials[s.key] ?? ""}
                    onChange={(e) => setSocials((p) => ({ ...p, [s.key]: e.target.value }))}
                    style={{ background: "transparent", border: "none", outline: "none", color: "var(--white)", fontSize: 14, flex: 1, minWidth: 0 }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="btn-secondary" style={{ padding: "10px 24px", borderRadius: 8, fontSize: 14 }}>
              Cancelar
            </button>
            <button type="button" className="btn-primary" style={{ padding: "10px 24px", borderRadius: 8, fontSize: 14 }}>
              Salvar alterações
            </button>
          </div>
        </div>

        {/* Coluna direita: preview + divulgar, sempre visíveis */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0, position: "sticky", top: 24 }}>
          <div className="store-card-highlight" style={{ padding: 24 }}>
            <h3 style={{ color: "var(--white)", fontWeight: 700, marginBottom: 16 }}>Preview em tempo real</h3>
            {aba !== "preview" && phone}
          </div>
          {aba !== "divulgar" && divulgar}
        </div>
      </div>

      <StoreModal open={aba === "preview"} onClose={() => setAba("personalizar")} width={348} label="Preview da Star Card">
        {phone}
      </StoreModal>
      <StoreModal open={aba === "divulgar"} onClose={() => setAba("personalizar")} width={360} label="Divulgar a Star Card">
        {divulgar}
      </StoreModal>
    </section>
  );
}

function SwitchRow({
  titulo,
  desc,
  checked,
  onChange,
}: {
  titulo: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: 12, borderRadius: 8, background: "rgba(0,0,0,0.3)", marginBottom: 8 }}>
      <div>
        <p style={{ color: "var(--white)", fontSize: 14, fontWeight: 600 }}>{titulo}</p>
        <p style={{ color: "#94a3b8", fontSize: 12 }}>{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}
