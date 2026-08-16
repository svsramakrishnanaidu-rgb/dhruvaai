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
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="tap flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-web-sage transition-all hover:bg-web-emerald/10 hover:text-web-gold font-[Plus Jakarta Sans]"
      >
        <Languages className="h-4 w-4 text-web-gold" aria-hidden />
        <span className="hidden sm:inline">'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            REMOVE TODAY MODIFICATIONS</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t("aria.changeLanguage")}
          style={{ animation: "scale-in .18s var(--ease-out-expo) both" }}
          className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-[1.5rem] border border-web-leaf/10 bg-web-bg-midnight/95 py-1 shadow-2xl z-50 backdrop-blur-xl font-[Plus Jakarta Sans]"
        >
          {LANGS.map((l) => {
            const selected = l.code === lang;
            return (
              <li key={l.code}>
                <button
                  role="option"
                  aria-selected={selected}
                  onClick={() => { setLang(l.code); setOpen(false); }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-web-emerald/10 ${
                    selected ? "text-web-emerald" : "text-web-sage hover:text-web-mist"
                  }`}
                >
                  <span>
                    <span>{l.native}</span>
                    <span className="ml-2 text-[9px] opacity-40">{l.code}</span>
                  </span>
                  {selected && <Check className="h-3.5 w-3.5 text-web-gold" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
