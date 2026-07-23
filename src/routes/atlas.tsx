import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, Suspense, lazy } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { searchSoilLabs, type LabCenter } from "@/lib/soil-atlas.functions";
import { Search, MapPin, Phone, Clock, Navigation, Globe, Star, Loader2, LocateFixed } from "lucide-react";

const GoogleAtlasMap = lazy(() =>
  import("@/components/GoogleAtlasMap").then((m) => ({ default: m.GoogleAtlasMap })),
);

export const Route = createFileRoute("/atlas")({
  head: () => ({
    meta: [
      { title: "India Soil Testing Atlas — Krish Sense" },
      {
        name: "description",
        content:
          "Search any Indian district, village, town or PIN code and reveal nearby soil testing laboratories with hours, phone and directions.",
      },
    ],
  }),
  component: Atlas,
  ssr: false,
});

function Atlas() {
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const searchFn = useServerFn(searchSoilLabs);

  const mutation = useMutation({
    mutationFn: (query: string) => searchFn({ data: { query } }),
    onSuccess: () => setActiveId(null),
  });

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const value = q.trim();
      if (value.length < 2) return;
      mutation.mutate(value);
    },
    [q, mutation],
  );

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const query = `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
        setQ(query);
        mutation.mutate(query);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [mutation]);

  const result = mutation.data;
  const labs = result?.labs ?? [];
  const active = labs.find((l) => l.id === activeId) ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="max-w-2xl">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Nationwide · India
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          Soil Testing Center Atlas
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Search any state, district, mandal, village, town or PIN code. We drop pins for the
          nearest soil testing laboratories — tap one to reveal address, phone, hours and
          navigation.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <label className="flex flex-1 items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2.5 shadow-sm focus-within:border-primary">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try: Guntur, 522001, Warangal, Nashik…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search location"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={locateMe}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2.5 text-sm font-medium hover:bg-muted/40"
            aria-label="Use my location"
          >
            <LocateFixed className="h-4 w-4" /> GPS
          </button>
          <button
            type="submit"
            disabled={mutation.isPending || q.trim().length < 2}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </button>
        </div>
      </form>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Map */}
        <div>
          <Suspense
            fallback={
              <div className="grid aspect-[4/3] w-full place-items-center rounded-3xl border border-border/60 bg-muted/30 sm:aspect-video">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <GoogleAtlasMap
              center={result?.center ?? null}
              labs={labs}
              activeId={activeId}
              onSelect={setActiveId}
            />
          </Suspense>

          {result?.error ? (
            <div className="mt-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {result.error}. Try a nearby district or a valid 6-digit PIN.
            </div>
          ) : null}
          {result?.center && labs.length === 0 && !mutation.isPending ? (
            <div className="mt-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              No soil testing centers indexed within 25 km of{" "}
              <span className="font-medium text-foreground">{result.center.label}</span>. Try a
              larger nearby town or the district headquarters.
            </div>
          ) : null}
        </div>

        {/* Details / list */}
        <div>
          {active ? (
            <LabDetail lab={active} onClose={() => setActiveId(null)} />
          ) : (
            <LabList labs={labs} onSelect={setActiveId} pending={mutation.isPending} />
          )}
        </div>
      </div>
    </div>
  );
}

function LabList({
  labs,
  onSelect,
  pending,
}: {
  labs: LabCenter[];
  onSelect: (id: string) => void;
  pending: boolean;
}) {
  if (pending) {
    return (
      <div className="grid h-full min-h-[240px] place-items-center rounded-3xl border border-border/60 bg-muted/20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Finding nearest centers…
        </div>
      </div>
    );
  }
  if (labs.length === 0) {
    return (
      <div className="rounded-3xl border border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
        <MapPin className="mb-2 h-5 w-5 text-primary" />
        Search a place to see soil testing centers with pins on the map. Tap any pin to see full
        details — address, phone, working hours and directions.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {labs.length} centers · tap a pin or a row
      </div>
      <ul className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
        {labs.map((lab) => (
          <li key={lab.id}>
            <button
              onClick={() => onSelect(lab.id)}
              className="group w-full rounded-2xl border border-border/60 bg-background/70 p-3 text-left transition hover:border-primary/60 hover:bg-primary/5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold group-hover:text-primary">
                    {lab.name}
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {lab.address}
                  </div>
                </div>
                {typeof lab.distanceMeters === "number" ? (
                  <span className="shrink-0 rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium">
                    {formatDist(lab.distanceMeters)}
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                {lab.openNow !== undefined ? (
                  <span
                    className={
                      lab.openNow
                        ? "font-medium text-emerald-600 dark:text-emerald-400"
                        : "text-destructive"
                    }
                  >
                    {lab.openNow ? "Open now" : "Closed"}
                  </span>
                ) : null}
                {typeof lab.rating === "number" ? (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-amber-500" />
                    {lab.rating.toFixed(1)}
                    {lab.ratingCount ? ` (${lab.ratingCount})` : ""}
                  </span>
                ) : null}
                {lab.phone ? <span className="truncate">{lab.phone}</span> : null}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LabDetail({ lab, onClose }: { lab: LabCenter; onClose: () => void }) {
  const navUrl =
    lab.mapsUri ??
    `https://www.google.com/maps/dir/?api=1&destination=${lab.lat},${lab.lng}`;
  return (
    <div className="rounded-3xl border border-border/60 bg-background/80 p-5 shadow-lg backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            Soil Testing Center
          </div>
          <h2 className="mt-1 font-display text-lg font-bold sm:text-xl">{lab.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-full border border-border/60 px-3 py-1 text-xs hover:bg-muted/40"
        >
          Back to list
        </button>
      </div>

      <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>{lab.address}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {lab.openNow !== undefined ? (
          <Chip>
            <span
              className={
                lab.openNow
                  ? "font-semibold text-emerald-600 dark:text-emerald-400"
                  : "font-semibold text-destructive"
              }
            >
              {lab.openNow ? "Open now" : "Closed"}
            </span>
          </Chip>
        ) : null}
        {typeof lab.distanceMeters === "number" ? (
          <Chip>{formatDist(lab.distanceMeters)} away</Chip>
        ) : null}
        {typeof lab.rating === "number" ? (
          <Chip>
            <Star className="h-3 w-3 fill-current text-amber-500" />
            {lab.rating.toFixed(1)}
            {lab.ratingCount ? ` · ${lab.ratingCount}` : ""}
          </Chip>
        ) : null}
        {lab.status ? <Chip>{lab.status.replace(/_/g, " ").toLowerCase()}</Chip> : null}
      </div>

      {lab.hours && lab.hours.length > 0 ? (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Working hours
          </div>
          <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            {lab.hours.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={navUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Navigation className="h-3.5 w-3.5" /> Navigate
        </a>
        {lab.phone ? (
          <a
            href={`tel:${lab.phone.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-xs font-semibold hover:bg-muted/40"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
        ) : null}
        {lab.website ? (
          <a
            href={lab.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-xs font-semibold hover:bg-muted/40"
          >
            <Globe className="h-3.5 w-3.5" /> Website
          </a>
        ) : null}
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1">
      {children}
    </div>
  );
}

function formatDist(m: number) {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}
