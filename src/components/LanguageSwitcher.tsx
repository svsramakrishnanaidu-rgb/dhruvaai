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
        aria-label="'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Redesign and rebuild ONLY the responsive WEBSITE VERSION of my existing agricultural platform into a premium, cinematic, futuristic Agritech experience. Do not modify the native Android/iOS/mobile app in any way. Preserve all existing website content, crop data, features, APIs, backend logic, navigation logic, datasets, and workflows. This is primarily a UI/UX, visual, animation, responsiveness, and performance redesign.\n\n1. HOME PAGE — CINEMATIC BACKGROUND\n\nUse the uploaded Japanese moonlit landscape image as the Home Page background only (Desktop versions). Transform the static image into a 15–30 second seamless cinematic loop with drifting clouds, faint mist, flickering distant lights, and falling petals or leaves... Make the background dynamically react to the mouse wheel and page scrolling... [Extensive details on typography (Japan Ramen), palette (Midnight Navy, Crimson, Moonlight White), and Glassmorphism UI]. ... DO NOT MODIFY THE NATIVE MOBILE/ANDROID/iOS APP. DO NOT GIVE A PLAN — BUILD IT."
        aria-expanded={open}
        aria-haspopup="listbox"
        className="tap flex items-center gap-1.5 rounded-full px-2.5 text-xs font-bold uppercase tracking-widest text-muted-blue-gray transition-all hover:bg-white/5 hover:text-moonlight-white"
      >
        <Languages className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{current.native}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t("aria.changeLanguage")}
          style={{ animation: "scale-in .18s var(--ease-out-expo) both" }}
          className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border border-white/10 bg-midnight-navy py-1 shadow-2xl z-50"
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
