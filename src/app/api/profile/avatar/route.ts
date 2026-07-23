import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getProfile } from "@/lib/data";

// Salva a URL do avatar no profile do usuário. Usa a service role para
// funcionar mesmo no modo dev (login desabilitado) — ignora a RLS.

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const avatarUrl = String(body.imageUrl ?? "").trim();
  if (!avatarUrl) {
    return NextResponse.json({ error: "imageUrl ausente." }, { status: 400 });
  }

  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Perfil não encontrado." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      { error: "Serviço indisponível. Tente novamente mais tarde." },
      { status: 500 },
    );
  }

  const admin = createAdminClient(url, serviceKey);
  const { error } = await admin
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", profile.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
