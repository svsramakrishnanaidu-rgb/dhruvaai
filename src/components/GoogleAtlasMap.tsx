"use client";
import { useEffect, useRef } from "react";
import type { LabCenter } from "@/lib/soil-atlas.functions";

// Load Google Maps JS API once, then resolve.
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
  const infoRef = useRef<any>(null);

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
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
            ],
          });
          infoRef.current = new g.maps.InfoWindow();
        } else {
          mapRef.current.setCenter(center);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [center?.lat, center?.lng]);

  // Sync markers
  useEffect(() => {
    const g = (window as any).google;
    if (!g?.maps || !mapRef.current) return;
    const map = mapRef.current;
    const existing = markersRef.current;

    const nextIds = new Set(labs.map((l) => l.id));
    for (const [id, m] of existing) {
      if (!nextIds.has(id)) {
        m.setMap(null);
        existing.delete(id);
      }
    }

    for (const lab of labs) {
      let m = existing.get(lab.id);
      if (!m) {
        m = new g.maps.Marker({
          position: { lat: lab.lat, lng: lab.lng },
          map,
          title: lab.name,
        });
        m.addListener("click", () => onSelect(lab.id));
        existing.set(lab.id, m);
      }
    }

    // Fit bounds if we have labs
    if (labs.length > 0 && center) {
      const bounds = new g.maps.LatLngBounds();
      bounds.extend(center);
      labs.forEach((l) => bounds.extend({ lat: l.lat, lng: l.lng }));
      map.fitBounds(bounds, 60);
    }
  }, [labs, onSelect, center?.lat, center?.lng]);

  // Info window for active
  useEffect(() => {
    const g = (window as any).google;
    if (!g?.maps || !mapRef.current || !infoRef.current) return;
    if (!activeId) {
      infoRef.current.close();
      return;
    }
    const lab = labs.find((l) => l.id === activeId);
    const marker = markersRef.current.get(activeId);
    if (!lab || !marker) return;
    infoRef.current.setContent(
      `<div style="font-family:system-ui;font-size:12px;max-width:220px">
        <div style="font-weight:600;font-size:13px;margin-bottom:4px">${escapeHtml(lab.name)}</div>
        <div style="color:#555;margin-bottom:4px">${escapeHtml(lab.address)}</div>
        ${lab.phone ? `<div>📞 ${escapeHtml(lab.phone)}</div>` : ""}
        ${lab.openNow !== undefined ? `<div>${lab.openNow ? "🟢 Open now" : "🔴 Closed"}</div>` : ""}
      </div>`,
    );
    infoRef.current.open({ map: mapRef.current, anchor: marker });
    mapRef.current.panTo({ lat: lab.lat, lng: lab.lng });
  }, [activeId, labs]);

  if (!center) {
    return (
      <div className="grid aspect-[4/3] w-full place-items-center rounded-3xl border border-border/60 bg-muted/30 text-sm text-muted-foreground sm:aspect-video">
        Search a district, place or PIN to see nearby soil testing centers.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/60 shadow-lg sm:aspect-video"
    />
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}
