import { createFileRoute } from "@tanstack/react-router";
import { Flame, Music2, Pause, Play, Search, Sparkles, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useMusic } from "@/lib/music-store";
import {
  TELUGU_CATALOG,
  TELUGU_GENRES,
  TELUGU_MOODS,
  TELUGU_YEARS,
  formatDur,
  formatPlays,
  type Genre,
  type Mood,
  type TeluguSong,
} from "@/data/telugu-catalog";

export const Route = createFileRoute("/music")({
  head: () => ({
    meta: [
      { title: "Telugu Music Radar — DHRUVA" },
      { name: "description", content: "1000+ trending Telugu songs — movies, artists, composers. Cinematic streaming built into DHRUVA." },
      { property: "og:title", content: "Telugu Music Radar — DHRUVA" },
      { property: "og:description", content: "Discover the top trending Telugu tracks from the biggest movies. Playback continues everywhere in DHRUVA." },
      { property: "og:type", content: "music.playlist" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MusicPage,
});

const PAGE_STEP = 60;

function MusicPage() {
  const { current, isPlaying, play, toggle } = useMusic();

  // Filters
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<Genre | "All">("All");
  const [mood, setMood] = useState<Mood | "All">("All");
  const [year, setYear] = useState<number | "All">("All");
  const [sort, setSort] = useState<"trending" | "newest" | "plays" | "az">("trending");
  const [visible, setVisible] = useState(PAGE_STEP);

  // Ranked / featured slices come from full catalog (rank was pre-computed).
  const trendingTop = useMemo(
    () => [...TELUGU_CATALOG].sort((a, b) => a.rank - b.rank).slice(0, 100),
    [],
  );
  const featured = trendingTop[0];
  const hotTen = trendingTop.slice(0, 10);
  const newReleases = useMemo(
    () =>
      [...TELUGU_CATALOG]
        .filter((s) => s.isNew)
        .sort((a, b) => b.year - a.year || a.rank - b.rank)
        .slice(0, 12),
    [],
  );
  const editorsPicks = useMemo(
    () => trendingTop.filter((_, i) => i % 7 === 3).slice(0, 8),
    [trendingTop],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = TELUGU_CATALOG.filter((s) => {
      if (genre !== "All" && s.genre !== genre) return false;
      if (mood !== "All" && s.mood !== mood) return false;
      if (year !== "All" && s.year !== year) return false;
      if (q) {
        const hay =
          s.title + " " + s.movie + " " + s.singers.join(" ") + " " +
          s.composer + " " + s.lyricist + " " + s.genre + " " + s.mood;
        if (!hay.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    switch (sort) {
      case "newest": list.sort((a, b) => b.year - a.year || a.rank - b.rank); break;
      case "plays":  list.sort((a, b) => b.plays - a.plays); break;
      case "az":     list.sort((a, b) => a.title.localeCompare(b.title)); break;
      default:       list.sort((a, b) => a.rank - b.rank);
    }
    return list;
  }, [query, genre, mood, year, sort]);

  const shown = filtered.slice(0, visible);

  const activate = (id: string) => (current?.id === id ? toggle() : play(id));

  return (
    <section className="mx-auto max-w-6xl px-4 pb-40 pt-24 sm:px-6">
      {/* Header */}
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
          <Flame className="h-3 w-3" /> Trending Telugu · Live
        </div>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight sm:text-6xl">
          <span className="text-white">Telugu </span>
          <span className="text-gradient">Music Radar</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {TELUGU_CATALOG.length.toLocaleString()} tracks · blockbuster movies, indie releases, folk, devotional & classical.
          Tap any track to stream — playback continues everywhere in DHRUVA.
        </p>
      </header>

      {/* Featured hero */}
      {featured && (
        <FeaturedHero
          song={featured}
          active={current?.id === featured.id}
          isPlaying={isPlaying}
          onToggle={() => activate(featured.id)}
        />
      )}

      {/* Top 10 rail */}
      <SectionHeader title="Top 10 This Week" hint="Ranked by momentum × recency" />
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {hotTen.map((s) => (
          <SongPoster key={s.id} song={s} active={current?.id === s.id} isPlaying={isPlaying} onActivate={() => activate(s.id)} />
        ))}
      </div>

      {/* New Releases */}
      <SectionHeader title="New Releases" hint="Fresh from 2023–2025" icon={<Sparkles className="h-3 w-3" />} />
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {newReleases.map((s) => (
          <SongPoster key={s.id} song={s} active={current?.id === s.id} isPlaying={isPlaying} onActivate={() => activate(s.id)} compact />
        ))}
      </div>

      {/* Editor's Picks */}
      <SectionHeader title="Editor's Picks" hint="Handpicked cinematic gems" />
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {editorsPicks.map((s) => (
          <SongPoster key={s.id} song={s} active={current?.id === s.id} isPlaying={isPlaying} onActivate={() => activate(s.id)} compact />
        ))}
      </div>

      {/* Search + Filters */}
      <SectionHeader title="Explore Catalog" hint={`${filtered.length.toLocaleString()} matching tracks`} icon={<TrendingUp className="h-3 w-3" />} />
      <div className="card-elegant mb-5 rounded-2xl p-3 sm:p-4">
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-black/30 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_STEP); }}
            placeholder="Search song, movie, singer, composer…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterSelect label="Genre" value={genre} onChange={(v) => { setGenre(v as Genre | "All"); setVisible(PAGE_STEP); }} options={["All", ...TELUGU_GENRES]} />
          <FilterSelect label="Mood" value={mood} onChange={(v) => { setMood(v as Mood | "All"); setVisible(PAGE_STEP); }} options={["All", ...TELUGU_MOODS]} />
          <FilterSelect label="Year" value={String(year)} onChange={(v) => { setYear(v === "All" ? "All" : Number(v)); setVisible(PAGE_STEP); }} options={["All", ...TELUGU_YEARS.map(String)]} />
          <FilterSelect label="Sort" value={sort} onChange={(v) => setSort(v as typeof sort)} options={["trending", "newest", "plays", "az"]} />
        </div>
      </div>

      {/* Full list */}
      <div className="card-elegant overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[36px_1fr_1fr_120px_80px_60px] items-center gap-3 border-b border-border/50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground md:grid">
          <span>#</span><span>Title</span><span>Movie · Composer</span><span>Plays</span><span>Year</span><span>Time</span>
        </div>
        <ul className="divide-y divide-border/40">
          {shown.map((s) => {
            const active = current?.id === s.id;
            return (
              <li key={s.id}>
                <button
                  onClick={() => activate(s.id)}
                  className={`group grid w-full grid-cols-[36px_1fr_60px] items-center gap-3 px-3 py-2.5 text-left transition hover:bg-accent/5 md:grid-cols-[36px_1fr_1fr_120px_80px_60px] md:px-4 ${
                    active ? "bg-accent/[0.06]" : ""
                  }`}
                >
                  <span className="grid h-8 w-8 place-items-center">
                    {active && isPlaying ? (
                      <Pause className="h-4 w-4 text-accent" />
                    ) : (
                      <>
                        <span className={`font-display text-[13px] tabular-nums group-hover:hidden ${active ? "text-accent" : "text-muted-foreground"}`}>
                          {s.rank.toString().padStart(3, "0")}
                        </span>
                        <Play className="hidden h-4 w-4 text-accent group-hover:block" />
                      </>
                    )}
                  </span>
                  <span className="flex min-w-0 items-center gap-3">
                    <img src={s.cover} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-md object-cover" />
                    <span className="min-w-0">
                      <span className={`font-display flex items-center gap-1.5 truncate text-[13px] font-bold uppercase tracking-wide ${active ? "text-accent" : "text-foreground"}`}>
                        {s.title}
                        {s.isNew && <span className="rounded bg-accent/20 px-1 text-[9px] font-bold uppercase tracking-widest text-accent">New</span>}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {s.singers.join(", ")} · {s.genre}
                      </span>
                    </span>
                  </span>
                  <span className="hidden min-w-0 truncate text-[12px] text-muted-foreground md:block">
                    <span className="text-foreground/80">{s.movie}</span> · {s.composer}
                  </span>
                  <span className="hidden font-display text-[11px] tabular-nums text-muted-foreground md:block">
                    {formatPlays(s.plays)} · +{s.trend}%
                  </span>
                  <span className="hidden font-display text-[11px] tabular-nums text-muted-foreground md:block">{s.year}</span>
                  <span className="font-display text-[11px] tabular-nums text-muted-foreground">{formatDur(s.duration)}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {shown.length < filtered.length && (
          <div className="border-t border-border/50 p-3 text-center">
            <button
              onClick={() => setVisible((v) => v + PAGE_STEP)}
              className="btn-gold font-display inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] uppercase tracking-widest"
            >
              <Music2 className="h-3.5 w-3.5" />
              Load {Math.min(PAGE_STEP, filtered.length - shown.length)} more
              <span className="text-[10px] opacity-70">({shown.length}/{filtered.length})</span>
            </button>
          </div>
        )}
        {shown.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No tracks match your filters. Try clearing search or switching genre.
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
        Catalog metadata is factual · Audio streams are demo placeholders pending licensed provider integration
      </p>
    </section>
  );
}

/* -------------- Sub-components -------------- */

function FeaturedHero({
  song, active, isPlaying, onToggle,
}: {
  song: TeluguSong; active: boolean; isPlaying: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="card-elegant group relative mb-10 flex w-full overflow-hidden rounded-3xl p-0 text-left"
    >
      <div aria-hidden className="absolute inset-0 opacity-40">
        <img src={song.banner} alt="" className="h-full w-full object-cover blur-md scale-110" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      </div>
      <div className="relative hidden h-64 w-64 shrink-0 sm:block">
        <img src={song.cover} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="relative flex flex-1 flex-col justify-between p-6 sm:p-8">
        <div>
          <p className="font-display mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
            #{song.rank} Trending · {song.genre} · {song.year}
          </p>
          <h2 className="font-display text-2xl font-black uppercase leading-tight sm:text-4xl">
            {song.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="text-foreground/90">{song.movie}</span> · {song.singers.join(", ")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Music: {song.composer} · Lyrics: {song.lyricist}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="btn-gold font-display inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] uppercase tracking-widest">
            {active && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {active && isPlaying ? "Playing" : "Play now"}
          </span>
          <span className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">
            {formatPlays(song.plays)} plays · +{song.trend}% · {formatDur(song.duration)}
          </span>
        </div>
      </div>
    </button>
  );
}

function SongPoster({
  song, active, isPlaying, onActivate, compact,
}: {
  song: TeluguSong; active: boolean; isPlaying: boolean; onActivate: () => void; compact?: boolean;
}) {
  return (
    <button onClick={onActivate} className="card-elegant group relative overflow-hidden rounded-2xl p-3 text-left">
      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl">
        <img src={song.cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <span className="absolute right-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 font-display text-[9px] font-bold uppercase tracking-widest text-accent">
          +{song.trend}%
        </span>
        {song.isNew && (
          <span className="absolute left-2 top-2 rounded-md bg-accent px-1.5 py-0.5 font-display text-[9px] font-bold uppercase tracking-widest text-black">
            New
          </span>
        )}
        <span className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-accent text-black shadow-elegant transition-transform group-hover:scale-110">
          {active && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
        </span>
      </div>
      <p className={`font-display truncate text-[12px] font-bold uppercase tracking-wide ${active ? "text-accent" : "text-foreground"}`}>
        {song.title}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
        {song.movie}{!compact && <> · {song.year}</>}
      </p>
    </button>
  );
}

function SectionHeader({ title, hint, icon }: { title: string; hint?: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <h3 className="font-display text-lg font-bold uppercase tracking-wide">{title}</h3>
      {hint && (
        <span className="font-display inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {icon} {hint}
        </span>
      )}
    </div>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-black/30 px-3 py-1.5">
      <span className="font-display text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs uppercase tracking-wide text-foreground outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-background text-foreground">{o}</option>
        ))}
      </select>
    </label>
  );
}
