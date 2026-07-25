import { createFileRoute } from "@tanstack/react-router";
import { Flame, Pause, Play, TrendingUp } from "lucide-react";
import { formatTime, useMusic } from "@/lib/music-store";

export const Route = createFileRoute("/music")({
  head: () => ({
    meta: [
      { title: "Trending Music — Krish Sense" },
      { name: "description", content: "Trending farm-field soundtrack for Krish Sense. Discover, stream, and keep playing across the app." },
      { property: "og:title", content: "Trending Music — Krish Sense" },
      { property: "og:description", content: "Discover trending tracks and stream a curated field soundtrack. Plays continue as you navigate Krish Sense." },
    ],
  }),
  component: MusicPage,
});

function MusicPage() {
  const { playlist, current, isPlaying, play, toggle } = useMusic();
  const featured = playlist[0];
  const hot = [...playlist].sort((a, b) => b.trend - a.trend).slice(0, 6);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-40 pt-24 sm:px-6">
      {/* Header */}
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
          <Flame className="h-3 w-3" /> Trending Now
        </div>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight sm:text-6xl">
          <span className="text-white">Music </span><span className="text-gradient">Radar</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Live curated playlist. Tap a track to stream — playback continues everywhere in Krish Sense.
        </p>
      </header>

      {/* Featured hero card */}
      {featured && (
        <button
          onClick={() => (current?.id === featured.id ? toggle() : play(featured.id))}
          className="card-elegant group relative mb-10 flex w-full overflow-hidden rounded-3xl p-0 text-left"
        >
          <div className="relative hidden h-56 w-56 shrink-0 sm:block">
            <img src={featured.cover} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="relative flex flex-1 flex-col justify-between p-6 sm:p-8">
            <div>
              <p className="font-display mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
                #1 Trending · {featured.genre}
              </p>
              <h2 className="font-display text-2xl font-black uppercase leading-tight sm:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{featured.artist} · {featured.album}</p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <span className="btn-gold font-display inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] uppercase tracking-widest">
                {current?.id === featured.id && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {current?.id === featured.id && isPlaying ? "Playing" : "Play now"}
              </span>
              <span className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">
                {featured.plays} plays · +{featured.trend}%
              </span>
            </div>
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-40"
               style={{ background: "radial-gradient(400px 200px at 90% 50%, color-mix(in oklab, var(--accent) 35%, transparent), transparent 70%)" }} />
        </button>
      )}

      {/* Hot 6 grid */}
      <div className="mb-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide">Hot This Week</h3>
          <span className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Ranked by momentum</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {hot.map((s) => {
            const active = current?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => (active ? toggle() : play(s.id))}
                className="card-elegant group relative overflow-hidden rounded-2xl p-3 text-left"
              >
                <div className="relative mb-3 aspect-square overflow-hidden rounded-xl">
                  <img src={s.cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <span className="absolute right-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 font-display text-[9px] font-bold uppercase tracking-widest text-accent">
                    +{s.trend}%
                  </span>
                  <span className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-accent text-black shadow-elegant transition-transform group-hover:scale-110">
                    {active && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
                  </span>
                </div>
                <p className="font-display truncate text-[12px] font-bold uppercase tracking-wide text-foreground">{s.title}</p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{s.artist}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full list */}
      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide">Trending Tracks</h3>
          <span className="font-display inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-accent">
            <TrendingUp className="h-3 w-3" /> Live
          </span>
        </div>
        <div className="card-elegant overflow-hidden rounded-2xl">
          {/* Header row (desktop) */}
          <div className="hidden grid-cols-[36px_1fr_1fr_100px_60px] items-center gap-3 border-b border-border/50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground md:grid">
            <span>#</span><span>Title</span><span>Album</span><span>Plays</span><span>Time</span>
          </div>
          <ul className="divide-y divide-border/40">
            {playlist.map((s, i) => {
              const active = current?.id === s.id;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => (active ? toggle() : play(s.id))}
                    className={`group grid w-full grid-cols-[36px_1fr_60px] items-center gap-3 px-3 py-2.5 text-left transition hover:bg-accent/5 md:grid-cols-[36px_1fr_1fr_100px_60px] md:px-4 ${
                      active ? "bg-accent/[0.06]" : ""
                    }`}
                  >
                    <span className="grid h-8 w-8 place-items-center">
                      {active && isPlaying ? (
                        <Pause className="h-4 w-4 text-accent" />
                      ) : (
                        <>
                          <span className={`font-display text-[13px] tabular-nums group-hover:hidden ${active ? "text-accent" : "text-muted-foreground"}`}>
                            {(i + 1).toString().padStart(2, "0")}
                          </span>
                          <Play className="hidden h-4 w-4 text-accent group-hover:block" />
                        </>
                      )}
                    </span>
                    <span className="flex min-w-0 items-center gap-3">
                      <img src={s.cover} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
                      <span className="min-w-0">
                        <span className={`font-display block truncate text-[13px] font-bold uppercase tracking-wide ${active ? "text-accent" : "text-foreground"}`}>
                          {s.title}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">{s.artist} · {s.genre}</span>
                      </span>
                    </span>
                    <span className="hidden truncate text-[12px] text-muted-foreground md:block">{s.album}</span>
                    <span className="hidden font-display text-[11px] tabular-nums text-muted-foreground md:block">{s.plays}</span>
                    <span className="font-display text-[11px] tabular-nums text-muted-foreground">{formatTime(s.duration)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
