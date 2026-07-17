"use client";
import type { Crop } from "@/data/crops/types";
import { Link } from "@tanstack/react-router";
import { Droplets, TrendingUp, Sprout as SproutIcon } from "lucide-react";

export function CropCard({ crop, index = 0 }: { crop: Crop; index?: number }) {
  return (
    <Link
      to="/crops/$slug"
      params={{ slug: crop.slug }}
      className="group relative block overflow-hidden rounded-3xl border border-border/60 bg-card hover-lift"
      style={{ animation: `fade-up 0.7s var(--ease-out-expo) ${index * 80}ms both` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={crop.image}
          alt={crop.name}
          loading="lazy"
          width={800}
          height={1000}
          className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        {crop.trending && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-accent/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground shadow-lg">
            <TrendingUp className="h-3 w-3" /> Trending
          </span>
        )}
        <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full glass text-2xl">
          {crop.emoji}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-display text-2xl font-bold tracking-tight">{crop.name}</h3>
          <p className="text-xs italic text-muted-foreground">{crop.scientificName}</p>

          <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
            <Fact icon={<SproutIcon className="h-3 w-3" />} label={crop.season.split(" ")[0]} />
            <Fact icon={<Droplets className="h-3 w-3" />} label={crop.waterNeed} />
            <Fact icon={<TrendingUp className="h-3 w-3" />} label={`+${crop.profitPct}%`} />
          </div>
        </div>
      </div>
    </Link>
  );
}

function Fact({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-2 py-1 backdrop-blur">
      <span className="text-primary">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}
