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
import { WebCinematicBackground } from "@/components/WebCinematicBackground";



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
          <WebCinematicBackground />
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
            <span className="inline-flex items-center gap-2 rounded-full border border-web-leaf/30 bg-web-bg-midnight/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] backdrop-blur text-web-sage">
              <Sparkles className="h-3.5 w-3.5 text-web-gold" />
              Advisory reimagined · v2026
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-5 font-[Plus_Jakarta_Sans] text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-web-mist">
              <span className="web-text-gold">Farm Smarter</span>
              <br className="hidden sm:block" />
              See Further&nbsp;
              <span className="relative inline-block">
                Grow Better.
                <svg className="absolute -bottom-2 left-0 h-3 w-full text-web-gold/40" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden>
                  <path d="M0 8 Q 50 0 100 6 T 200 4" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-web-sage md:text-lg font-[Instrument Sans]">
              A cinematic, science-backed playbook — from soil to mandi — tuned live to{" "}
              <b className="font-semibold text-web-mist">{loc.district}, {loc.state}</b>.
              Trusted by a growing community of Indian growers.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3 font-[Plus Jakarta Sans]">
              <Link
                to="/crops"
                className="group inline-flex items-center gap-2 rounded-full bg-web-emerald px-6 py-3 text-sm font-semibold text-web-mist transition hover:bg-web-leaf tap shadow-lg shadow-web-emerald/20"
              >
                Explore crops
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/analytics"
                className="group inline-flex items-center gap-2 rounded-full border border-web-leaf/40 bg-web-bg-midnight/30 px-6 py-3 text-sm font-semibold text-web-mist backdrop-blur transition hover:bg-web-bg-forest tap"
              >
                <PlayCircle className="h-4 w-4 text-web-gold" />
                See the India atlas
              </Link>
              <Link to="/districts" className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs text-web-sage hover:text-web-mist tap">
                <MapPin className="h-3.5 w-3.5 text-web-gold" /> Change district
              </Link>
            </div>
          </Reveal>

          {/* Live mini-stats */}
          <Reveal delay={320}>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 font-[Plus Jakarta Sans]">
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
                className="group relative block overflow-hidden rounded-[2rem] border border-web-leaf/20"
                style={{ boxShadow: "var(--shadow-elegant)" }}
              >
                <img src={featured.image} alt={featured.name} className="h-[520px] w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-web-bg-midnight via-web-bg-midnight/40 to-transparent" />

                {/* top chips */}
                <div className="absolute inset-x-5 top-5 flex items-center justify-between font-[Plus Jakarta Sans]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-web-emerald px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-web-mist">
                    <Star className="h-3 w-3" /> Featured today
                  </span>
                  <div className="grid h-10 w-10 place-items-center rounded-full web-glass text-xl">{featured.emoji}</div>
                </div>

                {/* bottom info */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-web-gold font-bold font-[Plus Jakarta Sans]">Crop dossier</div>
                  <h3 className="mt-1 font-[Unbounded] text-3xl font-black tracking-tight md:text-4xl text-web-mist">{featured.name}</h3>
                  <p className="text-xs italic text-web-sage font-[Instrument Sans]">{featured.scientificName}</p>

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

            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="web-glass flex items-center gap-3 rounded-2xl px-3 py-3 border-web-leaf/10">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-web-emerald/15 text-web-emerald">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-web-sage font-bold font-[Plus Jakarta Sans]">{label}</div>
        <div className="truncate text-sm font-semibold text-web-mist font-[Plus Jakarta Sans]">{value}</div>
      </div>
    </div>
  );
}

