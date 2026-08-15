import { useEffect, useRef, useState } from "react";
import bgAsset from "@/assets/bg-moonlit-crimson.jpg.asset.json";

export function CinematicBackground() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-midnight-navy">
      {/* 
         Static Background Image 
         User explicitly requested "DONT MOVIE THE BACKGROUND ALSO WITH SCROLLING"
      */}
      <div className="absolute inset-0 h-full w-full">
        <img
          src={bgAsset.url}
          alt=""
          className={`h-full w-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          style={{
            filter: "brightness(0.75) contrast(1.1) saturate(1.1)",
          }}
        />
      </div>
      
      {/* Atmospheric Mist Layer (Static) */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-screen"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(38, 62, 82, 0.2), transparent 70%)",
        }}
      />
      
      {/* Crimson Depth Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-crimson/5 to-midnight-navy/80" />
      
      {/* Grain & Noise handled by global CSS */}
    </div>
  );
}
