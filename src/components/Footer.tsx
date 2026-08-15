import { Link } from "@tanstack/react-router";
import { Sprout, Github, Twitter, Youtube } from "lucide-react";
import { useT } from "@/lib/i18n";

export function Footer() {
  const t = useT();
  return (
    <footer className="mt-24 border-t border-white/5 pt-16 pb-10 neo-glass bg-midnight-navy/40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary-crimson to-bright-crimson shadow-lg shadow-primary-crimson/20">
                <Sprout className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-black tracking-tighter text-moonlight-white">
                KRISH <span className="text-primary-crimson">SENSE</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-blue-gray leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>
          <FooterCol
            title={t("footer.platform")}
            links={[
              { to: "/crops", label: t("nav.crops") },
              { to: "/paddy-future", label: t("nav.paddyFuture") },
              { to: "/rotation", label: t("nav.rotation") },
              { to: "/calculators", label: t("nav.fertilizer") },
              { to: "/diseases", label: t("nav.diseases") },
            ]}
          />
          <FooterCol
            title={t("footer.insights")}
            links={[
              
              { to: "/market", label: t("nav.market") },
              { to: "/schemes", label: t("nav.schemes") },
              { to: "/districts", label: t("nav.districts") },
            ]}
          />
          <FooterCol
            title={t("footer.company")}
            links={[
              { to: "/about", label: t("nav.about") },
              { to: "/contact", label: t("nav.contact") },
            ]}
          />
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-muted-blue-gray sm:flex-row">
          <p>© {new Date().getFullYear()} KRISH SENSE. Premium Cinematic Agritech.</p>
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
