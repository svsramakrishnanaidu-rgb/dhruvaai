import { createFileRoute } from "@tanstack/react-router";
import { CROP_LIST } from "@/data/crops";
import { Reveal } from "@/components/Reveal";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useLocation } from "@/lib/location-store";
import { TrendingUp, TrendingDown } from "lucide-react";

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
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Insights</span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight md:text-6xl">Market Prices</h1>
        <p className="mt-3 text-muted-foreground">Nearby mandis in {loc.district}. Track today's price, MSP and 7-day trend.</p>
      </Reveal>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {CROP_LIST.map((c) => {
          const first = c.marketPrice.trend[0].price;
          const last = c.marketPrice.trend[c.marketPrice.trend.length - 1].price;
          const up = last >= first;
          const delta = (((last - first) / first) * 100).toFixed(1);
          return (
            <Reveal key={c.slug}>
              <div className="card-elegant hover-lift p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{c.emoji}</span>
                      <h3 className="font-display text-xl font-bold">{c.name}</h3>
                    </div>
                    <div className="mt-2 font-display text-3xl font-black tabular-nums">₹{c.marketPrice.price.toLocaleString()}</div>
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
                    <LineChart data={c.marketPrice.trend}>
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
  );
}
