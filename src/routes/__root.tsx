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
import { Footer } from "@/components/Footer";
import { CinematicLoader } from "@/components/CinematicLoader";
import { SearchDialog } from "@/components/SearchDialog";
import { LeoAssistant } from "@/components/LeoAssistant";
import { I18nProvider } from "@/lib/i18n";
import { TranslationProvider } from "@/lib/translate-cache";
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
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KrishiSense — Smart Agricultural Advisory Platform" },
      { name: "description", content: "Cinematic crop advisory: trending crops, live weather, market prices, fertilizer calculator and disease library for Indian farmers." },
      { name: "author", content: "Bhaskar, Ravi, Ramakrishna, Vinay" },
      { property: "og:title", content: "KrishiSense — Smart Agricultural Advisory Platform" },
      { property: "og:description", content: "Cinematic crop advisory: trending crops, live weather, market prices, fertilizer calculator and disease library for Indian farmers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "KrishiSense — Smart Agricultural Advisory Platform" },
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
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
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
          <a href="#main" className="skip-link">Skip to content</a>
          <CinematicLoader />
          <AnimatedBackground />
          <div className="relative flex min-h-dvh flex-col">
            <Navbar onSearchOpen={() => setSearchOpen(true)} />
            <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
              <Outlet />
            </main>
            <Footer />
          </div>
          <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
          <LeoAssistant />
        </TranslationProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
