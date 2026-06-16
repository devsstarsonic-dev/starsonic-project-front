import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Renova a sessão do Supabase em cada request e protege as rotas:
// não logado -> /login, logado nas telas de auth -> /compositor.
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Roda em tudo, menos assets estáticos e arquivos de imagem.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
