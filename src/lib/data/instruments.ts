export const INSTRUMENTS = [
  "A STARSONIC escolhe para você",
  "Contra Baixo",
  "Violão",
  "Piano",
  "Guitarra",
  "Sanfona",
  "Bateria",
  "Orquestra",
  "Teclado",
  "Beats Eletrônicos",
  "Saxofone",
  "Trompete",
  "Clarinete",
  "Violino",
  "Violoncelo",
  "Flauta",
] as const;

export type Instrument = typeof INSTRUMENTS[number];
