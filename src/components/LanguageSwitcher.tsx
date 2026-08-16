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
        <span className="hidden sm:inline">'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            For the code present, I get the error below.\n\nPlease think step-by-step in order to resolve it.\n```\nThe app returned 500 while handling GET /_serverFn/eyJmaWxlIjoiL3NyYy9saWIvYWdtYXJrbmV0LmZ1bmN0aW9ucy50cz90c3Mtc2VydmVyZm4tc3BsaXQiLCJleHBvcnQiOiJmZXRjaEFnbWFya25ldF9jcmVhdGVTZXJ2ZXJGbl9oYW5kbGVyIn0?payload=%7B%22t%22%3A%7B%22t%22%3A10%2C%22i%22%3A0%2C%22p%22%3A%7B%22k%22%3A%5B%22data%22%5D%2C%22v%22%3A%5B%7B%22t%22%3A10%2C%22i%22%3A1%2C%22p%22%3A%7B%22k%22%3A%5B%22state%22%2C%22limit%22%5D%2C%22v%22%3A%5B%7B%22t%22%3A2%2C%22s%22%3A1%7D%2C%7B%22t%22%3A0%2C%22s%22%3A1500%7D%5D%7D%2C%22o%22%3A0%7D%5D%7D%2C%22o%22%3A0%7D%2C%22f%22%3A63%2C%22m%22%3A%5B%5D%7D. The error was handled by a route or error boundary, so no stack was captured — check the failing loader/route code and the dev server output.\n\n{\n  \"timestamp\": 1786892546270,\n  \"error_type\": \"RUNTIME_ERROR\",\n  \"filename\": \"Unknown file\",\n  \"lineno\": 0,\n  \"colno\": 0,\n  \"stack\": \"Unavailable\",\n  \"has_blank_screen\": true\n}\n```</span>
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
