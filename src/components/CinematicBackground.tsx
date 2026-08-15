import { useEffect, useRef, useState, useMemo } from "react";
import japanAsset from "@/assets/moonlit-japan.png.asset.json";

export function CinematicBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Parallax layers
  // We simulate depth by moving the background at different speeds
  // The uploaded image is treated as a video source since its content_type was video/mp4 in the asset json
  // (Wait, the asset JSON said content_type: video/mp4, but filename was .png. Let's verify.)

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-midnight-navy">
      <div 
        className="absolute inset-0 h-[120%] w-[120%] -left-[10%] -top-[10%]"
        style={{
          transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
          transition: "transform 0.1s linear"
        }}
      >
        <video
          ref={videoRef}
          src={japanAsset.url}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
          style={{
            filter: "brightness(0.8) contrast(1.1)",
          }}
        />
      </div>
      
      {/* Mist layer */}
      <div 
        className="absolute inset-0 opacity-30 mix-blend-screen"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(38, 62, 82, 0.2), transparent 70%)",
          transform: `translate3d(0, ${scrollY * 0.2}px, 0)`,
        }}
      />
      
      {/* Crimson glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-crimson/5 to-midnight-navy/80" />
      
      {/* Grain & Noise handled by global CSS */}
    </div>
  );
}
