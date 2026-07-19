"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Anime-inspired ninja avatar (Naruto-referenced).
 * Face expresses: idle, listening (curious brow), thinking (down-glance), speaking (open mouth lip-sync).
 * `mouthLevel` 0..1 drives mouth opening for lip-sync.
 */
export function LeoAvatarAnime({
  mouthLevel = 0,
  state = "idle",
  size = 220,
  waving = false,
}: {
  mouthLevel?: number;
  state?: "idle" | "listening" | "thinking" | "speaking";
  size?: number;
  waving?: boolean;
}) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    let t: any;
    const loop = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
      t = setTimeout(loop, 2600 + Math.random() * 2200);
    };
    t = setTimeout(loop, 1200);
    return () => clearTimeout(t);
  }, []);

  // Mouth geometry: ellipse rx=fixed, ry grows with mouthLevel.
  const mouthRy = 1.4 + Math.max(0, Math.min(1, mouthLevel)) * 6.5;
  const mouthRx = 4 + Math.max(0, Math.min(1, mouthLevel)) * 2.2;

  const eyeRy = blink ? 0.4 : 2.6;
  const browY = state === "listening" ? 28 : state === "thinking" ? 31 : 30;
  const smile = state === "speaking" || state === "listening";

  const handAngle = waving ? "wave" : "idle";

  return (
    <svg viewBox="0 0 120 140" width={size} height={size} aria-hidden>
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe6cf" />
          <stop offset="100%" stopColor="#f2c9a3" />
        </linearGradient>
        <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5c34b" />
          <stop offset="100%" stopColor="#d99612" />
        </linearGradient>
        <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0b1e5a" />
        </linearGradient>
        <radialGradient id="cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff9aa2" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ff9aa2" stopOpacity="0" />
        </radialGradient>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Aura */}
      <circle cx="60" cy="66" r="52" fill="none" stroke="url(#hair)" strokeOpacity="0.28" strokeWidth="1.4" />

      {/* Waving hand (behind face) */}
      <g style={{ transformOrigin: "18px 108px", animation: handAngle === "wave" ? "leo-wave 1.4s ease-in-out infinite" : undefined }}>
        <path d="M8 108 q6 -18 20 -14 q6 2 8 8 q1 4 -3 8 l-14 12 q-8 4 -11 -4 z" fill="url(#skin)" stroke="#c98d5c" strokeWidth="0.8" />
      </g>

      {/* Hair back */}
      <path d="M18 66 Q10 32 40 20 Q60 8 82 20 Q112 30 104 66 Q100 44 88 40 Q76 60 60 52 Q44 60 34 40 Q22 44 18 66 Z" fill="url(#hair)" />

      {/* Face */}
      <ellipse cx="60" cy="70" rx="30" ry="34" fill="url(#skin)" />

      {/* Forehead protector (Naruto-style band) */}
      <rect x="26" y="38" width="68" height="12" rx="2" fill="url(#band)" />
      <rect x="26" y="38" width="68" height="12" rx="2" fill="none" stroke="#e5e7eb" strokeOpacity="0.25" />
      {/* Leaf swirl emblem */}
      <g transform="translate(60 44)">
        <circle r="6" fill="#c0c0c8" />
        <path d="M -2 -2 q 4 -3 6 1 q -1 3 -4 2 q 1 3 4 2 q 2 3 -2 4" fill="none" stroke="#0b1e5a" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* Front hair spikes */}
      <path d="M28 52 L34 34 L40 50 L48 30 L54 50 L60 32 L66 50 L72 30 L80 50 L86 34 L92 52 Z" fill="url(#hair)" />

      {/* Cheek whisker marks */}
      <g stroke="#7c4a1e" strokeWidth="0.9" strokeLinecap="round" opacity="0.8">
        <line x1="34" y1="76" x2="42" y2="76" />
        <line x1="34" y1="80" x2="42" y2="80" />
        <line x1="34" y1="84" x2="42" y2="84" />
        <line x1="78" y1="76" x2="86" y2="76" />
        <line x1="78" y1="80" x2="86" y2="80" />
        <line x1="78" y1="84" x2="86" y2="84" />
      </g>

      {/* Cheeks */}
      <ellipse cx="42" cy="86" rx="6" ry="3" fill="url(#cheek)" />
      <ellipse cx="78" cy="86" rx="6" ry="3" fill="url(#cheek)" />

      {/* Brows */}
      <path d={`M40 ${browY} q6 -3 12 0`} stroke="#7a4a10" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d={`M68 ${browY} q6 -3 12 0`} stroke="#7a4a10" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* Eyes */}
      <g filter="url(#glow)">
        <ellipse cx="46" cy="70" rx="4.2" ry={eyeRy} fill="#fff" />
        <ellipse cx="74" cy="70" rx="4.2" ry={eyeRy} fill="#fff" />
        {!blink && (
          <>
            <circle cx="46" cy="70" r="2.3" fill="#1e3a8a" />
            <circle cx="74" cy="70" r="2.3" fill="#1e3a8a" />
            <circle cx="46.6" cy="69.3" r="0.9" fill="#fff" />
            <circle cx="74.6" cy="69.3" r="0.9" fill="#fff" />
          </>
        )}
      </g>

      {/* Nose */}
      <path d="M60 78 q2 4 -1 6" stroke="#c98d5c" strokeWidth="0.9" fill="none" strokeLinecap="round" />

      {/* Mouth (lip-sync) */}
      {state === "speaking" ? (
        <ellipse cx="60" cy="94" rx={mouthRx} ry={mouthRy} fill="#7a1728" stroke="#3a0a13" strokeWidth="0.6" />
      ) : smile ? (
        <path d="M52 94 q8 6 16 0" stroke="#7a4a10" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      ) : state === "thinking" ? (
        <path d="M54 96 q6 -2 12 0" stroke="#7a4a10" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M54 94 q6 3 12 0" stroke="#7a4a10" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      )}

      {/* Chin shadow */}
      <ellipse cx="60" cy="102" rx="12" ry="2" fill="#c98d5c" opacity="0.35" />

      <style>{`@keyframes leo-wave { 0%,100%{ transform: rotate(-10deg);} 50%{ transform: rotate(22deg);} }`}</style>
    </svg>
  );
}
