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
  /** Toca uma faixa nova (ou retoma, se for a mesma). */
  playTrack: (t: PlayerTrack) => void;
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

  // Liga os eventos do <audio> uma única vez.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrent(a.currentTime);
    const onMeta = () => setDuration(a.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => {
      setPlaying(false);
      setCurrent(0);
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
  }, []);

  const playTrack = useCallback(
    (t: PlayerTrack) => {
      const a = audioRef.current;
      if (!a) return;
      if (track?.id === t.id) {
        // Mesma faixa: apenas retoma.
        void a.play();
        return;
      }
      setTrack(t);
      setCurrent(0);
      setDuration(0);
      a.src = t.audioUrl;
      a.load();
      void a.play().catch(() => {
        /* autoplay bloqueado / URL inválida */
      });
    },
    [track],
  );

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

  return (
    <NowPlayingContext.Provider
      value={{
        track,
        playing,
        current,
        duration,
        volume,
        muted,
        playTrack,
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
