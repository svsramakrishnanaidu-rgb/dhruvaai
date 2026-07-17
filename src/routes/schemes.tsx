import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { Award, IndianRupee, Sprout, Tractor } from "lucide-react";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Government Schemes — KrishiSense" },
      { name: "description", content: "Key central and state government agriculture schemes with subsidies and eligibility at a glance." },
    ],
  }),
  component: Schemes,
});

const SCHEMES = [
  { icon: <IndianRupee className="h-5 w-5" />, name: "PM-KISAN", tag: "Central", benefit: "₹6,000/year direct income support", eligibility: "Small & marginal farmer families with cultivable land." },
  { icon: <Sprout className="h-5 w-5" />, name: "PM Fasal Bima Yojana", tag: "Central", benefit: "Crop insurance @ 2% premium (Kharif)", eligibility: "All farmers growing notified crops." },
  { icon: <Tractor className="h-5 w-5" />, name: "SMAM Farm Machinery", tag: "Central", benefit: "40–50% subsidy on tractors, drones, seed drills", eligibility: "Individual farmers, FPOs & Custom Hiring Centres." },
  { icon: <Award className="h-5 w-5" />, name: "Rythu Bharosa (AP/TS)", tag: "State", benefit: "₹13,500/year input assistance", eligibility: "Land-owning farmers registered with Agri department." },
  { icon: <Sprout className="h-5 w-5" />, name: "PKVY", tag: "Central", benefit: "₹31,500/hectare/3yrs for organic conversion", eligibility: "Farmer groups adopting cluster-based organic practices." },
  { icon: <IndianRupee className="h-5 w-5" />, name: "KCC — Kisan Credit Card", tag: "Central", benefit: "Crop loan up to ₹3L at 4% interest (with subvention)", eligibility: "All active cultivators, tenants, oral lessees." },
];

function Schemes() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Support</span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight md:text-6xl">Government Schemes</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">The most relevant central + state schemes for row-crop farmers, curated and simplified.</p>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SCHEMES.map((s, i) => (
          <Reveal key={s.name} delay={i * 60}>
            <div className="card-elegant hover-lift p-6">
              <div className="flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">{s.icon}</div>
                <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.tag}</span>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">{s.name}</h3>
              <p className="mt-2 text-sm text-primary">{s.benefit}</p>
              <p className="mt-2 text-xs text-muted-foreground">{s.eligibility}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
