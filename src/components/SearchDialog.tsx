"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { Search, Mic, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CROP_LIST } from "@/data/crops";

type Item = { title: string; sub: string; to: string; kind: string };

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    CROP_LIST.forEach((c) => {
      out.push({ title: c.name, sub: `Crop · ${c.season}`, to: `/crops/${c.slug}`, kind: "crop" });
      c.diseases.forEach((d) =>
        out.push({ title: d.name, sub: `Disease in ${c.name}`, to: `/crops/${c.slug}`, kind: "disease" }),
      );
    });
    out.push({ title: "Calculators", sub: "Tool", to: "/calculators", kind: "tool" });
    
    out.push({ title: "Market Prices", sub: "Module", to: "/market", kind: "module" });
    out.push({ title: "Crop Rotation", sub: "Tool", to: "/rotation", kind: "tool" });
    return out;
  }, []);

  const fuse = useMemo(() => new Fuse(items, { keys: ["title", "sub"], threshold: 0.35 }), [items]);
  const results = q ? fuse.search(q).slice(0, 8).map((r) => r.item) : items.slice(0, 8);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setTimeout(() => inputRef.current?.focus(), 40);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const startVoice = () => {
    const w = window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { alert("Voice search not supported in this browser."); return; }
    const rec = new SR();
    rec.lang = "en-IN"; rec.interimResults = false; rec.maxAlternatives = 1;
    setListening(true);
    rec.onresult = (e: any) => setQ(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-start justify-center bg-background/70 px-4 pt-24 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl"
        style={{ animation: "scale-in 0.3s var(--ease-spring)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border/50 px-5 py-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search crops, diseases, tools…"
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={startVoice}
            aria-label="Voice search"
            className={`grid h-8 w-8 place-items-center rounded-full transition ${
              listening ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            style={listening ? { animation: "pulse-glow 1.2s ease-in-out infinite" } : undefined}
          >
            <Mic className="h-4 w-4" />
          </button>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="p-8 text-center text-sm text-muted-foreground">No results.</li>
          )}
          {results.map((r, i) => (
            <li key={r.to + r.title + i}>
              <Link
                to={r.to}
                onClick={onClose}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-secondary/60"
              >
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.sub}</div>
                </div>
                <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {r.kind}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
