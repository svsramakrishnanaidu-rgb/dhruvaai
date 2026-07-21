"use client";
import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";

const NAMES = ["Bhaskar", "Ravi", "Ramakrishna", "Vinay"];

export function CinematicLoader() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    if (sessionStorage.getItem("agri.intro") === "done") return;
    setVisible(true);
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 1900);
    const t3 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("agri.intro", "done");
    }, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const skip = () => { setVisible(false); sessionStorage.setItem("agri.intro", "done"); };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center"
      style={{
        background:
          "radial-gradient(600px 400px at 50% 50%, oklch(0.22 0.03 150), oklch(0.08 0.02 150) 70%)",
      }}
    >
      {/* particles */}
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            background: "radial-gradient(circle, rgba(180,255,150,0.9), transparent)",
            animation: `float-y ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite`,
          }}
        />
      ))}
      {/* light rays */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "conic-gradient(from 210deg at 50% 55%, transparent 0deg, rgba(220,255,180,0.10) 30deg, transparent 60deg, rgba(255,210,140,0.10) 90deg, transparent 130deg, transparent 360deg)",
          animation: "gradient-shift 6s linear infinite",
          mixBlendMode: "screen",
        }}
      />

      <div className="relative flex flex-col items-center gap-6 text-center">
        {phase < 2 && (
          <>
            <div
              className="grid h-28 w-28 place-items-center rounded-full"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "0 0 80px 10px color-mix(in oklab, var(--primary) 45%, transparent)",
                animation: "scale-in 0.9s var(--ease-spring)",
              }}
            >
              <Sprout className="h-14 w-14 text-primary-foreground" style={{ animation: "float-y 3s ease-in-out infinite" }} />
            </div>
            <div style={{ animation: "fade-up 0.9s var(--ease-out-expo) 0.3s both" }}>
              <div className="font-display text-3xl font-black tracking-tight md:text-5xl">
                Krish <span className="text-gradient">Sense</span>
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.4em] text-muted-foreground">
                Smart Agricultural Advisory
              </div>
            </div>
          </>
        )}
        {phase === 2 && (
          <div className="text-center" style={{ animation: "fade-up 0.6s var(--ease-out-expo) both" }}>
            <div className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Crafted by</div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-display text-2xl font-black md:text-4xl">
              {NAMES.map((n, i) => (
                <span
                  key={n}
                  className="text-gradient"
                  style={{
                    animation: `fade-up 0.6s var(--ease-out-expo) ${i * 0.12}s both, float-y ${3 + i * 0.3}s ease-in-out ${i * 0.15}s infinite`,
                    textShadow: "0 0 30px color-mix(in oklab, var(--primary) 60%, transparent)",
                  }}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={skip}
        className="absolute bottom-6 right-6 rounded-full border border-border/50 bg-background/40 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur transition hover:text-foreground"
      >
        Skip intro →
      </button>
    </div>
  );
}
