"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Mic, MicOff, X, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { leoChat } from "@/lib/leo.functions";
import { useI18n, type Lang } from "@/lib/i18n";
import { locationStore, useLocation } from "@/lib/location-store";

type Intent =
  | { type: "navigate"; path: string }
  | { type: "setDistrict"; district: string }
  | { type: "setLanguage"; lang: Lang }
  | { type: "openSearch" }
  | { type: "toggleTheme" }
  | null;

type Msg = { role: "user" | "assistant"; content: string };

const LANG_TO_BCP47: Record<Lang, string> = {
  en: "en-IN",
  te: "te-IN",
  hi: "hi-IN",
};

const GREETING: Record<Lang, string> = {
  en: "Hello! I am LEO, your AI farming assistant. Ask me about crops, diseases, fertilizers, or say 'open cotton' to explore.",
  te: "నమస్తే! నేను లియో, మీ AI వ్యవసాయ సహాయకుడిని. పంటలు, తెగుళ్ళు, ఎరువుల గురించి అడగండి.",
  hi: "नमस्ते! मैं लियो हूँ, आपका AI कृषि सहायक। फसलों, बीमारियों, उर्वरकों के बारे में पूछें।",
};

export function LeoAssistant() {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const chat = useServerFn(leoChat);

  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [caption, setCaption] = useState("");
  const [userCaption, setUserCaption] = useState("");
  const [history, setHistory] = useState<Msg[]>([]);
  const [supported, setSupported] = useState(true);
  const [greeted, setGreeted] = useState(false);

  const recRef = useRef<any>(null);
  const langRef = useRef<Lang>(lang);
  langRef.current = lang;

  // Speech synthesis
  const speak = useCallback((text: string) => {
    if (muted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LANG_TO_BCP47[langRef.current];
      u.rate = 1;
      u.pitch = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    } catch {}
  }, [muted]);

  const runIntent = useCallback((intent: Intent) => {
    if (!intent) return;
    switch (intent.type) {
      case "navigate":
        if (typeof intent.path === "string" && intent.path.startsWith("/")) {
          navigate({ to: intent.path as any }).catch(() => {});
        }
        break;
      case "setDistrict":
        locationStore.set({ district: intent.district });
        break;
      case "setLanguage":
        if (intent.lang === "en" || intent.lang === "te" || intent.lang === "hi") {
          try { localStorage.setItem("agri.lang", intent.lang); } catch {}
          window.location.reload();
        }
        break;
      case "toggleTheme":
        document.documentElement.classList.toggle("light");
        break;
      case "openSearch":
        window.dispatchEvent(new CustomEvent("leo:openSearch"));
        break;
    }
  }, [navigate]);

  const ask = useCallback(async (message: string) => {
    if (!message.trim()) return;
    setThinking(true);
    setCaption("");
    const next = [...history, { role: "user" as const, content: message }];
    setHistory(next);
    try {
      const res = await chat({
        data: {
          message,
          lang: langRef.current,
          history: next.slice(-6),
          context: { district: location.district, state: location.state },
        },
      });
      setThinking(false);
      setCaption(res.speak);
      setHistory((h) => [...h, { role: "assistant", content: res.speak }]);
      speak(res.speak);
      runIntent(res.intent as Intent);
    } catch (e: any) {
      setThinking(false);
      const msg = "I couldn't reach the server. Please try again.";
      setCaption(msg);
      speak(msg);
    }
  }, [chat, history, location.district, location.state, runIntent, speak]);

  // Speech recognition
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    try {
      window.speechSynthesis?.cancel();
      const rec = new SR();
      rec.lang = LANG_TO_BCP47[langRef.current];
      rec.interimResults = true;
      rec.continuous = false;
      rec.onstart = () => setListening(true);
      rec.onresult = (e: any) => {
        let interim = "";
        let finalT = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalT += r[0].transcript;
          else interim += r[0].transcript;
        }
        setUserCaption(finalT || interim);
        if (finalT) {
          rec.stop();
          ask(finalT);
        }
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recRef.current = rec;
      rec.start();
    } catch {
      setListening(false);
    }
  }, [ask]);

  const stopListening = useCallback(() => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  // Auto-greet on first open per session
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("leo.greeted");
    if (!seen) {
      const timer = setTimeout(() => {
        setOpen(true);
        const g = GREETING[langRef.current];
        setCaption(g);
        setHistory([{ role: "assistant", content: g }]);
        speak(g);
        sessionStorage.setItem("leo.greeted", "1");
        setGreeted(true);
      }, 3800); // wait for cinematic loader
      return () => clearTimeout(timer);
    } else {
      setGreeted(true);
    }
  }, [speak]);

  // Wake word support: "Hey LEO"
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || !greeted) return;
    let stopped = false;
    let wake: any;
    const start = () => {
      if (stopped || listening || thinking || speaking) return;
      try {
        wake = new SR();
        wake.lang = "en-IN";
        wake.continuous = true;
        wake.interimResults = true;
        wake.onresult = (e: any) => {
          const t = Array.from(e.results as any).map((r: any) => r[0].transcript).join(" ").toLowerCase();
          if (/\b(hey|hi|hello)\s+leo\b/.test(t) || /\bleo\b/.test(t) && t.length < 20) {
            try { wake.stop(); } catch {}
            setOpen(true);
            setTimeout(startListening, 300);
          }
        };
        wake.onerror = () => { try { wake.stop(); } catch {} };
        wake.onend = () => { if (!stopped) setTimeout(start, 1200); };
        wake.start();
      } catch {}
    };
    // Only enable wake word if user has clicked once (autoplay policy safe)
    const enable = () => { window.removeEventListener("click", enable); start(); };
    window.addEventListener("click", enable, { once: true });
    return () => { stopped = true; try { wake?.stop(); } catch {}; window.removeEventListener("click", enable); };
  }, [greeted, startListening, listening, thinking, speaking]);

  return (
    <>
      {/* Floating launcher */}
      <button
        aria-label="Open LEO assistant"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-[70] grid h-16 w-16 place-items-center rounded-full text-primary-foreground shadow-2xl transition hover:scale-105 active:scale-95"
        style={{
          background: "var(--gradient-primary, linear-gradient(135deg,#4ade80,#16a34a))",
          boxShadow: "0 10px 40px -5px color-mix(in oklab, var(--primary, #16a34a) 60%, transparent), 0 0 0 6px color-mix(in oklab, var(--primary, #16a34a) 15%, transparent)",
        }}
      >
        <LeoAvatar active={speaking || listening || thinking} />
      </button>

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-[71] flex justify-end p-2 sm:inset-auto sm:bottom-24 sm:right-5">
          <div
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-border/60 shadow-2xl backdrop-blur-xl"
            style={{ background: "color-mix(in oklab, var(--background) 85%, transparent)" }}
            role="dialog"
            aria-label="LEO AI assistant"
          >
            <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full" style={{ background: "var(--gradient-primary)" }}>
                  <LeoAvatar active={speaking || listening || thinking} small />
                </div>
                <div>
                  <div className="text-sm font-semibold">LEO</div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {thinking ? "Thinking…" : listening ? "Listening…" : speaking ? "Speaking…" : "Live"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  aria-label={muted ? "Unmute" : "Mute"}
                  onClick={() => { setMuted((m) => !m); window.speechSynthesis?.cancel(); }}
                  className="rounded-full p-2 hover:bg-secondary"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <button aria-label="Close" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-secondary">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div className="max-h-[45dvh] overflow-y-auto px-4 py-3 text-sm">
              {history.length === 0 && (
                <p className="text-muted-foreground">{GREETING[lang]}</p>
              )}
              <ul className="space-y-2">
                {history.slice(-8).map((m, i) => (
                  <li key={i} className={m.role === "user" ? "text-right" : ""}>
                    <span
                      className={
                        m.role === "user"
                          ? "inline-block max-w-[85%] rounded-2xl rounded-br-md bg-primary/15 px-3 py-2 text-foreground"
                          : "inline-block max-w-[95%] rounded-2xl rounded-bl-md bg-secondary px-3 py-2 text-foreground"
                      }
                    >
                      {m.content}
                    </span>
                  </li>
                ))}
              </ul>
              {userCaption && listening && (
                <p className="mt-2 text-right text-xs italic text-muted-foreground">"{userCaption}"</p>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-border/60 px-3 py-3">
              <button
                onClick={listening ? stopListening : startListening}
                aria-label={listening ? "Stop listening" : "Start voice"}
                className="grid h-11 w-11 place-items-center rounded-full text-primary-foreground transition"
                style={{
                  background: listening ? "#ef4444" : "var(--gradient-primary)",
                  boxShadow: listening ? "0 0 0 6px rgba(239,68,68,0.25)" : "0 0 0 4px color-mix(in oklab, var(--primary) 20%, transparent)",
                }}
              >
                {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              <form
                className="flex-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const msg = String(fd.get("q") || "");
                  (e.currentTarget as HTMLFormElement).reset();
                  ask(msg);
                }}
              >
                <input
                  name="q"
                  placeholder={supported ? "Speak or type…" : "Type your question…"}
                  className="w-full rounded-full border border-border/60 bg-background/60 px-4 py-2 text-sm outline-none focus:border-primary"
                  autoComplete="off"
                />
              </form>
              <div className="hidden text-xs text-muted-foreground sm:block">
                <Sparkles className="inline h-3 w-3" /> {lang.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LeoAvatar({ active, small = false }: { active: boolean; small?: boolean }) {
  const size = small ? 22 : 30;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <radialGradient id="leo-eye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#dcfce7" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#leo-eye)" opacity="0.15" />
      <circle
        cx="16"
        cy="16"
        r={active ? 8 : 6}
        fill="url(#leo-eye)"
        style={{ transition: "r 0.3s ease" }}
      />
      <circle cx="16" cy="16" r="3" fill="#052e16">
        <animate attributeName="r" values="3;3.6;3" dur="2.4s" repeatCount="indefinite" />
      </circle>
      {active && (
        <circle cx="16" cy="16" r="12" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1">
          <animate attributeName="r" values="8;15;8" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}
