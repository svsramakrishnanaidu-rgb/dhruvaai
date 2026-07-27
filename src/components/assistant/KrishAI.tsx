"use client";
/**
 * KRISH AI — the entry point.
 *
 * A premium floating orb that expands on hover, ripples on press and routes to
 * the dedicated full-screen `/ai` experience. It hides itself while on `/ai`.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";

const LABEL = { en: "Ask Krish AI", te: "కృష్ AIని అడగండి", hi: "कृष AI से पूछें" } as const;

export function KrishAI() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const seed = useRef(0);

  const open = useCallback((e?: { clientX: number; clientY: number; currentTarget: HTMLElement }) => {
    haptic("select");
    if (e) {
      const r = e.currentTarget.getBoundingClientRect();
      const id = ++seed.current;
      setRipples((rs) => [...rs, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
      window.setTimeout(() => setRipples((rs) => rs.filter((p) => p.id !== id)), 620);
    }
    navigate({ to: "/ai" });
  }, [navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        navigate({ to: "/ai" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  if (path === "/ai") return null;

  return (
    <button
      type="button"
      onClick={(e) => open(e)}
      aria-label="Open Krish AI assistant"
      title="Krish AI  (Ctrl / ⌘ + J)"
      className="ks-orb group"
    >
      <span className="ks-orb-halo" aria-hidden />
      <span className="ks-orb-ring" aria-hidden />
      <span className="ks-orb-core" aria-hidden />
      <Bot className="relative z-10 h-6 w-6" />
      <span className="ks-orb-label">{LABEL[lang] ?? LABEL.en}</span>
      {ripples.map((r) => (
        <span key={r.id} className="ks-orb-ripple" style={{ left: r.x, top: r.y }} aria-hidden />
      ))}
    </button>
  );
}
