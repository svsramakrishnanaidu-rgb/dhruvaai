"use client";
import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Search, Moon, Sun, Sprout } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { DistrictPicker } from "@/components/DistrictPicker";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useT } from "@/lib/i18n";

const NAV = [
  { to: "/", key: "nav.home" },
  { to: "/analytics", key: "nav.analytics" },
  { to: "/crops", key: "nav.crops" },
  { to: "/paddy-future", key: "nav.paddyFuture" },
  { to: "/rotation", key: "nav.rotation" },
  { to: "/fertilizer", key: "nav.fertilizer" },
  { to: "/fertilizers", key: "nav.fertilizers" },
  
  { to: "/weather", key: "nav.weather" },
  { to: "/market", key: "nav.market" },
  { to: "/diseases", key: "nav.diseases" },
  { to: "/schemes", key: "nav.schemes" },
  { to: "/districts", key: "nav.districts" },
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
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 sm:px-4">
        <div
          className={`flex flex-1 items-center gap-1 rounded-full border px-2 py-1.5 transition-all sm:px-3 sm:py-2 ${
            scrolled ? "glass shadow-elegant" : "glass"
          }`}
          style={{ boxShadow: scrolled ? "var(--shadow-elegant)" : undefined }}
        >
          <Link to="/" aria-label="Krish Sense home" className="flex shrink-0 items-center gap-2 pr-1 sm:pr-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg">
              <Sprout className="h-5 w-5 text-primary-foreground" aria-hidden />
            </div>
            <span className="hidden font-display text-lg font-bold tracking-tight xs:inline sm:inline">
              Krish <span className="text-gradient">Sense</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="ml-2 hidden min-w-0 items-center gap-1 lg:flex">
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
                  className={`relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-0 -z-10 rounded-full"
                      style={{
                        background: "color-mix(in oklab, var(--primary) 22%, transparent)",
                        boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--primary) 45%, transparent)",
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
              className="tap grid place-items-center rounded-full text-muted-foreground transition-all hover:bg-secondary/60 hover:text-foreground"
            >
              <Search className="h-4 w-4" aria-hidden />
            </button>
            <LanguageSwitcher />
            <button
              onClick={toggle}
              aria-label={t("aria.toggleTheme")}
              aria-pressed={theme === "dark"}
              className="tap grid place-items-center rounded-full text-muted-foreground transition-all hover:bg-secondary/60 hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={t("aria.toggleMenu")}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="tap grid place-items-center rounded-full text-muted-foreground transition-all hover:bg-secondary/60 hover:text-foreground lg:hidden"
            >
              {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="mx-auto mt-2 max-w-7xl px-3 sm:px-4 lg:hidden">
          <div className="glass rounded-3xl p-3">
            <div className="mb-2 sm:hidden">
              <DistrictPicker />
            </div>
            <nav aria-label="Mobile" className="grid grid-cols-2 gap-1">
              {NAV.map((item) => {
                const active =
                  item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-primary/15 text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
