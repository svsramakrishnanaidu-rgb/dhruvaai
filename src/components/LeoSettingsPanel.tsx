"use client";
import { useState } from "react";
import { X, Settings2, Plus, Trash2 } from "lucide-react";
import { PERSONAS, useLeoSettings, leoSettings, type Persona } from "@/lib/leo-settings";

const LANGS = [
  { code: "", label: "Auto (match app)" },
  { code: "en-IN", label: "English (India)" },
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "te-IN", label: "తెలుగు" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "ta-IN", label: "தமிழ்" },
  { code: "kn-IN", label: "ಕನ್ನಡ" },
  { code: "ml-IN", label: "മലയാളം" },
  { code: "mr-IN", label: "मराठी" },
  { code: "bn-IN", label: "বাংলা" },
  { code: "gu-IN", label: "ગુજરાતી" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ" },
  { code: "ur-IN", label: "اردو" },
  { code: "ja-JP", label: "日本語" },
  { code: "ko-KR", label: "한국어" },
  { code: "zh-CN", label: "中文" },
  { code: "fr-FR", label: "Français" },
  { code: "de-DE", label: "Deutsch" },
  { code: "es-ES", label: "Español" },
  { code: "ar-SA", label: "العربية" },
  { code: "ru-RU", label: "Русский" },
];

export function LeoSettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useLeoSettings();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-t-3xl border border-border/60 bg-background shadow-2xl sm:rounded-3xl"
      >
        <header className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">LEO · Voice Settings</h2>
          </div>
          <button aria-label="Close settings" onClick={onClose} className="rounded-full p-2 hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="max-h-[70dvh] space-y-5 overflow-y-auto px-5 py-5">
          {/* Persona */}
          <section>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Voice persona</label>
            <div className="grid grid-cols-1 gap-2">
              {PERSONAS.map((p) => {
                const active = s.persona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => leoSettings.set({ persona: p.id as Persona })}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                      active ? "border-primary bg-primary/10 text-foreground" : "border-border/60 hover:bg-secondary"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{p.emoji}</span>
                      <span className="text-sm font-medium">{p.label}</span>
                    </span>
                    {active && <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Active</span>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Language */}
          <section>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Voice language</label>
            <select
              value={s.voiceLang}
              onChange={(e) => leoSettings.set({ voiceLang: e.target.value })}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
            >
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </section>

          {/* Speech rate */}
          <section>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Speech rate</label>
              <span className="text-xs tabular-nums text-muted-foreground">{s.rate.toFixed(2)}×</span>
            </div>
            <input
              type="range" min={0.5} max={1.8} step={0.05}
              value={s.rate}
              onChange={(e) => leoSettings.set({ rate: Number(e.target.value) })}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Slow</span><span>Normal</span><span>Fast</span>
            </div>
          </section>

          {/* Auto-speak toggle */}
          <ToggleRow
            label="Auto-speak replies"
            hint="If off, LEO shows the answer as text and you tap Speak to hear it."
            value={s.autoSpeak}
            onChange={(v) => leoSettings.set({ autoSpeak: v })}
          />

          {/* Wake phrase enable */}
          <ToggleRow
            label="Wake phrase"
            hint="Say any of your saved phrases from anywhere on the site to summon LEO."
            value={s.wakeEnabled}
            onChange={(v) => leoSettings.set({ wakeEnabled: v })}
          />

          {/* Custom wake phrases */}
          {s.wakeEnabled && (
            <WakePhrasesEditor phrases={s.wakePhrases} />
          )}

          {/* Wake confidence */}
          {s.wakeEnabled && (
            <section>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Wake confidence</label>
                <span className="text-xs tabular-nums text-muted-foreground">{Math.round(s.wakeConfidence * 100)}%</span>
              </div>
              <input
                type="range" min={0.2} max={0.95} step={0.05}
                value={s.wakeConfidence}
                onChange={(e) => leoSettings.set({ wakeConfidence: Number(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Easy trigger</span><span>Balanced</span><span>Strict (fewer false wakes)</span>
              </div>
            </section>
          )}

          {/* Barge-in sensitivity */}
          <section>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Barge-in sensitivity</label>
              <span className="text-xs tabular-nums text-muted-foreground">{s.bargeSensitivity}/5</span>
            </div>
            <input
              type="range" min={1} max={5} step={1}
              value={s.bargeSensitivity}
              onChange={(e) => leoSettings.set({ bargeSensitivity: Number(e.target.value) })}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Off / rarely</span><span>Balanced</span><span>Interrupt instantly</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <section className="flex items-start justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative mt-0.5 h-6 w-11 flex-shrink-0 rounded-full transition ${value ? "bg-primary" : "bg-muted"}`}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: value ? "translateX(22px)" : "translateX(2px)" }}
        />
      </button>
    </section>
  );
}

function WakePhrasesEditor({ phrases }: { phrases: string[] }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim().toLowerCase();
    if (!v) return;
    if (phrases.map((p) => p.toLowerCase()).includes(v)) { setDraft(""); return; }
    leoSettings.set({ wakePhrases: [...phrases, v] });
    setDraft("");
  };
  const remove = (idx: number) => {
    const next = phrases.filter((_, i) => i !== idx);
    leoSettings.set({ wakePhrases: next.length ? next : ["hey leo"] });
  };
  return (
    <section>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Your wake phrases
      </label>
      <p className="mb-2 text-[11px] text-muted-foreground">
        Add nicknames or multilingual triggers (e.g. "hey leo", "namaste leo", "నమస్తే లియో"). Saved across sessions.
      </p>
      <ul className="mb-2 space-y-1.5">
        {phrases.map((p, i) => (
          <li key={`${p}-${i}`} className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/60 px-3 py-1.5">
            <span className="text-sm">{p}</span>
            <button
              aria-label={`Remove ${p}`}
              onClick={() => remove(i)}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-background hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="e.g. hey leo"
          className="flex-1 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={add}
          disabled={!draft.trim()}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
    </section>
  );
}
