"use client";
import { useEffect, useRef, useState } from "react";
import { Languages, Check } from "lucide-react";
import { LANGS, useI18n, useT } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Optimize and enhance the overall performance, accuracy, and reliability of both the mobile application and website to deliver a fast, seamless, and enterprise-grade user experience.\n\nPerformance & Speed Improvements\n\nSignificantly improve application performance across all devices, including low-end smartphones and slower network connections.\n\nOptimize frontend and backend architecture to reduce load times, improve responsiveness, and eliminate lag or UI freezes.\n\nIncrease data transmission speed between the client and server by implementing efficient APIs, compression, caching, connection pooling, lazy loading, and optimized database queries.\n\nMinimize API response times and ensure real-time synchronization of data across all platforms.\n\nImprove page rendering speed, navigation smoothness, and overall application responsiveness.\n\nAccuracy & Reliability\n\nEnhance the accuracy of all AI responses, calculations, search results, recommendations, and analytics.\n\nImprove data validation, error handling, and consistency across the entire application.\n\nEnsure real-time data updates are reliable, accurate, and synchronized without duplication or delays.\n\nOptimize search algorithms for faster and more precise results.\n\nScalability & Stability\n\nOptimize memory usage, CPU utilization, and battery consumption.\n\nImprove network resilience with automatic retries, offline caching, and graceful recovery from connectivity issues.\n\nEnsure the platform remains stable under high traffic and concurrent users.\n\nImplement intelligent background processing to improve efficiency without affecting the user experience.\n\nOverall Goal\n\nDeliver a high-performance, production-ready application that provides ultra-fast data transmission, maximum accuracy, low latency, seamless synchronization, and a smooth, responsive experience across Android, iOS, web, desktop, and PWA platforms."
        aria-expanded={open}
        aria-haspopup="listbox"
        className="tap flex items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary/60 hover:text-foreground"
      >
        <Languages className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{current.native}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Optimize and enhance the overall performance, accuracy, and reliability of both the mobile application and website to deliver a fast, seamless, and enterprise-grade user experience.\n\nPerformance & Speed Improvements\n\nSignificantly improve application performance across all devices, including low-end smartphones and slower network connections.\n\nOptimize frontend and backend architecture to reduce load times, improve responsiveness, and eliminate lag or UI freezes.\n\nIncrease data transmission speed between the client and server by implementing efficient APIs, compression, caching, connection pooling, lazy loading, and optimized database queries.\n\nMinimize API response times and ensure real-time synchronization of data across all platforms.\n\nImprove page rendering speed, navigation smoothness, and overall application responsiveness.\n\nAccuracy & Reliability\n\nEnhance the accuracy of all AI responses, calculations, search results, recommendations, and analytics.\n\nImprove data validation, error handling, and consistency across the entire application.\n\nEnsure real-time data updates are reliable, accurate, and synchronized without duplication or delays.\n\nOptimize search algorithms for faster and more precise results.\n\nScalability & Stability\n\nOptimize memory usage, CPU utilization, and battery consumption.\n\nImprove network resilience with automatic retries, offline caching, and graceful recovery from connectivity issues.\n\nEnsure the platform remains stable under high traffic and concurrent users.\n\nImplement intelligent background processing to improve efficiency without affecting the user experience.\n\nOverall Goal\n\nDeliver a high-performance, production-ready application that provides ultra-fast data transmission, maximum accuracy, low latency, seamless synchronization, and a smooth, responsive experience across Android, iOS, web, desktop, and PWA platforms."
          className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-xl border border-border/60 bg-popover shadow-2xl"
          style={{ animation: "scale-in .18s var(--ease-out-expo) both" }}
        >
          {LANGS.map((l) => {
            const selected = l.code === lang;
            return (
              <li key={l.code}>
                <button
                  role="option"
                  aria-selected={selected}
                  onClick={() => { setLang(l.code); setOpen(false); }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm transition hover:bg-secondary/60 ${
                    selected ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span>
                    <span className="font-medium">{l.native}</span>
                    <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground">{l.code}</span>
                  </span>
                  {selected && <Check className="h-3.5 w-3.5 text-primary" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
