import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// CRUD dos planos (public.plans) pelo painel /admin. Usa a service role
// porque a RLS de "plans" só tem policy de leitura (ver supabase/schema.sql)
// — não existe policy de insert/update/delete pra escrita anônima.
// ponytail: proteção é só a checagem de full_name === "Admininstrador" na
// página /admin (ver src/app/api/admin/users/route.ts); mesmo modelo aqui.

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createAdminClient(url, serviceKey);
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

  const slug = String(body.slug ?? "").trim();
  const name = String(body.name ?? "").trim();
  if (!slug) return NextResponse.json({ error: "Informe o slug do plano." }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Informe o nome do plano." }, { status: 400 });

  const insert = {
    slug,
    name,
    tagline: String(body.tagline ?? "").trim(),
    price_label: String(body.price_label ?? "").trim(),
    price_cents: Number.isFinite(body.price_cents) ? Math.max(0, Math.round(body.price_cents as number)) : 0,
    is_popular: Boolean(body.is_popular),
    sort_order: Number.isFinite(body.sort_order) ? Math.round(body.sort_order as number) : 0,
    features: [],
  };

  const { data, error } = await admin.from("plans").insert(insert).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ plan: data });
}

export async function PATCH(req: NextRequest) {
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

  const id = String(body.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "id ausente." }, { status: 400 });

  // Nunca toca em "features" aqui — a lista de recursos do plano continua
  // sendo editada só via SQL/seed (fora do escopo desta tabela do admin).
  const updates: Record<string, unknown> = {};
  if (typeof body.slug === "string" && body.slug.trim()) updates.slug = body.slug.trim();
  if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
  if (typeof body.tagline === "string") updates.tagline = body.tagline.trim();
  if (typeof body.price_label === "string") updates.price_label = body.price_label.trim();
  if (typeof body.price_cents === "number" && Number.isFinite(body.price_cents)) {
    updates.price_cents = Math.max(0, Math.round(body.price_cents));
  }
  if (typeof body.is_popular === "boolean") updates.is_popular = body.is_popular;
  if (typeof body.sort_order === "number" && Number.isFinite(body.sort_order)) {
    updates.sort_order = Math.round(body.sort_order);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nenhum campo válido pra atualizar." }, { status: 400 });
  }

  const { data, error } = await admin.from("plans").update(updates).eq("id", id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ plan: data });
}

export async function DELETE(req: NextRequest) {
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

  const id = String(body.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "id ausente." }, { status: 400 });

  // profiles.plan é texto livre (sem FK pra plans.id), então excluir um
  // plano nunca quebra referência de usuários já nesse plano.
  const { error } = await admin.from("plans").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
