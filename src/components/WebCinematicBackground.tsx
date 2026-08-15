"use client";
import { useEffect, useRef } from "react";
import { useScroll } from "framer-motion";

export function WebCinematicBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 -z-20 overflow-hidden bg-web-bg-midnight pointer-events-none"
    >
      {/* Deep Forest Base Layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-web-bg-midnight via-web-bg-forest to-web-bg-midnight opacity-80" />
      
      {/* Animated Light Rays */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-[-20%] left-[10%] w-[40%] h-[140%] bg-web-emerald blur-[120px] rotate-[35deg] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[-10%] right-[5%] w-[30%] h-[120%] bg-web-leaf blur-[100px] rotate-[-25deg] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Floating Particles/Dust */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-web-gold/20 blur-[1px]"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `drift ${Math.random() * 10 + 20}s linear infinite`,
              animationDelay: `-${Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,26,18,0.4)_100%)]" />
    </div>
  );
}
