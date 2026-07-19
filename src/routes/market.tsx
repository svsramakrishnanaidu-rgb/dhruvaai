import { createFileRoute } from "@tanstack/react-router";
import { CROP_LIST } from "@/data/crops";
import { Reveal } from "@/components/Reveal";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useLocation } from "@/lib/location-store";
import { profileFor } from "@/lib/district-profiles";
import { HeroBanner } from "@/components/HeroBanner";
import { TrendingUp, TrendingDown } from "lucide-react";
import heroImg from "@/assets/heroes/market.jpg";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Market Prices — KrishiSense" },
      { name: "description", content: "Live-style mandi prices, MSP, weekly trend and profit estimator." },
    ],
  }),
  component: Market,
});

function Market() {
  const loc = useLocation();
  const p = profileFor(loc.district);
  const mod = 1 + p.priceModifier;

  return (
    <div>
      <HeroBanner
        image={heroImg}
        eyebrow={`Insights · ${p.state}`}
        title="Market Prices"
        description={`Nearby mandis in ${loc.district}. Regional adjustment ${p.priceModifier >= 0 ? "+" : ""}${(p.priceModifier * 100).toFixed(0)}% applied to national reference price.`}
      />
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">

        {CROP_LIST.map((c) => {
          const first = c.marketPrice.trend[0].price * mod;
          const last = c.marketPrice.trend[c.marketPrice.trend.length - 1].price * mod;
          const up = last >= first;
          const delta = (((last - first) / first) * 100).toFixed(1);
          const price = Math.round(c.marketPrice.price * mod);
          const trend = c.marketPrice.trend.map((t) => ({ ...t, price: Math.round(t.price * mod) }));
          return (
            <Reveal key={c.slug}>
              <div className="card-elegant hover-lift p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{c.emoji}</span>
                      <h3 className="font-display text-xl font-bold">{c.name}</h3>
                    </div>
                    <div className="mt-2 font-display text-3xl font-black tabular-nums">₹{price.toLocaleString()}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{c.marketPrice.unit} · MSP ₹{c.marketPrice.msp.toLocaleString()}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                    up ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                  }`}>
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {up ? "+" : ""}{delta}%
                  </span>
                </div>
                <div className="mt-4 h-24">
                  <ResponsiveContainer>
                    <LineChart data={trend}>
                      <XAxis dataKey="day" hide />
                      <YAxis hide domain={["auto", "auto"]} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                      <Line type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Reveal>
          );
        })}
        </div>
      </div>
    </div>
  );
}
