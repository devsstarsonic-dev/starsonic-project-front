import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

// Coloca/tira uma criação à venda na Minha Loja (public.store_listings) e/ou
// atualiza o preço. Upsert por creation_id (1 linha por criação — ver
// supabase/schema.sql). O profile vem sempre da sessão (getProfile), nunca
// de um campo enviado pelo cliente — e a criação precisa pertencer a esse
// profile, senão a escrita é rejeitada.

export async function PATCH(req: NextRequest) {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const creationId = String(body.creation_id ?? "").trim();
  if (!creationId) return NextResponse.json({ error: "creation_id ausente." }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (typeof body.price_cents === "number" && Number.isFinite(body.price_cents)) {
    updates.price_cents = Math.max(0, Math.round(body.price_cents));
  }
  if (typeof body.on_sale === "boolean") updates.on_sale = body.on_sale;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nenhum campo válido pra atualizar." }, { status: 400 });
  }

  const supabase = await createClient();

  // Garante que a criação é do usuário logado antes de deixar mexer na listagem.
  const { data: creation, error: creationError } = await supabase
    .from("creations")
    .select("id")
    .eq("id", creationId)
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (creationError) return NextResponse.json({ error: creationError.message }, { status: 500 });
  if (!creation) return NextResponse.json({ error: "Criação não encontrada." }, { status: 403 });

  const { data, error } = await supabase
    .from("store_listings")
    .upsert(
      {
        creation_id: creationId,
        profile_id: profile.id,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "creation_id" },
    )
    .select("*")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ listing: data });
}
