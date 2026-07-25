import {
  createContext, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import { TRENDING_SONGS, type TrendingSong } from "@/data/trending-songs";

type Ctx = {
  playlist: TrendingSong[];
  current: TrendingSong | null;
  isPlaying: boolean;
  progress: number; // 0..1
  currentTime: number;
  duration: number;
  volume: number;
  play: (id?: string) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (ratio: number) => void;
  setVolume: (v: number) => void;
};

const MusicCtx = createContext<Ctx | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);

  const playlist = TRENDING_SONGS;
  const current = useMemo(
    () => playlist.find((s) => s.id === currentId) ?? null,
    [currentId, playlist],
  );

  // Create audio element once (client only)
  useEffect(() => {
    if (audioRef.current) return;
    const a = new Audio();
    a.preload = "metadata";
    a.volume = volume;
    audioRef.current = a;

    const onTime = () => setCurrentTime(a.currentTime || 0);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => {
      // auto-next
      const idx = playlist.findIndex((s) => s.id === currentId);
      const nxt = playlist[(idx + 1) % playlist.length];
      if (nxt) {
        setCurrentId(nxt.id);
      } else {
        setIsPlaying(false);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to track changes
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (!current) return;
    if (a.src !== current.url) {
      a.src = current.url;
    }
    a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [current]);

  const play: Ctx["play"] = (id) => {
    const a = audioRef.current;
    if (!a) return;
    if (id && id !== currentId) {
      setCurrentId(id);
      return;
    }
    if (!currentId && playlist[0]) {
      setCurrentId(playlist[0].id);
      return;
    }
    a.play().then(() => setIsPlaying(true)).catch(() => {});
  };
  const pause = () => { audioRef.current?.pause(); };
  const toggle = () => (isPlaying ? pause() : play());
  const next = () => {
    const idx = playlist.findIndex((s) => s.id === currentId);
    const nxt = playlist[(idx + 1 + playlist.length) % playlist.length];
    if (nxt) setCurrentId(nxt.id);
  };
  const prev = () => {
    const idx = playlist.findIndex((s) => s.id === currentId);
    const prv = playlist[(idx - 1 + playlist.length) % playlist.length];
    if (prv) setCurrentId(prv.id);
  };
  const seek = (ratio: number) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    a.currentTime = Math.max(0, Math.min(1, ratio)) * a.duration;
  };
  const setVolume = (v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  };

  const value: Ctx = {
    playlist, current, isPlaying,
    progress: duration ? currentTime / duration : 0,
    currentTime, duration, volume,
    play, pause, toggle, next, prev, seek, setVolume,
  };

  return <MusicCtx.Provider value={value}>{children}</MusicCtx.Provider>;
}

export function useMusic() {
  const ctx = useContext(MusicCtx);
  if (!ctx) throw new Error("useMusic must be used within MusicProvider");
  return ctx;
}

export function formatTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}
