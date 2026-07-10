"use client";

/**
 * Detalhes da voz de artista.
 *
 * ponytail: rota estática. Vira /vocalista/artista/[id] quando existir a tabela
 * artist_voices — hoje não há id pra rotear.
 *
 * O cabeçalho usa o rascunho que o usuário preencheu; músicas, analytics e
 * metadata técnica dependem da geração real e nascem vazios.
 */

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useVocalista } from "@/lib/vocalista/VocalistaContext";
import { EmptyState } from "@/components/Vocalista/EmptyState";
import { VOICE_GENDERS } from "@/lib/data/artistVoice";
import { Icon } from "@/components/Icon";

export default function ArtistaPage() {
  const router = useRouter();
  const { draft, hydrated, reset } = useVocalista();

  useEffect(() => {
    if (hydrated && !draft.name.trim()) router.replace("/vocalista");
  }, [hydrated, draft.name, router]);

  const generoLabel = VOICE_GENDERS.find((g) => g.value === draft.gender)?.label;

  return (
    <div className="e1-wrap">
      <div className="e1-panel">
        {/* Hero */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, var(--cyan-1), var(--purple))",
            }}
          >
            <Icon name="mic" size={44} style={{ color: "#050514" }} />
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              <span className="badge">✓ ATIVA</span>
              <span className="badge">Artista virtual</span>
              {generoLabel && <span className="badge">{generoLabel}</span>}
            </div>
            <h1
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 900,
                fontSize: 28,
                color: "var(--white)",
                margin: "0 0 8px",
              }}
            >
              {draft.name}
            </h1>
            {draft.description && (
              <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" }}>
                {draft.description}
              </p>
            )}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {draft.styles.map((s) => (
                <span key={s} className="badge">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="stack-mobile" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
            <section>
              <h3 style={{ color: "var(--white)", fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>
                Músicas com esse artista
              </h3>
              <p style={{ color: "var(--text-3)", fontSize: 12, margin: "0 0 12px" }}>
                Sempre a mesma voz, em todas as criações.
              </p>
              <EmptyState
                icon="music"
                title="Nenhuma música ainda"
                text="Crie a primeira música com esse artista e ela aparece aqui."
              >
                <Link href="/compositor" className="btn-primary">
                  <Icon name="music" size={15} />
                  Criar música com esse artista
                </Link>
              </EmptyState>
            </section>

            <section>
              <h3 style={{ color: "var(--white)", fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>
                Analytics desse artista
              </h3>
              <EmptyState
                icon="target"
                title="Sem dados de uso"
                text="Streams, segundos gerados, reuso e royalties aparecem depois que esse artista tiver músicas distribuídas."
              />
            </section>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
            <div className="card" style={{ padding: 20 }}>
              <p
                style={{
                  color: "var(--text-3)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  margin: "0 0 12px",
                }}
              >
                Ações
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link href="/compositor" className="btn-primary" style={{ justifyContent: "center" }}>
                  <Icon name="music" size={14} />
                  Criar música
                </Link>
                <Link href="/vocalista/criar" className="btn-secondary" style={{ textAlign: "center" }}>
                  Criar outra voz
                </Link>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    reset();
                    router.push("/vocalista");
                  }}
                >
                  Voltar às minhas vozes
                </button>
              </div>
            </div>

            <div
              className="card"
              style={{ padding: 20, background: "rgba(245,158,11,0.03)", borderColor: "rgba(245,158,11,0.2)" }}
            >
              <span className="badge" style={{ marginBottom: 12 }}>
                ⚠ DISCLOSURE
              </span>
              <p style={{ color: "var(--text-2)", fontSize: 12, margin: "0 0 8px" }}>
                Toda música distribuída com essa voz vai ter:
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {["Metadata de AI disclosure no DDEX", "Marcação “voz sintética” nos DSPs", "Referência à persona"].map(
                  (t) => (
                    <li key={t} style={{ color: "var(--text-2)", fontSize: 12, display: "flex", gap: 8 }}>
                      <span style={{ color: "#fbbf24" }}>•</span>
                      {t}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
