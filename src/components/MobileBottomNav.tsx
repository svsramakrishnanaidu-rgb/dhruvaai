"use client";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LineChart, Sprout, CloudSun, Store } from "lucide-react";
import { useT } from "@/lib/i18n";

const TABS = [
  { to: "/", key: "nav.home", Icon: Home },
  { to: "/crops", key: "nav.crops", Icon: Sprout },
  { to: "/market", key: "nav.market", Icon: Store },
  { to: "/weather", key: "nav.weather", Icon: CloudSun },
  { to: "/analytics", key: "nav.analytics", Icon: LineChart },
] as const;

export function MobileBottomNav() {
  const t = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Bottom"
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto max-w-lg px-3 pb-2">
        <div className="glass shadow-elegant flex items-center justify-between rounded-2xl px-2 py-1.5">
          {TABS.map(({ to, key, Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`font-display tap relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="truncate">{t(key)}</span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute -top-0.5 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, var(--accent), transparent)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
