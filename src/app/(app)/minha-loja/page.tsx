"use client";

import { useState } from "react";
import { StoreTabs } from "@/components/store/StoreTabs";
import { PhoneMockup } from "@/components/store/PhoneMockup";
import { CopyLinkButton } from "@/components/store/CopyLinkButton";
import { Icon } from "@/components/store/Icon";
import { getStoreProfile } from "@/lib/store/mock";

const COLORS = [
  { label: "Cyan", value: "#06b6d4" },
  { label: "Purple", value: "#a855f7" },
  { label: "Green", value: "#10b981" },
  { label: "Pink", value: "#ec4899" },
  { label: "Orange", value: "#f97316" },
  { label: "Blue", value: "#3b82f6" },
];

const SOCIAL_PLATFORMS = ["instagram", "tiktok", "youtube", "twitter", "spotify"] as const;

type TabKey = "editor" | "compartilhar";

export default function MinhaLojaPage() {
  const profile = getStoreProfile();
  const [tab, setTab] = useState<TabKey>("editor");

  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [color, setColor] = useState(profile.themeColor);
  const [socials, setSocials] = useState(profile.socials);

  const shareUrl = `https://star.so/${profile.username}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  const handleSocialChange = (platform: (typeof SOCIAL_PLATFORMS)[number], value: string) => {
    setSocials((prev) => ({ ...prev, [platform]: value }));
  };

  return (
    <section className="page">
      <div className="page-title-row">
        <div>
          <span className="badge cyan" style={{ marginBottom: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="store" size={12} /> NOVO
          </span>
          <div className="page-title">Minha Loja · Star Card</div>
          <div className="page-sub">Sua vitrine pública em <span style={{ color: "var(--cyan-1)", fontWeight: 700 }}>star.so/{profile.username}</span> — o link que você compartilha com seus fãs pra vender suas músicas</div>
        </div>
      </div>

      {/* Abas */}
      <StoreTabs
        tabs={[
          { key: "editor", label: "Editor" },
          { key: "compartilhar", label: "Compartilhar" },
        ]}
        activeTab={tab}
        onTabChange={(key) => setTab(key as TabKey)}
      />

      {/* Tab: Editor */}
      {tab === "editor" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {/* Formulário */}
          <div>
            <div className="card" style={{ padding: "20px 24px" }}>
              {/* URL da sua loja */}
              <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--border-soft)" }}>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 12, textTransform: "uppercase" }}>
                  URL da sua loja
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: 8,
                    background: "rgba(34, 197, 94, 0.08)",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, color: "var(--white)", fontWeight: 500 }}>
                    star.so/{profile.username}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    ✓ Disponível
                  </span>
                </div>
                <p style={{ fontSize: 11, color: "var(--text-3)" }}>
                  Este é o link que você compartilha nas redes sociais e QR code
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase" }}>
                  Nome da loja
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-soft)",
                    color: "var(--white)",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase" }}>
                  Bio (até 160 caracteres)
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 160))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-soft)",
                    color: "var(--white)",
                    fontFamily: "inherit",
                    minHeight: 80,
                    resize: "vertical",
                  }}
                />
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, textAlign: "right" }}>
                  {bio.length}/160
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 8, textTransform: "uppercase" }}>
                  Cor do tema
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {COLORS.map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => setColor(value)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: value,
                        border: color === value ? "2px solid white" : "2px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      title={label}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border-soft)" }}>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10 }}>Redes sociais (opcional)</p>
                {SOCIAL_PLATFORMS.map((platform) => (
                  <div key={platform} style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 4, textTransform: "capitalize" }}>
                      {platform}
                    </label>
                    <input
                      type="text"
                      placeholder={`@seu_${platform}`}
                      value={socials[platform] || ""}
                      onChange={(e) => handleSocialChange(platform, e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 6,
                        background: "rgba(0,0,0,0.2)",
                        border: "1px solid var(--border-soft)",
                        color: "var(--white)",
                        fontFamily: "inherit",
                        fontSize: 12,
                      }}
                    />
                  </div>
                ))}
              </div>

              <button
                className="btn-primary"
                style={{
                  width: "100%",
                  marginTop: 20,
                  padding: "10px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Icon name="check" size={16} /> Salvar alterações
              </button>
            </div>
          </div>

          {/* Preview no phone */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 16 }}>Preview da sua Star Card</p>
            <PhoneMockup>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(135deg, ${color}22, ${color}11)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 20,
                  textAlign: "center",
                  color: "var(--white)",
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 12,
                    background: color,
                    marginBottom: 16,
                    opacity: 0.8,
                  }}
                />
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{name}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 16, maxHeight: 60, overflow: "hidden" }}>
                  {bio || "Sua bio aparecerá aqui"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-3)",
                    padding: "8px 12px",
                    borderRadius: 100,
                    background: "rgba(0,0,0,0.2)",
                  }}
                >
                  star.so/{profile.username}
                </div>
              </div>
            </PhoneMockup>
          </div>
        </div>
      )}

      {/* Tab: Compartilhar */}
      {tab === "compartilhar" && (
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--white)", marginBottom: 8 }}>Sua Star Card</h3>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 24 }}>
              Compartilhe para vender direto do seu link
            </p>

            {/* Link */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--border-soft)",
                marginBottom: 24,
              }}
            >
              <input
                type="text"
                value={shareUrl}
                readOnly
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "var(--cyan-1)",
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono'",
                  cursor: "pointer",
                }}
              />
              <CopyLinkButton link={shareUrl} />
            </div>

            {/* QR Code */}
            <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12 }}>Código QR</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="QR Code"
              style={{
                width: 200,
                height: 200,
                margin: "0 auto 24px",
                padding: 12,
                background: "white",
                borderRadius: 8,
              }}
            />

            {/* Botões */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn-primary"
                style={{ flex: 1, padding: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Icon name="link" size={15} /> Copiar link
              </button>
              <button
                className="btn-secondary"
                aria-label="Baixar QR code"
                style={{ flex: 1, padding: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Icon name="download" size={15} /> Baixar QR
              </button>
            </div>

            {/* Dica */}
            <div
              style={{
                marginTop: 24,
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(0, 212, 255, 0.08)",
                border: "1px solid rgba(0, 212, 255, 0.2)",
              }}
            >
              <p style={{ fontSize: 11, color: "var(--text-2)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="sparkles" size={13} /> Comissão reduzida: apenas 5% quando o cliente vem do seu link direto
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
