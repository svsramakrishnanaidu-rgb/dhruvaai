"use client";
import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Menu, X, Search, Moon, Sun, Sprout,
  Home, LineChart, MapPin, Leaf, TrendingUp, RefreshCw, ShieldAlert,
  Calculator, Layers, Store, CloudSun, Landmark, Music2,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { DistrictPicker } from "@/components/DistrictPicker";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useT } from "@/lib/i18n";

const NAV = [
  { to: "/", key: "nav.home" },
  { to: "/music", key: "nav.music" },
  { to: "/analytics", key: "nav.analytics" },
  { to: "/crops", key: "nav.crops" },
  { to: "/paddy-future", key: "nav.paddyFuture" },
  { to: "/rotation", key: "nav.rotation" },
  { to: "/calculators", key: "nav.fertilizer" },
  
  { to: "/weather", key: "nav.weather" },
  { to: "/market", key: "nav.market" },
  { to: "/diseases", key: "nav.diseases" },
  { to: "/schemes", key: "nav.schemes" },
  { to: "/districts", key: "nav.districts" },
  { to: "/atlas", key: "nav.atlas" },
] as const;

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/", key: "nav.home", Icon: Home },
      { to: "/analytics", key: "nav.analytics", Icon: LineChart },
      { to: "/districts", key: "nav.districts", Icon: MapPin },
    ],
  },
  {
    label: "Crops & Advisory",
    items: [
      { to: "/crops", key: "nav.crops", Icon: Leaf },
      { to: "/paddy-future", key: "nav.paddyFuture", Icon: TrendingUp },
      { to: "/rotation", key: "nav.rotation", Icon: RefreshCw },
      { to: "/diseases", key: "nav.diseases", Icon: ShieldAlert },
    ],
  },
  {
    label: "Inputs & Soil",
    items: [
      { to: "/calculators", key: "nav.fertilizer", Icon: Calculator },
      { to: "/atlas", key: "nav.atlas", Icon: Layers },
    ],
  },
  {
    label: "Market, Climate & Studio",
    items: [
      { to: "/market", key: "nav.market", Icon: Store },
      { to: "/weather", key: "nav.weather", Icon: CloudSun },
      { to: "/schemes", key: "nav.schemes", Icon: Landmark },
      { to: "/music", key: "nav.music", Icon: Music2 },
    ],
  },
] as const;

export function Navbar({ onSearchOpen }: { onSearchOpen: () => void }) {
  const t = useT();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled ? "py-2" : "py-3"
      }`}
    >
      <div className="mx-auto flex w-full min-w-0 max-w-7xl items-center gap-3 px-3 sm:px-4">
        <div
          className={`flex min-w-0 flex-1 items-center gap-1 rounded-full border px-2 py-1.5 transition-all sm:px-3 sm:py-2 ${
            scrolled ? "neo-glass border-white/10" : "neo-glass border-white/5"
          }`}
          style={{ boxShadow: scrolled ? "var(--neo-glass-shadow)" : undefined }}
        >
          <Link to="/" aria-label="Krish Sense home" className="flex shrink-0 items-center gap-2 pr-1 sm:pr-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-crimson to-bright-crimson shadow-lg shadow-primary-crimson/20">
              <Sprout className="h-5 w-5 text-white" aria-hidden />
            </div>
            <span className="hidden font-display text-lg font-black tracking-tighter xs:inline sm:inline text-moonlight-white">
              KRISH <span className="text-primary-crimson">SENSE</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="ml-4 hidden min-w-0 flex-1 items-center gap-1 overflow-hidden xl:flex">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-all ${
                    active
                      ? "text-white"
                      : "text-muted-blue-gray hover:text-moonlight-white"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-0 -z-10 rounded-full"
                      style={{
                        background: "rgba(227, 25, 55, 0.15)",
                        boxShadow: "inset 0 0 0 1px rgba(227, 25, 55, 0.3)",
                      }}
                    />
                  )}
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <div className="hidden sm:block">
              <DistrictPicker />
            </div>
            <button
              onClick={onSearchOpen}
              aria-label={t("aria.openSearch")}
              className="tap grid place-items-center rounded-full text-muted-blue-gray transition-all hover:bg-white/5 hover:text-moonlight-white"
            >
              <Search className="h-4 w-4" aria-hidden />
            </button>
            <LanguageSwitcher />
            <button
              onClick={toggle}
              aria-label={t("aria.toggleTheme")}
              aria-pressed={theme === "dark"}
              className="tap grid place-items-center rounded-full text-muted-blue-gray transition-all hover:bg-white/5 hover:text-moonlight-white"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={t("aria.toggleMenu")}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="tap grid place-items-center rounded-full text-muted-blue-gray transition-all hover:bg-white/5 hover:text-moonlight-white"
            >
              {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="mx-auto mt-2 max-w-7xl px-3 sm:px-4">
          <div className="neo-glass rounded-[2rem] p-4 border border-white/10 shadow-2xl">
            <div className="mb-3 sm:hidden">
              <DistrictPicker />
            </div>
            {/* Scrollable menu body — keeps the drawer inside the viewport on phones */}
            <div
              className="menu-scroll -mr-1 space-y-4 overflow-y-auto pr-1"
              style={{ maxHeight: "min(62vh, 30rem)", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}
            >
              {NAV_GROUPS.map((group) => (
                <section key={group.label}>
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span
                      aria-hidden
                      className="h-px flex-1"
                      style={{ background: "linear-gradient(90deg, rgba(227, 25, 55, 0.4), transparent)" }}
                    />
                    <h3 className="font-display text-[10px] font-black uppercase tracking-[0.2em] text-primary-crimson">
                      {group.label}
                    </h3>
                    <span
                      aria-hidden
                      className="h-px flex-1"
                      style={{ background: "linear-gradient(270deg, rgba(227, 25, 55, 0.4), transparent)" }}
                    />
                  </div>
                  <nav aria-label={group.label} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {group.items.map(({ to, key, Icon }) => {
                      const active =
                        to === "/" ? pathname === "/" : pathname.startsWith(to);
                      return (
                        <Link
                          key={to}
                          to={to}
                          aria-current={active ? "page" : undefined}
                            className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3 py-3 transition-all active:scale-[.98] ${
                              active
                                ? "border-primary-crimson/50 bg-primary-crimson/10 text-moonlight-white shadow-[0_0_20px_rgba(227,25,55,0.1)]"
                                : "border-white/5 bg-white/5 text-muted-blue-gray hover:border-primary-crimson/30 hover:text-moonlight-white"
                            }`}
                          >
                            <span
                              className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-all ${
                                active ? "bg-primary-crimson text-white shadow-lg shadow-primary-crimson/20" : "bg-white/10 text-muted-blue-gray group-hover:text-primary-crimson"
                              }`}
                            >
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <span className="font-display truncate text-[12px] uppercase tracking-wide">
                            {t(key)}
                          </span>
                          {active && (
                            <span
                              aria-hidden
                              className="absolute inset-y-1 right-1 w-[3px] rounded-full"
                              style={{ background: "linear-gradient(180deg, transparent, var(--accent), transparent)" }}
                            />
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
