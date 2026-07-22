"use client";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { MessageCircle, X, Send, Camera, Loader2, Sparkles, Trash2, Image as ImageIcon } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { leoChat, leoIdentify } from "@/lib/leo.functions";
import { buildLeoKnowledge } from "@/lib/leo-knowledge";
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

type Msg = { id: string; role: "user" | "assistant"; content: string; image?: string; pending?: boolean };

const CROP_SLUGS = CROP_LIST.map((c) => c.slug);
const STORAGE_KEY = "leo.chat.v1";

const GREETING: Record<Lang, string> = {
  en: "Hi! I'm LEO. Ask me about crops, diseases, fertilisers, weather or market prices — or upload a leaf photo to identify a disease.",
  te: "నమస్తే! నేను లియో. పంటలు, తెగుళ్ళు, ఎరువులు, వాతావరణం లేదా మార్కెట్ ధరల గురించి అడగండి — లేదా ఆకు ఫోటో అప్‌లోడ్ చేయండి.",
  hi: "नमस्ते! मैं लियो हूँ। फसलों, बीमारियों, उर्वरकों, मौसम या बाज़ार भाव के बारे में पूछें — या पत्ते की फ़ोटो अपलोड करें।",
};

const PLACEHOLDER: Record<Lang, string> = {
  en: "Ask LEO anything about farming…",
  te: "వ్యవసాయం గురించి ఏదైనా అడగండి…",
  hi: "खेती के बारे में कुछ भी पूछें…",
};

const uid = () => Math.random().toString(36).slice(2, 10);

