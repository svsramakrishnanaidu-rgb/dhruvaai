import { Link } from "@tanstack/react-router";
import { heroAIFor, type Fertilizer } from "@/data/fertilizers";

export function FertMiniCard({ f }: { f: Fertilizer }) {
  return (
    <Link
      to="/fertilizers/$slug"
      params={{ slug: f.slug }}
      className="card-elegant hover-lift group block overflow-hidden"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={heroAIFor(f)}
          alt={f.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-3">
          <span className="rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
            {f.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="font-display text-base font-bold leading-tight">{f.name}</div>
        <div className="mt-0.5 truncate text-xs text-muted-foreground">{f.generic}</div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="rounded-lg border border-border/60 px-2 py-1 font-mono">
            {f.npk.n}-{f.npk.p}-{f.npk.k}
          </span>
          <span className="font-semibold text-primary">
            ₹{f.price.inr.toLocaleString("en-IN")}
            <span className="text-muted-foreground">/{f.price.unit}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
