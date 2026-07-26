/**
 * Haptic feedback helper.
 *
 * Android Chrome exposes `navigator.vibrate`; iOS Safari does not, so every
 * call is a silent no-op there. Durations are deliberately tiny — anything
 * above ~20ms reads as a buzz rather than a tap on modern Android hardware.
 */
type HapticKind = "tap" | "select" | "success" | "warn";

const PATTERNS: Record<HapticKind, number | number[]> = {
  tap: 8,
  select: 12,
  success: [10, 40, 14],
  warn: [18, 60, 18],
};

let enabled: boolean | null = null;

function canVibrate() {
  if (enabled !== null) return enabled;
  if (typeof navigator === "undefined" || typeof window === "undefined") return (enabled = false);
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  enabled = typeof navigator.vibrate === "function" && !reduced;
  return enabled;
}

export function haptic(kind: HapticKind = "tap") {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(PATTERNS[kind]);
  } catch {
    /* vibration can be blocked by user settings — never let it break a tap */
  }
}
