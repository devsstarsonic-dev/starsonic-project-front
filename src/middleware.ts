import { NextResponse } from "next/server";

// Autenticação desativada por enquanto (modo dados públicos / demo).
// Quando o login for adicionado, reative a verificação de sessão aqui.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
