import type { ArtistVoiceDraft } from "@/lib/types";

// Monta o que a Suno precisa para gerar a AMOSTRA de ~20s de uma voz de artista
// a partir do rascunho do Vocalista. A amostra é uma música curta cantada no
// timbre/estilo descrito — serve para o usuário ouvir e aprovar a voz.

const MAX_STYLE = 1000;

// Gênero vocal (draft.gender) → tag em inglês que a Suno interpreta melhor.
function vocalTag(gender: ArtistVoiceDraft["gender"]): string {
  if (gender === "male") return "male vocals";
  if (gender === "female") return "female vocals";
  if (gender === "nb") return "androgynous vocals";
  return "";
}

/** Título da amostra: o próprio nome do artista fictício. */
export function buildSampleTitle(draft: ArtistVoiceDraft): string {
  return draft.name.trim() || "Voz de artista";
}

/** Estilo enviado à Suno: voz + estilos + timbre + resumo da descrição. */
export function buildVoiceSampleStyle(draft: ArtistVoiceDraft): string {
  const parts: string[] = [];

  const voice = vocalTag(draft.gender);
  if (voice) parts.push(voice);

  // Estilos musicais escolhidos (reusam GENRES; guiam o som da amostra).
  const styles = draft.styles.filter(Boolean);
  if (styles.length) parts.push(styles.join(", "));

  // Timbre descritivo (ex.: "Grave / encorpado / romântico").
  const timbre = draft.timbre.trim();
  if (timbre) parts.push(timbre);

  // Resumo da descrição livre (limita para não estourar o campo de estilo).
  const desc = draft.description.trim().replace(/\s+/g, " ");
  if (desc) parts.push(desc.slice(0, 200));

  let style = parts.join(", ");
  if (style.length > MAX_STYLE) {
    style = style.slice(0, MAX_STYLE);
    const lastComma = style.lastIndexOf(",");
    if (lastComma > 0) style = style.slice(0, lastComma);
  }
  return style.trim() || "pop, male vocals";
}

// Letra curta e neutra, só para a voz cantar na amostra (mantém o áudio curto).
export const SAMPLE_LYRICS = `[Verso]
Essa é a minha voz chegando pra cantar
Um som que nasce livre e não para de brilhar

[Refrão]
Ouça esse timbre, sinta a emoção
Uma voz nova ganhando o coração`;
