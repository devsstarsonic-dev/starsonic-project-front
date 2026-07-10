// Chave Pix: detecção de tipo, máscara e validação.
// Lógica pura, sem React — testada em pixKey.test.ts.

export type PixKeyType = "celular" | "cpf" | "cnpj" | "email" | "aleatoria";

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EVP_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// DDDs em uso no Brasil. Sem esta lista, um CPF como 529.982.247-25 passa por
// celular (o 3º dígito é 9 e "52" seria aceito como DDD).
const DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length > 7) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 0) return `(${d}`;
  return "";
}

function maskCPF(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length > 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`;
  return d;
}

function maskCNPJ(v: string) {
  const d = onlyDigits(v).slice(0, 14);
  if (d.length > 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  if (d.length > 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  if (d.length > 5) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length > 2) return `${d.slice(0, 2)}.${d.slice(2)}`;
  return d;
}

export const PIX_TYPES: Record<PixKeyType, {
  label: string;
  placeholder: string;
  inputMode: "tel" | "numeric" | "email" | "text";
  mask: (v: string) => string;
  isValid: (v: string) => boolean;
  hint: string;
}> = {
  celular: {
    label: "Celular",
    placeholder: "(11) 90000-0000",
    inputMode: "tel",
    mask: maskPhone,
    isValid: (v) => onlyDigits(v).length === 11,
    hint: "DDD + número de celular (11 dígitos).",
  },
  cpf: {
    label: "CPF",
    placeholder: "000.000.000-00",
    inputMode: "numeric",
    mask: maskCPF,
    isValid: (v) => onlyDigits(v).length === 11,
    hint: "Os 11 dígitos do seu CPF.",
  },
  cnpj: {
    label: "CNPJ",
    placeholder: "00.000.000/0000-00",
    inputMode: "numeric",
    mask: maskCNPJ,
    isValid: (v) => onlyDigits(v).length === 14,
    hint: "Os 14 dígitos do CNPJ.",
  },
  email: {
    label: "E-mail",
    placeholder: "voce@email.com.br",
    inputMode: "email",
    mask: (v) => v.replace(/\s/g, ""),
    isValid: (v) => EMAIL_RE.test(v),
    hint: "Um e-mail válido cadastrado no seu banco.",
  },
  aleatoria: {
    label: "Aleatória",
    placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    inputMode: "text",
    mask: (v) => v.trim().toLowerCase(),
    isValid: (v) => EVP_RE.test(v.trim().toLowerCase()),
    hint: "Chave aleatória (EVP) gerada pelo banco.",
  },
};

/**
 * Adivinha o tipo da chave pelo que foi digitado.
 * Retorna null quando o texto ainda não decide — aí o chamador mantém o tipo atual.
 */
export function detectPixType(raw: string): PixKeyType | null {
  const s = (raw || "").trim();
  if (!s) return null;
  if (s.includes("@")) return "email";

  const semEspaco = s.replace(/\s/g, "");
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-/.test(semEspaco)) return "aleatoria";
  if (/[g-zG-Z]/.test(s)) return "email"; // letra fora do alfabeto hex

  const d = onlyDigits(s);
  if (d.length > 11) return "cnpj";
  if (d.length === 11) {
    // Celular tem o 9 na terceira posição e um DDD real; senão é CPF.
    // ponytail: um CPF que comece com DDD válido + 9 ainda cai como celular —
    // ambiguidade inerente a 11 dígitos. Os chips de tipo são o escape.
    const ddd = parseInt(d.slice(0, 2), 10);
    return d.charAt(2) === "9" && DDDS.has(ddd) ? "celular" : "cpf";
  }
  return null;
}

export function isValidPixKey(type: PixKeyType, value: string): boolean {
  return PIX_TYPES[type].isValid(value);
}

export function maskPixKey(type: PixKeyType, value: string): string {
  return PIX_TYPES[type].mask(value);
}
