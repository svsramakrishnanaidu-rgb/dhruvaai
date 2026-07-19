"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Mic, MicOff, X, Sparkles, Volume2, VolumeX, Camera, Loader2, Star } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { leoChat, leoIdentify } from "@/lib/leo.functions";
import { useI18n, type Lang } from "@/lib/i18n";
import { locationStore, useLocation } from "@/lib/location-store";
import { leoMemory, useLeoMemory } from "@/lib/leo-memory";
import { CROP_LIST } from "@/data/crops";

type Intent =
  | { type: "navigate"; path: string; highlight?: string }
  | { type: "setDistrict"; district: string }
  | { type: "setLanguage"; lang: Lang }
  | { type: "openSearch" }
  | { type: "toggleTheme" }
  | { type: "favorite"; slug: string }
  | null;

type Msg = { role: "user" | "assistant"; content: string };

const LANG_TO_BCP47: Record<Lang, string> = { en: "en-IN", te: "te-IN", hi: "hi-IN" };

const GREETING: Record<Lang, string> = {
  en: "Hello! I am LEO, your AI farming assistant. Ask me about crops, diseases, fertilizers, or say 'open cotton' to explore.",
  te: "నమస్తే! నేను లియో, మీ AI వ్యవసాయ సహాయకుడిని. పంటలు, తెగుళ్ళు, ఎరువుల గురించి అడగండి.",
  hi: "नमस्ते! मैं लियो हूँ, आपका AI कृषि सहायक। फसलों, बीमारियों, उर्वरकों के बारे में पूछें।",
};

const CROP_SLUGS = CROP_LIST.map((c) => c.slug);

