"use client";
import { useSyncExternalStore } from "react";

export type Persona =
  | "friendly-female"
  | "anime-girl"
  | "friendly-male"
  | "mature-male"
  | "fantasy-deep";

export const PERSONAS: { id: Persona; label: string; rate: number; pitch: number; voiceHints: string[]; emoji: string }[] = [
  { id: "friendly-female", label: "Friendly Young Woman", rate: 1.0, pitch: 1.1, voiceHints: ["female", "samantha", "google us english", "aria", "zira"], emoji: "👩" },
  { id: "anime-girl",       label: "Anime Girl",           rate: 1.15, pitch: 1.6, voiceHints: ["female", "google japanese", "kyoko", "otoya"], emoji: "🌸" },
  { id: "friendly-male",    label: "Friendly Young Man",   rate: 1.0, pitch: 1.0, voiceHints: ["male", "daniel", "david", "alex"], emoji: "🧑" },
  { id: "mature-male",      label: "Mature Professional",  rate: 0.95, pitch: 0.85, voiceHints: ["male", "google uk english male", "arthur"], emoji: "🧔" },
  { id: "fantasy-deep",     label: "Fantasy / Cinematic",  rate: 0.85, pitch: 0.55, voiceHints: ["male", "deep", "google uk english male"], emoji: "🐉" },
];

export type LeoSettings = {
  persona: Persona;
  rate: number;              // 0.5 - 2
  wakeEnabled: boolean;
  bargeSensitivity: number;  // 1(low) - 5(high) — smaller triggers earlier
  autoSpeak: boolean;        // if false, user must press Speak on each reply
  voiceLang: string;         // BCP47 e.g. "en-IN"
};

const KEY = "leo.settings.v1";
const DEFAULT: LeoSettings = {
  persona: "friendly-female",
  rate: 0.82,
  wakeEnabled: true,
  bargeSensitivity: 3,
  autoSpeak: true,
  voiceLang: "",
};

let current: LeoSettings = DEFAULT;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try { const raw = localStorage.getItem(KEY); if (raw) current = { ...DEFAULT, ...JSON.parse(raw) }; } catch {}
}

function persist() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch {}
  listeners.forEach((l) => l());
}

export const leoSettings = {
  get: () => current,
  set(patch: Partial<LeoSettings>) { current = { ...current, ...patch }; persist(); },
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
};

export function useLeoSettings(): LeoSettings {
  return useSyncExternalStore(leoSettings.subscribe, () => current, () => DEFAULT);
}

export function pickVoice(voices: SpeechSynthesisVoice[], persona: Persona, lang: string): SpeechSynthesisVoice | undefined {
  const p = PERSONAS.find((x) => x.id === persona)!;
  const langPrefix = lang.slice(0, 2).toLowerCase();
  const inLang = voices.filter((v) => v.lang?.toLowerCase().startsWith(langPrefix));
  const pool = inLang.length ? inLang : voices;
  for (const hint of p.voiceHints) {
    const m = pool.find((v) => v.name.toLowerCase().includes(hint));
    if (m) return m;
  }
  return pool[0];
}
