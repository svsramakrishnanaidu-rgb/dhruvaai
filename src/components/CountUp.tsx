"use client";
import { useEffect, useRef, useState } from "react";

export function CountUp({ value, duration = 1400, suffix = "", precision = 0 }: { value: number; duration?: number; suffix?: string; precision?: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(value * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  const shown = precision > 0 ? n.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision }) : Math.round(n).toLocaleString();
  return <span ref={ref}>{shown}{suffix}</span>;
}
