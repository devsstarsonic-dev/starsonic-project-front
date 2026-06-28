"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";

const FAILED = new Set(["failed", "error"]);

const GENDERS = ["Woman", "Man"];
const AGES = ["Young Adult", "Early Middle Age", "Late Middle Age", "Senior", "Child"];
const STYLES = ["Realistic", "Pixar", "Cinematic", "Anime"];

export function AvatarCreator({
  initial,
  currentAvatarUrl,
}: {
  initial: string;
  currentAvatarUrl: string | null;
}) {
  const router = useRouter();
  const [appearance, setAppearance] = useState("");
  const [gender, setGender] = useState("Woman");
  const [age, setAge] = useState("Young Adult");
  const [style, setStyle] = useState("Realistic");

  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPoll() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }
  useEffect(() => stopPoll, []);

  async function salvar(imageUrl: string) {
    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });
    const d = await res.json();
    if (!res.ok) {
      setError(d.error ?? "Falha ao salvar o avatar.");
      return;
    }
    setSavedMsg("Avatar salvo! ✓");
    router.refresh();
  }

  async function gerar() {
    if (generating) return;
    if (!appearance.trim()) {
      setError("Descreva como o avatar deve ser.");
      return;
    }
    setError(null);
    setSavedMsg(null);
    setGenerating(true);
    setStatus("pending");

    try {
      const res = await fetch("/api/heygen/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appearance: appearance.trim(), gender, age, style }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) {
        setError(data.error ?? "Não foi possível iniciar a geração.");
        setGenerating(false);
        return;
      }
      const id = data.id as string;
      stopPoll();
      const check = async () => {
        try {
          const r = await fetch(`/api/heygen/avatar/status?id=${encodeURIComponent(id)}`);
          const d = await r.json();
          if (!r.ok) {
            setError(d.error ?? "Erro ao consultar o avatar.");
            setGenerating(false);
            stopPoll();
            return;
          }
          setStatus(d.status);
          if (d.imageUrl) {
            setPreview(d.imageUrl);
            setGenerating(false);
            stopPoll();
            void salvar(d.imageUrl);
          } else if (FAILED.has(String(d.status))) {
            setError("A geração do avatar falhou. Tente novamente.");
            setGenerating(false);
            stopPoll();
          }
        } catch {
          // rede transitória
        }
      };
      check();
      pollRef.current = setInterval(check, 5000);
    } catch {
      setError("Falha de conexão.");
      setGenerating(false);
    }
  }

  const selStyle: React.CSSProperties = { padding: "8px 10px", fontSize: 12, width: "100%" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 24, alignItems: "start" }}>
      {/* Círculo do avatar */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            margin: "0 auto",
            position: "relative",
            background: preview
              ? `center / cover url(${preview})`
              : "linear-gradient(135deg, #00d4ff, #3b9eff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 800,
            fontSize: 48,
            color: "var(--bg-deep)",
            border: "2px solid var(--border-strong)",
            boxShadow: "0 0 30px rgba(0,212,255,0.3)",
          }}
        >
          {!preview && initial}
          {generating && (
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(5,6,32,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ width: 30, height: 30, border: "3px solid var(--cyan-1)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block" }} />
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 10 }}>
          {preview ? "Avatar atual" : "Sem avatar — usando a inicial"}
        </div>
      </div>

      {/* Formulário */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="sparkle" size={13} style={{ color: "var(--cyan-1)" }} /> Criar avatar com IA (HeyGen)
        </div>

        <textarea
          className="wiz-textarea"
          placeholder="Descreva o avatar (ex.: mulher jovem, cabelo cacheado, sorrindo, fundo neon, estilo retrato profissional)…"
          value={appearance}
          onChange={(e) => setAppearance(e.target.value)}
          rows={3}
          disabled={generating}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <select className="wiz-input" style={selStyle} value={gender} onChange={(e) => setGender(e.target.value)} disabled={generating}>
            {GENDERS.map((g) => <option key={g} value={g}>{g === "Woman" ? "Feminino" : "Masculino"}</option>)}
          </select>
          <select className="wiz-input" style={selStyle} value={age} onChange={(e) => setAge(e.target.value)} disabled={generating}>
            {AGES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select className="wiz-input" style={selStyle} value={style} onChange={(e) => setStyle(e.target.value)} disabled={generating}>
            {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <button className="btn-primary" onClick={gerar} disabled={generating} style={{ width: "fit-content", opacity: generating ? 0.7 : 1 }}>
          {generating ? "Gerando avatar…" : <><Icon name="sparkle" size={15} /> Gerar avatar</>}
        </button>

        {savedMsg && <div style={{ fontSize: 12, color: "var(--green)" }}>{savedMsg}</div>}
        {error && (
          <div style={{ padding: 12, borderRadius: 10, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", color: "var(--orange)", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
}
