// "Instrumentos desejados" — Etapa 3. Espelha fielmente o PDF de design.
// O 1º item é a opção "instrumentação livre" (exclui as demais quando ativo).
export const INSTRUMENTS = [
  "A STARSONIC escolhe para você - Instrumentação livre",
  "Contrabaixo",
  "Violão",
  "Piano",
  "Guitarra",
  "Sanfona",
  "Bateria",
  "Orquestra",
  "Teclado",
  "Beats eletrônicos",
  "Saxofone",
] as const;

export type Instrument = typeof INSTRUMENTS[number];
