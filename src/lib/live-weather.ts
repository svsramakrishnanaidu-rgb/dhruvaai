/**
 * Live weather from Open-Meteo (free, no API key, browser-safe).
 * Cached in-memory per district for the session.
 */

const CACHE = new Map<string, { at: number; data: LiveWeather }>();
const TTL_MS = 15 * 60 * 1000; // 15 min

export type LiveWeather = {
  district: string;
  tempC: number;
  humidity: number;
  windKph: number;
  precipMm: number;
  weatherCode: number;
  sky: string;
  fetchedAt: number;
};

// Rough district → (lat, lon) index. Falls back to Hyderabad if unknown.
const COORDS: Record<string, [number, number]> = {
  Guntur: [16.3067, 80.4365],
  Krishna: [16.5062, 80.6480],
  Anantapur: [14.6819, 77.6006],
  Kurnool: [15.8281, 78.0373],
  Chittoor: [13.2172, 79.1003],
  Nellore: [14.4426, 79.9865],
  Kadapa: [14.4674, 78.8241],
  Prakasam: [15.3486, 79.5603],
  Visakhapatnam: [17.6868, 83.2185],
  Vizianagaram: [18.1067, 83.3956],
  Srikakulam: [18.2949, 83.8938],
  "West Godavari": [16.9174, 81.3399],
  "East Godavari": [16.9891, 82.2475],
  Hyderabad: [17.3850, 78.4867],
  Warangal: [17.9784, 79.5941],
  Karimnagar: [18.4386, 79.1288],
  Nizamabad: [18.6725, 78.0941],
  Mahbubnagar: [16.7488, 77.9853],
  Nalgonda: [17.0575, 79.2670],
  Medak: [18.0451, 78.2634],
  Nagpur: [21.1458, 79.0882],
  Pune: [18.5204, 73.8567],
  Nashik: [19.9975, 73.7898],
  Ahmednagar: [19.0948, 74.7480],
  Kolhapur: [16.7050, 74.2433],
  Ludhiana: [30.9010, 75.8573],
  Amritsar: [31.6340, 74.8723],
  Bathinda: [30.2110, 74.9455],
  Karnal: [29.6857, 76.9905],
  Hisar: [29.1492, 75.7217],
  Meerut: [28.9845, 77.7064],
  Lucknow: [26.8467, 80.9462],
  Varanasi: [25.3176, 82.9739],
  Ahmedabad: [23.0225, 72.5714],
  Rajkot: [22.3039, 70.8022],
  Junagadh: [21.5222, 70.4579],
  Jaipur: [26.9124, 75.7873],
  Jodhpur: [26.2389, 73.0243],
  Bhopal: [23.2599, 77.4126],
  Indore: [22.7196, 75.8577],
  Patna: [25.5941, 85.1376],
  Kolkata: [22.5726, 88.3639],
  Bengaluru: [12.9716, 77.5946],
  Mysuru: [12.2958, 76.6394],
  Coimbatore: [11.0168, 76.9558],
  Madurai: [9.9252, 78.1198],
  Chennai: [13.0827, 80.2707],
  Thanjavur: [10.7870, 79.1378],
  Kochi: [9.9312, 76.2673],
};

function codeToSky(code: number): string {
  if (code === 0) return "Clear";
  if ([1, 2].includes(code)) return "Mostly clear";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "Rain";
  if ([66, 67].includes(code)) return "Freezing rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "—";
}

export async function fetchLiveWeather(district: string): Promise<LiveWeather | null> {
  const key = district || "Hyderabad";
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;
  const coord = COORDS[key] ?? COORDS.Hyderabad;
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${coord[0]}&longitude=${coord[1]}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m` +
      `&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const j = await res.json();
    const c = j.current ?? {};
    const data: LiveWeather = {
      district: key,
      tempC: Math.round(c.temperature_2m ?? 0),
      humidity: Math.round(c.relative_humidity_2m ?? 0),
      windKph: Math.round((c.wind_speed_10m ?? 0) * 1),
      precipMm: Number(c.precipitation ?? 0),
      weatherCode: Number(c.weather_code ?? 0),
      sky: codeToSky(Number(c.weather_code ?? 0)),
      fetchedAt: Date.now(),
    };
    CACHE.set(key, { at: Date.now(), data });
    return data;
  } catch {
    return null;
  }
}

/** Synchronous cached read — returns null if not yet fetched. */
export function cachedLiveWeather(district: string): LiveWeather | null {
  return CACHE.get(district)?.data ?? null;
}

/** Small helper: current season + time-of-day, computed client-side. */
export function nowContext(): {
  date: string;
  weekday: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  season: "Kharif" | "Rabi" | "Zaid";
  monthName: string;
} {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMonth() + 1; // 1..12
  const timeOfDay: "morning" | "afternoon" | "evening" | "night" =
    h < 5 ? "night" : h < 12 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night";
  const season: "Kharif" | "Rabi" | "Zaid" =
    m >= 6 && m <= 10 ? "Kharif" : m >= 11 || m <= 3 ? "Rabi" : "Zaid";
  return {
    date: d.toISOString().slice(0, 10),
    weekday: d.toLocaleDateString(undefined, { weekday: "long" }),
    monthName: d.toLocaleDateString(undefined, { month: "long" }),
    timeOfDay,
    season,
  };
}
