"use client";
/**
 * KRISH AI — full conversation surface.
 *
 * Composes the UI Context Engine, Conversation Engine, Voice Engine,
 * Navigation/Automation Engine and Memory Service into one premium chat
 * experience. Rendered full-screen by `/ai`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Bot, Mic, MicOff, Send, Volume2, VolumeX, Sparkle, Trash2, BookOpenText,
  Type, Contrast, Camera, Paperclip, X, Square,
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
  en: "I'm Krish AI. I can see the app around you — ask me what a screen means, or tell me where to go.",
  te: "నేను కృష్ AI. యాప్‌లోని స్క్రీన్‌లు నాకు కనిపిస్తాయి — ఏదైనా అడగండి లేదా ఎక్కడికి వెళ్లాలో చెప్పండి.",
  hi: "मैं कृष AI हूँ। ऐप की स्क्रीन मुझे दिखती है — कुछ भी पूछें या बताएं कहाँ जाना है।",
};

const QUICK: Record<Lang, string[]> = {
  en: ["What is this app?", "Open live weather", "Today's market prices", "Best crop for black soil"],
  te: ["ఈ యాప్ ఏంటి?", "వాతావరణం చూపించు", "నేటి మార్కెట్ ధరలు", "నల్ల నేలకు మంచి పంట"],
  hi: ["यह ऐप क्या है?", "मौसम खोलो", "आज के मंडी भाव", "काली मिट्टी की फसल"],
};

const PLACEHOLDERS: Record<Lang, string[]> = {
  en: ["Ask Krish AI anything…", "Which fertilizer for paddy?", "Take me to market prices…", "Is it safe to spray today?"],
  te: ["కృష్ AIని ఏదైనా అడగండి…", "వరికి ఏ ఎరువు?", "మార్కెట్ ధరలు చూపించు…", "ఈరోజు స్ప్రే చేయవచ్చా?"],
  hi: ["कृष AI से कुछ भी पूछें…", "धान के लिए कौन सा उर्वरक?", "मंडी भाव दिखाओ…", "आज छिड़काव करें?"],
};

type Msg = Turn & { id: string; image?: string };

export function AssistantChat() {
  const { lang, setLang } = useI18n();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const ask = useServerFn(askAssistant);

  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [prefs, setPrefs] = useState<AssistantPrefs | null>(null);
  const [a11yOpen, setA11yOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  /* ---------------------------------------------------------------- memory */
  useEffect(() => {
    const p = loadPrefs();
    setPrefs(p);
    applyA11y(p);
    setMsgs(loadTurns().map((t, i) => ({ ...t, id: `${t.at}-${i}` })));
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  useEffect(() => { noteVisit(path); }, [path]);

  useEffect(() => {
    if (msgs.length) saveTurns(msgs.map(({ role, content, at }) => ({ role, content, at })));
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  /* rotating placeholder — a small "alive" typing cue */
  useEffect(() => {
    const id = window.setInterval(() => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS[lang].length), 4200);
    return () => window.clearInterval(id);
  }, [lang]);

  /* auto-expanding textarea */
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [input]);

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
        speak(screenReadout(captureScreen()).slice(0, 3000));
        break;
      }
      case "click": {
        const label = String(a.label ?? "").toLowerCase();
        Array.from(document.querySelectorAll<HTMLElement>("button,a[href],[role='button']"))
          .find((n) => (n.innerText || n.getAttribute("aria-label") || "").toLowerCase().includes(label))
          ?.click();
        break;
      }
      default:
        break;
    }
  }, [navigate, setLang, speak, updatePrefs]);

  /* -------------------------------------------------------------- send turn */
  const send = useCallback(async (raw: string) => {
    const text = raw.trim();
    if ((!text && !attachment) || busy) return;
    setErr(null);
    setInput("");
    setSuggestions([]);
    const image = attachment;
    setAttachment(null);
    if (text) noteQuery(text);
    haptic("tap");
    const now = Date.now();
    const history = msgs.slice(-8).map(({ role, content }) => ({ role, content: content.slice(0, 2000) }));
    setMsgs((m) => [...m, { id: `u${now}`, role: "user", content: text || "What is in this photo?", at: now, image: image ?? undefined }]);
    setBusy(true);
    try {
      const res = await ask({
        data: {
          message: text || "Identify what is in this photo and advise the farmer.",
          lang,
          screen: snapshotToPrompt(captureScreen()).slice(0, 9000),
          history,
          favourites: topScreens(),
          ...(image ? { imageDataUrl: image } : {}),
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
  }, [ask, attachment, busy, lang, msgs, runAction, speak]);

  /* ------------------------------------------------------------ attachments */
  const onPickImage = useCallback((file?: File | null) => {
    if (!file) return;
    if (file.size > 4_000_000) { setErr("Image is too large — please pick one under 4 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setAttachment(String(reader.result)); haptic("select"); };
    reader.readAsDataURL(file);
  }, []);

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

  const pageName = useMemo(
    () => APP_ROUTES.find((r) => r.path === path)?.name ?? "the app",
    [path],
  );

  const status = busy ? "Thinking…" : listening ? "Listening…" : speaking ? "Speaking…" : `Online · watching ${pageName}`;

  return (
    <div className="ks-ai-shell">
      {/* ----------------------------------------------------------- header */}
      <header className="ks-ai-head">
        <span className="ks-ai-avatar" data-live={busy || listening || speaking}>
          <Bot className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-base font-black tracking-[0.18em]">KRISH AI</h1>
          <p className="truncate text-[11px] text-muted-foreground">
            <span className="ks-ai-dot" data-busy={busy} /> {status}
          </p>
        </div>
        <button
          onClick={() => updatePrefs({ voiceReplies: !(prefs?.voiceReplies ?? true) })}
          aria-label={prefs?.voiceReplies ?? true ? "Mute voice replies" : "Unmute voice replies"}
          className="ks-ai-icon"
        >
          {prefs?.voiceReplies ?? true ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
        <button onClick={() => setA11yOpen((v) => !v)} aria-label="Accessibility options" aria-expanded={a11yOpen} className="ks-ai-icon">
          <Type className="h-4 w-4" />
        </button>
      </header>

      {a11yOpen && (
        <div className="ks-ai-a11y">
          <label className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-muted-foreground">Text size</span>
            <input
              type="range" min={0.9} max={1.6} step={0.05}
              value={prefs?.fontScale ?? 1}
              onChange={(e) => updatePrefs({ fontScale: Number(e.target.value) })}
              aria-label="Text size"
              className="min-w-0 flex-1 accent-primary"
            />
            <span className="w-11 shrink-0 text-right tabular-nums">{Math.round((prefs?.fontScale ?? 1) * 100)}%</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => updatePrefs({ highContrast: !(prefs?.highContrast ?? false) })} className="ks-ai-chip">
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

      {/* --------------------------------------------------------- transcript */}
      <div ref={scrollRef} className="ks-ai-scroll" role="log" aria-live="polite">
        {msgs.length === 0 && (
          <div className="ks-ai-welcome">
            <span className="ks-ai-welcome-orb" aria-hidden><Sparkle className="h-6 w-6" /></span>
            <h2 className="font-display text-xl font-black tracking-tight sm:text-2xl">
              {lang === "te" ? "నమస్కారం 🌾" : lang === "hi" ? "नमस्ते 🌾" : "Hello there 🌾"}
            </h2>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">{GREETING[lang]}</p>
            <div className="ks-ai-prompts">
              {QUICK[lang].map((s) => (
                <button key={s} onClick={() => void send(s)} className="ks-ai-prompt">
                  <Sparkle className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="min-w-0">{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m) => (
          <div key={m.id} className={m.role === "user" ? "ks-row ks-row-user" : "ks-row"}>
            {m.role === "assistant" && (
              <span className="ks-ai-badge" aria-hidden><Bot className="h-3.5 w-3.5" /></span>
            )}
            <div className={m.role === "user" ? "ks-bubble ks-bubble-user" : "ks-bubble ks-bubble-ai"}>
              {m.image && <img src={m.image} alt="Attached" className="mb-2 max-h-48 rounded-xl object-cover" />}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {busy && (
          <div className="ks-row">
            <span className="ks-ai-badge" aria-hidden><Bot className="h-3.5 w-3.5" /></span>
            <div className="ks-bubble ks-bubble-ai ks-thinking">
              <span className="ks-dot" /><span className="ks-dot" /><span className="ks-dot" />
              <span className="ks-shimmer">Reading your screen…</span>
            </div>
          </div>
        )}

        {err && <div role="alert" className="ks-ai-error">{err}</div>}
      </div>

      {/* ------------------------------------------------------------ composer */}
      <div className="ks-ai-composer-wrap">
        {(suggestions.length > 0 && msgs.length > 0) && (
          <div className="ks-ai-suggests">
            {suggestions.slice(0, 4).map((s) => (
              <button key={s} onClick={() => void send(s)} className="ks-ai-chip">{s}</button>
            ))}
          </div>
        )}

        {attachment && (
          <div className="ks-ai-attach">
            <img src={attachment} alt="Attachment preview" />
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">Photo ready — ask what it shows.</span>
            <button onClick={() => setAttachment(null)} aria-label="Remove attachment" className="ks-ai-icon">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); void send(input); }}
          className="ks-ai-composer"
          data-focus={listening}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
            placeholder={PLACEHOLDERS[lang][placeholderIdx]}
            aria-label="Message Krish AI"
            className="ks-ai-input"
          />
          <div className="ks-ai-tools">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach an image" className="ks-ai-icon">
                <Paperclip className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => cameraRef.current?.click()} aria-label="Take a photo" className="ks-ai-icon">
                <Camera className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={toggleMic}
                aria-label={listening ? "Stop listening" : "Speak to Krish AI"}
                className="ks-ai-icon"
                data-live={listening}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              {speaking && (
                <button type="button" onClick={stopSpeaking} aria-label="Stop speaking" className="ks-ai-icon" data-live>
                  <Square className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={busy || (!input.trim() && !attachment)}
              aria-label="Send message"
              className="ks-ai-send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <input
            ref={fileRef} type="file" accept="image/*" hidden
            onChange={(e) => { onPickImage(e.target.files?.[0]); e.currentTarget.value = ""; }}
          />
          <input
            ref={cameraRef} type="file" accept="image/*" capture="environment" hidden
            onChange={(e) => { onPickImage(e.target.files?.[0]); e.currentTarget.value = ""; }}
          />
        </form>
        <p className="px-1 pt-2 text-center text-[10px] text-muted-foreground">
          Krish AI can make mistakes — confirm doses with a local soil test.
        </p>
      </div>
    </div>
  );
}

/** Applies accessibility preferences to the document root. */
function applyA11y(p: AssistantPrefs) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--ks-font-scale", String(p.fontScale ?? 1));
  document.documentElement.classList.toggle("ks-high-contrast", Boolean(p.highContrast));
}
