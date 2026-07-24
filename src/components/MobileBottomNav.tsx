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
        <div
          className="flex items-center justify-between rounded-2xl px-2 py-1.5"
          style={{
            background:
              "linear-gradient(180deg, rgba(26,26,26,0.92) 0%, rgba(17,17,17,0.92) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(212,175,55,0.22)",
            boxShadow:
              "0 20px 50px -20px rgba(0,0,0,0.9), inset 0 1px 0 rgba(241,199,91,0.08)",
          }}
        >
          {TABS.map(({ to, key, Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className="tap relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-semibold transition"
                style={{
                  color: active ? "#F1C75B" : "rgba(245,245,245,0.55)",
                  background: active
                    ? "linear-gradient(180deg, rgba(241,199,91,0.14), rgba(212,175,55,0.06))"
                    : "transparent",
                  fontFamily: "'Orbitron','Rajdhani',system-ui,sans-serif",
                  letterSpacing: "0.08em",
                }}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="truncate uppercase">{t(key)}</span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute -top-0.5 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, #F1C75B, transparent)",
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
