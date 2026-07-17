import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, MapPin, Cloud, Sprout, Sun, TrendingUp, Leaf, Droplets } from "lucide-react";
import { CROP_LIST } from "@/data/crops";
import { CropCard } from "@/components/CropCard";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { useLocation } from "@/lib/location-store";
import heroImg from "@/assets/hero-farm.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KrishiSense — Smart Agricultural Advisory Platform" },
      { name: "description", content: "Cinematic crop advisory: trending crops, live weather, market prices, fertilizer calculator and disease library for Indian farmers." },
    ],
  }),
  component: Home,
});

function Home() {
  const loc = useLocation();
  const stats = [
    { value: 128, suffix: "K+", label: "Farmers advised" },
    { value: 42, suffix: "", label: "Crops covered" },
    { value: 26, suffix: "", label: "Districts live" },
    { value: 99, suffix: "%", label: "Uptime" },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <img src={heroImg} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        </div>

        <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs backdrop-blur">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-primary text-[9px] text-primary-foreground">✓</span>
              Live for <b className="font-semibold text-foreground">{loc.district}, {loc.state}</b>
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 max-w-5xl font-display text-5xl font-black leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
              Smart <span className="text-gradient">Agricultural</span><br />
              Advisory Platform
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Cinematic, science-backed guidance for every acre. Choose your district, pick a crop,
              and unlock a full playbook — from land prep to market price.
            </p>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/crops"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:brightness-110"
                style={{ boxShadow: "var(--shadow-glow)" }}
              >
                Explore crops
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/districts"
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/40 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:bg-secondary"
              >
                <MapPin className="h-4 w-4 text-primary" /> Set your district
              </Link>
            </div>
          </Reveal>

          <Reveal delay={480}>
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MiniCard icon={<Cloud className="h-5 w-5" />} label="Today" value="28°C · Partly cloudy" tag="Weather" />
              <MiniCard icon={<Sun className="h-5 w-5" />} label="Season" value="Kharif · Week 6" tag="Growing" />
              <MiniCard icon={<Leaf className="h-5 w-5" />} label="Soil" value="Red loam · pH 6.4" tag="Ideal for legumes" />
              <MiniCard icon={<Droplets className="h-5 w-5" />} label="Rainfall" value="812 mm YTD" tag="+12% vs avg" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="text-center md:text-left">
                <div className="font-display text-4xl font-black tracking-tight md:text-5xl">
                  <CountUp value={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TRENDING */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Trending</span>
              <h2 className="mt-2 font-display text-4xl font-black tracking-tight md:text-5xl">
                Crops moving this season
              </h2>
            </div>
            <Link to="/crops" className="story-link hidden text-sm text-muted-foreground md:inline-block">
              See all →
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CROP_LIST.map((c, i) => (
            <CropCard key={c.slug} crop={c} index={i} />
          ))}
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Sprout className="h-5 w-5" />}
            title="Land-to-market playbooks"
            copy="Every crop ships with land prep, seed, spacing, irrigation, fertilizer, weeds, pests, harvest and storage — isolated per crop, never mixed."
            to="/crops"
          />
          <FeatureCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Live market + MSP"
            copy="Track today's mandi price, 7-day trend, and profit estimation against your acreage and yield."
            to="/market"
          />
          <FeatureCard
            icon={<Search className="h-5 w-5" />}
            title="Instant global search"
            copy="Voice-enabled search across crops, diseases, tools and districts. Press ⌘K anywhere."
            to="/diseases"
          />
        </div>
      </section>
    </div>
  );
}

function MiniCard({ icon, label, value, tag }: { icon: React.ReactNode; label: string; value: string; tag: string }) {
  return (
    <div className="glass hover-lift rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">{icon}</div>
        <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{tag}</span>
      </div>
      <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function FeatureCard({ icon, title, copy, to }: { icon: React.ReactNode; title: string; copy: string; to: string }) {
  return (
    <Link to={to} className="group card-elegant hover-lift block p-8">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
        {icon}
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
      <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
        Learn more
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
