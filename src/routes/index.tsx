import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, ArrowUpRight, MapPin, Sprout, Sun, TrendingUp, Leaf, Droplets,
  BarChart3, Compass, LineChart, ShieldCheck, CloudRain, Wind,
  Sparkles, Bot, Languages, Star, Quote, PlayCircle,
} from "lucide-react";
import { CROP_LIST } from "@/data/crops";
import { Reveal } from "@/components/Reveal";
import { MobileHome } from "@/components/MobileHome";
import { useIsDesktop } from "@/hooks/use-viewport";


import { CountUp } from "@/components/CountUp";
import { useLocation } from "@/lib/location-store";
import { profileFor } from "@/lib/district-profiles";
import heroImg from "@/assets/hero-farm.jpg";
import analyticsImg from "@/assets/heroes/analytics.jpg";
import rotationImg from "@/assets/heroes/rotation.jpg";
import fertilizerImg from "@/assets/heroes/fertilizer.jpg";
import marketImg from "@/assets/heroes/market.jpg";
import weatherImg from "@/assets/heroes/weather.jpg";
import schemesImg from "@/assets/heroes/schemes.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Krish Sense — Smart Agricultural Advisory Platform" },
      { name: "description", content: "A cinematic, science-backed advisory for Indian farmers: crops, weather, mandi prices, fertilizer planner, disease library and district atlas." },
    ],
  }),
  component: Home,
});

function Home() {
  const loc = useLocation();
  const p = profileFor(loc.district);
  const trending = CROP_LIST.filter((c) => c.trending).slice(0, 8);
  const featured = trending[0] ?? CROP_LIST[0];

  // `null` during SSR + first paint → both trees render exactly as the server
  // sent them (CSS decides what's visible, no hydration mismatch). Once the
  // viewport is known we unmount the tree that isn't in use, so phones stop
  // paying layout/decode/memory costs for the desktop dashboard.
  const isDesktop = useIsDesktop();
  const showMobile = isDesktop !== true;
  const showDesktop = isDesktop !== false;

  return (
    <>
      {/* Mobile — completely reimagined bento dashboard */}
      {showMobile && <MobileHome />}

      {/* Desktop / tablet — original cinematic home */}
      {showDesktop && (
        <div className="relative hidden lg:block">
          <HeroSection loc={loc} p={p} featured={featured} heroImg={heroImg} />
          <MarqueeStrip />
          <FeatureGrid />
          <TrendingSection trending={trending} />
          <CategoriesSection />
          <StatsSection cropsCount={CROP_LIST.length} />
          <TestimonialsSection />
          <CTASection />
        </div>
      )}
    </>
  );
}



/* ============================================================
   HERO
   ============================================================ */
