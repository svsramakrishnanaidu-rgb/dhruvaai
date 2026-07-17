import { Link } from "@tanstack/react-router";
import { Sprout, Github, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/50 pt-16 pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent">
                <Sprout className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">
                Krishi<span className="text-gradient">Sense</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Cinematic, science-backed advisory that turns every farmer into a data-driven agronomist.
            </p>
          </div>
          <FooterCol
            title="Platform"
            links={[
              { to: "/crops", label: "Crop Library" },
              { to: "/rotation", label: "Rotation" },
              { to: "/fertilizer", label: "Fertilizer" },
              { to: "/diseases", label: "Diseases" },
            ]}
          />
          <FooterCol
            title="Insights"
            links={[
              { to: "/weather", label: "Weather" },
              { to: "/market", label: "Market Prices" },
              { to: "/schemes", label: "Govt Schemes" },
              { to: "/districts", label: "Districts" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
            ]}
          />
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} KrishiSense. Built by Bhaskar, Ravi, Ramakrishna & Vinay.</p>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="GitHub" className="hover:text-foreground"><Github className="h-4 w-4" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-foreground"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h4>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="story-link text-foreground/80 hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
