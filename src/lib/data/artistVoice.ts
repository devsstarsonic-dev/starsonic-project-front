// Opções do formulário "Criar voz de artista" (Vocalista › Vozes de Artista).
// Os estilos musicais reusam GENRES — não há vocabulário próprio aqui.

import type { ArtistVoiceGender } from "@/lib/types";

// Custo fixo da geração da amostra. Cobrado na geração, não na aprovação:
// aprovar e reutilizar a voz é grátis.
export const SAMPLE_COST_CREDITS = 40;

// Máximo de estilos musicais por voz.
export const MAX_STYLES = 4;

export const VOICE_GENDERS: { value: ArtistVoiceGender; label: string }[] = [
  { value: "male", label: "Masculina" },
  { value: "female", label: "Feminina" },
  { value: "nb", label: "Não-binária" },
];

export const VOICE_TIMBRES = [
  "Grave / encorpado / romântico",
  "Grave / rasgado / potente",
  "Médio / suave / aveludado",
  "Médio / juvenil / doce",
  "Agudo / potente",
  "Agudo / leve / etéreo",
] as const;