function HeroSection({ loc, p, featured, heroImg }: any) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Decorative image + light layers */}
      <div className="absolute inset-0 -z-10">
        <img src={heroImg} alt="" className="h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(1000px 600px at 15% 0%, color-mix(in oklab, var(--primary) 20%, transparent), transparent 60%), radial-gradient(900px 500px at 90% 20%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 60%), linear-gradient(180deg, transparent, var(--background) 85%)",
        }}/>
        {/* Floating orbs */}
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full opacity-40 blur-3xl" style={{ background: "var(--primary)", animation: "float-y 9s ease-in-out infinite" }}/>
        <div className="absolute top-40 right-10 h-64 w-64 rounded-full opacity-30 blur-3xl" style={{ background: "var(--accent)", animation: "float-y 11s ease-in-out infinite" }}/>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pb-16 pt-14 sm:px-6 md:pt-20 lg:grid-cols-12 lg:pb-24">
        {/* Left column */}
        <div className="lg:col-span-7">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Advisory reimagined · v2026
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-5 font-display text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              Farm with{" "}
              <span className="text-gradient">foresight,</span>
              <br className="hidden sm:block" />
              grow with{" "}
              <span className="relative inline-block">
                clarity.
                <svg className="absolute -bottom-2 left-0 h-3 w-full text-primary/70" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden>
                  <path d="M0 8 Q 50 0 100 6 T 200 4" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              A cinematic, science-backed playbook — from soil to mandi — tuned live to{" "}
              <b className="font-semibold text-foreground">{loc.district}, {loc.state}</b>.
              Trusted by a growing community of Indian growers.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/crops"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 tap"
                style={{ boxShadow: "var(--shadow-glow)" }}
              >
                Explore crops
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/analytics"
                className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:bg-secondary tap"
              >
                <PlayCircle className="h-4 w-4 text-primary" />
                See the India atlas
              </Link>
              <Link to="/districts" className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground tap">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Change district
              </Link>
            </div>
          </Reveal>

          {/* Live mini-stats */}
          <Reveal delay={320}>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat icon={<Sun className="h-4 w-4" />} label="Season" value={p.season?.split(" ")[0] ?? "Kharif"} />
              <MiniStat icon={<Leaf className="h-4 w-4" />} label="Soil" value={p.soil?.split(" ")[0] ?? "Loam"} />
              <MiniStat icon={<Droplets className="h-4 w-4" />} label="Rain YTD" value={`${p.rainfallYtdMm} mm`} />
              <MiniStat icon={<Wind className="h-4 w-4" />} label="Wind" value={`${p.windKmh} km/h`} />
            </div>
          </Reveal>
        </div>

        {/* Right column — featured card */}
        <div className="lg:col-span-5">
          <Reveal delay={160}>
            <div className="relative">
              {/* glow ring */}
              <div aria-hidden className="absolute -inset-4 rounded-[2rem] opacity-60 blur-2xl" style={{ background: "var(--gradient-primary)" }}/>
              <Link
                to="/crops/$slug"
                params={{ slug: featured.slug }}
                className="group relative block overflow-hidden rounded-[2rem] border border-white/10"
                style={{ boxShadow: "var(--shadow-elegant)" }}
              >
                <img src={featured.image} alt={featured.name} className="h-[520px] w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                {/* top chips */}
                <div className="absolute inset-x-5 top-5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground">
                    <Star className="h-3 w-3" /> Featured today
                  </span>
                  <div className="grid h-10 w-10 place-items-center rounded-full glass text-xl">{featured.emoji}</div>
                </div>

                {/* bottom info */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-primary">Crop dossier</div>
                  <h3 className="mt-1 font-display text-3xl font-black tracking-tight md:text-4xl">{featured.name}</h3>
                  <p className="text-xs italic text-muted-foreground">{featured.scientificName}</p>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <MiniBadge label="Profit" value={`+${featured.profitPct}%`} accent />
                    <MiniBadge label="Water" value={featured.waterNeed} />
                    <MiniBadge label="Season" value={String(featured.season).split(" ")[0]} />
                  </div>

                  <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary">
                    Open dossier <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>

              {/* Floating LEO badge */}
              <div className="glass absolute -bottom-6 -left-6 hidden items-center gap-3 rounded-2xl px-4 py-3 sm:flex" style={{ boxShadow: "var(--shadow-elegant)" }}>
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Voice assistant</div>
                  <div className="text-sm font-semibold">Say “Hey LEO” anywhere</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl px-3 py-3">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

function MiniBadge({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2 backdrop-blur ${accent ? "border-primary/50 bg-primary/15" : "border-border/60 bg-background/50"}`}>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-sm font-bold ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}

/* ============================================================
   MARQUEE strip
   ============================================================ */
function MarqueeStrip() {
  const items = [
    "26 districts live", "1000+ crops indexed", "Real-time mandi feeds",
    "Multilingual · తెలుగు · हिन्दी · English", "Voice-first with LEO",
    "Open-Meteo backed weather", "MSP & scheme intelligence",
  ];
  return (
    <div className="border-y border-border/40 bg-background/40 py-4 backdrop-blur">
      <div className="mx-auto max-w-[100vw] overflow-hidden">
        <div className="flex gap-10 whitespace-nowrap will-change-transform" style={{ animation: "marquee 40s linear infinite" }}>
          {[...items, ...items, ...items].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t}
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }`}</style>
    </div>
  );
}

