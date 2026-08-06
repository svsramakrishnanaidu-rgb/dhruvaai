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
        aria-label="Here's an enhanced, professional version in a copy-friendly format:\n\nAdd a powerful Crop Search feature to the Diseases section. Include a searchable search bar that allows users to quickly find and select any crop. As the user types, display auto-suggestions containing all available crops in the database. Once a crop is selected, automatically filter the Diseases section to display only the diseases related to that specific crop. Do not show diseases from any other crops. Ensure the search database includes every major and minor crop grown in India, including cereals, pulses, oilseeds, vegetables, fruits, spices, plantation crops, medicinal crops, floriculture crops, fodder crops, and commercial crops. Organize the crop list alphabetically and support search by both common and local crop names. If no crop is selected, prompt the user to choose a crop before displaying disease information, creating a clean, fast, and crop-specific user experience."
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
          aria-label="Here's an enhanced, professional version in a copy-friendly format:\n\nAdd a powerful Crop Search feature to the Diseases section. Include a searchable search bar that allows users to quickly find and select any crop. As the user types, display auto-suggestions containing all available crops in the database. Once a crop is selected, automatically filter the Diseases section to display only the diseases related to that specific crop. Do not show diseases from any other crops. Ensure the search database includes every major and minor crop grown in India, including cereals, pulses, oilseeds, vegetables, fruits, spices, plantation crops, medicinal crops, floriculture crops, fodder crops, and commercial crops. Organize the crop list alphabetically and support search by both common and local crop names. If no crop is selected, prompt the user to choose a crop before displaying disease information, creating a clean, fast, and crop-specific user experience."
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
