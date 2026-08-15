import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowRight, ArrowUpRight, MapPin, Sprout, Sun, TrendingUp, TrendingDown, Leaf, Droplets,
  BarChart3, Compass, LineChart, ShieldCheck, CloudRain, Wind,
  Sparkles, Languages, Star, Quote, PlayCircle,
} from "lucide-react";
import { CROP_LIST } from "@/data/crops";
import { Reveal } from "@/components/Reveal";
import { MobileHome } from "@/components/MobileHome";
import { useIsDesktop } from "@/hooks/use-viewport";
import { useAgmarknetLive, type LiveCommodity } from "@/lib/agmarknet-live";
import { TopTrendingBar } from "@/components/TopTrendingBar";



import { CountUp } from "@/components/CountUp";
import { useLocation } from "@/lib/location-store";
import { profileFor } from "@/lib/district-profiles";
import heroImg from "@/assets/hero-farm.jpg";
import analyticsImg from "@/assets/heroes/analytics.jpg";
import rotationImg from "@/assets/heroes/rotation.jpg";
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
          <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
            <TopTrendingBar />
          </div>
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
function HeroSection({ loc, p, featured }: any) {
  return (
    <section className="relative isolate overflow-hidden min-h-screen flex items-center pt-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 pb-24 pt-10 lg:grid-cols-12">
        {/* Left column */}
        <div className="lg:col-span-7">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] backdrop-blur-md text-moonlight-white/80">
              <Sparkles className="h-3.5 w-3.5 text-primary-crimson" />
              Advisory reimagined · v2026
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-8 font-display text-6xl font-black leading-[0.95] tracking-tighter sm:text-7xl md:text-8xl lg:text-[7.5rem] text-moonlight-white">
              Farm with{" "}
              <span className="text-primary-crimson drop-shadow-[0_0_15px_rgba(227,25,55,0.4)]">foresight,</span>
              <br className="hidden sm:block" />
              grow with{" "}
              <span className="relative inline-block">
                clarity.
                <svg className="absolute -bottom-2 left-0 h-3 w-full text-primary-crimson/70" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden>
                  <path d="M0 8 Q 50 0 100 6 T 200 4" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted-blue-gray/90 md:text-xl font-medium">
              A cinematic, science-backed playbook — from soil to mandi — <br className="hidden md:block"/>
              tuned live to <span className="text-primary-crimson font-bold">{loc.district}, {loc.state}</span>.
              Trusted by a growing community of Indian growers.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/crops"
                className="group inline-flex items-center gap-3 rounded-2xl bg-primary-crimson px-10 py-5 text-sm font-bold text-white transition-all hover:brightness-110 hover:scale-105 hover:shadow-[0_0_40px_rgba(227,25,55,0.4)] tap"
                style={{ boxShadow: "var(--shadow-glow)" }}
              >
                Explore crops
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/analytics"
                className="group inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-10 py-5 text-sm font-bold backdrop-blur-xl transition-all hover:bg-white/10 tap"
              >
                <PlayCircle className="h-4 w-4 text-primary-crimson" />
                See the India atlas
              </Link>
              <Link to="/districts" className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs text-muted-blue-gray hover:text-moonlight-white transition-colors tap">
                <MapPin className="h-3.5 w-3.5 text-primary-crimson" /> Change district
              </Link>
            </div>
          </Reveal>

          {/* Live mini-stats */}
          <Reveal delay={320}>
            <div className="mt-16 flex flex-wrap gap-4">
              <MiniStat icon={<Sun className="h-4 w-4" />} label="Season" value={p.season?.split(" ")[0] ?? "Kharif"} />
              <MiniStat icon={<Leaf className="h-4 w-4" />} label="Soil" value={p.soil?.split(" ")[0] ?? "Loam"} />
              <MiniStat icon={<Droplets className="h-4 w-4" />} label="Rain YTD" value={`${p.rainfallYtdMm} mm`} />
              <MiniStat icon={<Wind className="h-4 w-4" />} label="Wind" value={`${p.windKmh} km/h`} />
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
          <Reveal delay={160}>
            <div className="relative group w-full max-w-[500px]">
              {/* Crimson aura */}
              <div aria-hidden className="absolute -inset-10 rounded-full opacity-20 blur-[100px] bg-primary-crimson/30 animate-pulse" />
              
              <Link
                to="/crops/$slug"
                params={{ slug: featured.slug }}
                className="relative block w-full aspect-video overflow-hidden rounded-[2.5rem] border border-white/10 neo-glass transition-all duration-700 group-hover:scale-[1.02] group-hover:-translate-y-2 group-hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
              >
                <img src={featured.image} alt={featured.name} className="h-full w-full object-cover opacity-90 transition-transform duration-[2000ms] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-navy/90 via-midnight-navy/20 to-transparent" />

                {/* top chips */}
                <div className="absolute inset-x-8 top-8 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white border border-white/10 backdrop-blur-md">
                    <Star className="h-3 w-3 text-primary-crimson" /> Featured Today
                  </span>
                  <div className="grid h-12 w-12 place-items-center rounded-full glass border border-white/10 text-2xl shadow-2xl">{featured.emoji}</div>
                </div>

                {/* bottom info */}
                <div className="absolute inset-x-0 bottom-0 p-10">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-primary-crimson font-black">Crop Dossier</div>
                  <h3 className="mt-3 font-display text-5xl font-black tracking-tighter text-moonlight-white">{featured.name}</h3>
                  <p className="text-sm italic text-muted-blue-gray/80 mt-2 font-medium">{featured.scientificName}</p>

                  <div className="mt-8 flex gap-4">
                    <MiniBadge label="Profit" value={`+${featured.profitPct}%`} accent />
                    <MiniBadge label="Water" value={featured.waterNeed} />
                    <MiniBadge label="Season" value={String(featured.season).split(" ")[0]} />
                  </div>

                  <div className="mt-10 inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-primary-crimson group-hover:gap-5 transition-all">
                    Open dossier <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="neo-glass flex items-center gap-4 rounded-[1.25rem] px-6 py-4 border border-white/10">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-primary-crimson border border-white/10">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-blue-gray font-bold">{label}</div>
        <div className="truncate text-sm font-semibold text-moonlight-white">{value}</div>
      </div>
    </div>
  );
}

