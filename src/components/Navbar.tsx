"use client";
import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Search, Moon, Sun, Sprout } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { DistrictPicker } from "@/components/DistrictPicker";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/analytics", label: "Analytics" },
  { to: "/crops", label: "Crops" },
  { to: "/rotation", label: "Rotation" },
  { to: "/fertilizer", label: "Fertilizer" },
  { to: "/weather", label: "Weather" },
  { to: "/market", label: "Market" },
  { to: "/diseases", label: "Diseases" },
  { to: "/schemes", label: "Schemes" },
  { to: "/districts", label: "Districts" },
] as const;

export function Navbar({ onSearchOpen }: { onSearchOpen: () => void }) {
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
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4">
        <div
          className={`flex flex-1 items-center gap-2 rounded-full border px-3 py-2 transition-all ${
            scrolled ? "glass shadow-elegant" : "glass"
          }`}
          style={{ boxShadow: scrolled ? "var(--shadow-elegant)" : undefined }}
        >
          <Link to="/" className="flex items-center gap-2 pr-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg">
              <Sprout className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              Krishi<span className="text-gradient">Sense</span>
            </span>
          </Link>

          <nav className="ml-2 hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
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
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <div className="hidden sm:block">
              <DistrictPicker />
            </div>
            <button
              onClick={onSearchOpen}
              aria-label="Open search"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-all hover:scale-110 hover:bg-secondary/60 hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-all hover:scale-110 hover:bg-secondary/60 hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-all hover:bg-secondary/60 hover:text-foreground lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-7xl px-4 lg:hidden">
          <div className="glass rounded-3xl p-3">
            <div className="grid grid-cols-2 gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
