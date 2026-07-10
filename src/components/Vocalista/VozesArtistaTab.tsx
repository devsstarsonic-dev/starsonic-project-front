import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SAMPLE_COST_CREDITS } from "@/lib/data/artistVoice";

// Aba "Vozes de Artista" — MVP. A listagem depende da tabela artist_voices,
// que ainda não existe: por ora a aba nasce sempre no estado vazio.

export function VozesArtistaTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ color: "var(--white)", fontSize: 18, fontWeight: 700, margin: 0 }}>Vozes de Artista</p>
          <p style={{ color: "var(--text-2)", fontSize: 13, margin: "4px 0 0", maxWidth: 620, lineHeight: 1.5 }}>
            Vozes sintéticas criadas por IA. Cada uma vira um &quot;artista virtual&quot; reutilizável nas suas
            músicas.
          </p>
        </div>
        <Link href="/vocalista/criar" className="btn-primary">
          <Icon name="plus" size={16} />
          Criar voz de artista
        </Link>
      </div>

      {/* Estado vazio — nenhuma voz criada ainda */}
      <div
        className="card"
        style={{
          padding: "clamp(24px, 5vw, 48px)",
          textAlign: "center",
          borderStyle: "dashed",
          borderColor: "rgba(168,85,247,0.3)",
          background: "linear-gradient(135deg, rgba(168,85,247,0.03), rgba(236,72,153,0.02))",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.1))",
          }}
        >
          <Icon name="mic" size={28} style={{ color: "#c084fc" }} />
        </div>
        <p style={{ color: "var(--white)", fontWeight: 700, fontSize: 15, margin: "0 0 4px" }}>
          Você ainda não tem vozes de artista
        </p>
        <p style={{ color: "var(--text-3)", fontSize: 13, margin: "0 0 16px" }}>
          Crie a primeira e ela fica disponível no Compositor pra sempre.
        </p>
        <span className="badge">{SAMPLE_COST_CREDITS} créditos</span>
      </div>

      {/* Entenda */}
      <div
        className="card"
        style={{
          padding: 24,
          background: "linear-gradient(135deg, rgba(168,85,247,0.06), rgba(236,72,153,0.02))",
          borderColor: "rgba(168,85,247,0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, var(--purple), #ec4899)",
            }}
          >
            <Icon name="bulb" size={20} style={{ color: "#fff" }} />
          </div>
          <div>
            <p
              style={{
                color: "#c084fc",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: "0 0 4px",
              }}
            >
              Entenda
            </p>
            <p style={{ color: "var(--white)", fontWeight: 700, margin: "0 0 8px" }}>
              O que é uma Voz de Artista?
            </p>
            <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.6, margin: "0 0 12px" }}>
              É como se você fosse um empresário e cada Voz de Artista fosse um cantor no seu casting. Você cria
              personagens vocais fictícios (a &quot;Ana Pop&quot;, o &quot;João Sertanejo&quot;) e reutiliza eles
              em várias músicas — mantendo consistência sonora como se fossem seus próprios artistas.
            </p>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
              ⚠ São vozes sintéticas criadas por IA. Não representam pessoas reais. Pra clonar sua voz de verdade,
              veja a aba{" "}
              <Link href="/vocalista?aba=sua-voz" style={{ color: "#c084fc", fontWeight: 600 }}>
                Sua Voz
              </Link>{" "}
              (em breve).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