export function LeoAssistant() {
  const { lang, setLang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const memory = useLeoMemory();
  const chat = useServerFn(leoChat);
  const identify = useServerFn(leoIdentify);

  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [captionUser, setCaptionUser] = useState("");
  const [captionLeo, setCaptionLeo] = useState("");
  const [history, setHistory] = useState<Msg[]>([]);
  const [supported, setSupported] = useState(true);
  const [greeted, setGreeted] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [idResult, setIdResult] = useState<any>(null);

  const recRef = useRef<any>(null);
  const interruptRef = useRef<any>(null);
  const langRef = useRef<Lang>(lang);
  langRef.current = lang;
  const speakingRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // === TTS ===
  const stopSpeaking = useCallback(() => {
    try { window.speechSynthesis?.cancel(); } catch {}
    setSpeaking(false);
    speakingRef.current = false;
    try { interruptRef.current?.stop(); } catch {}
  }, []);

  const speak = useCallback((text: string) => {
    if (muted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LANG_TO_BCP47[langRef.current];
      u.rate = 1;
      u.pitch = 1;
      u.onstart = () => { setSpeaking(true); speakingRef.current = true; };
      u.onend = () => { setSpeaking(false); speakingRef.current = false; };
      u.onerror = () => { setSpeaking(false); speakingRef.current = false; };
      window.speechSynthesis.speak(u);
    } catch {}
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
          setLang(intent.lang); // instant, no reload
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

  // === Ask ===
  const ask = useCallback(async (message: string) => {
    if (!message.trim()) return;
    setThinking(true);
    setCaptionLeo("");
    leoMemory.setLastQuery(message);
    const next = [...history, { role: "user" as const, content: message }];
    setHistory(next);
    try {
      const res = await chat({
        data: {
          message,
          lang: langRef.current,
          history: next.slice(-6),
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
      setHistory((h) => [...h, { role: "assistant", content: res.speak }]);
      speak(res.speak);
      runIntent(res.intent as Intent);
    } catch {
      setThinking(false);
      const msg = "I couldn't reach the server. Please try again.";
      setCaptionLeo(msg);
      speak(msg);
    }
  }, [chat, history, location.district, location.state, memory.recentCrops, memory.favorites, runIntent, speak]);

  // === Main STT ===
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    stopSpeaking();
    try {
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
        setCaptionUser(finalT || interim);
        if (finalT) {
          try { rec.stop(); } catch {}
          ask(finalT);
        }
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recRef.current = rec;
      rec.start();
    } catch { setListening(false); }
  }, [ask, stopSpeaking]);

  const stopListening = useCallback(() => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  // === Voice interruption: listen for speech while LEO is speaking ===
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
        // Any interim transcript longer than a few chars means the user is speaking over LEO.
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

  // === Auto-greet ===
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("leo.greeted")) { setGreeted(true); return; }
    const timer = setTimeout(() => {
      setOpen(true);
      const g = GREETING[langRef.current];
      setCaptionLeo(g);
      setHistory([{ role: "assistant", content: g }]);
      speak(g);
      sessionStorage.setItem("leo.greeted", "1");
      setGreeted(true);
    }, 3800);
    return () => clearTimeout(timer);
  }, [speak]);

  // === Re-greet on language change (after greeted) ===
  useEffect(() => {
    if (!greeted) return;
    stopSpeaking();
    // Silent update — do not re-announce unless user is listening
    if (typeof window !== "undefined") {
      try { document.documentElement.lang = lang; } catch {}
    }
  }, [lang, greeted, stopSpeaking]);

  // === Wake word "Hey LEO" ===
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || !greeted) return;
    let stopped = false;
    let wake: any;
    const start = () => {
      if (stopped || listening || thinking || speakingRef.current) return;
      try {
        wake = new SR();
        wake.lang = "en-IN";
        wake.continuous = true;
        wake.interimResults = true;
        wake.onresult = (e: any) => {
          const t = Array.from(e.results as any).map((r: any) => r[0].transcript).join(" ").toLowerCase();
          if (/\b(hey|hi|hello)\s+leo\b/.test(t)) {
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
  }, [greeted, startListening, listening, thinking]);

  // === Image identification ===
  const handleFile = useCallback(async (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) {
      setCaptionLeo("Image too large — please pick one under 8MB.");
      return;
    }
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
        setHistory((h) => [...h, { role: "assistant", content: `[Photo ID] ${res.summary}` }]);
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

  // === Auto-record crop route visits ===
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => {
      const m = window.location.pathname.match(/^\/crops\/([\w-]+)$/);
      if (m) leoMemory.recordCrop(m[1]);
    };
    onPop();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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
            style={{ background: "color-mix(in oklab, var(--background) 88%, transparent)" }}
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
                    {thinking ? "Thinking…" : listening ? "Listening…" : speaking ? "Speaking…" : identifying ? "Analyzing…" : "Live"}
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
                <button aria-label="Close" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-secondary">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {/* Memory strip */}
            {(memory.recentCrops.length > 0 || memory.favorites.length > 0) && (
              <div className="flex flex-wrap gap-1 border-b border-border/50 px-3 py-2 text-xs">
                {memory.favorites.slice(0, 3).map((s) => (
                  <button key={"f"+s} onClick={() => navigate({ to: `/crops/${s}` as any })} className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-500">
                    <Star className="h-3 w-3 fill-current" />{s}
                  </button>
                ))}
                {memory.recentCrops.slice(0, 4).map((s) => (
                  <button key={"r"+s} onClick={() => navigate({ to: `/crops/${s}` as any })} className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground hover:text-foreground">
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="max-h-[40dvh] overflow-y-auto px-4 py-3 text-sm">
              {history.length === 0 && (
                <p className="text-muted-foreground">{GREETING[lang]}</p>
              )}
              <ul className="space-y-2">
                {history.slice(-8).map((m, i) => (
                  <li key={i} className={m.role === "user" ? "text-right" : ""}>
                    <span className={m.role === "user"
                      ? "inline-block max-w-[85%] rounded-2xl rounded-br-md bg-primary/15 px-3 py-2"
                      : "inline-block max-w-[95%] rounded-2xl rounded-bl-md bg-secondary px-3 py-2"}>
                      {m.content}
                    </span>
                  </li>
                ))}
              </ul>

              {identifying && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Analyzing photo…
                </div>
              )}
              {idResult && idResult.topMatches?.length > 0 && (
                <div className="mt-3 space-y-2 rounded-xl border border-border/60 bg-background/40 p-3 text-xs">
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
              <button
                aria-label="Identify plant from photo"
                onClick={() => fileRef.current?.click()}
                className="grid h-11 w-11 place-items-center rounded-full border border-border/60 hover:bg-secondary"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
              />
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
                  placeholder={supported ? "Speak, type, or upload a photo…" : "Type your question…"}
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
      <circle cx="16" cy="16" r={active ? 8 : 6} fill="url(#leo-eye)" style={{ transition: "r 0.3s ease" }} />
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
