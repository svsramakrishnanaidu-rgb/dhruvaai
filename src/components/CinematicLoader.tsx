"use client";
import { useEffect, useRef, useState } from "react";
import mobileVideo from "@/assets/intro-mobile.mp4.asset.json";
import desktopVideo from "@/assets/intro-desktop.mp4.asset.json";

const MOBILE_BP = 768;
const PLAYED_KEY = "krishsense_intro_played_v1";

export function CinematicLoader() {
  const [done, setDone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return localStorage.getItem(PLAYED_KEY) === "1"; } catch { return false; }
  });
  const [fading, setFading] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BP : false,
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BP);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  useEffect(() => {
    // Lock scroll while intro plays
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const play = v.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => finish());
    }
    // Safety fallback in case of stall
    const safety = setTimeout(() => finish(), 20000);
    return () => clearTimeout(safety);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    if (fading) return;
    try { localStorage.setItem(PLAYED_KEY, "1"); } catch {}
    setFading(true);
    setTimeout(() => {
      setDone(true);
      try {
        const v = videoRef.current;
        if (v) {
          v.pause();
          v.removeAttribute("src");
          v.load();
        }
      } catch {}
    }, 650);
  };

  if (done) return null;

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
