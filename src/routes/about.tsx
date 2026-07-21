import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { HeroBanner } from "@/components/HeroBanner";
import heroImg from "@/assets/heroes/about.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Krish Sense" },
      { name: "description", content: "Built by Bhaskar, Ravi, Ramakrishna and Vinay — a team obsessed with cinematic, science-backed advisory for Indian farmers." },
    ],
  }),
  component: About,
});

const TEAM = ["Bhaskar", "Ravi", "Ramakrishna", "Vinay"];

function About() {
  return (
    <div>
      <HeroBanner
        image={heroImg}
        eyebrow="About"
        title="Every farmer, an agronomist."
        description="Krish Sense is a cinematic, image-first advisory platform. Every crop is a self-contained playbook — from land preparation to market — so a farmer in Guntur never sees data meant for Anantapur."
      />
      <div className="mx-auto max-w-4xl px-6 py-16">


      <div className="mt-16">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Team</div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {TEAM.map((n, i) => (
            <Reveal key={n} delay={i * 100}>
              <div className="card-elegant p-6 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-black text-primary-foreground">
                  {n[0]}
                </div>
                <div className="mt-3 font-display text-xl font-bold">{n}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Co-creator</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
