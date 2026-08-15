import { Link } from "@tanstack/react-router";
import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { formatTime, useMusic } from "@/lib/music-store";

export function MiniPlayer() {
  const { current, isPlaying, toggle, next, prev, progress, currentTime, duration, seek, volume, setVolume } = useMusic();
  if (!current) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + var(--mini-bottom, 76px))" }}
    >
      <div className="pointer-events-auto mx-auto max-w-4xl px-3">
        <div className="neo-glass relative flex items-center gap-3 overflow-hidden rounded-[2rem] p-2 pr-3 border border-white/10 shadow-2xl">
          {/* Cover + title */}
          <Link to="/music" className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
              <img src={current.cover} alt="" className="h-full w-full object-cover" />
              {isPlaying && (
                <span className="absolute inset-0 grid place-items-center bg-black/40">
                  <span className="flex h-3 items-end gap-[2px]">
                    <span className="w-[2px] animate-[eq_0.9s_ease-in-out_infinite] bg-accent" style={{ height: "60%" }} />
                    <span className="w-[2px] animate-[eq_1.1s_ease-in-out_infinite] bg-accent" style={{ height: "100%", animationDelay: ".15s" }} />
                    <span className="w-[2px] animate-[eq_0.8s_ease-in-out_infinite] bg-accent" style={{ height: "40%", animationDelay: ".3s" }} />
                  </span>
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-display truncate text-[13px] font-bold uppercase tracking-wide text-foreground">
                {current.title}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">{current.artist} · {current.album}</p>
            </div>
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button onClick={prev} aria-label="Previous" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:text-accent">
              <SkipBack className="h-4 w-4" />
            </button>
            <button onClick={toggle} aria-label={isPlaying ? "Pause" : "Play"} className="btn-gold grid h-10 w-10 place-items-center rounded-xl">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
            </button>
            <button onClick={next} aria-label="Next" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:text-accent">
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Time + volume (desktop) */}
          <div className="hidden items-center gap-2 md:flex">
            <span className="font-display text-[10px] tabular-nums text-muted-foreground">{formatTime(currentTime)}</span>
            <div className="flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="range" min={0} max={1} step={0.01} value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="h-1 w-20 cursor-pointer accent-[color:var(--accent)]"
                aria-label="Volume"
              />
            </div>
            <span className="font-display text-[10px] tabular-nums text-muted-foreground">{formatTime(duration)}</span>
          </div>

          {/* Progress bar */}
          <div
            className="absolute inset-x-0 bottom-0 h-[3px] cursor-pointer bg-white/5"
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              seek((e.clientX - rect.left) / rect.width);
            }}
          >
            <div
              className="h-full transition-[width] duration-150"
              style={{
                width: `${Math.min(100, Math.max(0, progress * 100))}%`,
                background: "linear-gradient(90deg, var(--accent), var(--primary))",
                boxShadow: "0 0 12px color-mix(in oklab, var(--accent) 60%, transparent)",
              }}
            />
          </div>
        </div>
      </div>
      <style>{`@keyframes eq { 0%,100%{transform:scaleY(.4)} 50%{transform:scaleY(1)} }`}</style>
    </div>
  );
}
