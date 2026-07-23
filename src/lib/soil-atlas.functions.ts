import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

const SearchInput = z.object({
  query: z.string().min(1).max(200),
  radiusMeters: z.number().int().min(1000).max(50000).optional(),
});

export interface LabCenter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  mapsUri?: string;
  rating?: number;
  ratingCount?: number;
  status?: string;
  openNow?: boolean;
  hours?: string[];
  types?: string[];
  distanceMeters?: number;
}

export interface AtlasSearchResult {
  query: string;
  center: { lat: number; lng: number; label: string } | null;
  labs: LabCenter[];
  error?: string;
}

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

export const searchSoilLabs = createServerFn({ method: "POST" })
  .validator((input: unknown) => SearchInput.parse(input))
  .handler(async ({ data }): Promise<AtlasSearchResult> => {
    const LOVABLE = process.env.LOVABLE_API_KEY;
    const GMAPS = process.env.GOOGLE_MAPS_API_KEY;
    if (!LOVABLE || !GMAPS) {
      return { query: data.query, center: null, labs: [], error: "Maps not configured" };
    }
    const auth = {
      Authorization: `Bearer ${LOVABLE}`,
      "X-Connection-Api-Key": GMAPS,
    };

    // 1) Geocode the query (place / district / PIN / village)
    const q = `${data.query}, India`;
    let center: AtlasSearchResult["center"] = null;
    try {
      const geo = await fetch(
        `${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(q)}&region=in`,
        { headers: auth },
      );
      if (geo.ok) {
        const gj: any = await geo.json();
        const r = gj?.results?.[0];
        if (r?.geometry?.location) {
          center = {
            lat: Number(r.geometry.location.lat),
            lng: Number(r.geometry.location.lng),
            label: r.formatted_address ?? data.query,
          };
        }
      }
    } catch {
      /* fall through */
    }

    if (!center) {
      return { query: data.query, center: null, labs: [], error: "Location not found" };
    }

    // 2) Search nearby soil testing labs via Places API (New) searchText
    const fieldMask = [
      "places.id",
      "places.displayName",
      "places.formattedAddress",
      "places.location",
      "places.nationalPhoneNumber",
      "places.internationalPhoneNumber",
      "places.regularOpeningHours",
      "places.currentOpeningHours",
      "places.googleMapsUri",
      "places.websiteUri",
      "places.rating",
      "places.userRatingCount",
      "places.businessStatus",
      "places.types",
    ].join(",");

    const radius = data.radiusMeters ?? 25000;
    const textQueries = [
      `soil testing laboratory near ${data.query}`,
      `soil health card center near ${data.query}`,
      `Krishi Vigyan Kendra near ${data.query}`,
    ];

    const seen = new Map<string, LabCenter>();

    for (const textQuery of textQueries) {
      try {
        const res = await fetch(`${GATEWAY_URL}/places/v1/places:searchText`, {
          method: "POST",
          headers: {
            ...auth,
            "Content-Type": "application/json",
            "X-Goog-FieldMask": fieldMask,
          },
          body: JSON.stringify({
            textQuery,
            regionCode: "IN",
            maxResultCount: 15,
            locationBias: {
              circle: {
                center: { latitude: center.lat, longitude: center.lng },
                radius,
              },
            },
          }),
        });
        if (!res.ok) continue;
        const pj: any = await res.json();
        const places: any[] = pj?.places ?? [];
        for (const p of places) {
          const id = p?.id;
          const loc = p?.location;
          if (!id || !loc) continue;
          if (seen.has(id)) continue;
          const lat = Number(loc.latitude);
          const lng = Number(loc.longitude);
          const dist = haversine(center, { lat, lng });
          if (dist > radius * 1.5) continue;
          const hours: string[] | undefined =
            p?.currentOpeningHours?.weekdayDescriptions ??
            p?.regularOpeningHours?.weekdayDescriptions ??
            undefined;
          seen.set(id, {
            id,
            name: p?.displayName?.text ?? "Soil Testing Center",
            address: p?.formattedAddress ?? "",
            lat,
            lng,
            phone: p?.nationalPhoneNumber ?? p?.internationalPhoneNumber,
            website: p?.websiteUri,
            mapsUri: p?.googleMapsUri,
            rating: typeof p?.rating === "number" ? p.rating : undefined,
            ratingCount: p?.userRatingCount,
            status: p?.businessStatus,
            openNow:
              p?.currentOpeningHours?.openNow ??
              p?.regularOpeningHours?.openNow ??
              undefined,
            hours,
            types: p?.types,
            distanceMeters: dist,
          });
        }
      } catch {
        /* ignore, try next query */
      }
    }

    const labs = Array.from(seen.values()).sort(
      (a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0),
    );

    return { query: data.query, center, labs };
  });
