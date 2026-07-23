import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Edição/exclusão de contas pelo painel /admin. Usa a service role porque a
// RLS de "profiles" só permite cada usuário editar/ver a própria linha (não
// existe policy de update/delete "de outro usuário" — ver supabase/schema.sql).
// ponytail: proteção é só a checagem de full_name === "Administrador" na
// página /admin (client-side + guard no server component); não há coluna de
// role/permissão ainda. Upgrade natural: adicionar profiles.role e checar
// aqui também, no servidor, antes de aceitar a escrita.

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createAdminClient(url, serviceKey);
}

export async function PATCH(req: NextRequest) {
  const admin = getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Serviço indisponível. Tente novamente mais tarde." }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const id = String(body.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "id ausente." }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (typeof body.full_name === "string" && body.full_name.trim()) updates.full_name = body.full_name.trim();
  if (typeof body.plan === "string" && body.plan.trim()) updates.plan = body.plan.trim();
  if (typeof body.credits === "number" && Number.isFinite(body.credits)) updates.credits = Math.max(0, Math.round(body.credits));

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nenhum campo válido pra atualizar." }, { status: 400 });
  }

  const { data, error } = await admin.from("profiles").update(updates).eq("id", id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ profile: data });
}

export async function DELETE(req: NextRequest) {
  const admin = getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Serviço indisponível. Tente novamente mais tarde." }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const id = String(body.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "id ausente." }, { status: 400 });

  // Apaga o profile (creations/jingles/notificações dele saem via "on delete
  // cascade") e, se existir, também o usuário em auth.users, pra ele não
  // conseguir mais logar.
  const { error } = await admin.from("profiles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.auth.admin.deleteUser(id).catch(() => null);

  return NextResponse.json({ ok: true });
}
