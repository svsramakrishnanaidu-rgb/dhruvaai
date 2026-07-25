import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { CinematicLoader } from "@/components/CinematicLoader";

import { SearchDialog } from "@/components/SearchDialog";
import { AutoLocalize } from "@/components/AutoLocalize";
import { AutoLocate } from "@/components/AutoLocate";
import { MiniPlayer } from "@/components/MiniPlayer";


import { I18nProvider } from "@/lib/i18n";
import { TranslationProvider } from "@/lib/translate-cache";
import { MusicProvider } from "@/lib/music-store";
import { useLocation as useUserLocation } from "@/lib/location-store";
import { fetchLiveWeather } from "@/lib/live-weather";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl font-black text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">This field is fallow</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for hasn't been sown yet.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Something wilted</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again or head home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-110"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#111111" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "format-detection", content: "telephone=no" },
      { title: "Krish Sense — Smart Agricultural Advisory Platform" },
      { name: "description", content: "Cinematic crop advisory: trending crops, live weather, market prices, fertilizer calculator and disease library for Indian farmers." },
      { name: "author", content: "Bhaskar, Ravi, Ramakrishna, Vinay" },
      { property: "og:title", content: "Krish Sense — Smart Agricultural Advisory Platform" },
      { property: "og:description", content: "Cinematic crop advisory: trending crops, live weather, market prices, fertilizer calculator and disease library for Indian farmers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Krish Sense — Smart Agricultural Advisory Platform" },
      { name: "twitter:description", content: "Cinematic crop advisory: trending crops, live weather, market prices, fertilizer calculator and disease library for Indian farmers." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/2e9d4641-a461-4a68-ae35-cf51b71e4f2a" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/2e9d4641-a461-4a68-ae35-cf51b71e4f2a" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Orbitron:wght@600;700;800;900&family=Rajdhani:wght@500;600;700&display=swap",
      },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // Runs before hydration: tags <html> with device/OS/orientation classes so
  // CSS + components can adapt without a first-paint flash.
  const deviceDetectScript = `
    (function(){try{
      var h=document.documentElement, ua=navigator.userAgent||"", p=navigator.platform||"", mt=navigator.maxTouchPoints||0;
      var isIOS=/iPad|iPhone|iPod/.test(ua)||(p==='MacIntel'&&mt>1);
      var isAndroid=/Android/.test(ua);
      var isMac=/Mac/.test(p)&&!isIOS;
      var isWin=/Win/.test(p);
      var isLinux=/Linux/.test(p)&&!isAndroid;
      var isTouch=mt>0||/Mobi|Tablet/.test(ua);
      var w=window.innerWidth;
      var bp = w<640?'xs':w<768?'sm':w<1024?'md':w<1440?'lg':w<1920?'xl':'2xl';
      var os=isIOS?'ios':isAndroid?'android':isMac?'macos':isWin?'windows':isLinux?'linux':'other';
      h.classList.add('os-'+os,'bp-'+bp, isTouch?'is-touch':'is-mouse');
      h.dataset.os=os; h.dataset.bp=bp;
      var setOrient=function(){h.dataset.orient=window.matchMedia('(orientation: portrait)').matches?'portrait':'landscape';};
      setOrient(); window.addEventListener('orientationchange', setOrient); window.addEventListener('resize', setOrient);
    }catch(e){}})();
  `;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: deviceDetectScript }} />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [searchOpen, setSearchOpen] = useState(false);
  const userLoc = useUserLocation();

  // Warm the live-weather cache whenever the user's district changes so
  // LEO and the UI can ground answers in real conditions.
  useEffect(() => {
    if (userLoc.district) fetchLiveWeather(userLoc.district).catch(() => {});
  }, [userLoc.district]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    const onLeoSearch = () => setSearchOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("leo:openSearch", onLeoSearch);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("leo:openSearch", onLeoSearch);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TranslationProvider>
          <MusicProvider>
            <a href="#main" className="skip-link">Skip to content</a>
            <CinematicLoader />

            <AnimatedBackground />
            <div className="relative flex min-h-dvh flex-col ks-safe">
              <Navbar onSearchOpen={() => setSearchOpen(true)} />
              <main id="main" tabIndex={-1} className="flex-1 pb-20 focus:outline-none lg:pb-0">
                <Outlet />
              </main>
              <Footer />
            </div>
            <MobileBottomNav />
            <MiniPlayer />
            <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
            <AutoLocalize />
            <AutoLocate />
          </MusicProvider>
        </TranslationProvider>

      </I18nProvider>
    </QueryClientProvider>
  );
}