function MiniBadge({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border px-3 py-3 backdrop-blur-md transition-colors ${accent ? "border-primary-crimson/40 bg-primary-crimson/10" : "border-white/5 bg-white/5"}`}>
      <div className="text-[9px] uppercase tracking-widest text-muted-blue-gray font-bold">{label}</div>
      <div className={`text-sm font-black mt-0.5 ${accent ? "text-primary-crimson" : "text-moonlight-white"}`}>{value}</div>
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
    <div className="border-y border-white/5 bg-midnight-navy/40 py-6 backdrop-blur-xl">
      <div className="mx-auto max-w-[100vw] overflow-hidden">
        <div className="flex gap-12 whitespace-nowrap will-change-transform" style={{ animation: "marquee 40s linear infinite" }}>
          {[...items, ...items, ...items].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-muted-blue-gray">
              <span className="h-2 w-2 rounded-full bg-primary-crimson shadow-[0_0_8px_rgba(227,25,55,0.6)]" />
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
    { to: "/weather", image: weatherImg, tag: "Live", title: "Weather Intelligence", copy: "Radar, AQI, soil moisture and agri advisories.", icon: <CloudRain className="h-4 w-4"/>, size: "md" },
    { to: "/market", image: marketImg, tag: "Mandi", title: "Market Prices", copy: "Daily trends, MSP and profit estimator.", icon: <TrendingUp className="h-4 w-4"/>, size: "md" },
    { to: "/rotation", image: rotationImg, tag: "Wheel", title: "Rotation Planner", copy: "Sequences that rebuild soil and profit.", icon: <Compass className="h-4 w-4"/>, size: "md" },
    { to: "/schemes", image: schemesImg, tag: "Govt", title: "Schemes & Subsidies", copy: "Central + state programs, eligibility & links.", icon: <ShieldCheck className="h-4 w-4"/>, size: "lg" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
      <SectionHeader eyebrow="Intelligence" title="Everything an acre needs." subtitle="A modular agritech ecosystem. Each surface is beautifully image-first and tuned to your district." />

      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-6">
        {features.map((f, i) => (
          <Reveal key={f.to} delay={i * 60} className={`${f.size === "lg" ? "md:col-span-3" : "md:col-span-2"}`}>
            <Link
              to={f.to}
              className="group relative block h-full min-h-[300px] overflow-hidden rounded-[2rem] border border-white/5 neo-glass"
              style={{ boxShadow: "var(--neo-glass-shadow)" }}
            >
              <img src={f.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-[1400ms] group-hover:scale-105 group-hover:opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight-navy via-midnight-navy/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-crimson/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative flex h-full flex-col justify-between p-8">
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary-crimson to-bright-crimson text-white shadow-lg shadow-primary-crimson/20">
                    {f.icon}
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-blue-gray backdrop-blur transition-colors group-hover:text-moonlight-white">
                    {f.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black tracking-tight text-moonlight-white md:text-3xl">{f.title}</h3>
                  <p className="mt-2 max-w-md text-sm text-muted-blue-gray font-medium leading-relaxed">{f.copy}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-crimson group-hover:gap-3 transition-all">
                    ENTER MODULE <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
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
    <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end mb-12">
      <div>
        <Reveal>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-crimson">{eyebrow}</span>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-black tracking-tighter text-moonlight-white md:text-6xl">{title}</h2>
        </Reveal>
        {subtitle && (
          <Reveal delay={120}>
            <p className="mt-6 max-w-2xl text-base text-muted-blue-gray font-medium leading-relaxed md:text-lg">{subtitle}</p>
          </Reveal>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   TRENDING crops — live from Agmarknet
   ============================================================ */
function TrendingSection({ trending }: { trending: any[] }) {
  const { data: live, loading, updated } = useAgmarknetLive({ refreshMs: 60_000, limit: 2000 });

  // commodity name -> live row (first/best match wins)
  const liveMap = useMemo(() => {
    const m = new Map<string, (typeof live)[number]>();
    for (const row of live) {
      const key = row.commodity.toLowerCase().trim();
      if (!m.has(key)) m.set(key, row);
    }
    return m;
  }, [live]);

  const matchLive = (name: string) => {
    const key = name.toLowerCase().trim();
    if (liveMap.has(key)) return liveMap.get(key)!;
    for (const [k, v] of liveMap) {
      if (k.includes(key) || key.includes(k)) return v;
    }
    return null;
  };

  // Pull from the whole library, then rank by live market momentum so the
  // section genuinely reflects what is moving in the mandis right now.
  const cards = useMemo(() => {
    const pool = CROP_LIST.filter((c: any) => c.trending || matchLive(c.name));
    const source = pool.length >= 12 ? pool : CROP_LIST;
    return source
      .map((c: any) => ({ crop: c, live: matchLive(c.name) }))
      .sort((a, b) => {
        const av = a.live ? a.live.deltaPct : -999;
        const bv = b.live ? b.live.deltaPct : -999;
        if (av !== bv) return bv - av;
        return (b.crop.profitPct ?? 0) - (a.crop.profitPct ?? 0);
      })
      .slice(0, 12);
  }, [liveMap, trending]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
      <div className="flex items-end justify-between mb-12">
        <SectionHeader eyebrow="Momentum" title="Crops moving this season." />
        <div className="hidden shrink-0 flex-col items-end gap-3 md:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-crimson/30 bg-primary-crimson/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary-crimson backdrop-blur">
            <span className={`h-2 w-2 rounded-full bg-primary-crimson ${loading ? "animate-ping" : "animate-pulse"}`} />
            {loading ? "Syncing Mandis" : "Live · Agmarknet"}
            {updated ? ` · ${updated}` : ""}
          </span>
          <Link to="/crops" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-crimson hover:brightness-110 transition-all group">
            BROWSE LIBRARY <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {cards.map(({ crop: c, live: l }, i) => {
          const up = (l?.deltaPct ?? 0) >= 0;
          return (
            <Reveal key={c.slug} delay={i * 50}>
              <Link
                to="/crops/$slug"
                params={{ slug: c.slug }}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/5 neo-glass transition-all duration-700 hover:scale-[1.03] hover:-translate-y-1"
                style={{ boxShadow: "var(--neo-glass-shadow)" }}
              >
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-navy via-midnight-navy/40 to-transparent" />
                
                <span
                  className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest backdrop-blur shadow-lg ${
                    l
                      ? up
                        ? "bg-primary-crimson/90 text-white"
                        : "bg-steel-blue/90 text-moonlight-white"
                      : "bg-primary-crimson/90 text-white"
                  }`}
                >
                  {l ? (
                    <>
                      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {up ? "+" : ""}{l.deltaPct.toFixed(1)}%
                    </>
                  ) : (
                    <>+{c.profitPct}%</>
                  )}
                </span>
                <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full glass border border-white/10 text-xl">{c.emoji}</div>
                
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-crimson">{String(c.season).split(" ")[0]}</div>
                  <div className="mt-1 truncate font-display text-lg font-black text-moonlight-white tracking-tight">{c.name}</div>
                  {l ? (
                    <div className="mt-2 truncate text-[10px] text-muted-blue-gray font-bold">
                      <span className="text-moonlight-white">₹{l.modal.toLocaleString("en-IN")}</span>/qtl · {l.markets} mandis
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-blue-gray font-bold">
                      <Droplets className="h-3.5 w-3.5 text-primary-crimson" /> {c.waterNeed}
                    </div>
                  )}
                </div>
              </Link>
            </Reveal>
          );
        })}
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
