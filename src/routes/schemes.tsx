import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { HeroBanner } from "@/components/HeroBanner";
import { Award, IndianRupee, Sprout, Tractor } from "lucide-react";
import { useLocation } from "@/lib/location-store";
import { profileFor } from "@/lib/district-profiles";
import heroImg from "@/assets/heroes/schemes.jpg";

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
  { key: "PM-KISAN",             icon: <IndianRupee className="h-5 w-5" />, name: "PM-KISAN",              tag: "Central", benefit: "₹6,000/year direct income support", eligibility: "Small & marginal farmer families with cultivable land." },
  { key: "PMFBY",                icon: <Sprout className="h-5 w-5" />,      name: "PM Fasal Bima Yojana",  tag: "Central", benefit: "Crop insurance @ 2% premium (Kharif)", eligibility: "All farmers growing notified crops." },
  { key: "SMAM",                 icon: <Tractor className="h-5 w-5" />,     name: "SMAM Farm Machinery",   tag: "Central", benefit: "40–50% subsidy on tractors, drones, seed drills", eligibility: "Individual farmers, FPOs & Custom Hiring Centres." },
  { key: "SMAM (Drone)",         icon: <Tractor className="h-5 w-5" />,     name: "SMAM Drone Sub-Mission",tag: "Central", benefit: "Up to ₹10L for Kisan drones", eligibility: "FPOs, CHCs, agri graduates." },
  { key: "Rythu Bharosa",        icon: <Award className="h-5 w-5" />,       name: "Rythu Bharosa (AP/TS)", tag: "State",   benefit: "₹13,500/year input assistance",   eligibility: "Land-owning farmers registered with Agri department." },
  { key: "PKVY",                 icon: <Sprout className="h-5 w-5" />,      name: "PKVY",                  tag: "Central", benefit: "₹31,500/hectare/3yrs for organic conversion", eligibility: "Farmer groups adopting cluster-based organic practices." },
  { key: "KCC",                  icon: <IndianRupee className="h-5 w-5" />, name: "KCC — Kisan Credit Card", tag: "Central", benefit: "Crop loan up to ₹3L at 4% interest",   eligibility: "All active cultivators, tenants, oral lessees." },
  { key: "PMKSY",                icon: <Sprout className="h-5 w-5" />,      name: "PMKSY (Micro-Irrigation)", tag: "Central", benefit: "Up to 55% subsidy on drip/sprinkler",  eligibility: "Farmers in notified micro-irrigation districts." },
  { key: "PMKSY (Drip)",         icon: <Sprout className="h-5 w-5" />,      name: "PMKSY Per Drop More Crop", tag: "Central", benefit: "Drip subsidy priority in dryland districts", eligibility: "Rainfed farmers with borewell / lift source." },
  { key: "Ganna Vikas",          icon: <Sprout className="h-5 w-5" />,      name: "Ganna Vikas Yojana",    tag: "State",   benefit: "Higher SAP + seed subsidy for sugarcane", eligibility: "Registered cane growers in UP mills." },
  { key: "MahaDBT",              icon: <IndianRupee className="h-5 w-5" />, name: "MahaDBT Farmer",        tag: "State",   benefit: "Umbrella DBT for MH input & implement subsidies", eligibility: "MH-registered cultivators via MahaDBT portal." },
  { key: "Punjab Fasal Bima",    icon: <Sprout className="h-5 w-5" />,      name: "Punjab Fasal Bima",     tag: "State",   benefit: "State-topped crop insurance for wheat/paddy", eligibility: "Punjab notified area cultivators." },
  { key: "Mukhyamantri Kisan Sahay", icon: <IndianRupee className="h-5 w-5" />, name: "Mukhyamantri Kisan Sahay", tag: "State", benefit: "Direct compensation for crop loss (GJ)", eligibility: "Gujarat farmers with land record entry." },
  { key: "Mukhyamantri Krishak Sathi", icon: <IndianRupee className="h-5 w-5" />, name: "Mukhyamantri Krishak Sathi", tag: "State", benefit: "Accident & livelihood cover (RJ)", eligibility: "Rajasthan farmer households." },
  { key: "Raitha Suraksha",      icon: <Award className="h-5 w-5" />,       name: "Raitha Suraksha",       tag: "State",   benefit: "Karnataka farmer welfare + insurance", eligibility: "KA-registered land-owning farmers." },
  { key: "Bihar Fasal Sahayata", icon: <Sprout className="h-5 w-5" />,      name: "Bihar Fasal Sahayata",  tag: "State",   benefit: "Non-loanee crop loss assistance",     eligibility: "Bihar notified crops, self-registered." },
  { key: "MIDH",                 icon: <Sprout className="h-5 w-5" />,      name: "MIDH Horticulture",     tag: "Central", benefit: "Subsidy for high-value hortic. clusters", eligibility: "Fruit / vegetable / spice growers." },
];

function Schemes() {
  const loc = useLocation();
  const p = profileFor(loc.district);
  const recommendedKeys = new Set(p.schemes);
  const recommended = SCHEMES.filter((s) => recommendedKeys.has(s.key));
  const others = SCHEMES.filter((s) => !recommendedKeys.has(s.key));

  return (
    <div>
      <HeroBanner
        image={heroImg}
        eyebrow={`Support · ${p.state}`}
        title="Government Schemes"
        description="Curated central + state schemes — schemes are auto-prioritized for your selected district."
      />
      <div className="mx-auto max-w-7xl px-6 py-16">


      {recommended.length > 0 && (
        <>
          <Reveal>
            <h2 className="mt-10 font-display text-2xl font-bold">Recommended for {loc.district}</h2>
          </Reveal>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommended.map((s, i) => <SchemeCard key={s.key} s={s} i={i} highlight />)}
          </div>
        </>
      )}

      <Reveal>
        <h2 className="mt-12 font-display text-2xl font-bold">All schemes</h2>
      </Reveal>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {others.map((s, i) => <SchemeCard key={s.key} s={s} i={i} />)}
      </div>
    </div>
    </div>
  );
}

function SchemeCard({ s, i, highlight }: { s: typeof SCHEMES[number]; i: number; highlight?: boolean }) {
  return (
    <Reveal delay={i * 60}>
      <div className={`card-elegant hover-lift p-6 ${highlight ? "ring-1 ring-primary/50" : ""}`}>
        <div className="flex items-center justify-between">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">{s.icon}</div>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            highlight ? "border-primary/50 text-primary" : "border-border/60 text-muted-foreground"
          }`}>{highlight ? "Priority" : s.tag}</span>
        </div>
        <h3 className="mt-4 font-display text-xl font-bold">{s.name}</h3>
        <p className="mt-2 text-sm text-primary">{s.benefit}</p>
        <p className="mt-2 text-xs text-muted-foreground">{s.eligibility}</p>
      </div>
    </Reveal>
  );
}
