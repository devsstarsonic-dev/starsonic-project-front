import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 (API S3-compatível) — re-hospeda mídia gerada por terceiros
// (Suno, KIE, HeyGen...) para que o link não dependa/expire da API externa.
// Sem as env vars configuradas, rehostToR2() simplesmente devolve a URL original.

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;
const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

const client =
  accountId && accessKeyId && secretAccessKey
    ? new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      })
    : null;

export const r2Enabled = !!(client && bucket && publicUrl);

/**
 * Baixa `sourceUrl` e grava no bucket R2 sob `key`, devolvendo a URL pública.
 * Se o R2 não estiver configurado, ou o download/upload falhar, devolve
 * `sourceUrl` original (nunca quebra o fluxo de salvar a criação).
 */
export async function rehostToR2(
  sourceUrl: string | null | undefined,
  key: string,
  contentType: string,
): Promise<string> {
  if (!sourceUrl) return sourceUrl ?? "";
  if (!client || !bucket || !publicUrl) return sourceUrl;

  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) return sourceUrl;
    const body = new Uint8Array(await res.arrayBuffer());

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return `${publicUrl}/${key}`;
  } catch (err) {
    console.error("[r2] falha ao re-hospedar mídia, mantendo URL original:", err);
    return sourceUrl;
  }
}

