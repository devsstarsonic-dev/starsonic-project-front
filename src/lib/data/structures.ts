export const SONG_STRUCTURES = [
  { label: "30 segundos", value: "30s" },
  { label: "1 minuto", value: "1m" },
  { label: "Padrão (2 a 3 minutos)", value: "padrao" },
  { label: "Completa (3 a 5 minutos)", value: "completa" },
  { label: "Estendida (+5 minutos)", value: "estendida" },
  { label: "A STARSONIC escolhe para você", value: "auto" },
] as const;

export const COMPOSITION_STRUCTURES = [
  "Verso, Refrão, Verso, Refrão, Bridge, Refrão",
  "Verso, Verso, Refrão, Verso, Refrão",
  "Intro, Verso, Refrão, Bridge, Refrão, Outro",
  "Verso único com múltiplos refrões",
  "Livre (deixar a IA decidir)",
] as const;
