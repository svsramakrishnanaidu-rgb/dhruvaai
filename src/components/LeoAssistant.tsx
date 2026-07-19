"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Mic, MicOff, X, Volume2, VolumeX, Camera, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { leoChat, leoIdentify } from "@/lib/leo.functions";
import { useI18n, type Lang } from "@/lib/i18n";
import { locationStore, useLocation } from "@/lib/location-store";
import { leoMemory, useLeoMemory } from "@/lib/leo-memory";
import { CROP_LIST } from "@/data/crops";
import { useReducedMotion } from "@/lib/reduced-motion";

type Intent =
  | { type: "navigate"; path: string; highlight?: string }
  | { type: "setDistrict"; district: string }
  | { type: "setLanguage"; lang: Lang }
  | { type: "openSearch" }
  | { type: "toggleTheme" }
  | { type: "favorite"; slug: string }
  | null;

const LANG_TO_BCP47: Record<Lang, string> = { en: "en-IN", te: "te-IN", hi: "hi-IN" };

const GREETING: Record<Lang, string> = {
  en: "Hello! I am LEO, your voice-first farming assistant. Just speak — ask me about crops, diseases, fertilizers, or say 'open cotton' and I'll take you there.",
  te: "నమస్తే! నేను లియో, మీ వాయిస్ ఆధారిత వ్యవసాయ సహాయకుడిని. మాట్లాడండి — పంటలు, తెగుళ్ళు, ఎరువుల గురించి అడగండి.",
  hi: "नमस्ते! मैं लियो हूँ, आपका वॉइस-आधारित कृषि सहायक। बस बोलिए — फसलों, बीमारियों, उर्वरकों के बारे में पूछें।",
};

const STATE_LABEL: Record<Lang, { listening: string; thinking: string; speaking: string; idle: string; muted: string; identifying: string }> = {
  en: { listening: "Listening…", thinking: "Thinking…", speaking: "Speaking…", idle: "Ready", muted: "Muted", identifying: "Analyzing photo…" },
  te: { listening: "వింటున్నాను…", thinking: "ఆలోచిస్తున్నాను…", speaking: "మాట్లాడుతున్నాను…", idle: "సిద్ధం", muted: "మ్యూట్", identifying: "చిత్రాన్ని విశ్లేషిస్తున్నాను…" },
  hi: { listening: "सुन रहा हूँ…", thinking: "सोच रहा हूँ…", speaking: "बोल रहा हूँ…", idle: "तैयार", muted: "म्यूट", identifying: "फ़ोटो जाँच रहा हूँ…" },
};

const CROP_SLUGS = CROP_LIST.map((c) => c.slug);

