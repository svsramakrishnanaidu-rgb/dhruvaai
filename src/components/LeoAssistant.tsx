"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Mic, MicOff, X, Volume2, VolumeX, Camera, Loader2, Settings2, Play, Square } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { leoChat, leoIdentify } from "@/lib/leo.functions";
import { useI18n, type Lang } from "@/lib/i18n";
import { locationStore, useLocation } from "@/lib/location-store";
import { leoMemory, useLeoMemory } from "@/lib/leo-memory";
import { CROP_LIST } from "@/data/crops";
import { useReducedMotion } from "@/lib/reduced-motion";
import { useLeoSettings, PERSONAS, pickVoice } from "@/lib/leo-settings";
import { LeoAvatarAnime } from "./LeoAvatarAnime";
import { LeoSettingsPanel } from "./LeoSettingsPanel";

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
  en: "Hi! I'm LEO, your voice-first farming assistant. Ask about crops, diseases, fertilizers, or say 'open cotton' and I'll take you there.",
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
  const settings = useLeoSettings();
  const chat = useServerFn(leoChat);
  const identify = useServerFn(leoIdentify);
  const reducedMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [captionUser, setCaptionUser] = useState("");
  const [captionLeo, setCaptionLeo] = useState("");
  const [lastReply, setLastReply] = useState("");   // for manual Speak
  const [supported, setSupported] = useState(true);
  const [greeted, setGreeted] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [idResult, setIdResult] = useState<any>(null);
  const [mouth, setMouth] = useState(0);            // 0..1 lip-sync level
  const [summoning, setSummoning] = useState(false); // burst animation on wake / open

  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const pushHistory = (role: "user" | "assistant", content: string) => {
    historyRef.current = [...historyRef.current, { role, content }].slice(-12);
  };
  const recRef = useRef<any>(null);
  const interruptRef = useRef<any>(null);
  const langRef = useRef<Lang>(lang);
  langRef.current = lang;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const speakingRef = useRef(false);
  const listeningRef = useRef(false);
  const conversationRef = useRef(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const mouthRAF = useRef<number | null>(null);

  // === Lip-sync driver: sine-modulated envelope while speaking ===
  useEffect(() => {
    if (!speaking) {
      if (mouthRAF.current) cancelAnimationFrame(mouthRAF.current);
      setMouth(0);
      return;
    }
    let t0 = performance.now();
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      // Layered sine waves emulate phoneme envelope
      const v = 0.45
        + 0.35 * Math.sin(t * 11)
        + 0.20 * Math.sin(t * 4.7 + 1.3)
        + 0.10 * Math.sin(t * 23 + 0.5);
      const clamped = Math.max(0.05, Math.min(1, (v + 0.4) / 1.6));
      setMouth(clamped);
      mouthRAF.current = requestAnimationFrame(tick);
    };
    mouthRAF.current = requestAnimationFrame(tick);
    return () => { if (mouthRAF.current) cancelAnimationFrame(mouthRAF.current); };
  }, [speaking]);

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
      const s = settingsRef.current;
      const persona = PERSONAS.find((p) => p.id === s.persona)!;
      const targetLang = s.voiceLang || LANG_TO_BCP47[langRef.current];
      const u = new SpeechSynthesisUtterance(text);
      u.lang = targetLang;
      u.rate = Math.max(0.5, Math.min(1.8, s.rate)) * persona.rate;
      u.pitch = Math.max(0.1, Math.min(2, persona.pitch));
      try {
        const voices = window.speechSynthesis.getVoices();
        const match = pickVoice(voices, s.persona, targetLang);
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
          if (intent.highlight) { try { sessionStorage.setItem("leo.highlight", intent.highlight); } catch {} }
          navigate({ to: intent.path as any }).catch(() => {});
          const m = intent.path.match(/^\/crops\/([\w-]+)$/);
          if (m) leoMemory.recordCrop(m[1]);
        }
        break;
      case "setDistrict": locationStore.set({ district: intent.district }); break;
      case "setLanguage":
        if (intent.lang === "en" || intent.lang === "te" || intent.lang === "hi") setLang(intent.lang);
        break;
      case "toggleTheme": document.documentElement.classList.toggle("light"); break;
      case "openSearch": window.dispatchEvent(new CustomEvent("leo:openSearch")); break;
      case "favorite": if (intent.slug) leoMemory.toggleFavorite(intent.slug); break;
    }
  }, [navigate, setLang]);

  const startListeningRef = useRef<() => void>(() => {});

  // === Ask ===
  const ask = useCallback(async (message: string) => {
    if (!message.trim()) return;
    setThinking(true);
    setCaptionLeo("");
    leoMemory.setLastQuery(message);
    pushHistory("user", message);
    try {
      const res = await chat({
        data: {
          message,
          lang: langRef.current,
          history: historyRef.current.slice(-6),
          context: {
            district: location.district, state: location.state,
            recentCrops: memory.recentCrops, favorites: memory.favorites,
          },
          cropSlugs: CROP_SLUGS,
        },
      });
      setThinking(false);
      setCaptionLeo(res.speak);
      setLastReply(res.speak);
      pushHistory("assistant", res.speak);
      const s = settingsRef.current;
      // No auto-restart: LEO only speaks the reply. User taps mic to talk again.
      if (s.autoSpeak) speak(res.speak);
      runIntent(res.intent as Intent);
    } catch {
      setThinking(false);
      const fallback: Record<Lang, string> = {
        en: "I couldn't reach the server. Please try again.",
        te: "సర్వర్‌ను చేరుకోలేకపోయాను. మళ్ళీ ప్రయత్నించండి.",
        hi: "सर्वर तक नहीं पहुँच सका। कृपया पुनः प्रयास करें।",
      };
      const msg = fallback[langRef.current];
      setCaptionLeo(msg); setLastReply(msg);
      if (settingsRef.current.autoSpeak) speak(msg);
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
      rec.lang = settingsRef.current.voiceLang || LANG_TO_BCP47[langRef.current];
      rec.interimResults = true;
      rec.continuous = false;
      rec.onstart = () => { setListening(true); listeningRef.current = true; setCaptionUser(""); };
      rec.onresult = (e: any) => {
        let interim = "", finalT = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalT += r[0].transcript; else interim += r[0].transcript;
        }
        setCaptionUser(finalT || interim);
        if (finalT) { try { rec.stop(); } catch {} ask(finalT); }
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
    setListening(false); listeningRef.current = false;
  }, []);

  // === Barge-in with sensitivity ===
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || !speaking) return;
    // Sensitivity: 1(off-ish) → require 12 chars; 5(instant) → 1 char
    const threshold = Math.max(1, 14 - settingsRef.current.bargeSensitivity * 3);
    let rec: any;
    try {
      rec = new SR();
      rec.lang = settingsRef.current.voiceLang || LANG_TO_BCP47[langRef.current];
      rec.continuous = true; rec.interimResults = true;
      let triggered = false;
      rec.onresult = (e: any) => {
        const t = Array.from(e.results as any).map((r: any) => r[0].transcript).join("").trim();
        if (!triggered && t.length >= threshold) {
          triggered = true;
          try { rec.stop(); } catch {}
          stopSpeaking();
          // No auto-restart of mic; user taps the mic to reply.
        }
      };
      rec.onerror = () => {}; rec.onend = () => {};
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
      setCaptionLeo(g); setLastReply(g);
      historyRef.current = []; pushHistory("assistant", g);
      if (settingsRef.current.autoSpeak) {
        speak(g);
      }
      sessionStorage.setItem("leo.greeted", "1");
      setGreeted(true);
    }, 3200);
    return () => clearTimeout(timer);
  }, [speak, startListening]);

  useEffect(() => {
    if (typeof window !== "undefined") { try { document.documentElement.lang = lang; } catch {} }
  }, [lang]);

  // === Wake word ===
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || !greeted || !settings.wakeEnabled) return;
    let stopped = false; let wake: any;
    const start = () => {
      if (stopped || listeningRef.current || thinking || speakingRef.current || open) return;
      try {
        wake = new SR();
        wake.lang = "en-IN"; wake.continuous = true; wake.interimResults = true;
        wake.onresult = (e: any) => {
          const t = Array.from(e.results as any).map((r: any) => r[0].transcript).join(" ").toLowerCase();
          if (/\b(hey|hi|hello|ok)\s+leo\b/.test(t)) {
            try { wake.stop(); } catch {}
            setSummoning(true);
            setTimeout(() => setSummoning(false), 1400);
            setOpen(true);
            setTimeout(startListening, 900);
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
  }, [greeted, startListening, thinking, open, settings.wakeEnabled]);

  const handleFile = useCallback(async (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) { setCaptionLeo("Image too large — please pick one under 8MB."); return; }
    setIdentifying(true); setIdResult(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = String(reader.result || "");
        const res = await identify({ data: { imageDataUrl: dataUrl, lang: langRef.current, kind: "any" } });
        setIdResult(res); setIdentifying(false);
        setCaptionLeo(res.summary); setLastReply(`${res.summary} ${res.advice}`);
        if (settingsRef.current.autoSpeak) speak(`${res.summary}. ${res.advice}`);
        if (res.topMatches?.[0]?.name) leoMemory.recordDisease(res.topMatches[0].name);
      } catch {
        setIdentifying(false);
        const msg = "I couldn't analyze that photo. Try a clearer close-up.";
        setCaptionLeo(msg); setLastReply(msg);
        if (settingsRef.current.autoSpeak) speak(msg);
      }
    };
    reader.readAsDataURL(file);
  }, [identify, speak]);

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

  const avatarState: "idle" | "listening" | "thinking" | "speaking" =
    speaking ? "speaking" : listening ? "listening" : thinking ? "thinking" : "idle";

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
        className="fixed bottom-5 right-5 z-[70] grid h-16 w-16 place-items-center overflow-hidden rounded-full text-primary-foreground shadow-2xl transition hover:scale-105 active:scale-95"
        style={{
          background: "var(--gradient-primary, linear-gradient(135deg,#4ade80,#16a34a))",
          boxShadow: "0 10px 40px -5px color-mix(in oklab, var(--primary, #16a34a) 60%, transparent), 0 0 0 6px color-mix(in oklab, var(--primary, #16a34a) 15%, transparent)",
        }}
      >
        <div className="scale-[1.15]">
          <LeoAvatarAnime mouthLevel={mouth} state={avatarState} size={62} waving={!open && !reducedMotion} />
        </div>
      </button>

      {/* Summoning burst — plays each time the wake phrase fires */}
      {summoning && !reducedMotion && (
        <div className="pointer-events-none fixed inset-0 z-[69] grid place-items-center" aria-hidden>
          <div className="leo-summon-ring" />
          <div className="leo-summon-ring leo-summon-ring--2" />
          <div className="leo-summon-ring leo-summon-ring--3" />
          <div className="leo-summon-seal" />
          <div className="leo-summon-flash" />
          <style>{`
            @keyframes leo-summon-ring { 0% { transform: scale(0.15); opacity: 0.9; } 100% { transform: scale(2.4); opacity: 0; } }
            @keyframes leo-summon-seal { 0% { transform: rotate(0) scale(0.4); opacity: 0; } 30% { opacity: 1; } 100% { transform: rotate(360deg) scale(1.6); opacity: 0; } }
            @keyframes leo-summon-flash { 0% { opacity: 0; } 25% { opacity: 0.55; } 100% { opacity: 0; } }
            .leo-summon-ring {
              position: absolute; width: 260px; height: 260px; border-radius: 999px;
              border: 2px solid color-mix(in oklab, var(--primary, #16a34a) 85%, white);
              box-shadow: 0 0 60px color-mix(in oklab, var(--primary, #16a34a) 70%, transparent);
              animation: leo-summon-ring 1.2s ease-out forwards;
            }
            .leo-summon-ring--2 { animation-delay: 0.15s; border-color: color-mix(in oklab, var(--primary, #16a34a) 60%, white); }
            .leo-summon-ring--3 { animation-delay: 0.3s; border-color: color-mix(in oklab, var(--primary, #16a34a) 40%, white); }
            .leo-summon-seal {
              position: absolute; width: 220px; height: 220px; border-radius: 999px;
              background:
                conic-gradient(from 0deg, transparent 0 40deg, color-mix(in oklab, var(--primary, #16a34a) 70%, transparent) 40deg 50deg,
                transparent 50deg 130deg, color-mix(in oklab, var(--primary, #16a34a) 70%, transparent) 130deg 140deg,
                transparent 140deg 220deg, color-mix(in oklab, var(--primary, #16a34a) 70%, transparent) 220deg 230deg,
                transparent 230deg 310deg, color-mix(in oklab, var(--primary, #16a34a) 70%, transparent) 310deg 320deg, transparent 320deg 360deg);
              -webkit-mask: radial-gradient(circle, transparent 62%, black 63%, black 100%);
                      mask: radial-gradient(circle, transparent 62%, black 63%, black 100%);
              animation: leo-summon-seal 1.3s ease-out forwards;
              filter: drop-shadow(0 0 24px color-mix(in oklab, var(--primary, #16a34a) 60%, transparent));
            }
            .leo-summon-flash {
              position: absolute; inset: 0;
              background: radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--primary, #16a34a) 45%, transparent), transparent 45%);
              animation: leo-summon-flash 1s ease-out forwards;
            }
          `}</style>
        </div>
      )}

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-[71] flex justify-end p-2 sm:inset-auto sm:bottom-24 sm:right-5">
          <div
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-border/60 shadow-2xl backdrop-blur-xl"
            style={{ background: "color-mix(in oklab, var(--background) 92%, transparent)" }}
            role="dialog" aria-label="LEO voice assistant"
          >
            <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-sm font-semibold">LEO · {PERSONAS.find((p) => p.id === settings.persona)?.label}</div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground" aria-live="polite">{status}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button aria-label="Voice settings" onClick={() => setSettingsOpen(true)} className="rounded-full p-2 hover:bg-secondary">
                  <Settings2 className="h-4 w-4" />
                </button>
                <button aria-label={muted ? "Unmute" : "Mute"} onClick={() => { setMuted((m) => !m); stopSpeaking(); }} className="rounded-full p-2 hover:bg-secondary">
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <button aria-label="Close" onClick={() => { setOpen(false); stopListening(); stopSpeaking(); }} className="rounded-full p-2 hover:bg-secondary">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {/* Anime avatar stage with live lip-sync */}
            <div className="relative grid place-items-center px-6 pb-3 pt-5">
              <div
                className="rounded-full"
                style={{
                  padding: 6,
                  background: "radial-gradient(circle at 30% 20%, color-mix(in oklab, var(--primary) 40%, transparent), transparent 65%)",
                  filter: (speaking || listening) && !reducedMotion ? "drop-shadow(0 12px 28px color-mix(in oklab, var(--primary) 40%, transparent))" : undefined,
                  animation: (speaking || listening) && !reducedMotion ? "leo-orb-pulse 2.4s ease-in-out infinite" : undefined,
                }}
              >
                <LeoAvatarAnime mouthLevel={mouth} state={avatarState} size={200} waving={avatarState === "idle" && !reducedMotion} />
              </div>
              <Waveform active={listening || speaking} reducedMotion={reducedMotion} />
              <p className="mt-3 min-h-[2.5rem] max-w-full text-center text-sm text-muted-foreground">
                {listening && captionUser ? <span className="text-primary">{captionUser}</span>
                  : thinking ? "…"
                  : captionLeo || (!greeted ? GREETING[lang] : "")}
              </p>
              {/* Manual Speak button when autoSpeak is off */}
              {!settings.autoSpeak && lastReply && !thinking && (
                <button
                  onClick={() => (speaking ? stopSpeaking() : speak(lastReply))}
                  className="mt-2 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                >
                  {speaking ? <><Square className="h-3 w-3" /> Stop</> : <><Play className="h-3 w-3" /> Speak reply</>}
                </button>
              )}
              <style>{`@keyframes leo-orb-pulse { 0%,100% { transform: scale(1);} 50% { transform: scale(1.04);} }`}</style>
            </div>

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

            <div className="flex items-center justify-center gap-4 border-t border-border/60 px-4 py-4">
              <button aria-label="Identify plant from photo" onClick={() => fileRef.current?.click()} className="grid h-12 w-12 place-items-center rounded-full border border-border/60 hover:bg-secondary">
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
                {(settings.voiceLang || LANG_TO_BCP47[lang]).slice(0, 2)}
              </div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
            </div>

            {!supported && (
              <p className="border-t border-border/60 px-4 py-3 text-center text-xs text-muted-foreground">
                Voice recognition isn't supported in this browser. Try Chrome, Edge, or Safari on a recent device.
              </p>
            )}
          </div>
        </div>
      )}

      <LeoSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
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
            display: "inline-block", width: 3, height: 26, borderRadius: 2,
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