function MiniBadge({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2 backdrop-blur font-[Plus Jakarta Sans] ${accent ? "border-web-gold/50 bg-web-gold/15" : "border-web-leaf/20 bg-web-bg-midnight/50"}`}>
      <div className="text-[9px] uppercase tracking-widest text-web-sage font-bold">{label}</div>
      <div className={`text-sm font-bold ${accent ? "text-web-gold" : "text-web-mist"}`}>{value}</div>
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
    <div className="border-y border-web-leaf/20 bg-web-bg-midnight/40 py-4 backdrop-blur font-[Plus Jakarta Sans]">
      <div className="mx-auto max-w-[100vw] overflow-hidden">
        <div className="flex gap-10 whitespace-nowrap will-change-transform" style={{ animation: "marquee 40s linear infinite" }}>
          {[...items, ...items, ...items].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-web-sage font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-web-gold" />
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
              <div className="absolute inset-0 bg-gradient-to-t from-web-bg-midnight via-web-bg-midnight/70 to-web-bg-midnight/10" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-web-emerald/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative flex h-full flex-col justify-between p-6">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-web-emerald to-web-leaf text-web-mist shadow-lg shadow-web-emerald/20">
                    {f.icon}
                  </div>
                  <span className="rounded-full border border-web-leaf/30 bg-web-bg-midnight/50 px-2.5 py-1 text-[10px] uppercase tracking-widest text-web-sage font-bold backdrop-blur">
                    {f.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-[Unbounded] text-2xl font-black tracking-tight md:text-3xl text-web-mist">{f.title}</h3>
                  <p className="mt-1.5 max-w-md text-sm text-web-sage font-[Instrument Sans]">{f.copy}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-web-gold font-[Plus Jakarta Sans]">
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
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-web-gold font-[Plus Jakarta Sans]">{eyebrow}</span>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="mt-2 max-w-2xl font-[Unbounded] text-3xl font-black tracking-tight md:text-5xl text-web-mist">{title}</h2>
        </Reveal>
        {subtitle && (
          <Reveal delay={120}>
            <p className="mt-3 max-w-2xl text-sm text-web-sage md:text-base font-[Instrument Sans]">{subtitle}</p>
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
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
      <div className="flex items-end justify-between">
        <SectionHeader eyebrow="Trending" title="Crops moving this season." />
        <div className="hidden shrink-0 flex-col items-end gap-2 md:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            <span className={`h-1.5 w-1.5 rounded-full bg-primary ${loading ? "animate-ping" : "animate-pulse"}`} />
            {loading ? "Syncing mandis" : "Live · Agmarknet"}
            {updated ? ` · ${updated}` : ""}
          </span>
          <Link to="/crops" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80">
            Browse library <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {cards.map(({ crop: c, live: l }, i) => {
          const up = (l?.deltaPct ?? 0) >= 0;
          return (
            <Reveal key={c.slug} delay={i * 50}>
              <Link
                to="/crops/$slug"
                params={{ slug: c.slug }}
                className="group relative block aspect-[4/5] overflow-hidden rounded-3xl border border-border/60"
                style={{ boxShadow: "var(--shadow-elegant)" }}
              >
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-web-bg-midnight via-transparent to-transparent" />
                <span
                  className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${
                    l
                      ? up
                        ? "bg-web-emerald text-web-bg-midnight"
                        : "bg-rose-500 text-white"
                      : "bg-web-gold text-web-bg-midnight"
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
                <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full web-glass border-web-leaf/20 text-base">{c.emoji}</div>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="text-[9px] font-black uppercase tracking-widest text-web-gold">{String(c.season).split(" ")[0]}</div>
                  <div className="mt-0.5 truncate font-[Unbounded] text-lg font-black text-web-mist">{c.name}</div>
                  {l ? (
                    <div className="mt-1 truncate text-[10px] font-bold text-web-sage">
                      <span className="font-black text-web-mist">₹{l.modal.toLocaleString("en-IN")}</span>/qtl · {l.markets} mandis
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Droplets className="h-3 w-3" /> {c.waterNeed}
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
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 font-[Plus Jakarta Sans]">
        <SectionHeader eyebrow="Categories" title="Every crop family, one taxonomy." subtitle="Filter the library by category, water need, soil and district." />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {cats.map((c, i) => (
            <Reveal key={c.key} delay={i * 40}>
              <Link
                to="/crops"
                className="group web-glass hover-lift border-web-leaf/10 flex items-center gap-4 p-5 transition-all duration-500 hover:border-web-emerald/30"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-web-emerald/20 text-3xl transition-transform group-hover:scale-110 group-hover:bg-web-emerald/30">
                  {c.icon}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-[Unbounded] text-base font-black text-web-mist">{c.name}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-web-sage group-hover:text-web-gold">Browse →</div>
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
        <div className="relative overflow-hidden rounded-[2.5rem] border border-web-leaf/10 p-8 md:p-12 font-[Plus Jakarta Sans]" style={{
          background: "linear-gradient(135deg, rgba(7, 26, 18, 0.8), rgba(4, 15, 10, 0.8))",
          backdropFilter: "blur(40px)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}>
          <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl bg-web-emerald" />
          <div className="relative grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center md:text-left">
                <div className="font-[Unbounded] text-4xl font-black tracking-tight text-web-gold md:text-6xl">
                  <CountUp value={s.value} suffix={s.suffix} precision={(s as any).precision ?? 0} />
                </div>
                <div className="mt-2 text-[9px] font-black uppercase tracking-widest text-web-sage md:text-[10px]">{s.label}</div>
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
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 font-[Plus Jakarta Sans]">
      <SectionHeader eyebrow="Voices" title="Loved by growers across India." />
      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {items.map((t, i) => (
          <Reveal key={t.name} delay={i * 80}>
            <figure className="web-glass hover-lift border-web-leaf/10 flex h-full flex-col p-6 transition-all duration-500 hover:border-web-emerald/30">
              <Quote className="h-6 w-6 text-web-gold" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-web-mist font-[Instrument Sans] md:text-base">
                "{t.quote}"
              </blockquote>
              <div className="mt-6 flex items-center gap-3 border-t border-web-leaf/10 pt-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-web-emerald/20 font-[Unbounded] font-black text-web-gold">
                  {t.name.charAt(0)}
                </div>
                <figcaption className="min-w-0">
                  <div className="truncate text-sm font-black text-web-mist uppercase tracking-tighter">{t.name}</div>
                  <div className="truncate text-[10px] font-bold text-web-sage uppercase tracking-widest">{t.role}</div>
                </figcaption>
                <div className="ml-auto flex items-center gap-0.5 text-web-gold">
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
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-6 font-[Plus Jakarta Sans]">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-web-leaf/10 p-10 md:p-16" style={{
          background: "linear-gradient(135deg, rgba(7, 26, 18, 0.9), rgba(4, 15, 10, 0.9))",
          backdropFilter: "blur(40px)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
        }}>
          <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15 mix-blend-overlay" />
          <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_20%_20%,rgba(52,211,153,0.1),transparent_60%)]" />
          <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-web-emerald/30 bg-web-emerald/20 px-3 py-1 text-[9px] font-black uppercase tracking-[0.3em] text-web-gold">
                <Sprout className="h-3.5 w-3.5" /> Ready when you are
              </span>
              <h2 className="mt-4 font-[Unbounded] text-3xl font-black tracking-tight text-web-mist md:text-5xl">
                Turn every acre into an <span className="text-web-gold">informed decision.</span>
              </h2>
              <p className="mt-3 max-w-xl text-xs font-bold uppercase tracking-widest text-web-sage md:text-sm">
                Open the dashboard, pick your district, and watch the entire platform tune to your ground truth.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/crops"
                className="group inline-flex items-center gap-2 rounded-full bg-web-gold px-8 py-4 text-[11px] font-black uppercase tracking-widest text-web-bg-midnight transition-all hover:scale-105 hover:bg-white tap"
                style={{ boxShadow: "0 10px 30px -10px rgba(229, 195, 102, 0.5)" }}
              >
                Start exploring <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/analytics"
                className="inline-flex items-center gap-2 rounded-full border border-web-leaf/20 bg-web-bg-midnight/60 px-8 py-4 text-[11px] font-black uppercase tracking-widest text-web-mist backdrop-blur transition hover:bg-web-bg-midnight/80 tap"
              >
                <Languages className="h-4 w-4 text-web-gold" /> Available in EN · తె · हिं
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
