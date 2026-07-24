import type { ReactNode } from "react";

// Config por modo da tela de revisão. Cada modo (Studio / Instrumental / Jingle)
// tem sua própria rota e sua própria cópia — o motor (ReviewPanel) é o mesmo,
// só as legendas, o rodapé e o fluxo "gerar outro" mudam por modo.

export type ReviewMode = "studio" | "instrumental" | "jingle";

// Textos/afordâncias que o ReviewPanel renderiza de forma específica do modo.
export interface ReviewUi {
  /** Título do card central ("Sua Música" / "Sua Trilha" / "Seu Jingle"). */
  musicLabel: string;
  musicEmoji: string;
  /** Título do card de letra. Vazio quando não há letra (instrumental). */
  lyricsLabel: string;
  /** Trecho do rodapé de custo ("letra incluída" / "sem voz" / "com slogan"). */
  footerExtra: string;
  /** Rótulo do botão de variação ("Gerar outro jingle" etc.). */
  otherActionLabel: string;
  otherModalTitle: string;
  otherModalDesc: ReactNode;
  /** Se a variação mantém a mesma letra (jingle/studio) ou não (instrumental). */
  keepLyricsOnVariation: boolean;
  /** Texto do placeholder de "sua música" antes de compor. */
  emptyHint: string;
}

export interface ReviewConfig {
  /** Trilha sem vocal — esconde a letra e envia instrumental=true à Suno. */
  instrumental: boolean;
  /** "editar respostas" volta ao formulário do modo. */
  editHref: string;
  /** "criar nova música" recomeça no formulário do modo. */
  newSongHref: string;
  ui: ReviewUi;
}

export const REVIEW_CONFIGS: Record<ReviewMode, ReviewConfig> = {
  studio: {
    instrumental: false,
    editHref: "/compositor/step-3",
    newSongHref: "/compositor",
    ui: {
      musicLabel: "Sua Música",
      musicEmoji: "🎵",
      lyricsLabel: "Sua Letra",
      footerExtra: "letra incluída",
      otherActionLabel: "Gerar com outros estilos",
      otherModalTitle: "Gerar com outros estilos",
      otherModalDesc: (
        <>
          Escolha um ou mais estilos (e, opcionalmente, um idioma). Vamos{" "}
          <b style={{ color: "var(--cyan-1)" }}>adaptar a letra</b> ao novo
          gênero/idioma — mantendo a história — e compor novas versões.
        </>
      ),
      keepLyricsOnVariation: true,
      emptyHint: "Clique em “COMPOR MÚSICA” para gerar a partir da letra acima.",
    },
  },

  instrumental: {
    instrumental: true,
    editHref: "/instrumental",
    newSongHref: "/instrumental",
    ui: {
      musicLabel: "Sua Trilha",
      musicEmoji: "🎼",
      lyricsLabel: "", // sem letra
      footerExtra: "sem voz",
      otherActionLabel: "Gerar outra trilha",
      otherModalTitle: "Gerar outra trilha instrumental",
      otherModalDesc: (
        <>
          Escolha um ou mais estilos. Vamos compor uma{" "}
          <b style={{ color: "var(--cyan-1)" }}>nova trilha instrumental</b> nos
          estilos selecionados, mantendo o mesmo clima.
        </>
      ),
      keepLyricsOnVariation: false,
      emptyHint:
        "Clique em “COMPOR MÚSICA” para gerar sua trilha instrumental.",
    },
  },

  jingle: {
    instrumental: false,
    editHref: "/jingle",
    newSongHref: "/jingle",
    ui: {
      musicLabel: "Seu Jingle",
      musicEmoji: "🎯",
      lyricsLabel: "Letra do Jingle",
      footerExtra: "com slogan",
      otherActionLabel: "Gerar outro jingle",
      otherModalTitle: "Gerar outro jingle",
      otherModalDesc: (
        <>
          Escolha um ou mais estilos. Vamos manter o{" "}
          <b style={{ color: "var(--cyan-1)" }}>mesmo slogan e letra</b> e compor
          um novo jingle nos estilos selecionados.
        </>
      ),
      keepLyricsOnVariation: true,
      emptyHint:
        "Clique em “COMPOR MÚSICA” para gerar seu jingle a partir da letra acima.",
    },
  },
};
