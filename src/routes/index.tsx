import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, MapPin, Sprout, Sun, TrendingUp, Leaf, Droplets,
  BarChart3, Compass, LineChart, ShieldCheck,
} from "lucide-react";
import { CROP_LIST } from "@/data/crops";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { useLocation } from "@/lib/location-store";
import { profileFor } from "@/lib/district-profiles";
import heroImg from "@/assets/hero-farm.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KrishiSense — Smart Agricultural Advisory Platform" },
      { name: "description", content: "A cinematic bento dashboard for Indian farmers: trending crops, live soil and rainfall, market prices, fertilizer planner, disease library and district atlas." },
    ],
  }),
  component: Home,
});

function Home() {
  const loc = useLocation();
  const p = profileFor(loc.district);
  const trending = CROP_LIST.filter((c) => c.trending).slice(0, 6);
  const featured = trending[0] ?? CROP_LIST[0];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 md:pt-10">
      {/* Location strip */}
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs backdrop-blur">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-primary text-[9px] text-primary-foreground">✓</span>
            Live for <b className="font-semibold text-foreground">{loc.district}, {loc.state}</b>
          </span>
          <Link
            to="/districts"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/40 px-3 py-1 text-xs backdrop-blur transition hover:bg-secondary tap"
          >
            <MapPin className="h-3.5 w-3.5 text-primary" /> Change district
          </Link>
        </div>
      </Reveal>

      {/* BENTO GRID */}
      <div className="mt-6 grid auto-rows-[minmax(140px,auto)] grid-cols-2 gap-4 md:grid-cols-6 md:gap-5">
        {/* Hero (spans 4x2 desktop, full width mobile) */}
        <Reveal className="col-span-2 md:col-span-4 md:row-span-2">
          <div className="relative h-full overflow-hidden rounded-3xl border border-border/60 bg-card">
            <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
            <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/40 to-transparent" />
            <div className="relative flex h-full flex-col justify-between p-6 md:p-10">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] backdrop-blur">
                <Sprout className="h-3.5 w-3.5 text-primary" /> Advisory platform
              </span>
              <div>
                <h1 className="font-display text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Grow with <span className="text-gradient">clarity.</span>
                </h1>
                <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
                  A cinematic, science-backed playbook for every acre — soil to market, tuned to {loc.district}.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    to="/crops"
                    className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:brightness-110 tap"
                    style={{ boxShadow: "var(--shadow-glow)" }}
                  >
                    Explore crops
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/analytics"
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-secondary tap"
                  >
                    <BarChart3 className="h-4 w-4 text-primary" /> India atlas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Season tile */}
        <BentoTile
          className="col-span-1 md:col-span-2"
          icon={<Sun className="h-4 w-4" />}
          tag="Season"
          title={p.season}
          sub={p.climate}
        />

        {/* Soil tile */}
        <BentoTile
          className="col-span-1 md:col-span-2"
          icon={<Leaf className="h-4 w-4" />}
          tag="Soil"
          title={p.soil}
          sub={`pH ${p.soilPh}`}
        />

        {/* Rainfall tile — larger */}
        <Reveal className="col-span-2 md:col-span-2">
          <div className="card-elegant hover-lift flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">
                <Droplets className="h-4 w-4" />
              </div>
              <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Rainfall
              </span>
            </div>
            <div>
              <div className="font-display text-3xl font-black tracking-tight">
                <CountUp value={p.rainfallYtdMm} suffix=" mm" />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                YTD · <span className={p.rainfallDeltaPct >= 0 ? "text-primary" : "text-destructive"}>
                  {p.rainfallDeltaPct >= 0 ? "+" : ""}{p.rainfallDeltaPct}% vs avg
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Trending row */}
        <Reveal className="col-span-2 md:col-span-4">
          <div className="card-elegant flex h-full flex-col p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">Trending</span>
                <h2 className="mt-1 font-display text-xl font-bold tracking-tight md:text-2xl">Crops moving this season</h2>
              </div>
              <Link to="/crops" className="story-link text-xs text-muted-foreground">See all →</Link>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {trending.map((c) => (
                <Link
                  key={c.slug}
                  to="/crops/$slug"
                  params={{ slug: c.slug }}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border/60"
                >
                  <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-2">
                    <div className="truncate text-[11px] font-semibold">{c.name}</div>
                    <div className="text-[9px] text-primary">+{c.profitPct}%</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Featured crop */}
        <Reveal className="col-span-2 md:col-span-3 md:row-span-2">
          <Link
            to="/crops/$slug"
            params={{ slug: featured.slug }}
            className="group relative block h-full min-h-[280px] overflow-hidden rounded-3xl border border-border/60"
          >
            <img src={featured.image} alt={featured.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full glass text-2xl">
              {featured.emoji}
            </div>
            <span className="absolute left-4 top-4 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
              Featured
            </span>
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h3 className="font-display text-3xl font-black tracking-tight md:text-4xl">{featured.name}</h3>
              <p className="text-xs italic text-muted-foreground">{featured.scientificName}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <Pill>+{featured.profitPct}% profit</Pill>
                <Pill>{featured.waterNeed} water</Pill>
                <Pill>{featured.season.split(" ")[0]}</Pill>
              </div>
            </div>
          </Link>
        </Reveal>

        {/* Market mini card */}
        <BentoLink
          to="/market"
          className="col-span-1 md:col-span-3"
          icon={<TrendingUp className="h-4 w-4" />}
          tag="Live"
          title="Market prices"
          sub="Mandi trends & MSP"
        />

        {/* Fertilizer mini card */}
        <BentoLink
          to="/fertilizer"
          className="col-span-1 md:col-span-3"
          icon={<LineChart className="h-4 w-4" />}
          tag="Planner"
          title="Fertilizer calculator"
          sub="Per acre / hectare"
        />

        {/* Stats strip */}
        <Reveal className="col-span-2 md:col-span-6">
          <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur md:grid-cols-4">
            {[
              { value: 128, suffix: "K+", label: "Farmers advised" },
              { value: CROP_LIST.length, suffix: "", label: "Crops covered" },
              { value: 26, suffix: "", label: "Districts live" },
              { value: 99, suffix: "%", label: "Uptime" },
            ].map((s) => (
              <div key={s.label} className="text-center md:text-left">
                <div className="font-display text-3xl font-black tracking-tight md:text-4xl">
                  <CountUp value={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Feature cards */}
        <FeatureBento
          className="col-span-2 md:col-span-2"
          to="/analytics"
          icon={<BarChart3 className="h-4 w-4" />}
          title="India Crop Atlas"
          copy="2025-26 estimates across 9 states, fully interactive."
        />
        <FeatureBento
          className="col-span-2 md:col-span-2"
          to="/rotation"
          icon={<Compass className="h-4 w-4" />}
          title="Rotation wheel"
          copy="Plan sequences that rebuild soil and profit."
        />
        <FeatureBento
          className="col-span-2 md:col-span-2"
          to="/diseases"
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Disease library"
          copy="Identify symptoms, organic and chemical remedies."
        />
      </div>
    </div>
  );
}

function BentoTile({ className = "", icon, tag, title, sub }: { className?: string; icon: React.ReactNode; tag: string; title: string; sub: string }) {
  return (
    <Reveal className={className}>
      <div className="card-elegant hover-lift flex h-full flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">{icon}</div>
          <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{tag}</span>
        </div>
        <div>
          <div className="font-display text-xl font-bold tracking-tight">{title}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
        </div>
      </div>
    </Reveal>
  );
}

function BentoLink({ to, className = "", icon, tag, title, sub }: { to: string; className?: string; icon: React.ReactNode; tag: string; title: string; sub: string }) {
  return (
    <Reveal className={className}>
      <Link to={to} className="card-elegant hover-lift group flex h-full items-center justify-between gap-4 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">{icon}</div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{tag}</div>
            <div className="truncate font-display text-lg font-bold">{title}</div>
            <div className="truncate text-xs text-muted-foreground">{sub}</div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
      </Link>
    </Reveal>
  );
}

function FeatureBento({ to, className = "", icon, title, copy }: { to: string; className?: string; icon: React.ReactNode; title: string; copy: string }) {
  return (
    <Reveal className={className}>
      <Link to={to} className="card-elegant hover-lift group flex h-full flex-col justify-between p-5">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">{icon}</div>
        <div className="mt-4">
          <h3 className="font-display text-lg font-bold tracking-tight">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{copy}</p>
        </div>
        <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
          Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </Reveal>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[10px] font-medium backdrop-blur">
      {children}
    </span>
  );
}
