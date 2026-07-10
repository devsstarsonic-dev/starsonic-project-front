import Link from "next/link";
import { Icon } from "@/components/Icon";

// Aba "Sua Voz" — clone real da voz do usuário. Placeholder da V2.
// A captura de e-mail da lista de espera depende de backend (tabela
// voice_waitlist), então o campo fica desabilitado até a integração existir.

const PASSOS = [
  { n: 1, titulo: "Grava sua voz", texto: "30–60s falando ou cantando. Aqui mesmo no Star Sonic." },
  { n: 2, titulo: "A IA clona", texto: "Sua voz vira um perfil que canta em qualquer estilo." },
  { n: 3, titulo: "Usa em tudo", texto: "Compositor, cover, jingles. Sua voz em qualquer música." },
];

export function SuaVozTab() {
  return (
    <div
      className="card"
      style={{
        padding: "clamp(20px, 5vw, 48px)",
        maxWidth: 800,
        margin: "0 auto",
        borderColor: "rgba(0,212,255,0.25)",
        backgroundImage:
          "radial-gradient(circle at 25% 25%, rgba(0,212,255,0.15) 0%, transparent 40%), radial-gradient(circle at 75% 75%, rgba(59,158,255,0.1) 0%, transparent 40%)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            margin: "0 auto 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--grad-brand)",
            boxShadow: "0 0 20px rgba(0,212,255,0.35), 0 0 40px rgba(59,158,255,0.15)",
          }}
        >
          <Icon name="mic" size={44} style={{ color: "var(--bg-deep)" }} />
        </div>
        <span className="badge" style={{ marginBottom: 12 }}>
          🔒 EM BREVE
        </span>
        <h2
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            fontSize: 28,
            color: "var(--white)",
            margin: "12px 0",
          }}
        >
          Sua Voz — Clone Real
        </h2>
        <p style={{ color: "var(--text-2)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
          Em breve você vai poder <strong style={{ color: "var(--white)" }}>clonar sua própria voz</strong> e
          cantar em qualquer música gerada pelo Star Sonic. Sua voz real, em todas as suas criações.
        </p>
      </div>

      <div className="stack-mobile" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {PASSOS.map((p) => (
          <div
            key={p.n}
            style={{
              padding: 16,
              borderRadius: 12,
              background: "rgba(3,3,20,0.4)",
              border: "1px solid rgba(0,212,255,0.15)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                background: "rgba(0,212,255,0.2)",
                color: "var(--cyan-1)",
                fontWeight: 900,
              }}
            >
              {p.n}
            </div>
            <h4 style={{ color: "var(--white)", fontWeight: 700, fontSize: 14, margin: "0 0 4px" }}>{p.titulo}</h4>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: 0, lineHeight: 1.5 }}>{p.texto}</p>
          </div>
        ))}
      </div>

      {/* Lista de espera — sem backend ainda */}
      <div
        className="card"
        style={{
          padding: 24,
          background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(59,158,255,0.03))",
          borderColor: "rgba(0,212,255,0.35)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--grad-brand)",
            }}
          >
            <Icon name="send" size={18} style={{ color: "var(--bg-deep)" }} />
          </div>
          <div>
            <p style={{ color: "var(--white)", fontWeight: 700, margin: 0 }}>Entre na lista de espera</p>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: 0 }}>
              Seja avisado no dia do lançamento e ganhe acesso antecipado.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            className="e1-input"
            type="email"
            placeholder="seu@email.com"
            disabled
            style={{ flex: "1 1 200px", minWidth: 0 }}
          />
          <button type="button" className="btn-primary" disabled style={{ opacity: 0.5, cursor: "not-allowed", flex: "0 0 auto" }}>
            Me avisar
          </button>
        </div>
        <p style={{ color: "var(--text-3)", fontSize: 11, margin: "12px 0 0" }}>
          A lista de espera abre junto com o recurso. Previsão de lançamento: {" "}
          <strong style={{ color: "var(--white)" }}>Q4 2026</strong>.
        </p>
      </div>

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 12 }}>
          Enquanto isso, crie <strong style={{ color: "var(--white)" }}>Vozes de Artista</strong> — vozes
          sintéticas reutilizáveis pras suas músicas.
        </p>
        <Link href="/vocalista" className="btn-secondary">
          Ver Vozes de Artista →
        </Link>
      </div>
    </div>
  );
}
