import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const AUTH_ROUTES = ["/login", "/cadastro", "/esqueci-senha"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  // Rotas de API são chamadas via fetch (não devem receber redirect HTML).
  const isApiRoute = pathname.startsWith("/api");
  // Rotas liberadas para convidado (sem login): raiz e o compositor (wizard).
  // O convidado compõe; ao gerar a música é mandado para o cadastro.
  const isGuestRoute = pathname === "/" || pathname.startsWith("/compositor");

  // Não logado tentando acessar área protegida -> manda pro login
  if (!user && !isAuthRoute && !isApiRoute && !isGuestRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logado tentando acessar telas de auth -> manda direto pro compositor
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/compositor";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