export function LeoAssistant() {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const memory = useLeoMemory();
  const chat = useServerFn(leoChat);
  const identify = useServerFn(leoIdentify);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [unread, setUnread] = useState(0);

  const langRef = useRef<Lang>(lang);
  langRef.current = lang;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hydrate persisted transcript
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed) && parsed.length) { setMessages(parsed); return; }
      }
    } catch {}
    setMessages([{ id: uid(), role: "assistant", content: GREETING[langRef.current] }]);
  }, []);

  // Persist (debounced via microtask coalescing)
  useEffect(() => {
    if (!messages.length) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40))); } catch {}
  }, [messages]);

  // Autoscroll on new content
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  // Track unread while closed
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

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
      case "openSearch": window.dispatchEvent(new CustomEvent("leo:openSearch")); break;
      case "toggleTheme": document.documentElement.classList.toggle("light"); break;
      case "favorite": if (intent.slug) leoMemory.toggleFavorite(intent.slug); break;
    }
  }, [navigate]);

  const send = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    const userMsg: Msg = { id: uid(), role: "user", content: text };
    const pendingId = uid();
    setMessages((prev) => [...prev, userMsg, { id: pendingId, role: "assistant", content: "", pending: true }]);
    setInput("");
    setBusy(true);
    leoMemory.setLastQuery(text);

    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const res = await chat({
        data: {
          message: text,
          lang: langRef.current,
          history,
          context: {
            district: location.district, state: location.state,
            recentCrops: memory.recentCrops, favorites: memory.favorites,
            currentPath: typeof window !== "undefined" ? window.location.pathname : "/",
          },
          cropSlugs: CROP_SLUGS,
          knowledge: buildLeoKnowledge({
            district: location.district,
            state: location.state,
            recentCrops: memory.recentCrops,
            favorites: memory.favorites,
          }),
        },
      });
      setMessages((prev) => prev.map((m) => m.id === pendingId ? { ...m, content: res.speak, pending: false } : m));
      if (!open) setUnread((u) => u + 1);
      runIntent(res.intent as Intent);
    } catch (e) {
      const fallback: Record<Lang, string> = {
        en: "I couldn't reach the server. Please try again.",
        te: "సర్వర్‌ను చేరుకోలేకపోయాను. మళ్ళీ ప్రయత్నించండి.",
        hi: "सर्वर तक नहीं पहुँच सका। कृपया पुनः प्रयास करें।",
      };
      setMessages((prev) => prev.map((m) => m.id === pendingId ? { ...m, content: fallback[langRef.current], pending: false } : m));
    } finally {
      setBusy(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [busy, chat, location.district, location.state, memory.recentCrops, memory.favorites, messages, open, runIntent]);

  const handleFile = useCallback(async (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) return;
    setIdentifying(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      const userMsg: Msg = { id: uid(), role: "user", content: "📷 Identify this photo", image: dataUrl };
      const pendingId = uid();
      setMessages((prev) => [...prev, userMsg, { id: pendingId, role: "assistant", content: "", pending: true }]);
      try {
        const res = await identify({ data: { imageDataUrl: dataUrl, lang: langRef.current, kind: "any" } });
        const body = [res.summary, res.advice].filter(Boolean).join("\n\n");
        setMessages((prev) => prev.map((m) => m.id === pendingId ? { ...m, content: body || "No confident match.", pending: false } : m));
        if (res.topMatches?.[0]?.name) leoMemory.recordDisease(res.topMatches[0].name);
        if (!open) setUnread((u) => u + 1);
      } catch {
        setMessages((prev) => prev.map((m) => m.id === pendingId ? { ...m, content: "I couldn't analyse that photo. Try a clearer close-up.", pending: false } : m));
      } finally {
        setIdentifying(false);
      }
    };
    reader.readAsDataURL(file);
  }, [identify, open]);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    const m = pathname.match(/^\/crops\/([\w-]+)$/);
    if (m) leoMemory.recordCrop(m[1]);
  }, [pathname]);

  const clearChat = () => {
    setMessages([{ id: uid(), role: "assistant", content: GREETING[langRef.current] }]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const suggestions = [
    lang === "te" ? "వరిలో బ్లాస్ట్ ఎలా నివారించాలి?" : lang === "hi" ? "गेहूँ में रस्ट कैसे रोकें?" : "How do I prevent rice blast?",
    lang === "te" ? "పత్తికి DAP ఎంత?" : lang === "hi" ? "कपास के लिए DAP कितना?" : "How much DAP for cotton?",
    lang === "te" ? "ఈరోజు మార్కెట్ ధరలు" : lang === "hi" ? "आज के बाज़ार भाव" : "Today's market prices",
  ];

  return (
    <>
      {/* Launcher */}
      <button
        aria-label={open ? "Close LEO" : "Open LEO chat"}
        aria-pressed={open}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-[70] grid h-14 w-14 place-items-center rounded-full text-primary-foreground shadow-2xl transition hover:scale-105 active:scale-95"
        style={{
          background: "var(--gradient-primary, linear-gradient(135deg,#4ade80,#16a34a))",
          boxShadow: "0 10px 40px -5px color-mix(in oklab, var(--primary, #16a34a) 60%, transparent), 0 0 0 6px color-mix(in oklab, var(--primary, #16a34a) 15%, transparent)",
        }}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shadow">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-[71] flex justify-end p-2 sm:inset-auto sm:bottom-24 sm:right-5">
          <div
            className="flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-border/60 shadow-2xl backdrop-blur-xl"
            style={{ background: "color-mix(in oklab, var(--background) 94%, transparent)", height: "min(72vh, 640px)" }}
            role="dialog" aria-label="LEO chat assistant"
          >
            <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full text-primary-foreground"
                  style={{ background: "var(--gradient-primary, linear-gradient(135deg,#4ade80,#16a34a))" }}>
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">LEO · AI Agri Assistant</div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {busy || identifying ? "Thinking…" : "Online"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button aria-label="Clear chat" onClick={clearChat} className="rounded-full p-2 hover:bg-secondary">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button aria-label="Close" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-secondary">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => <Bubble key={m.id} msg={m} />)}
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => send(s)}
                      className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs hover:bg-secondary">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-end gap-2 border-t border-border/60 px-3 py-3"
            >
              <button type="button" aria-label="Upload photo" onClick={() => fileRef.current?.click()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border/60 hover:bg-secondary">
                {identifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                }}
                placeholder={PLACEHOLDER[lang]}
                rows={1}
                className="min-h-[40px] max-h-32 flex-1 resize-none rounded-2xl border border-border/60 bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/60"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary-foreground transition disabled:opacity-40"
                style={{ background: "var(--gradient-primary, linear-gradient(135deg,#4ade80,#16a34a))" }}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const Bubble = memo(function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-md text-primary-foreground"
            : "rounded-bl-md border border-border/60 bg-secondary/50"
        }`}
        style={isUser ? { background: "var(--gradient-primary, linear-gradient(135deg,#4ade80,#16a34a))" } : undefined}
      >
        {msg.image && (
          <img src={msg.image} alt="" className="mb-2 max-h-48 w-full rounded-xl object-cover" />
        )}
        {msg.pending ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <span className="leo-dot" /><span className="leo-dot" style={{ animationDelay: "0.15s" }} /><span className="leo-dot" style={{ animationDelay: "0.3s" }} />
            <style>{`
              .leo-dot { display:inline-block; width:6px; height:6px; border-radius:999px; background:currentColor; animation: leo-blink 1s ease-in-out infinite; }
              @keyframes leo-blink { 0%,80%,100% { opacity: 0.2; transform: translateY(0);} 40% { opacity: 1; transform: translateY(-2px);} }
            `}</style>
          </span>
        ) : (
          <span className="whitespace-pre-wrap">{msg.content}</span>
        )}
      </div>
    </div>
  );
});
