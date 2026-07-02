"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useComposition } from "@/lib/hooks/useComposition";
import { Icon } from "@/components/Icon";

// "Inspire-se": informe uma música de referência (link + nome), a IA detecta
// gênero/voz/vibe e você decide "Manter similar" (gera direto no /revisar, com
// letra diferente) ou "Personalizar" (abre o formulário já pré-preenchido).

type Detected = {
  genre: string;
  voice: string;
  vibe: string;
  theme: string;
  language: string;
};

// Converte a vibe ("Romântica, nostálgica") em array de emoções (máx. 3).
function vibeToEmotions(vibe: string): string[] {
  return vibe
    .split(/[,;]+/)
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((v) => v.charAt(0).toUpperCase() + v.slice(1));
}

export function InspireBox({ onPersonalize }: { onPersonalize: () => void }) {
  const router = useRouter();
  const { updateFormData } = useComposition();

  const [link, setLink] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detected, setDetected] = useState<Detected | null>(null);
  const [choice, setChoice] = useState<"manter" | "personalizar" | null>(null);

  async function concluir() {
    if (loading) return;
    if (!name.trim() && !link.trim()) {
      setError("Preencha o link ou o nome da música.");
      return;
    }
    setError(null);
    setLoading(true);
    setDetected(null);
    setChoice(null);
    try {
      const res = await fetch("/api/inspire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: link.trim(), name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Não foi possível analisar a música.");
      setDetected(data as Detected);
      setChoice("manter"); // padrão sugerido
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao analisar a música.");
    } finally {
      setLoading(false);
    }
  }

  // Aplica o que a IA detectou ao formData compartilhado do wizard.
  function aplicarDetectado(d: Detected) {
    updateFormData({
      genre: d.genre,
      emotions: vibeToEmotions(d.vibe),
      voiceStyle: d.voice,
      theme: d.theme,
      language: d.language || "pt-BR",
      musicName: "", // deixa a STARSONIC criar um novo nome
      quantity: 2,
    });
  }

  function finalizar() {
    if (!detected || !choice) return;
    aplicarDetectado(detected);
    if (choice === "manter") {
      // Gera direto: vai para o /revisar com tudo pronto (letra nova, estilo similar).
      router.push("/compositor/revisar");
    } else {
      // Abre o formulário personalizado já pré-preenchido.
      onPersonalize();
    }
  }

  const chip = (active: boolean): React.CSSProperties => ({
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 16px",
    borderRadius: 14,
    border: active ? "2px solid var(--cyan-1)" : "1px solid var(--border-soft)",
    background: active
      ? "linear-gradient(135deg, rgba(0,214,247,0.16), rgba(168,85,247,0.12))"
      : "var(--bg-card)",
    color: active ? "var(--white)" : "var(--text-1)",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    textAlign: "center",
    transition: "all .15s",
    boxShadow: active ? "0 8px 22px rgba(0,214,247,0.2)" : "none",
  });

  const DETECTED_CARDS = [
    { label: "Gênero", key: "genre" as const, icon: "music" as const, accent: "#00d4ff" },
    { label: "Voz", key: "voice" as const, icon: "mic" as const, accent: "#a855f7" },
    { label: "Vibe", key: "vibe" as const, icon: "bolt" as const, accent: "#ec4899" },
  ];

  return (
    <div className="e1-panel">
      <style>{`
        .insp-check { width:18px; height:18px; border-radius:50%; border:2px solid var(--cyan-1);
          display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }
        @keyframes insp-spin { to { transform: rotate(360deg); } }
        .insp-spin { width:16px; height:16px; border:2px solid rgba(255,255,255,0.5);
          border-top-color:#fff; border-radius:50%; display:inline-block; animation: insp-spin .8s linear infinite; }
        .insp-reveal { animation: insp-fade .35s ease both; }
        @keyframes insp-fade { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform:none;} }
      `}</style>

      <h1 className="e1-title">
        Inspire-se em uma música
      </h1>
      <div style={{ color: "black", fontSize: 14, marginTop: -6, marginBottom: 22, textAlign: "center" }}>
        Informe uma música de referência e a IA detecta o estilo para criar uma música nova parecida.
      </div>

      {/* Box com os dois inputs + Concluir */}
      <div
        style={{
          borderRadius: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "black", marginBottom: 7 }}>
            <Icon name="globe" size={14} /> Link da música
          </label>
          <input
            className="e1-input"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://open.spotify.com/... ou YouTube"
            maxLength={500}
          />
        </div>
        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "black", marginBottom: 7 }}>
            <Icon name="music" size={14} /> Nome da música
          </label>
          <input
            className="e1-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Evidências — Chitãozinho & Xororó"
            maxLength={300}
            onKeyDown={(e) => { if (e.key === "Enter") concluir(); }}
          />
        </div>

        {error && (
          <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", color: "var(--orange)", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <button
            type="button"
            className="e1-next"
            onClick={concluir}
            disabled={loading}
            style={{ display: "inline-flex", alignItems: "center", alignSelf: "center", gap: 8, opacity: loading ? 0.85 : 1, cursor: loading ? "default" : "pointer" }}
          >
            {loading ? <><span className="insp-spin" /> Analisando…</> : <><Icon name="sparkle" size={16} /> Concluir</>}
          </button>
        </div>
      </div>

      {/* Resultado da detecção */}
      {detected && (
        <div className="insp-reveal" style={{ marginTop: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="sparkle" size={16} style={{ color: "var(--cyan-1)" }} /> O que a IA detectou:
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 22 }}>
            {DETECTED_CARDS.map((d) => (
              <div
                key={d.label}
                style={{
                  position: "relative",
                  background: "linear-gradient(180deg, rgba(22,22,77,0.85), rgba(10,10,46,0.85))",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "16px 16px 16px 18px",
                  overflow: "hidden",
                }}
              >
                <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: d.accent }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: d.accent, background: `${d.accent}22` }}>
                    <Icon name={d.icon} size={16} />
                  </span>
                  <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>{d.label}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--white)", lineHeight: 1.3 }}>{detected[d.key]}</div>
              </div>
            ))}
          </div>

          {/* Escolha: manter similar ou personalizar */}
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
            E agora?
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <button type="button" style={chip(choice === "manter")} onClick={() => setChoice("manter")}>
              {choice === "manter" && <span className="insp-check"><Icon name="check" size={11} style={{ color: "var(--cyan-1)" }} /></span>}
              Manter similar
            </button>
            <button type="button" style={chip(choice === "personalizar")} onClick={() => setChoice("personalizar")}>
              {choice === "personalizar" && <span className="insp-check"><Icon name="check" size={11} style={{ color: "var(--cyan-1)" }} /></span>}
              Personalizar
            </button>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-3)", marginBottom: 20, lineHeight: 1.6 }}>
            {choice === "personalizar"
              ? "Abre o formulário completo já preenchido para você ajustar cada detalhe."
              : "Gera uma música nova no mesmo estilo detectado, com uma letra totalmente diferente."}
          </div>

          <div className="e1-actions">
            <button type="button" className="e1-next" onClick={finalizar} disabled={!choice}>
              Finalizar →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
