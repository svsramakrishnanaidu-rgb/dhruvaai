"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Music, Play } from "lucide-react";
import bgm from "@/assets/bgm.mp3.asset.json";

const STORAGE_KEY = "krish.bgm";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.35);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.volume === "number") setVolume(s.volume);
        if (typeof s.muted === "boolean") setMuted(s.muted);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume, muted }));
    } catch {}
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
  }, [volume, muted]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    a.muted = muted;
    const tryPlay = () => {
      a.play()
        .then(() => { setPlaying(true); setNeedsGesture(false); })
        .catch(() => setNeedsGesture(true));
    };
    tryPlay();
    const onGesture = () => {
      if (a.paused) tryPlay();
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed left-3 top-3 z-[60] flex items-center gap-2">
      <audio ref={audioRef} src={bgm.url} loop preload="auto" />
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Background music controls"
        className="glass grid h-10 w-10 place-items-center rounded-full text-foreground shadow-elegant transition hover:scale-105"
        style={{ boxShadow: "0 0 24px color-mix(in oklab, var(--primary) 30%, transparent)" }}
      >
        {needsGesture ? <Play className="h-4 w-4" /> : <Music className={`h-4 w-4 ${playing && !muted ? "animate-pulse" : ""}`} />}
      </button>
      {open && (
        <div className="glass flex items-center gap-2 rounded-full px-3 py-2 shadow-elegant">
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:text-foreground"
          >
            {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (v > 0 && muted) setMuted(false);
            }}
            aria-label="Music volume"
            className="h-1 w-28 cursor-pointer accent-primary"
          />
          <span className="w-8 text-right text-[10px] tabular-nums text-muted-foreground">
            {Math.round((muted ? 0 : volume) * 100)}
          </span>
        </div>
      )}
    </div>
  );
}
