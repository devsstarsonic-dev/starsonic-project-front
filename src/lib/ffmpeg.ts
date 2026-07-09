import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpegPath = require("ffmpeg-static") as string;

const execFileAsync = promisify(execFile);

// Suno não gera áudios curtos: geramos 1 take completo (1:30-2:00) só como
// FONTE interna e cortamos aqui com FFmpeg em 15s/30s/60s — o áudio completo
// NUNCA é entregue ao usuário, só as 3 versões cortadas.
//
// O corte parte de `startOffset` (em segundos) em vez do início do áudio:
// quem chama passa o início do refrão/hook (calculado via timestamps da
// Suno em src/lib/suno/hookWindow.ts) pra que os 3 clipes comecem já na
// parte mais forte da música. Cada clipe leva fade-in (0.3s) + fade-out
// (1s) + normalização de volume (loudnorm) e sai em MP3 320kbps.
const CLIP_DURATIONS = { s15: 15, s30: 30, s60: 60 } as const;

export type JingleClips = {
  s15: Buffer;
  s30: Buffer;
  s60: Buffer;
};

async function cutClip(inputFile: string, outFile: string, start: number, seconds: number): Promise<void> {
  const fadeOutStart = Math.max(seconds - 1, 0);
  await execFileAsync(ffmpegPath, [
    "-y",
    "-ss", String(Math.max(start, 0)),
    "-i", inputFile,
    "-t", String(seconds),
    "-af", `afade=t=in:d=0.3,afade=t=out:st=${fadeOutStart}:d=1,loudnorm`,
    "-b:a", "320k",
    outFile,
  ]);
}

/**
 * Baixa `audioUrl` pra um arquivo temporário (fonte interna, descartada ao
 * final) e corta em 15s/30s/60s via FFmpeg a partir de `startOffset`
 * segundos (padrão 0 = início do áudio, usado quando não há hook detectado).
 * Devolve os 3 buffers dos clipes, prontos pra subir no R2. Limpa o
 * diretório temporário no `finally`, mesmo em caso de erro.
 */
export async function cutJingle(audioUrl: string, startOffset = 0): Promise<JingleClips> {
  const dir = await mkdtemp(path.join(tmpdir(), "jingle-"));
  const inputFile = path.join(dir, "full.mp3");

  try {
    const res = await fetch(audioUrl);
    if (!res.ok) throw new Error(`Falha ao baixar áudio completo (${res.status})`);
    await writeFile(inputFile, Buffer.from(await res.arrayBuffer()));

    const out15 = path.join(dir, "15s.mp3");
    const out30 = path.join(dir, "30s.mp3");
    const out60 = path.join(dir, "60s.mp3");

    await cutClip(inputFile, out15, startOffset, CLIP_DURATIONS.s15);
    await cutClip(inputFile, out30, startOffset, CLIP_DURATIONS.s30);
    await cutClip(inputFile, out60, startOffset, CLIP_DURATIONS.s60);

    const [s15, s30, s60] = await Promise.all([
      readFile(out15),
      readFile(out30),
      readFile(out60),
    ]);

    return { s15, s30, s60 };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
