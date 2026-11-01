import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, Suspense, lazy, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { searchSoilLabs, type LabCenter } from "@/lib/soil-atlas.functions";
import { 
  Search, MapPin, Phone, Clock, Navigation, Globe, Star, Loader2, 
  LocateFixed, Filter, Info, ChevronRight, X, FlaskConical, Map as MapIcon,
  LayoutList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GoogleAtlasMap = lazy(() =>
  import("@/components/GoogleAtlasMap").then((m) => ({ default: m.GoogleAtlasMap })),
);

import { ManualLocationPicker, type ManualPlace } from "@/components/ManualLocationPicker";

export const Route = createFileRoute("/atlas")({
  head: () => ({
    meta: [
      { title: "National Soil Testing Atlas — DHRUVA" },
      {
        name: "description",
        content: "Premium interactive atlas of soil testing centers across India with real-time GPS tracking and service filtering.",
      },
    ],
  }),
  component: Atlas,
  ssr: false,
});

function Atlas() {
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<"map" | "list">("map");
  const [filterType, setFilterType] = useState<string>("All");
  const [manualPlace, setManualPlace] = useState<ManualPlace | null>(null);
  
  const searchFn = useServerFn(searchSoilLabs);

  const mutation = useMutation({
    mutationFn: (query: string) => searchFn({ data: { query } }),
    onSuccess: () => setActiveId(null),
  });

  const onManualSelect = useCallback((p: ManualPlace) => {
    setManualPlace(p);
    setQ(p.name);
    mutation.mutate(`${p.lat},${p.lon}`);
  }, [mutation]);

  const onManualClear = useCallback(() => {
    setManualPlace(null);
    setQ("");
  }, []);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const value = q.trim();
      if (value.length < 2) return;
      mutation.mutate(value);
    },
    [q, mutation],
  );

  const locateMe = useCallback(async () => {
    try {
      const { requestLocationPermission } = await import("@/lib/geolocate");
      const outcome = await requestLocationPermission({ highAccuracy: true, timeout: 10000 });
      
      if (outcome.status === "granted" && outcome.result?.status === "granted") {
        const query = `${outcome.result.accuracy ? 'precise' : 'fixed'}:${outcome.result.state || ''},${outcome.result.district || ''}`;
        // Note: The geolocate applyCoords already sets the locationStore, 
        // but for the Atlas we want to trigger the search mutation with coordinates.
        if (outcome.accuracy) {
          // If we have raw accuracy, it likely came from a fresh GPS fix
          // We'll use the coordinates for the search
          // Note: requestLocationPermission currently doesn't return raw lat/lon in the outcome object directly 
          // besides via the internal applyCoords call which we'd have to duplicate or expose.
          // Let's check navigator directly since we just got permission.
          navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude.toFixed(5);
            const lon = pos.coords.longitude.toFixed(5);
            setQ("My Location");
            mutation.mutate(`${lat},${lon}`);
          });
        }
      } else if (outcome.status === "servicesOff") {
        // Fallback to coarse if services are off but IP might work
        setQ("Searching...");
        mutation.mutate("current location");
      }
    } catch (err) {
      console.error("Atlas location error:", err);
    }
  }, [mutation]);

  const labs = useMemo(() => {
    const raw = mutation.data?.labs ?? [];
    if (filterType === "All") return raw;
    return raw.filter(l => l.services?.includes(filterType));
  }, [mutation.data, filterType]);

  const active = labs.find((l) => l.id === activeId) ?? null;
  const stats = useMemo(() => ({
    total: labs.length,
    open: labs.filter(l => l.openNow).length,
    nearby: labs.filter(l => (l.distanceMeters ?? 0) < 5000).length
  }), [labs]);

  return (
    <div className="relative min-h-screen bg-web-bg-midnight">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_-20%,var(--web-emerald),transparent_50%)]" />
      
      <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:h-screen lg:overflow-hidden flex flex-col">
        <header className="mb-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-web-sage mb-1">
                National Agriculture Data Hub
              </div>
              <h1 className="font-[Unbounded] text-3xl font-black tracking-tight text-web-gold sm:text-4xl">
                Soil Testing Atlas
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <StatCard label="Total Centers" value={stats.total} icon={<FlaskConical className="w-3 h-3"/>} />
              <StatCard label="Open Now" value={stats.open} icon={<Clock className="w-3 h-3"/>} color="text-emerald-400" />
            </div>
          </motion.div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[400px_1fr] flex-1 min-h-0">
          {/* Sidebar: Filters & List */}
          <aside className="flex flex-col gap-4 overflow-hidden h-full">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="web-glass p-4 space-y-4 border-web-leaf/10 font-[Plus Jakarta Sans]"
            >
              <form onSubmit={onSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-web-sage" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search District, Pincode, Village..."
                  className="w-full bg-web-bg-midnight/40 border border-web-leaf/10 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-web-mist focus:outline-none focus:border-web-emerald/50 transition-all"
                />
              </form>
              
              <div className="pt-2">
                <ManualLocationPicker 
                  active={manualPlace} 
                  onSelect={onManualSelect} 
                  onClear={onManualClear}
                  variant="atlas"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={locateMe}
                  className="flex-1 web-glass border-web-leaf/10 py-2 px-3 text-[10px] font-black flex items-center justify-center gap-2 hover:bg-web-emerald/10 transition-colors group text-web-mist uppercase tracking-widest"
                >
                  <LocateFixed className="w-3 h-3 text-web-gold group-hover:scale-110 transition-transform" /> 
                  <span className="relative">
                    Live GPS
                    <span className="absolute -top-1 -right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-web-emerald opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-web-emerald"></span>
                    </span>
                  </span>
                </button>
                <button
                  onClick={onSubmit}
                  disabled={mutation.isPending}
                  className="flex-[1.5] bg-web-emerald/20 border border-web-emerald/30 py-2 px-4 text-[10px] font-black uppercase tracking-widest text-web-gold flex items-center justify-center gap-2 hover:bg-web-emerald/30 transition-all"
                >
                  {mutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />} 
                  Find Labs
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {["All", "Soil Health Card", "NPK Testing", "Micronutrient"].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                      filterType === type 
                        ? "bg-web-gold text-web-bg-midnight border-web-gold" 
                        : "bg-web-bg-midnight/40 border-web-leaf/10 text-web-sage hover:border-web-emerald/40 hover:text-web-mist"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
              <AnimatePresence mode="wait">
                {mutation.isPending ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
                    <div className="relative">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                      <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
                    </div>
                    <span className="text-xs font-bold tracking-widest uppercase">Mapping centers...</span>
                  </div>
                ) : labs.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    {labs.map((lab, i) => (
                      <LabListItem 
                        key={lab.id} 
                        lab={lab} 
                        index={i}
                        active={activeId === lab.id}
                        onClick={() => {
                          setActiveId(lab.id);
                          setView("map");
                        }} 
                      />
                    ))}
                  </motion.div>
                ) : (
                  <div className="web-glass p-10 text-center space-y-3 border-web-leaf/10 font-[Plus Jakarta Sans]">
                    <div className="bg-web-emerald/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                      <MapPin className="text-web-gold w-6 h-6" />
                    </div>
                    <p className="text-[10px] text-web-sage font-black uppercase tracking-widest">Search for centers to see them on the atlas map.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </aside>

          {/* Main: Map / Details */}
          <main className="relative h-full flex flex-col overflow-hidden">
            <div className="flex lg:hidden gap-2 mb-4">
              <button 
                onClick={() => setView("map")}
                className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${view === 'map' ? 'bg-primary text-black' : 'neo-glass-card'}`}
              >
                <MapIcon className="w-4 h-4" /> Map
              </button>
              <button 
                onClick={() => setView("list")}
                className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${view === 'list' ? 'bg-primary text-black' : 'neo-glass-card'}`}
              >
                <LayoutList className="w-4 h-4" /> List
              </button>
            </div>

            <div className={`flex-1 relative rounded-3xl overflow-hidden border border-web-leaf/20 shadow-2xl ${view === 'list' ? 'hidden lg:block' : 'block'}`}>
              <Suspense fallback={<div className="w-full h-full bg-muted/20 animate-pulse flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
                <GoogleAtlasMap 
                  center={mutation.data?.center ?? null} 
                  labs={labs} 
                  activeId={activeId} 
                  onSelect={setActiveId} 
                />
              </Suspense>

              {/* Float Overlay Details on Mobile/Tablet */}
              <AnimatePresence>
                {active && (
                  <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    className="absolute inset-x-0 bottom-0 lg:left-6 lg:bottom-6 lg:w-[450px] z-50"
                  >
                    <LabDetailCard lab={active} onClose={() => setActiveId(null)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = "text-primary" }: { label: string, value: number, icon: any, color?: string }) {
  return (
    <div className="web-glass px-3 py-1.5 flex items-center gap-3 border-web-leaf/10 font-[Plus Jakarta Sans]">
      <div className={`bg-web-bg-midnight/30 p-1.5 rounded-lg ${color}`}>{icon}</div>
      <div>
        <div className="text-[9px] font-black uppercase tracking-widest text-web-sage leading-none">{label}</div>
        <div className="text-sm font-[Unbounded] font-black text-web-mist">{value}</div>
      </div>
    </div>
  );
}

function LabListItem({ lab, index, active, onClick }: { lab: LabCenter, index: number, active: boolean, onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all hover-lift font-[Plus Jakarta Sans] ${
        active 
          ? "web-glass bg-web-emerald/10 border-web-emerald shadow-glow" 
          : "web-glass border-web-leaf/10 bg-web-bg-midnight/20 hover:border-web-emerald/30"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-black uppercase tracking-tight truncate ${active ? 'text-web-gold' : 'text-web-mist'}`}>{lab.name}</h3>
          <p className="text-[10px] text-web-sage truncate font-bold flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-web-gold" /> {lab.address}
          </p>
        </div>
        {lab.distanceMeters && (
          <span className="text-[9px] font-black uppercase tracking-widest bg-web-bg-midnight/50 px-2 py-1 rounded-full border border-web-leaf/10 shrink-0 text-web-mist">
            {(lab.distanceMeters / 1000).toFixed(1)} km
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${lab.openNow ? 'text-emerald-400' : 'text-rose-400'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${lab.openNow ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-rose-400'}`} />
          {lab.openNow ? 'OPEN' : 'CLOSED'}
        </div>
        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-web-sage">
          <Star className="w-2.5 h-2.5 text-web-gold fill-web-gold" />
          {lab.rating?.toFixed(1) || 'N/A'}
        </div>
        <div className="ml-auto text-[9px] font-black uppercase tracking-widest text-web-gold flex items-center gap-1">
          Details <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </motion.button>
  );
}

function LabDetailCard({ lab, onClose }: { lab: LabCenter, onClose: () => void }) {
  return (
    <div className="web-glass p-6 lg:rounded-[2.5rem] shadow-2xl border-web-gold/30 bg-black/90 backdrop-blur-3xl m-4 lg:m-0 font-[Plus Jakarta Sans]">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-web-emerald/20 text-web-emerald text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">Verified Lab</span>
            {lab.openNow && <span className="bg-emerald-400/20 text-emerald-400 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase">Open</span>}
          </div>
          <h2 className="text-xl font-display font-bold text-gradient">{lab.name}</h2>
        </div>
        <button onClick={onClose} className="bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <DetailItem icon={<MapPin className="text-primary"/>} label="Address" value={lab.address} />
        {lab.phone && <DetailItem icon={<Phone className="text-primary"/>} label="Contact" value={lab.phone} />}
        {lab.hours && <DetailItem icon={<Clock className="text-primary"/>} label="Working Hours" value={lab.hours[0]} />}
        <DetailItem 
          icon={<FlaskConical className="text-primary"/>} 
          label="Services" 
          value={lab.services?.join(" • ") || "Soil testing and advisory"} 
        />
        <DetailItem icon={<Info className="text-primary"/>} label="Testing Charges" value={lab.charges || "Variable (Contact center)"} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a 
          href={lab.mapsUri || `https://www.google.com/maps/dir/?api=1&destination=${lab.lat},${lab.lng}`}
          target="_blank"
          rel="noreferrer"
          className="btn-gold py-4 flex items-center justify-center gap-2 text-xs"
        >
          <Navigation className="w-4 h-4" /> Get Directions
        </a>
        {lab.phone ? (
          <a href={`tel:${lab.phone}`} className="neo-glass-card py-4 flex items-center justify-center gap-2 text-xs font-bold hover:bg-white/5 transition-colors">
            <Phone className="w-4 h-4" /> Call Now
          </a>
        ) : (
          <div className="neo-glass-card py-4 flex items-center justify-center gap-2 text-xs font-bold opacity-50">
            <Phone className="w-4 h-4" /> No Phone
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex gap-4">
      <div className="bg-white/5 p-2 rounded-xl h-fit">{icon}</div>
      <div>
        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{label}</div>
        <div className="text-sm font-medium leading-relaxed">{value}</div>
      </div>
    </div>
  );
}
