import { NextRequest, NextResponse } from "next/server";

// Baixa o áudio da Suno através do servidor para forçar o download.
// Os URLs da CDN são cross-origin, então o atributo "download" do <a> não
// funciona direto no browser — este proxy adiciona o Content-Disposition.

function safeFileName(name: string): string {
  const base = name.replace(/[^\p{L}\p{N}\-_ ]/gu, "").trim() || "musica";
  return `${base}.mp3`;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const title = req.nextUrl.searchParams.get("title") ?? "musica";

  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Parâmetro url inválido." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, { cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "Não foi possível baixar o áudio." }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: `Erro ${upstream.status} ao baixar o áudio.` }, { status: 502 });
  }

  const fileName = safeFileName(title);
  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("Content-Type") ?? "audio/mpeg");
  headers.set("Content-Disposition", `attachment; filename="${fileName}"`);
  const len = upstream.headers.get("Content-Length");
  if (len) headers.set("Content-Length", len);

  return new NextResponse(upstream.body, { status: 200, headers });
}
