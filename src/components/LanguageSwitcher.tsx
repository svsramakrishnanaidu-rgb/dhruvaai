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
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("aria.changeLanguage")}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary/60 hover:text-foreground"
      >
        <Languages className="h-4 w-4" />
        <span className="hidden sm:inline">{current.native}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-40 overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-sm transition hover:bg-secondary/60 ${
                l.code === lang ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <span>
                <span className="font-medium">{l.native}</span>
                <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground">{l.code}</span>
              </span>
              {l.code === lang && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
