"use client";
/**
 * Memory Service — private, on-device only.
 *
 * Stores the assistant's short conversation history plus lightweight
 * personalization signals in localStorage. Nothing leaves the browser except
 * the turns explicitly sent to the AI Gateway for the current answer.
 */

export type Turn = { role: "user" | "assistant"; content: string; at: number };

export type AssistantPrefs = {
  voiceReplies: boolean;
  fontScale: number;
  highContrast: boolean;
  visits: Record<string, number>;
  lastQueries: string[];
};

const KEY_TURNS = "ks.ai.turns.v1";
const KEY_PREFS = "ks.ai.prefs.v1";
const MAX_TURNS = 24;

const DEFAULT_PREFS: AssistantPrefs = {
  voiceReplies: true,
  fontScale: 1,
  highContrast: false,
  visits: {},
  lastQueries: [],
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota — memory is best-effort */
  }
}

export function loadTurns(): Turn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY_TURNS);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.slice(-MAX_TURNS) : [];
  } catch {
    return [];
  }
}

export function saveTurns(turns: Turn[]) {
  write(KEY_TURNS, turns.slice(-MAX_TURNS));
}

export function loadPrefs(): AssistantPrefs {
  return read(KEY_PREFS, DEFAULT_PREFS);
}

export function savePrefs(p: AssistantPrefs) {
  write(KEY_PREFS, p);
}

/** Records a screen visit so the assistant can personalise suggestions. */
export function noteVisit(path: string) {
  const p = loadPrefs();
  p.visits[path] = (p.visits[path] ?? 0) + 1;
  savePrefs(p);
}

export function noteQuery(q: string) {
  const p = loadPrefs();
  p.lastQueries = [q, ...p.lastQueries.filter((x) => x !== q)].slice(0, 8);
  savePrefs(p);
}

export function topScreens(n = 4): string[] {
  const p = loadPrefs();
  return Object.entries(p.visits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([path]) => path);
}

export function clearMemory() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY_TURNS);
    window.localStorage.removeItem(KEY_PREFS);
  } catch {
    /* ignore */
  }
}