/* ============================================================
   FEATURE GRID (bento-style with hero images)
   ============================================================ */
function FeatureGrid() {
  const features = [
    { to: "/analytics", image: analyticsImg, tag: "Atlas", title: "India Crop Atlas", copy: "Nine-state production intelligence, 2025-26 estimates.", icon: <BarChart3 className="h-4 w-4"/>, size: "lg" },
    { to: "/weather", image: weatherImg, tag: "Live", title: "Weather intelligence", copy: "Radar, AQI, soil moisture and agri advisories.", icon: <CloudRain className="h-4 w-4"/>, size: "md" },
    { to: "/market", image: marketImg, tag: "Mandi", title: "Market prices", copy: "Daily trends, MSP and profit estimator.", icon: <TrendingUp className="h-4 w-4"/>, size: "md" },
    { to: "/fertilizer", image: fertilizerImg, tag: "Planner", title: "Fertilizer calculator", copy: "Per-acre nutrient math with organic options.", icon: <LineChart className="h-4 w-4"/>, size: "md" },
    { to: "/rotation", image: rotationImg, tag: "Wheel", title: "Rotation planner", copy: "Sequences that rebuild soil and profit.", icon: <Compass className="h-4 w-4"/>, size: "md" },
    { to: "/schemes", image: schemesImg, tag: "Govt", title: "Schemes & subsidies", copy: "Central + state programs, eligibility & links.", icon: <ShieldCheck className="h-4 w-4"/>, size: "lg" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
      <SectionHeader eyebrow="Services" title="Everything an acre needs." subtitle="A modular platform. Each surface is beautifully image-first and tuned to your district." />

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-6">
        {features.map((f, i) => (
          <Reveal key={f.to} delay={i * 60} className={`${f.size === "lg" ? "md:col-span-3" : "md:col-span-2"}`}>
            <Link
              to={f.to}
              className="group relative block h-full min-h-[240px] overflow-hidden rounded-3xl border border-border/60"
              style={{ boxShadow: "var(--shadow-elegant)" }}
            >
              <img src={f.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative flex h-full flex-col justify-between p-6">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {f.icon}
                  </div>
                  <span className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
                    {f.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black tracking-tight md:text-3xl">{f.title}</h3>
                  <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{f.copy}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    Open <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div>
        <Reveal>
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">{eyebrow}</span>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-black tracking-tight md:text-5xl">{title}</h2>
        </Reveal>
        {subtitle && (
          <Reveal delay={120}>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">{subtitle}</p>
          </Reveal>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   TRENDING crops
   ============================================================ */
function TrendingSection({ trending }: { trending: any[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
      <div className="flex items-end justify-between">
        <SectionHeader eyebrow="Trending" title="Crops moving this season." />
        <Link to="/crops" className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 md:inline-flex">
          Browse library <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {trending.map((c, i) => (
          <Reveal key={c.slug} delay={i * 50}>
            <Link
              to="/crops/$slug"
              params={{ slug: c.slug }}
              className="group relative block aspect-[4/5] overflow-hidden rounded-3xl border border-border/60"
              style={{ boxShadow: "var(--shadow-elegant)" }}
            >
              <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-primary-foreground">
                +{c.profitPct}%
              </span>
              <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full glass text-base">{c.emoji}</div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="text-[10px] uppercase tracking-widest text-primary">{String(c.season).split(" ")[0]}</div>
                <div className="mt-0.5 truncate font-display text-lg font-bold">{c.name}</div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Droplets className="h-3 w-3" /> {c.waterNeed}
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   CATEGORIES
   ============================================================ */
function CategoriesSection() {
  const cats = [
    { name: "Cereals", key: "Cereal", icon: "🌾" },
    { name: "Pulses", key: "Pulse", icon: "🫘" },
    { name: "Oilseeds", key: "Oilseed", icon: "🌻" },
    { name: "Spices", key: "Spice", icon: "🌶️" },
    { name: "Vegetables", key: "Vegetable", icon: "🥬" },
    { name: "Fruits", key: "Fruit", icon: "🥭" },
    { name: "Millets", key: "Millet", icon: "🌱" },
    { name: "Plantation", key: "Plantation", icon: "🌴" },
  ];
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
        <SectionHeader eyebrow="Categories" title="Every crop family, one taxonomy." subtitle="Filter the library by category, water need, soil and district." />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {cats.map((c, i) => (
            <Reveal key={c.key} delay={i * 40}>
              <Link
                to="/crops"
                className="group card-elegant hover-lift flex items-center gap-4 p-5"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/25 to-accent/20 text-3xl transition-transform group-hover:scale-110">
                  {c.icon}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-display text-lg font-bold">{c.name}</div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Browse →</div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   STATS
   ============================================================ */
function StatsSection({ cropsCount }: { cropsCount: number }) {
  const stats = [
    { value: 128, suffix: "K+", label: "Farmers advised" },
    { value: cropsCount, suffix: "+", label: "Crops indexed" },
    { value: 26, suffix: "", label: "Districts live" },
    { value: 99.9, suffix: "%", label: "Uptime", precision: 1 as const },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 pt-4 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 p-8 md:p-12" style={{
          background: "linear-gradient(135deg, color-mix(in oklab, var(--primary) 25%, transparent), color-mix(in oklab, var(--accent) 18%, transparent))",
          boxShadow: "var(--shadow-elegant)",
        }}>
          <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl" style={{ background: "var(--primary)" }} />
          <div className="relative grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center md:text-left">
                <div className="font-display text-4xl font-black tracking-tight md:text-6xl">
                  <CountUp value={s.value} suffix={s.suffix} precision={(s as any).precision ?? 0} />
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground md:text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ============================================================
   TESTIMONIALS
   ============================================================ */
function TestimonialsSection() {
  const items = [
    { name: "Ramakrishna N.", role: "Paddy grower · Krishna, AP", quote: "The rotation planner alone saved me two full sprays this Kharif. Feels like having an agronomist in my pocket." },
    { name: "Priya S.", role: "Cotton farm · Warangal, TS", quote: "Mandi prices refresh live. I timed my last sale 8% above the district average. Cinematic and practical." },
    { name: "Anil V.", role: "Chilli & Turmeric · Guntur", quote: "LEO answers me in Telugu. My father — who doesn't type — now uses the app every morning." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
      <SectionHeader eyebrow="Voices" title="Loved by growers across India." />
      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {items.map((t, i) => (
          <Reveal key={t.name} delay={i * 80}>
            <figure className="card-elegant hover-lift flex h-full flex-col p-6">
              <Quote className="h-6 w-6 text-primary" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90 md:text-base">
                "{t.quote}"
              </blockquote>
              <div className="mt-6 flex items-center gap-3 border-t border-border/50 pt-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-bold text-primary-foreground">
                  {t.name.charAt(0)}
                </div>
                <figcaption className="min-w-0">
                  <div className="truncate text-sm font-semibold">{t.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{t.role}</div>
                </figcaption>
                <div className="ml-auto flex items-center gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </div>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   CTA
   ============================================================ */
function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 p-10 md:p-16" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0" style={{
            background: "radial-gradient(700px 400px at 20% 20%, color-mix(in oklab, var(--primary) 35%, transparent), transparent 60%), linear-gradient(135deg, color-mix(in oklab, var(--background) 60%, transparent), color-mix(in oklab, var(--background) 90%, transparent))",
          }}/>
          <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                <Sprout className="h-3.5 w-3.5" /> Ready when you are
              </span>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight md:text-5xl">
                Turn every acre into an <span className="text-gradient">informed decision.</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
                Open the dashboard, pick your district, and watch the entire platform tune to your ground truth.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/crops"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 tap"
                style={{ boxShadow: "var(--shadow-glow)" }}
              >
                Start exploring <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/analytics"
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:bg-secondary tap"
              >
                <Languages className="h-4 w-4 text-primary" /> Available in EN · తె · हिं
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
