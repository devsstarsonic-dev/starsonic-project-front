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

  const semRascunho = !draft.name.trim();

  useEffect(() => {
    if (hydrated && semRascunho) router.replace("/vocalista");
  }, [hydrated, semRascunho, router]);

  // Evita o lampejo do painel vazio antes do redirecionamento.
  if (!hydrated || semRascunho) return null;

  const generoLabel = VOICE_GENDERS.find((g) => g.value === draft.gender)?.label;

  return (
    <div className="e1-wrap voc-wrap">
      <div className="e1-panel">
        {/* Hero */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
          <div className="voc-hero-icon" style={{ width: 96, height: 96, flexShrink: 0 }} aria-hidden="true">
            <Icon name="mic" size={44} style={{ color: "#fff" }} />
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              <span className="voc-tag voc-tag-solid">✓ Ativa</span>
              <span className="voc-tag">Artista virtual</span>
              {generoLabel && <span className="voc-tag">{generoLabel}</span>}
            </div>
            <h1
              className="voc-ink"
              style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 28, margin: "0 0 8px" }}
            >
              {draft.name}
            </h1>
            {draft.description && (
              <p className="voc-ink-2" style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" }}>
                {draft.description}
              </p>
            )}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {draft.styles.map((s) => (
                <span key={s} className="voc-tag">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="stack-mobile" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
            <section>
              <h2 className="voc-ink" style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>
                Músicas com esse artista
              </h2>
              <p className="voc-ink-2" style={{ fontSize: 12, margin: "0 0 12px" }}>
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
              <h2 className="voc-ink" style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>
                Analytics desse artista
              </h2>
              <EmptyState
                icon="target"
                title="Sem dados de uso"
                text="Streams, segundos gerados, reuso e royalties aparecem depois que esse artista tiver músicas distribuídas."
              />
            </section>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
            <div className="voc-surface-strong" style={{ padding: 20 }}>
              <p
                className="voc-ink-3"
                style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 12px" }}
              >
                Ações
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link href="/compositor" className="btn-primary" style={{ justifyContent: "center" }}>
                  <Icon name="music" size={14} />
                  Criar música
                </Link>
                <Link href="/vocalista/criar" className="voc-btn-ghost" style={{ textDecoration: "none" }}>
                  Criar outra voz
                </Link>
                <button
                  type="button"
                  className="voc-btn-ghost"
                  onClick={() => {
                    reset();
                    router.push("/vocalista");
                  }}
                >
                  Voltar às minhas vozes
                </button>
              </div>
            </div>

            <div className="voc-warn" style={{ padding: 20 }}>
              <h2 className="voc-warn-title" style={{ marginBottom: 10 }}>
                <span aria-hidden="true">⚠</span> Disclosure
              </h2>
              <p className="voc-warn-text" style={{ margin: "0 0 8px" }}>
                Toda música distribuída com essa voz vai ter:
              </p>
              {/* role="list" preserva a semântica: `list-style: none` a remove no VoiceOver. */}
              <ul role="list" style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {["Metadata de AI disclosure no DDEX", "Marcação “voz sintética” nos DSPs", "Referência à persona"].map(
                  (t) => (
                    <li key={t} className="voc-warn-text" style={{ display: "flex", gap: 8 }}>
                      <span aria-hidden="true">•</span>
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
