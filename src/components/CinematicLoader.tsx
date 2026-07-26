"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import mobileVideo from "@/assets/intro-mobile.mp4.asset.json";
import desktopVideo from "@/assets/intro-desktop.mp4.asset.json";

const MOBILE_BP = 768;
const PLAYED_KEY = "krishsense_intro_played_v1";

export function CinematicLoader() {
  // Mount-gated: nothing renders during SSR / first hydration pass, so the
  // server and client markup always match (no hydration mismatch on mobile).
  const [mounted, setMounted] = useState(false);
  const [done, setDone] = useState(false);
  const [fading, setFading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fadingRef = useRef(false);

  useEffect(() => {
    let played = false;
    try { played = localStorage.getItem(PLAYED_KEY) === "1"; } catch {}
    setIsMobile(window.innerWidth < MOBILE_BP);
    setDone(played);
    setMounted(true);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BP);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  const finish = useCallback(() => {
    if (fadingRef.current) return;
    fadingRef.current = true;
    try { localStorage.setItem(PLAYED_KEY, "1"); } catch {}
    setFading(true);
    setTimeout(() => {
      setDone(true);
      try {
        const v = videoRef.current;
        if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
      } catch {}
    }, 650);
  }, []);

  // Lock scroll ONLY while the intro is actually on screen — otherwise a
  // skipped intro would leave the page permanently unscrollable on mobile.
  useEffect(() => {
    if (!mounted || done) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mounted, done]);

  useEffect(() => {
    if (!mounted || done) return;
    const v = videoRef.current;
    if (!v) return;
    const play = v.play();
    if (play && typeof play.catch === "function") play.catch(() => finish());
    // Safety fallback in case of a stall (common on throttled mobile networks).
    const safety = setTimeout(finish, 12000);
    return () => clearTimeout(safety);
  }, [mounted, done, finish]);

  if (!mounted || done) return null;

  const src = isMobile ? mobileVideo.url : desktopVideo.url;


  return (
    <div
      className="fixed inset-0 z-[100] bg-black"
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 600ms ease-out",
        pointerEvents: fading ? "none" : "auto",
      }}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        key={src}
        src={src}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
        className="h-full w-full"
        style={{ objectFit: "cover", width: "100vw", height: "100vh" }}
      />
    </div>
  );
}