export function LeoAssistant() {
  const { lang, setLang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const memory = useLeoMemory();
  const chat = useServerFn(leoChat);
  const identify = useServerFn(leoIdentify);
  const reducedMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [captionUser, setCaptionUser] = useState("");
  const [captionLeo, setCaptionLeo] = useState("");
  const [supported, setSupported] = useState(true);
  const [greeted, setGreeted] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [idResult, setIdResult] = useState<any>(null);

  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const pushHistory = (role: "user" | "assistant", content: string) => {
    historyRef.current = [...historyRef.current, { role, content }].slice(-12);
  };
  const recRef = useRef<any>(null);
  const interruptRef = useRef<any>(null);
  const langRef = useRef<Lang>(lang);
  langRef.current = lang;
  const speakingRef = useRef(false);
  const listeningRef = useRef(false);
  const conversationRef = useRef(true); // continuous voice mode is always on when open
  const fileRef = useRef<HTMLInputElement>(null);

  // === TTS ===
  const stopSpeaking = useCallback(() => {
    try { window.speechSynthesis?.cancel(); } catch {}
    setSpeaking(false);
    speakingRef.current = false;
    try { interruptRef.current?.stop(); } catch {}
  }, []);

  const speak = useCallback((text: string, onDone?: () => void) => {
    if (muted || typeof window === "undefined" || !("speechSynthesis" in window)) {
      onDone?.();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LANG_TO_BCP47[langRef.current];
      u.rate = 1;
      u.pitch = 1;
      // Try to pick an expressive voice matching the requested language.
      try {
        const voices = window.speechSynthesis.getVoices();
        const match = voices.find((v) => v.lang?.toLowerCase().startsWith(u.lang.toLowerCase().slice(0, 2)));
        if (match) u.voice = match;
      } catch {}
      u.onstart = () => { setSpeaking(true); speakingRef.current = true; };
      u.onend = () => { setSpeaking(false); speakingRef.current = false; onDone?.(); };
      u.onerror = () => { setSpeaking(false); speakingRef.current = false; onDone?.(); };
      window.speechSynthesis.speak(u);
    } catch { onDone?.(); }
  }, [muted]);

  // === Intents ===
  const runIntent = useCallback((intent: Intent) => {
    if (!intent) return;
    switch (intent.type) {
      case "navigate":
        if (typeof intent.path === "string" && intent.path.startsWith("/")) {
          if (intent.highlight) {
            try { sessionStorage.setItem("leo.highlight", intent.highlight); } catch {}
          }
          navigate({ to: intent.path as any }).catch(() => {});
          const m = intent.path.match(/^\/crops\/([\w-]+)$/);
          if (m) leoMemory.recordCrop(m[1]);
        }
        break;
      case "setDistrict":
        locationStore.set({ district: intent.district });
        break;
      case "setLanguage":
        if (intent.lang === "en" || intent.lang === "te" || intent.lang === "hi") {
          setLang(intent.lang);
        }
        break;
      case "toggleTheme":
        document.documentElement.classList.toggle("light");
        break;
      case "openSearch":
        window.dispatchEvent(new CustomEvent("leo:openSearch"));
        break;
      case "favorite":
        if (intent.slug) leoMemory.toggleFavorite(intent.slug);
        break;
    }
  }, [navigate, setLang]);

  // Forward decl so ask() can restart listening after LEO finishes speaking.
  const startListeningRef = useRef<() => void>(() => {});

  // === Ask ===
  const ask = useCallback(async (message: string) => {
    if (!message.trim()) return;
    setThinking(true);
    setCaptionLeo("");
    leoMemory.setLastQuery(message);
    historyRef.current = [...historyRef.current, { role: "user", content: message }].slice(-12);
    try {
      const res = await chat({
        data: {
          message,
          lang: langRef.current,
          history: historyRef.current.slice(-6),
          context: {
            district: location.district,
            state: location.state,
            recentCrops: memory.recentCrops,
            favorites: memory.favorites,
          },
          cropSlugs: CROP_SLUGS,
        },
      });
      setThinking(false);
      setCaptionLeo(res.speak);
      historyRef.current = [...historyRef.current, { role: "assistant", content: res.speak }].slice(-12);
      speak(res.speak, () => {
        // Continuous conversation: hand the mic back to the user automatically.
        if (conversationRef.current && open) setTimeout(() => startListeningRef.current(), 250);
      });
      runIntent(res.intent as Intent);
    } catch {
      setThinking(false);
      const fallback: Record<Lang, string> = {
        en: "I couldn't reach the server. Please try again.",
        te: "సర్వర్‌ను చేరుకోలేకపోయాను. మళ్ళీ ప్రయత్నించండి.",
        hi: "सर्वर तक नहीं पहुँच सका। कृपया पुनः प्रयास करें।",
      };
      const msg = fallback[langRef.current];
      setCaptionLeo(msg);
      speak(msg);
    }
  }, [chat, location.district, location.state, memory.recentCrops, memory.favorites, runIntent, speak, open]);

  // === Main STT ===
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    if (listeningRef.current) return;
    stopSpeaking();
    try {
      const rec = new SR();
      rec.lang = LANG_TO_BCP47[langRef.current];
      rec.interimResults = true;
      rec.continuous = false;
      rec.onstart = () => { setListening(true); listeningRef.current = true; setCaptionUser(""); };
      rec.onresult = (e: any) => {
        let interim = "";
        let finalT = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalT += r[0].transcript;
          else interim += r[0].transcript;
        }
        setCaptionUser(finalT || interim);
        if (finalT) {
          try { rec.stop(); } catch {}
          ask(finalT);
        }
      };
      rec.onerror = () => { setListening(false); listeningRef.current = false; };
      rec.onend = () => { setListening(false); listeningRef.current = false; };
      recRef.current = rec;
      rec.start();
    } catch { setListening(false); listeningRef.current = false; }
  }, [ask, stopSpeaking]);

  startListeningRef.current = startListening;

  const stopListening = useCallback(() => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
    listeningRef.current = false;
  }, []);

  // === Barge-in: detect user speech while LEO is speaking ===
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || !speaking) return;
    let rec: any;
    try {
      rec = new SR();
      rec.lang = LANG_TO_BCP47[langRef.current];
      rec.continuous = true;
      rec.interimResults = true;
      let triggered = false;
      rec.onresult = (e: any) => {
        const t = Array.from(e.results as any).map((r: any) => r[0].transcript).join("").trim();
        if (!triggered && t.length > 3) {
          triggered = true;
          try { rec.stop(); } catch {}
          stopSpeaking();
          setTimeout(startListening, 150);
        }
      };
      rec.onerror = () => {};
      rec.onend = () => {};
      interruptRef.current = rec;
      rec.start();
    } catch {}
    return () => { try { rec?.stop(); } catch {} };
  }, [speaking, startListening, stopSpeaking]);

  // === Auto-greet on first visit ===
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("leo.greeted")) { setGreeted(true); return; }
    const timer = setTimeout(() => {
      setOpen(true);
      const g = GREETING[langRef.current];
      setCaptionLeo(g);
      historyRef.current = [{ role: "assistant", content: g }];
      speak(g, () => {
        // Hand the mic to the user immediately after the greeting.
        if (conversationRef.current) setTimeout(startListening, 300);
      });
      sessionStorage.setItem("leo.greeted", "1");
      setGreeted(true);
    }, 3200);
    return () => clearTimeout(timer);
  }, [speak, startListening]);

  // === Update html lang instantly when i18n changes ===
  useEffect(() => {
    if (typeof window !== "undefined") {
      try { document.documentElement.lang = lang; } catch {}
    }
  }, [lang]);

  // === Wake word "Hey LEO" ===
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || !greeted) return;
    let stopped = false;
    let wake: any;
    const start = () => {
      if (stopped || listeningRef.current || thinking || speakingRef.current || open) return;
      try {
        wake = new SR();
        wake.lang = "en-IN";
        wake.continuous = true;
        wake.interimResults = true;
        wake.onresult = (e: any) => {
          const t = Array.from(e.results as any).map((r: any) => r[0].transcript).join(" ").toLowerCase();
          if (/\b(hey|hi|hello|ok)\s+leo\b/.test(t)) {
            try { wake.stop(); } catch {}
            setOpen(true);
            setTimeout(startListening, 250);
          }
        };
        wake.onerror = () => { try { wake.stop(); } catch {} };
        wake.onend = () => { if (!stopped) setTimeout(start, 1500); };
        wake.start();
      } catch {}
    };
    const enable = () => { window.removeEventListener("click", enable); start(); };
    window.addEventListener("click", enable, { once: true });
    return () => { stopped = true; try { wake?.stop(); } catch {}; window.removeEventListener("click", enable); };
  }, [greeted, startListening, thinking, open]);

  // === Vision identification ===
  const handleFile = useCallback(async (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) { setCaptionLeo("Image too large — please pick one under 8MB."); return; }
    setIdentifying(true);
    setIdResult(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = String(reader.result || "");
        const res = await identify({ data: { imageDataUrl: dataUrl, lang: langRef.current, kind: "any" } });
        setIdResult(res);
        setIdentifying(false);
        setCaptionLeo(res.summary);
        speak(`${res.summary}. ${res.advice}`);
        if (res.topMatches?.[0]?.name) leoMemory.recordDisease(res.topMatches[0].name);
      } catch {
        setIdentifying(false);
        const msg = "I couldn't analyze that photo. Try a clearer close-up.";
        setCaptionLeo(msg);
        speak(msg);
      }
    };
    reader.readAsDataURL(file);
  }, [identify, speak]);

  // === Track crop route visits ===
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    const m = pathname.match(/^\/crops\/([\w-]+)$/);
    if (m) leoMemory.recordCrop(m[1]);
  }, [pathname]);

  const labels = STATE_LABEL[lang];
  const status = muted ? labels.muted
    : identifying ? labels.identifying
    : thinking ? labels.thinking
    : speaking ? labels.speaking
    : listening ? labels.listening
    : labels.idle;

  return (
    <>
      {/* Live captions overlay */}
      {(captionUser || captionLeo || thinking) && (open || speaking || listening) && (
        <div className="pointer-events-none fixed inset-x-0 top-[76px] z-[68] flex justify-center px-3">
          <div className="max-w-3xl space-y-1 rounded-2xl border border-border/50 bg-background/70 px-4 py-2 text-center text-sm shadow-lg backdrop-blur-xl">
            {captionUser && listening && (
              <p className="text-primary"><span className="opacity-60">You:</span> {captionUser}</p>
            )}
            {(captionLeo || thinking) && (
              <p><span className="opacity-60">LEO:</span> {thinking ? "…" : captionLeo}</p>
            )}
          </div>
        </div>
      )}

      {/* Floating launcher */}
      <button
        aria-label={open ? "Close LEO voice assistant" : "Open LEO voice assistant"}
        aria-pressed={open}
        onClick={() => {
          const nowOpen = !open;
          setOpen(nowOpen);
          if (nowOpen && !listening && !speaking) setTimeout(startListening, 150);
          if (!nowOpen) { stopListening(); stopSpeaking(); }
        }}
        className="fixed bottom-5 right-5 z-[70] grid h-16 w-16 place-items-center rounded-full text-primary-foreground shadow-2xl transition hover:scale-105 active:scale-95"
        style={{
          background: "var(--gradient-primary, linear-gradient(135deg,#4ade80,#16a34a))",
          boxShadow: "0 10px 40px -5px color-mix(in oklab, var(--primary, #16a34a) 60%, transparent), 0 0 0 6px color-mix(in oklab, var(--primary, #16a34a) 15%, transparent)",
        }}
      >
        <LeoAvatar active={speaking || listening || thinking} reducedMotion={reducedMotion} />
      </button>

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-[71] flex justify-end p-2 sm:inset-auto sm:bottom-24 sm:right-5">
          <div
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-border/60 shadow-2xl backdrop-blur-xl"
            style={{ background: "color-mix(in oklab, var(--background) 88%, transparent)" }}
            role="dialog"
            aria-label="LEO voice assistant"
          >
            <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full" style={{ background: "var(--gradient-primary)" }}>
                  <LeoAvatar active={speaking || listening || thinking} small reducedMotion={reducedMotion} />
                </div>
                <div>
                  <div className="text-sm font-semibold">LEO</div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground" aria-live="polite">
                    {status}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  aria-label={muted ? "Unmute" : "Mute"}
                  onClick={() => { setMuted((m) => !m); stopSpeaking(); }}
                  className="rounded-full p-2 hover:bg-secondary"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <button
                  aria-label="Close"
                  onClick={() => { setOpen(false); stopListening(); stopSpeaking(); }}
                  className="rounded-full p-2 hover:bg-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {/* Voice stage — big avatar + waveform, no chat bubbles */}
            <div className="relative grid place-items-center px-6 pb-4 pt-6">
              <VoiceOrb active={speaking || listening} thinking={thinking} reducedMotion={reducedMotion} />
              <Waveform active={listening || speaking} reducedMotion={reducedMotion} />
              <p className="mt-3 min-h-[2.5rem] text-center text-sm text-muted-foreground">
                {listening && captionUser ? <span className="text-primary">{captionUser}</span>
                  : thinking ? "…"
                  : captionLeo || (!greeted ? GREETING[lang] : "")}
              </p>
            </div>

            {/* Vision result panel (if user uploaded a photo) */}
            {(identifying || idResult) && (
              <div className="mx-4 mb-3 rounded-2xl border border-border/60 bg-background/50 p-3 text-xs">
                {identifying && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> {labels.identifying}
                  </div>
                )}
                {idResult && idResult.topMatches?.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold text-foreground">Top matches</div>
                    {idResult.topMatches.map((t: any, i: number) => (
                      <div key={i} className="rounded-lg bg-secondary/70 p-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{t.name}</span>
                          <span className="text-muted-foreground">{t.confidence}%</span>
                        </div>
                        {t.scientificName && <div className="italic text-muted-foreground">{t.scientificName}</div>}
                        {t.symptoms && <div className="mt-1"><b>Symptoms:</b> {t.symptoms}</div>}
                        {t.organicControl && <div><b>Organic:</b> {t.organicControl}</div>}
                        {t.chemicalControl && <div><b>Chemical:</b> {t.chemicalControl}</div>}
                      </div>
                    ))}
                    {idResult.advice && <p className="text-muted-foreground">{idResult.advice}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Controls — voice only. Mic + camera. No text input. */}
            <div className="flex items-center justify-center gap-4 border-t border-border/60 px-4 py-4">
              <button
                aria-label="Identify plant from photo"
                onClick={() => fileRef.current?.click()}
                className="grid h-12 w-12 place-items-center rounded-full border border-border/60 hover:bg-secondary"
              >
                <Camera className="h-5 w-5" />
              </button>
              <button
                onClick={listening ? stopListening : startListening}
                aria-label={listening ? "Stop listening" : "Start voice"}
                aria-pressed={listening}
                className="grid h-16 w-16 place-items-center rounded-full text-primary-foreground transition"
                style={{
                  background: listening ? "#ef4444" : "var(--gradient-primary)",
                  boxShadow: listening
                    ? "0 0 0 10px rgba(239,68,68,0.20), 0 0 0 20px rgba(239,68,68,0.10)"
                    : "0 0 0 6px color-mix(in oklab, var(--primary) 22%, transparent)",
                }}
              >
                {listening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>
              <div className="grid h-12 w-12 place-items-center rounded-full border border-border/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {lang}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
              />
            </div>

            {!supported && (
              <p className="border-t border-border/60 px-4 py-3 text-center text-xs text-muted-foreground">
                Voice recognition isn't supported in this browser. Try Chrome, Edge, or Safari on a recent device.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function VoiceOrb({ active, thinking, reducedMotion }: { active: boolean; thinking: boolean; reducedMotion: boolean }) {
  const pulse = active && !reducedMotion;
  return (
    <div className="relative grid h-32 w-32 place-items-center">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--primary) 70%, white), color-mix(in oklab, var(--primary) 45%, transparent) 60%, transparent 75%)",
          filter: pulse ? "blur(6px)" : "blur(2px)",
          animation: pulse ? "leo-orb-pulse 2.4s ease-in-out infinite" : undefined,
        }}
      />
      <div
        className="relative grid h-24 w-24 place-items-center rounded-full text-primary-foreground"
        style={{
          background: "var(--gradient-primary)",
          boxShadow: "0 20px 60px -20px color-mix(in oklab, var(--primary) 60%, transparent)",
        }}
      >
        {thinking ? <Loader2 className="h-8 w-8 animate-spin" /> : <LeoAvatar active={active} reducedMotion={reducedMotion} large />}
      </div>
      <style>{`@keyframes leo-orb-pulse { 0%,100% { transform: scale(1); opacity: .85 } 50% { transform: scale(1.08); opacity: 1 } }`}</style>
    </div>
  );
}

