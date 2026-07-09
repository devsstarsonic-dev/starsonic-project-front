import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpegPath = require("ffmpeg-static") as string;

const execFileAsync = promisify(execFile);

// Suno não gera áudios curtos: geramos 1 take completo (1:30-2:00) e cortamos
// aqui com FFmpeg em 15s/30s/60s, cada um com fade-out de 1s no final.
const CLIP_DURATIONS = { s15: 15, s30: 30, s60: 60 } as const;

export type JingleClips = {
  full: Buffer;
  s15: Buffer;
  s30: Buffer;
  s60: Buffer;
};

async function cutClip(inputFile: string, outFile: string, seconds: number): Promise<void> {
  const fadeStart = Math.max(seconds - 1, 0);
  await execFileAsync(ffmpegPath, [
    "-y",
    "-i", inputFile,
    "-t", String(seconds),
    "-af", `afade=t=out:st=${fadeStart}:d=1`,
    outFile,
  ]);
}

/**
 * Baixa `audioUrl` pra um arquivo temporário e corta em 15s/30s/60s via FFmpeg.
 * Devolve os 4 buffers (completo + 3 clipes) prontos pra subir no R2.
 * Limpa o diretório temporário no `finally`, mesmo em caso de erro.
 */
export async function cutJingle(audioUrl: string): Promise<JingleClips> {
  const dir = await mkdtemp(path.join(tmpdir(), "jingle-"));
  const inputFile = path.join(dir, "full.mp3");

  try {
    const res = await fetch(audioUrl);
    if (!res.ok) throw new Error(`Falha ao baixar áudio completo (${res.status})`);
    await writeFile(inputFile, Buffer.from(await res.arrayBuffer()));

    const out15 = path.join(dir, "15s.mp3");
    const out30 = path.join(dir, "30s.mp3");
    const out60 = path.join(dir, "60s.mp3");

    await cutClip(inputFile, out15, CLIP_DURATIONS.s15);
    await cutClip(inputFile, out30, CLIP_DURATIONS.s30);
    await cutClip(inputFile, out60, CLIP_DURATIONS.s60);

    const [full, s15, s30, s60] = await Promise.all([
      readFile(inputFile),
      readFile(out15),
      readFile(out30),
      readFile(out60),
    ]);

    return { full, s15, s30, s60 };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
