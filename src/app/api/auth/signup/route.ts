import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Cadastro via service role: cria o usuário já com o e-mail confirmado
// (email_confirm: true), então não existe a etapa "clique no link enviado
// pro seu e-mail" — o usuário loga na hora, direto após o cadastro.
// Também grava a linha em public.profiles aqui mesmo (bypassa RLS), então
// TODO cadastro fica garantido na tabela — antes isso dependia do cliente
// receber uma sessão (que só existia se a confirmação de e-mail estivesse
// desligada no painel do Supabase) e rodar um upsert com a anon key.

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createAdminClient(url, serviceKey);
}

function traduzErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("already exists"))
    return "Este e-mail já está cadastrado. Faça login.";
  if (m.includes("password") && m.includes("6"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("unable to validate email") || m.includes("invalid email") || m.includes("is invalid"))
    return "E-mail inválido.";
  return msg;
}

export async function POST(req: NextRequest) {
  const admin = getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const fullName = String(body.full_name ?? "").trim();
  const website = String(body.website ?? "").trim();

  if (!email) return NextResponse.json({ error: "E-mail é obrigatório." }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "A senha precisa ter pelo menos 6 caracteres." }, { status: 400 });

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) {
    return NextResponse.json({ error: traduzErro(error?.message ?? "Não foi possível criar a conta.") }, { status: 400 });
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: data.user.id,
      full_name: fullName || "Artista",
      email,
      plan: "Free",
      credits: 200,
      avatar_initial: (fullName.charAt(0) || "A").toUpperCase(),
      bio: "",
      location: "",
      website,
    },
    { onConflict: "id" },
  );
  if (profileError) {
    // Conta já existe em auth.users; não desfazemos o createUser — só avisamos.
    return NextResponse.json({ error: "Conta criada, mas falha ao salvar o perfil: " + profileError.message }, { status: 500 });
  }

  return NextResponse.json({ user: { id: data.user.id, email: data.user.email } });
}
