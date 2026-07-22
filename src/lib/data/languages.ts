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

// O wizard grava o CÓDIGO ("en-US") nas opções fixas, mas a opção "Outro" da
// Etapa 3 grava TEXTO LIVRE ("japonês"). Resolver pelo código apenas fazia o
// texto livre cair no fallback e a letra sair em português.
function findLanguage(value?: string) {
  const v = (value ?? "").trim().toLowerCase();
  if (!v) return null;
  return (
    LANGUAGES.find((l) => l.code.toLowerCase() === v) ??
    LANGUAGES.find((l) => l.label.toLowerCase() === v || l.native.toLowerCase() === v) ??
    null
  );
}

/** Nome do idioma para instruções de prompt (ex.: "English (US)"). */
export function languageLabel(value?: string): string {
  const v = (value ?? "").trim();
  if (!v) return "Português (Brasil)";
  return findLanguage(v)?.label ?? v; // "Outro": usa o texto do usuário
}

/** Tag de idioma para o style da Suno (ex.: "english"). */
export function languageTag(value?: string): string {
  const v = (value ?? "").trim();
  if (!v) return "português";
  return findLanguage(v)?.native ?? v;
}
