import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Atualiza o título de criações na tabela "creations". Usa a service role para
// funcionar no modo dev (login desabilitado) — ignora a RLS.
// Body: { updates: { id: string; title: string }[] }

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const updates = Array.isArray(body.updates) ? body.updates : [];
  const clean = updates
    .map((u) => u as { id?: unknown; title?: unknown })
    .filter((u) => typeof u.id === "string" && typeof u.title === "string" && (u.title as string).trim())
    .map((u) => ({ id: u.id as string, title: (u.title as string).trim() }));

  if (clean.length === 0) {
    return NextResponse.json({ error: "Nenhuma atualização válida." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." },
      { status: 500 },
    );
  }

  const admin = createAdminClient(url, serviceKey);
  for (const u of clean) {
    const { error } = await admin.from("creations").update({ title: u.title }).eq("id", u.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
