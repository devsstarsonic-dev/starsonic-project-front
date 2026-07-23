import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient, SupabaseClient } from "@supabase/supabase-js";
import { getProfile } from "@/lib/data";

// Banco de vozes do usuário ("Sua Voz"): upload / listagem / exclusão de áudios
// no Supabase Storage. Usa a service role para funcionar no modo demo (sem
// login) — ignora a RLS, mesmo padrão do /api/profile/avatar. O bucket "vocals"
// é criado sob demanda, então não depende de nenhum setup manual no Supabase.

export const runtime = "nodejs";

const BUCKET = "vocals";
const CATS = ["vocais", "vozes"] as const;
type Cat = (typeof CATS)[number];

// 25 MB — cobre uma acapela/amostra de voz sem estourar limites do Storage.
const MAX_BYTES = 25 * 1024 * 1024;

function admin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createAdminClient(url, serviceKey);
}

// Garante que o bucket público "vocals" existe (idempotente).
async function ensureBucket(sb: SupabaseClient) {
  const { data } = await sb.storage.getBucket(BUCKET);
  if (data) return;
  await sb.storage.createBucket(BUCKET, { public: true });
}

function badEnv() {
  return NextResponse.json(
    { error: "Serviço indisponível. Tente novamente mais tarde." },
    { status: 500 },
  );
}

function isCat(v: unknown): v is Cat {
  return typeof v === "string" && (CATS as readonly string[]).includes(v);
}

// Monta a URL pública de cada objeto de uma pasta do usuário.
async function listItems(sb: SupabaseClient, userId: string, cat: Cat) {
  const { data, error } = await sb.storage.from(BUCKET).list(`${userId}/${cat}`, {
    limit: 100,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;
  return (data ?? [])
    .filter((f) => f.name && f.name !== ".emptyFolderPlaceholder")
    .map((f) => {
      const path = `${userId}/${cat}/${f.name}`;
      const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);
      return { name: f.name, url: pub.publicUrl };
    });
}

// ── GET: lista os arquivos de uma categoria (?cat=vocais|vozes) ──
export async function GET(req: NextRequest) {
  const sb = admin();
  if (!sb) return badEnv();

  const cat = req.nextUrl.searchParams.get("cat");
  if (!isCat(cat)) return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });

  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "Perfil não encontrado." }, { status: 401 });

  try {
    await ensureBucket(sb);
    const items = await listItems(sb, profile.id, cat);
    return NextResponse.json({ items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao listar os áudios.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── POST: envia um áudio (multipart: file + cat) e devolve { name, url } ──
export async function POST(req: NextRequest) {
  const sb = admin();
  if (!sb) return badEnv();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Envio inválido (esperado multipart)." }, { status: 400 });
  }

  const cat = form.get("cat");
  if (!isCat(cat)) return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (!file.type.startsWith("audio/")) {
    return NextResponse.json({ error: "Envie um arquivo de áudio (MP3, WAV, M4A…)." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Arquivo muito grande (máx. 25 MB)." }, { status: 400 });
  }

  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "Perfil não encontrado." }, { status: 401 });

  const safe = file.name.replace(/[^\w.\-]+/g, "_");
  const fileName = `${Date.now()}-${safe}`;
  const path = `${profile.id}/${cat}/${fileName}`;

  try {
    await ensureBucket(sb);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await sb.storage.from(BUCKET).upload(path, bytes, {
      contentType: file.type || "audio/mpeg",
      upsert: false,
    });
    if (error) throw error;

    const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ name: fileName, url: pub.publicUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao enviar o áudio.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── DELETE: remove um arquivo (?cat=&name=) ──
export async function DELETE(req: NextRequest) {
  const sb = admin();
  if (!sb) return badEnv();

  const cat = req.nextUrl.searchParams.get("cat");
  const name = req.nextUrl.searchParams.get("name");
  if (!isCat(cat)) return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Arquivo não informado." }, { status: 400 });

  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "Perfil não encontrado." }, { status: 401 });

  // Barra o path-traversal: o nome é só o arquivo, nunca uma subpasta.
  const safeName = name.replace(/[/\\]/g, "");
  const path = `${profile.id}/${cat}/${safeName}`;

  const { error } = await sb.storage.from(BUCKET).remove([path]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