function Waveform({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const bars = useMemo(() => new Array(14).fill(0), []);
  return (
    <div className="mt-3 flex h-8 items-center gap-1" aria-hidden="true">
      {bars.map((_, i) => (
        <span
          key={i}
          className={active ? "leo-wave-bar" : ""}
          style={{
            display: "inline-block",
            width: 3,
            height: 26,
            borderRadius: 2,
            background: "color-mix(in oklab, var(--primary) 75%, transparent)",
            animationDelay: `${(i % 7) * 90}ms`,
            transform: active && !reducedMotion ? undefined : "scaleY(0.35)",
            opacity: active ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );
}

function LeoAvatar({ active, small = false, large = false, reducedMotion }: { active: boolean; small?: boolean; large?: boolean; reducedMotion: boolean }) {
  const size = large ? 56 : small ? 22 : 30;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <radialGradient id="leo-eye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#dcfce7" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#leo-eye)" opacity="0.15" />
      <circle cx="16" cy="16" r={active ? 8 : 6} fill="url(#leo-eye)" style={{ transition: "r 0.3s ease" }} />
      <circle cx="16" cy="16" r="3" fill="#052e16">
        {!reducedMotion && (
          <animate attributeName="r" values="3;3.6;3" dur="2.4s" repeatCount="indefinite" />
        )}
      </circle>
      {active && !reducedMotion && (
        <circle cx="16" cy="16" r="12" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1">
          <animate attributeName="r" values="8;15;8" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}
