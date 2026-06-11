export const LANGUAGES = [
  { code: "pt-BR", flag: "🇧🇷", label: "Português (Brasil)", native: "português" },
  { code: "en-US", flag: "🇺🇸", label: "English (US)", native: "english" },
  { code: "es-ES", flag: "🇪🇸", label: "Español", native: "spanish" },
  { code: "fr-FR", flag: "🇫🇷", label: "Français", native: "french" },
  { code: "it-IT", flag: "🇮🇹", label: "Italiano", native: "italian" },
  { code: "de-DE", flag: "🇩🇪", label: "Deutsch", native: "german" },
] as const;

export type Language = typeof LANGUAGES[number]["code"];
export type LanguageNative = typeof LANGUAGES[number]["native"];

export const DEFAULT_LANGUAGE: Language = "pt-BR";
