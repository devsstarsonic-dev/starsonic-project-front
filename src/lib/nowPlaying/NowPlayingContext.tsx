"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

// Player de áudio GLOBAL e único, compartilhado por toda a área logada.
// Mantém um só elemento <audio> (dentro do provider) e o estado de reprodução,
// para que qualquer tela (revisar, criações…) possa dar play e o painel direito
// mostre a faixa "tocando agora" — estilo Spotify, sem dois áudios ao mesmo tempo.
//
// Suporta uma FILA (queue): ao tocar uma playlist, passamos a lista de faixas;
// a barra inferior mostra "anterior/próxima" e a faixa avança sozinha no fim.

export type PlayerTrack = {
  /** Identificador estável da faixa (usamos a própria URL do áudio). */
  id: string;
  audioUrl: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  primary?: boolean;
};

type Ctx = {
  track: PlayerTrack | null;
  playing: boolean;
  current: number;
  duration: number;
  volume: number;
  muted: boolean;
  /** Fila atual (vazia quando tocando faixa avulsa). */
  queue: PlayerTrack[];
  /** Índice da faixa atual dentro da fila (-1 quando sem fila). */
  queueIndex: number;
  hasNext: boolean;
  hasPrev: boolean;
  /** Toca uma faixa nova avulsa (ou retoma, se for a mesma). Limpa a fila. */
  playTrack: (t: PlayerTrack) => void;
  /** Toca uma fila de faixas começando em startIndex (playlist). */
  playQueue: (tracks: PlayerTrack[], startIndex?: number) => void;
  /** Próxima faixa da fila. */
  next: () => void;
  /** Faixa anterior da fila. */
  prev: () => void;
  /** Play/pause da faixa atual. */
  toggle: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
};

const NowPlayingContext = createContext<Ctx | null>(null);

export function NowPlayingProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<PlayerTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  // Refs espelham a fila para o handler "ended" (registrado uma única vez).
  const queueRef = useRef<PlayerTrack[]>([]);
  const indexRef = useRef(-1);
  queueRef.current = queue;
  indexRef.current = queueIndex;

  // Carrega e toca uma faixa no <audio> (referência estável).
  const loadAndPlay = useCallback((t: PlayerTrack) => {
    const a = audioRef.current;
    if (!a) return;
    setTrack(t);
    setCurrent(0);
    setDuration(0);
    a.src = t.audioUrl;
    a.load();
    void a.play().catch(() => {
      /* autoplay bloqueado / URL inválida */
    });
  }, []);

  // Liga os eventos do <audio> uma única vez.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrent(a.currentTime);
    const onMeta = () => setDuration(a.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => {
      // Avança na fila, se houver próxima; senão, encerra.
      const q = queueRef.current;
      const i = indexRef.current;
      if (q.length && i >= 0 && i < q.length - 1) {
        const ni = i + 1;
        setQueueIndex(ni);
        loadAndPlay(q[ni]);
      } else {
        setPlaying(false);
        setCurrent(0);
      }
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnd);
    };
  }, [loadAndPlay]);

  const playTrack = useCallback(
    (t: PlayerTrack) => {
      // Faixa avulsa: zera a fila.
      setQueue([]);
      setQueueIndex(-1);
      if (track?.id === t.id) {
        void audioRef.current?.play();
        return;
      }
      loadAndPlay(t);
    },
    [track, loadAndPlay],
  );

  const playQueue = useCallback(
    (tracks: PlayerTrack[], startIndex = 0) => {
      if (!tracks.length) return;
      const i = Math.max(0, Math.min(startIndex, tracks.length - 1));
      setQueue(tracks);
      setQueueIndex(i);
      const t = tracks[i];
      if (track?.id === t.id) {
        void audioRef.current?.play();
        return;
      }
      loadAndPlay(t);
    },
    [track, loadAndPlay],
  );

  const next = useCallback(() => {
    const q = queueRef.current;
    const i = indexRef.current;
    if (!q.length || i < 0 || i >= q.length - 1) return;
    const ni = i + 1;
    setQueueIndex(ni);
    loadAndPlay(q[ni]);
  }, [loadAndPlay]);

  const prev = useCallback(() => {
    const q = queueRef.current;
    const i = indexRef.current;
    if (!q.length || i <= 0) return;
    const pi = i - 1;
    setQueueIndex(pi);
    loadAndPlay(q[pi]);
  }, [loadAndPlay]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a || !track) return;
    if (a.paused) void a.play();
    else a.pause();
  }, [track]);

  const seekTo = useCallback((seconds: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = seconds;
    setCurrent(seconds);
  }, []);

  const setVolume = useCallback((v: number) => {
    const a = audioRef.current;
    setVolumeState(v);
    setMuted(v === 0);
    if (a) {
      a.volume = v;
      a.muted = v === 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (muted || volume === 0) {
      setVolume(0.7);
    } else {
      a.muted = true;
      setMuted(true);
    }
  }, [muted, volume, setVolume]);

  const hasNext = queue.length > 0 && queueIndex >= 0 && queueIndex < queue.length - 1;
  const hasPrev = queue.length > 0 && queueIndex > 0;

  return (
    <NowPlayingContext.Provider
      value={{
        track,
        playing,
        current,
        duration,
        volume,
        muted,
        queue,
        queueIndex,
        hasNext,
        hasPrev,
        playTrack,
        playQueue,
        next,
        prev,
        toggle,
        seekTo,
        setVolume,
        toggleMute,
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} preload="metadata" />
      {children}
    </NowPlayingContext.Provider>
  );
}

// Retorna null se usado fora do provider (não quebra players isolados).
export function useNowPlaying() {
  return useContext(NowPlayingContext);
}
