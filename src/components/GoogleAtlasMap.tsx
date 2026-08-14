"use client";
import { useEffect, useRef } from "react";
import type { LabCenter } from "@/lib/soil-atlas.functions";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import gsap from "gsap";

let loaderPromise: Promise<any> | null = null;
function loadMapsApi() {
  if (typeof window === "undefined") return Promise.reject("no window");
  const w = window as any;
  if (w.google?.maps) return Promise.resolve(w.google);
  if (loaderPromise) return loaderPromise;
  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
  if (!key) return Promise.reject("Missing Google Maps browser key");
  loaderPromise = new Promise((resolve, reject) => {
    w.__initAtlasMap = () => resolve(w.google);
    const s = document.createElement("script");
    s.async = true;
    s.defer = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      key,
    )}&loading=async&callback=__initAtlasMap${channel ? `&channel=${encodeURIComponent(channel)}` : ""}`;
    s.onerror = () => reject("Failed to load Google Maps");
    document.head.appendChild(s);
  });
  return loaderPromise;
}

interface Props {
  center: { lat: number; lng: number } | null;
  labs: LabCenter[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function GoogleAtlasMap({ center, labs, activeId, onSelect }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const clustererRef = useRef<MarkerClusterer | null>(null);

  useEffect(() => {
    if (!ref.current || !center) return;
    let cancelled = false;
    loadMapsApi()
      .then((g) => {
        if (cancelled || !ref.current) return;
        if (!mapRef.current) {
          mapRef.current = new g.maps.Map(ref.current, {
            center,
            zoom: 11,
            mapId: "DEMO_MAP_ID", // For advanced markers if needed
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#E5C366" }] },
              { featureType: "landscape", stylers: [{ color: "#0A0A0A" }] },
              { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
              { featureType: "road", stylers: [{ color: "#1A1A1A" }] },
              { featureType: "water", stylers: [{ color: "#000000" }] },
            ],
          });
          clustererRef.current = new MarkerClusterer({ map: mapRef.current });
        } else {
          mapRef.current.panTo(center);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [center?.lat, center?.lng]);

  useEffect(() => {
    const g = (window as any).google;
    if (!g?.maps || !mapRef.current || !clustererRef.current) return;
    const map = mapRef.current;
    const clusterer = clustererRef.current;
    const existing = markersRef.current;

    const nextIds = new Set(labs.map((l) => l.id));
    for (const [id, m] of existing) {
      if (!nextIds.has(id)) {
        clusterer.removeMarker(m);
        m.setMap(null);
        existing.delete(id);
      }
    }

    const newMarkers: any[] = [];
    for (const lab of labs) {
      if (!existing.has(lab.id)) {
        const m = new g.maps.Marker({
          position: { lat: lab.lat, lng: lab.lng },
          title: lab.name,
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            fillColor: "#E5C366",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
            scale: 10,
          },
        });
        m.addListener("click", () => onSelect(lab.id));
        existing.set(lab.id, m);
        newMarkers.push(m);
      }
    }
    clusterer.addMarkers(newMarkers);

    if (labs.length > 0 && center) {
      const bounds = new g.maps.LatLngBounds();
      bounds.extend(center);
      labs.forEach((l) => bounds.extend({ lat: l.lat, lng: l.lng }));
      map.fitBounds(bounds, 60);
    }
  }, [labs, center]);

  useEffect(() => {
    if (!mapRef.current || !activeId) return;
    const lab = labs.find((l) => l.id === activeId);
    if (lab) {
      const pos = { lat: lab.lat, lng: lab.lng };
      mapRef.current.panTo(pos);
      mapRef.current.setZoom(14);
    }
  }, [activeId, labs]);

  return (
    <div
      ref={ref}
      className="aspect-[4/3] w-full overflow-hidden rounded-3xl border border-gold-2/20 shadow-glow sm:aspect-video"
    />
  );
}
