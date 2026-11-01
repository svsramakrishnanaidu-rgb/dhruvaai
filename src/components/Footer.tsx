import { Link } from "@tanstack/react-router";
import dhruvaLogo from "@/assets/dhruva-logo.png.asset.json";
import { Github, Twitter, Youtube } from "lucide-react";
import { useT } from "@/lib/i18n";

export function Footer() {
  const t = useT();
  return (
    <footer className="mt-24 border-t border-web-leaf/10 bg-web-bg-midnight/30 pt-16 pb-10 font-[Plus Jakarta Sans]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-web-emerald/20">
                <img src={dhruvaLogo.url} alt="" aria-hidden className="h-9 w-9 object-cover" />
              </div>
              <span className="font-[Unbounded] text-lg font-black text-web-mist">
                DHRUVA
              </span>
            </div>
            <p className="mt-3 max-w-xs text-[11px] font-bold uppercase tracking-widest text-web-sage">
              {t("footer.tagline")}
            </p>
          </div>
          <FooterCol
            title={t("footer.platform")}
            links={[
              { to: "/crops", label: t("nav.crops") },
              { to: "/rotation", label: t("nav.rotation") },
              { to: "/diseases", label: t("nav.diseases") },
            ]}
          />
          <FooterCol
            title={t("footer.insights")}
            links={[
              { to: "/market", label: t("nav.market") },
              { to: "/weather", label: t("nav.weather") },
              { to: "/atlas", label: t("nav.districts") },
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
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-web-leaf/10 pt-6 text-[10px] font-black uppercase tracking-widest text-web-sage sm:flex-row">
          <p>© {new Date().getFullYear()} DHRUVA. Created by Mr. SRK.</p>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="GitHub" className="text-web-sage hover:text-web-gold transition-colors"><Github className="h-4 w-4" /></a>
            <a href="#" aria-label="Twitter" className="text-web-sage hover:text-web-gold transition-colors"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube" className="text-web-sage hover:text-web-gold transition-colors"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-web-gold">{title}</h4>
      <ul className="space-y-2 text-[11px] font-bold uppercase tracking-widest">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-web-sage hover:text-web-mist transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
