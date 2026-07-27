"use client";
/**
 * KRISH AI — the app's autonomous assistant surface.
 *
 * Floating orb (bottom-right) + side panel. Composes the UI Context Engine,
 * Conversation Engine, Voice Engine, Navigation/Automation Engine and Memory
 * Service into one embedded companion.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Bot, Mic, MicOff, Send, Volume2, VolumeX, X, Sparkle, Trash2, BookOpenText,
  Loader2, Type, Contrast, ChevronDown,
} from "lucide-react";
import { askAssistant, type AssistantReply } from "@/lib/assistant/assistant.functions";
import { captureScreen, snapshotToPrompt, screenReadout } from "@/lib/assistant/screen-context";
import {
  loadTurns, saveTurns, loadPrefs, savePrefs, noteVisit, noteQuery, topScreens, clearMemory,
  type Turn, type AssistantPrefs,
} from "@/lib/assistant/memory";
import { useI18n, type Lang } from "@/lib/i18n";
import { APP_ROUTES } from "@/lib/assistant/registry";
import { haptic } from "@/lib/haptics";

const VOICE_LOCALE: Record<Lang, string> = { en: "en-IN", te: "te-IN", hi: "hi-IN" };

const GREETING: Record<Lang, string> = {
  en: "I'm Krish AI. I can see this screen — ask me what it does, or tell me where to go.",
  te: "నేను కృష్ AI. ఈ స్క్రీన్ నాకు కనిపిస్తుంది — దీని గురించి అడగండి లేదా ఎక్కడికి వెళ్లాలో చెప్పండి.",
  hi: "मैं कृष AI हूँ। यह स्क्रीन मुझे दिख रही है — इसके बारे में पूछें या बताएं कहाँ जाना है।",
};

const QUICK: Record<Lang, string[]> = {
  en: ["What is this page?", "Read this page aloud", "Open live weather", "Today's market prices"],
  te: ["ఈ పేజీ ఏంటి?", "ఈ పేజీని చదివి వినిపించు", "వాతావరణం చూపించు", "నేటి మార్కెట్ ధరలు"],
  hi: ["यह पेज क्या है?", "यह पेज पढ़कर सुनाओ", "मौसम खोलो", "आज के मंडी भाव"],
};

type Msg = Turn & { id: string };

export function KrishAI() {
  const { lang, setLang } = useI18n();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const ask = useServerFn(askAssistant);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [prefs, setPrefs] = useState<AssistantPrefs | null>(null);
  const [a11yOpen, setA11yOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* ---------------------------------------------------------------- memory */
  useEffect(() => {
    const p = loadPrefs();
    setPrefs(p);
    applyA11y(p);
    setMsgs(loadTurns().map((t, i) => ({ ...t, id: `${t.at}-${i}` })));
  }, []);

  useEffect(() => { noteVisit(path); }, [path]);

  useEffect(() => {
    if (msgs.length) saveTurns(msgs.map(({ role, content, at }) => ({ role, content, at })));
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const updatePrefs = useCallback((patch: Partial<AssistantPrefs>) => {
    setPrefs((prev) => {
      const next = { ...(prev ?? loadPrefs()), ...patch };
      savePrefs(next);
      applyA11y(next);
      return next;
    });
  }, []);

  /* ----------------------------------------------------------- voice (TTS) */
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (!(prefs?.voiceReplies ?? true)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ""));
      u.lang = VOICE_LOCALE[lang];
      u.rate = 1.02;
      u.pitch = 1;
      const match = window.speechSynthesis.getVoices().find((v) => v.lang?.startsWith(VOICE_LOCALE[lang].slice(0, 2)));
      if (match) u.voice = match;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    } catch { /* TTS unsupported */ }
  }, [lang, prefs?.voiceReplies]);

  const stopSpeaking = useCallback(() => {
    try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
    setSpeaking(false);
  }, []);

  /* --------------------------------------------------- automation / actions */
  const runAction = useCallback((a: AssistantReply["actions"][number]) => {
    switch (a.type) {
      case "navigate": {
        const target = APP_ROUTES.find((r) => r.path === a.path)?.path;
        if (target) navigate({ to: target });
        break;
      }
      case "set_language":
        if (a.lang === "en" || a.lang === "te" || a.lang === "hi") setLang(a.lang);
        break;
      case "set_theme": {
        const light = a.theme === "light";
        document.documentElement.classList.toggle("light", light);
        try { localStorage.setItem("agri.theme", light ? "light" : "dark"); } catch { /* noop */ }
        break;
      }
      case "set_font_scale":
        updatePrefs({ fontScale: Math.min(1.6, Math.max(0.9, Number(a.scale) || 1)) });
        break;
      case "set_contrast":
        updatePrefs({ highContrast: Boolean(a.high) });
        break;
      case "open_search":
        window.dispatchEvent(new Event("leo:openSearch"));
        break;
      case "scroll":
        window.scrollTo({ top: a.to === "bottom" ? document.body.scrollHeight : 0, behavior: "smooth" });
        break;
      case "read_page": {
        const text = screenReadout(captureScreen());
        speak(text.slice(0, 3000));
        break;
      }
      case "click": {
        const label = String(a.label ?? "").toLowerCase();
        const el = Array.from(document.querySelectorAll<HTMLElement>("button,a[href],[role='button']"))
          .find((n) => (n.innerText || n.getAttribute("aria-label") || "").toLowerCase().includes(label));
        el?.click();
        break;
      }
      default:
        break;
    }
  }, [navigate, setLang, speak, updatePrefs]);

  /* -------------------------------------------------------------- send turn */
  const send = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    setErr(null);
    setInput("");
    setSuggestions([]);
    noteQuery(text);
    haptic("tap");
    const now = Date.now();
    const history = msgs.slice(-8).map(({ role, content }) => ({ role, content: content.slice(0, 2000) }));
    setMsgs((m) => [...m, { id: `u${now}`, role: "user", content: text, at: now }]);
    setBusy(true);
    try {
      const snap = captureScreen();
      const res = await ask({
        data: {
          message: text,
          lang,
          screen: snapshotToPrompt(snap).slice(0, 9000),
          history,
          favourites: topScreens(),
        },
      });
      if (res.error) {
        setErr(res.error);
      } else {
        const at = Date.now();
        setMsgs((m) => [...m, { id: `a${at}`, role: "assistant", content: res.reply, at }]);
        setSuggestions(res.suggestions ?? []);
        res.actions?.forEach(runAction);
        if (!res.actions?.some((a) => a.type === "read_page")) speak(res.reply);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Assistant unavailable.");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }, [ask, busy, lang, msgs, runAction, speak]);

  /* ----------------------------------------------------------- voice (STT) */
  const toggleMic = useCallback(() => {
    const w = window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { setErr("Voice input isn't supported in this browser."); return; }
    if (listening) { try { recRef.current?.stop(); } catch { /* noop */ } setListening(false); return; }
    stopSpeaking();
    const rec = new SR();
    recRef.current = rec;
    rec.lang = VOICE_LOCALE[lang];
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let finalText = "";
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setInput((finalText + interim).trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      const t = finalText.trim();
      if (t) void send(t);
    };
    try { rec.start(); setListening(true); haptic("select"); } catch { setListening(false); }
  }, [lang, listening, send, stopSpeaking]);

  useEffect(() => () => { try { recRef.current?.stop(); } catch { /* noop */ } }, []);

  /* --------------------------------------------------------------- shortcut */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 120); }, [open]);

  const pageName = useMemo(
    () => APP_ROUTES.find((r) => r.path === path)?.name ?? "this screen",
    [path],
  );

  return (
    <>
      {/* ------------------------------------------------------------- orb */}
      <button
        onClick={() => { setOpen((o) => !o); haptic("tap"); }}
        aria-label="Open Krish AI assistant"
        className="ks-orb"
        data-active={open || listening || speaking}
      >
        <span className="ks-orb-ring" aria-hidden />
        {listening ? <Mic className="h-5 w-5" /> : speaking ? <Volume2 className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </button>

      {/* ----------------------------------------------------------- panel */}
      {open && (
        <div className="ks-ai-panel" role="dialog" aria-label="Krish AI assistant">
          <header className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
              <Bot className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-bold tracking-wide">KRISH AI</div>
              <div className="truncate text-[11px] text-muted-foreground">
                {busy ? "Thinking…" : listening ? "Listening…" : `Watching ${pageName}`}
              </div>
            </div>
            <button
              onClick={() => updatePrefs({ voiceReplies: !(prefs?.voiceReplies ?? true) })}
              aria-label={prefs?.voiceReplies ? "Mute voice replies" : "Unmute voice replies"}
              className="ks-ai-icon"
            >
              {prefs?.voiceReplies ?? true ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button onClick={() => setA11yOpen((v) => !v)} aria-label="Accessibility options" className="ks-ai-icon">
              <Type className="h-4 w-4" />
            </button>
            <button onClick={() => setOpen(false)} aria-label="Close assistant" className="ks-ai-icon">
              <X className="h-4 w-4" />
            </button>
          </header>

          {a11yOpen && (
            <div className="space-y-3 border-b border-border/60 bg-secondary/30 px-4 py-3 text-xs">
              <label className="flex items-center gap-3">
                <span className="w-20 text-muted-foreground">Text size</span>
                <input
                  type="range" min={0.9} max={1.6} step={0.05}
                  value={prefs?.fontScale ?? 1}
                  onChange={(e) => updatePrefs({ fontScale: Number(e.target.value) })}
                  className="flex-1 accent-primary"
                />
                <span className="w-10 text-right tabular-nums">{Math.round((prefs?.fontScale ?? 1) * 100)}%</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updatePrefs({ highContrast: !(prefs?.highContrast ?? false) })}
                  className="ks-ai-chip"
                >
                  <Contrast className="h-3.5 w-3.5" />
                  {prefs?.highContrast ? "High contrast on" : "High contrast off"}
                </button>
                <button onClick={() => runAction({ type: "read_page" })} className="ks-ai-chip">
                  <BookOpenText className="h-3.5 w-3.5" /> Read screen
                </button>
                <button
                  onClick={() => { clearMemory(); setMsgs([]); setPrefs(loadPrefs()); }}
                  className="ks-ai-chip"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear memory
                </button>
              </div>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {msgs.length === 0 && (
              <div className="rounded-2xl border border-border/50 bg-secondary/20 p-4 text-sm text-muted-foreground">
                <Sparkle className="mb-2 h-4 w-4 text-primary" />
                {GREETING[lang]}
              </div>
            )}
            {msgs.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="max-w-[95%] whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {m.content}
                </div>
              ),
            )}
            {busy && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading the screen…
              </div>
            )}
            {err && (
              <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {err}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 px-4 pb-2">
            {(suggestions.length ? suggestions : QUICK[lang]).slice(0, 4).map((s) => (
              <button key={s} onClick={() => void send(s)} className="ks-ai-chip">{s}</button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); void send(input); }}
            className="flex items-end gap-2 border-t border-border/60 px-3 py-3"
          >
            <button
              type="button"
              onClick={toggleMic}
              aria-label={listening ? "Stop listening" : "Speak to Krish AI"}
              className={`ks-ai-icon ${listening ? "text-primary" : ""}`}
              data-live={listening}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); }
              }}
              placeholder={lang === "te" ? "ఏదైనా అడగండి…" : lang === "hi" ? "कुछ भी पूछें…" : "Ask about this screen…"}
              className="max-h-28 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            {speaking ? (
              <button type="button" onClick={stopSpeaking} aria-label="Stop speaking" className="ks-ai-icon text-primary">
                <VolumeX className="h-4 w-4" />
              </button>
            ) : null}
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
          <button onClick={() => setOpen(false)} className="ks-ai-collapse" aria-label="Collapse assistant">
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </>
  );
}

/** Applies accessibility preferences to the document root. */
function applyA11y(p: AssistantPrefs) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--ks-font-scale", String(p.fontScale ?? 1));
  document.documentElement.classList.toggle("ks-high-contrast", Boolean(p.highContrast));
}
