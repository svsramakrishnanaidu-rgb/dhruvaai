"use client";
/**
 * Client-side batching translation cache.
 *
 * - `<T>{original english text}</T>` — renders live-translated text based on current language.
 * - Cache is keyed by (lang, sha-lite(text)) and persisted in localStorage so
 *   switching languages after the first visit is instant.
 * - Pending strings are batched and posted to the `translateBatch` server fn
 *   once per animation frame to minimise gateway calls.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { translateBatch } from "./translate.functions";
import { useI18n, type Lang } from "./i18n";

const STORAGE_KEY = "krishi.translate.v1";
const MAX_CACHE = 4000;

type CacheMap = Record<string, string>; // key = `${lang}::${text}`

function loadCache(): CacheMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch { return {}; }
}

function saveCache(cache: CacheMap) {
  if (typeof window === "undefined") return;
  try {
    const keys = Object.keys(cache);
    if (keys.length > MAX_CACHE) {
      // Drop oldest ~25%
      const drop = keys.slice(0, Math.floor(keys.length * 0.25));
      for (const k of drop) delete cache[k];
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {}
}

type Ctx = {
  translate: (text: string) => string;
  lang: Lang;
};

const TCtx = createContext<Ctx>({ translate: (t) => t, lang: "en" });

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const [cache, setCache] = useState<CacheMap>(() => loadCache());
  const translateFn = useServerFn(translateBatch);

  const pendingRef = useRef<Set<string>>(new Set());
  const flushTimer = useRef<number | null>(null);
  const inflight = useRef<Set<string>>(new Set());

  const flush = useCallback(async () => {
    flushTimer.current = null;
    if (lang === "en") return;
    const items = Array.from(pendingRef.current).filter((s) => !inflight.current.has(`${lang}::${s}`));
    pendingRef.current.clear();
    if (items.length === 0) return;
    // Chunk to keep requests small.
    const chunks: string[][] = [];
    for (let i = 0; i < items.length; i += 40) chunks.push(items.slice(i, i + 40));
    for (const chunk of chunks) {
      for (const s of chunk) inflight.current.add(`${lang}::${s}`);
    }
    try {
      const results = await Promise.all(
        chunks.map((c) => translateFn({ data: { items: c, lang } })),
      );
      setCache((prev) => {
        const next = { ...prev };
        chunks.forEach((chunk, ci) => {
          const out = results[ci]?.translations ?? chunk;
          chunk.forEach((src, idx) => {
            next[`${lang}::${src}`] = out[idx] ?? src;
          });
        });
        saveCache(next);
        return next;
      });
    } catch {
      // silent — original English will be shown as fallback
    } finally {
      chunks.flat().forEach((s) => inflight.current.delete(`${lang}::${s}`));
    }
  }, [lang, translateFn]);

  const queue = useCallback((text: string) => {
    if (!text || text.length > 400 || lang === "en") return;
    const key = `${lang}::${text}`;
    if (cache[key] || inflight.current.has(key)) return;
    pendingRef.current.add(text);
    if (flushTimer.current == null) {
      flushTimer.current = window.setTimeout(flush, 120) as unknown as number;
    }
  }, [cache, flush, lang]);

  const translate = useCallback((text: string): string => {
    if (!text || lang === "en") return text;
    const key = `${lang}::${text}`;
    const hit = cache[key];
    if (hit) return hit;
    queue(text);
    return text; // show English until translation arrives, then re-renders
  }, [cache, lang, queue]);

  const value = useMemo(() => ({ translate, lang }), [translate, lang]);

  // Warm-load cache if user's language changed elsewhere
  useEffect(() => { setCache(loadCache()); }, [lang]);

  return <TCtx.Provider value={value}>{children}</TCtx.Provider>;
}

export function useTranslate() {
  return useContext(TCtx).translate;
}

/** Inline translated text. Children must be a plain string. */
export function T({ children }: { children: string }) {
  const translate = useTranslate();
  return <>{translate(children)}</>;
}
