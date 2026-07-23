"use client";
// AutoLocalize — walks the DOM and swaps English text/attributes into the
// currently-selected language using a batched AI translation service with
// aggressive localStorage caching. Applies to any element not marked
// `data-nolang`. Idempotent, survives route changes via MutationObserver,
// and reverses back to English when the user picks EN again.
import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { translateBatch } from "@/lib/auto-translate.functions";

const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "CODE", "PRE", "NOSCRIPT", "TEXTAREA", "INPUT",
  "SELECT", "OPTION", "SVG", "PATH", "CANVAS",
]);
const ATTRS = ["placeholder", "aria-label", "title", "alt"] as const;
// Skip strings that are just numbers, symbols, units, dates, currencies.
const NUMERIC_ONLY = /^[\s\d.,:;₹$€£¥%\-+/×x*·—–°()[\]{}<>=@#|"'`~^&]+$/;

function isTranslatableEnglish(s: string) {
  const t = s.trim();
  if (t.length < 2) return false;
  if (NUMERIC_ONLY.test(t)) return false;
  // Must contain at least one Latin letter (so already-translated Telugu/Hindi text is skipped).
  if (!/[A-Za-z]/.test(t)) return false;
  // Skip URLs / emails / file paths
  if (/^https?:\/\//i.test(t) || /^[\w.+-]+@[\w-]+\.[\w.-]+$/i.test(t)) return false;
  if (/^\/[\w-]+(\/[\w-]+)*$/i.test(t)) return false;
  return true;
}

type Lang = "en" | "te" | "hi";
type Cache = Record<string, string>;

function loadCache(lang: Lang): Cache {
  if (lang === "en") return {};
  try { return JSON.parse(localStorage.getItem(`agri.autoT.${lang}`) || "{}"); } catch { return {}; }
}
function saveCache(lang: Lang, c: Cache) {
  if (lang === "en") return;
  try { localStorage.setItem(`agri.autoT.${lang}`, JSON.stringify(c)); } catch {}
}

/** Preserve leading/trailing whitespace when swapping. */
function swap(original: string, translated: string): string {
  const lead = original.match(/^\s*/)?.[0] ?? "";
  const tail = original.match(/\s*$/)?.[0] ?? "";
  return lead + translated + tail;
}

export function AutoLocalize() {
  const { lang } = useI18n();
  const busyRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Build caches for the current lang PLUS reverse maps from any other
    // non-EN cache so that switching languages restores/translates cleanly.
    const forward: Cache = loadCache(lang as Lang);            // en -> current lang
    // reverse: translatedText -> englishOriginal (union across te+hi)
    const reverse: Record<string, string> = {};
    for (const l of ["te", "hi"] as const) {
      const c = loadCache(l);
      for (const [en, tr] of Object.entries(c)) {
        if (tr && tr !== en) reverse[tr.trim()] = en;
      }
    }

    let cancelled = false;
    const pending = new Set<string>();

    const applyNode = (n: Node) => {
      if (n.nodeType === Node.ELEMENT_NODE) {
        const el = n as Element;
        if (SKIP_TAGS.has(el.tagName)) return false;
        if ((el as HTMLElement).dataset?.nolang !== undefined) return false;
        // attributes
        for (const a of ATTRS) {
          const v = el.getAttribute(a);
          if (!v) continue;
          const trimmed = v.trim();
          if (!trimmed) continue;
          if (lang === "en") {
            const orig = reverse[trimmed];
            if (orig && orig !== trimmed) el.setAttribute(a, swap(v, orig));
          } else if (isTranslatableEnglish(v)) {
            const tr = forward[trimmed];
            if (tr && tr !== trimmed) {
              if (v.trim() !== tr.trim()) el.setAttribute(a, swap(v, tr));
            } else {
              pending.add(trimmed);
            }
          }
        }
        return true;
      }
      if (n.nodeType === Node.TEXT_NODE) {
        const t = n as Text;
        const v = t.nodeValue || "";
        const trimmed = v.trim();
        if (!trimmed) return true;
        const parent = t.parentElement;
        if (parent && (SKIP_TAGS.has(parent.tagName) || parent.closest("[data-nolang]"))) return true;
        if (lang === "en") {
          const orig = reverse[trimmed];
          if (orig && orig !== trimmed) t.nodeValue = swap(v, orig);
        } else if (isTranslatableEnglish(v)) {
          const tr = forward[trimmed];
          if (tr && tr !== trimmed) {
            if (v.trim() !== tr.trim()) t.nodeValue = swap(v, tr);
          } else {
            pending.add(trimmed);
          }
        }
        return true;
      }
      return true;
    };

    const walk = (root: Node) => {
      const proceed = applyNode(root);
      if (!proceed) return;
      if (root.nodeType === Node.ELEMENT_NODE) {
        const children = Array.from((root as Element).childNodes);
        for (const c of children) walk(c);
      }
    };

    const applyAll = () => walk(document.body);

    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleFlush = () => {
      if (flushTimer) return;
      flushTimer = setTimeout(async () => {
        flushTimer = null;
        if (cancelled || lang === "en" || busyRef.current) return;
        if (pending.size === 0) return;
        busyRef.current = true;
        try {
          while (!cancelled && pending.size > 0) {
            const batch: string[] = [];
            for (const s of pending) {
              batch.push(s);
              if (batch.length >= 40) break;
            }
            batch.forEach((s) => pending.delete(s));
            try {
              const res = await translateBatch({ data: { lang: lang as "te" | "hi", texts: batch } });
              if (cancelled) return;
              let mutated = false;
              res.translations.forEach((tr, i) => {
                const src = batch[i];
                if (tr && tr !== src) {
                  forward[src] = tr;
                  reverse[tr.trim()] = src;
                  mutated = true;
                }
              });
              if (mutated) {
                saveCache(lang as Lang, forward);
                applyAll();
              }
            } catch (e) {
              console.warn("[AutoLocalize] batch failed", e);
              break;
            }
          }
        } finally {
          busyRef.current = false;
        }
      }, 250);
    };

    // Initial pass
    applyAll();
    scheduleFlush();

    // Watch for React re-renders / route changes
    const obs = new MutationObserver((records) => {
      const roots = new Set<Node>();
      for (const r of records) {
        if (r.type === "characterData") roots.add(r.target);
        else if (r.type === "attributes" && r.target.nodeType === Node.ELEMENT_NODE) roots.add(r.target);
        else r.addedNodes.forEach((n) => roots.add(n));
      }
      if (roots.size === 0) return;
      for (const r of roots) walk(r);
      scheduleFlush();
    });
    obs.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRS],
    });

    return () => {
      cancelled = true;
      if (flushTimer) clearTimeout(flushTimer);
      obs.disconnect();
    };
  }, [lang]);

  return null;
}
