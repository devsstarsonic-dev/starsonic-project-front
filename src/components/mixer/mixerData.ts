// Dados e tipos do StarMix (casca visual — Fase 1, sem áudio real).
// Os 5 canais mapeiam os stems que a Fase 2 (separação Demucs) vai produzir:
// bateria=drums, baixo=bass, vocal=vocals, teclado=piano, outros=guitar/other.

import type { ComponentType, SVGProps } from "react";
import { IcDrum, IcGuitar, IcMic, IcPiano, IcViolin, IcMusic, IcFlame, IcRadio, IcDiscVinyl, IcHeadphones, IcMoon, IcKaraoke } from "./icons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type ChannelId = "drums" | "bass" | "vocals" | "keys" | "other";
export type EqBand = "low" | "mid" | "high";

export type ChannelState = {
  volume: number; // 0–100
  mute: boolean;
  solo: boolean;
  eq: Record<EqBand, number>; // -12 a +12 dB
  reverb: number; // 0–100 (% wet)
  pan: number; // -50 a +50
};

export type ChannelDef = {
  id: ChannelId;
  name: string;
  sub: string;
  Icon: IconType;
  color: string;
};

export const CHANNELS: ChannelDef[] = [
  { id: "drums", name: "BATERIA", sub: "Percussão", Icon: IcDrum, color: "var(--pink)" },
  { id: "bass", name: "BAIXO", sub: "Grave", Icon: IcGuitar, color: "var(--purple)" },
  { id: "vocals", name: "VOCAL", sub: "Voz", Icon: IcMic, color: "var(--cyan-1)" },
  { id: "keys", name: "TECLADO", sub: "Piano/Órgão", Icon: IcPiano, color: "var(--amber)" },
  { id: "other", name: "OUTROS", sub: "Cordas, sopros", Icon: IcViolin, color: "var(--green)" },
];

type PresetChannel = { volume: number; eq: Record<EqBand, number>; reverb: number };
export type PresetId = "original" | "party" | "radio" | "acoustic" | "karaoke" | "vintage";

export const PRESETS: { id: PresetId; name: string; desc: string; Icon: IconType }[] = [
  { id: "original", name: "Original", desc: "Como veio", Icon: IcMusic },
  { id: "party", name: "Festa", desc: "Grave forte", Icon: IcFlame },
  { id: "radio", name: "Rádio", desc: "Volume comercial", Icon: IcRadio },
  { id: "acoustic", name: "Acústico", desc: "Sem bateria", Icon: IcMoon },
  { id: "karaoke", name: "Karaokê", desc: "Sem voz", Icon: IcKaraoke },
  { id: "vintage", name: "Vintage", desc: "Anos 70/80", Icon: IcDiscVinyl },
];

// Valores por canal aplicados ao clicar num preset.
export const PRESET_VALUES: Record<PresetId, Record<ChannelId, PresetChannel>> = {
  original: {
    drums: { volume: 75, eq: { low: 0, mid: 0, high: 0 }, reverb: 15 },
    bass: { volume: 65, eq: { low: 0, mid: 0, high: 0 }, reverb: 5 },
    vocals: { volume: 85, eq: { low: 0, mid: 0, high: 0 }, reverb: 20 },
    keys: { volume: 60, eq: { low: 0, mid: 0, high: 0 }, reverb: 25 },
    other: { volume: 60, eq: { low: 0, mid: 0, high: 0 }, reverb: 20 },
  },
  party: {
    drums: { volume: 90, eq: { low: 5, mid: 0, high: 2 }, reverb: 10 },
    bass: { volume: 85, eq: { low: 8, mid: 0, high: 0 }, reverb: 5 },
    vocals: { volume: 75, eq: { low: 0, mid: 2, high: 5 }, reverb: 15 },
    keys: { volume: 55, eq: { low: 0, mid: 0, high: 2 }, reverb: 20 },
    other: { volume: 65, eq: { low: 0, mid: 2, high: 3 }, reverb: 15 },
  },
  radio: {
    drums: { volume: 75, eq: { low: 2, mid: 0, high: 3 }, reverb: 12 },
    bass: { volume: 70, eq: { low: 3, mid: 0, high: 0 }, reverb: 5 },
    vocals: { volume: 90, eq: { low: 0, mid: 3, high: 4 }, reverb: 18 },
    keys: { volume: 55, eq: { low: 0, mid: 0, high: 2 }, reverb: 20 },
    other: { volume: 55, eq: { low: 0, mid: 2, high: 3 }, reverb: 15 },
  },
  acoustic: {
    drums: { volume: 30, eq: { low: -5, mid: -2, high: 0 }, reverb: 30 },
    bass: { volume: 40, eq: { low: 0, mid: 0, high: 0 }, reverb: 20 },
    vocals: { volume: 90, eq: { low: 0, mid: 3, high: 2 }, reverb: 40 },
    keys: { volume: 85, eq: { low: 0, mid: 2, high: 3 }, reverb: 45 },
    other: { volume: 85, eq: { low: 0, mid: 2, high: 2 }, reverb: 40 },
  },
  karaoke: {
    drums: { volume: 75, eq: { low: 0, mid: 0, high: 0 }, reverb: 15 },
    bass: { volume: 65, eq: { low: 0, mid: 0, high: 0 }, reverb: 5 },
    vocals: { volume: 0, eq: { low: 0, mid: 0, high: 0 }, reverb: 0 },
    keys: { volume: 65, eq: { low: 0, mid: 0, high: 0 }, reverb: 25 },
    other: { volume: 65, eq: { low: 0, mid: 0, high: 0 }, reverb: 20 },
  },
  vintage: {
    drums: { volume: 65, eq: { low: 2, mid: 0, high: -5 }, reverb: 40 },
    bass: { volume: 60, eq: { low: 3, mid: 0, high: -3 }, reverb: 25 },
    vocals: { volume: 80, eq: { low: 2, mid: 0, high: -3 }, reverb: 50 },
    keys: { volume: 55, eq: { low: 0, mid: 0, high: -3 }, reverb: 45 },
    other: { volume: 55, eq: { low: 0, mid: 0, high: -4 }, reverb: 40 },
  },
};

// Alvos de mastering (aba Avançado).
export const MASTER_TARGETS: { name: string; lufs: string; note: string; Icon: IconType }[] = [
  { name: "Streaming", lufs: "-14 LUFS", note: "Spotify / Apple", Icon: IcMusic },
  { name: "Rádio", lufs: "-9 LUFS", note: "FM broadcast", Icon: IcRadio },
  { name: "Vídeo", lufs: "-16 LUFS", note: "YouTube / TikTok", Icon: IcDiscVinyl },
  { name: "Cinema", lufs: "-23 LUFS", note: "Dinâmica total", Icon: IcHeadphones },
];

export function initialChannelState(): Record<ChannelId, ChannelState> {
  const out = {} as Record<ChannelId, ChannelState>;
  for (const ch of CHANNELS) {
    const p = PRESET_VALUES.original[ch.id];
    out[ch.id] = { volume: p.volume, mute: false, solo: false, eq: { ...p.eq }, reverb: p.reverb, pan: 0 };
  }
  return out;
}

export function panLabel(v: number): string {
  const n = Math.round(v);
  if (n === 0) return "C";
  return n < 0 ? `L${Math.abs(n)}` : `R${n}`;
}
