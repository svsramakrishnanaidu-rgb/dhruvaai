/**
 * Live weather from Open-Meteo (free, no API key, browser-safe).
 * Includes current conditions, hourly + daily forecast, air quality,
 * soil metrics and historical archive. Cached in-memory per key.
 */

const CACHE = new Map<string, { at: number; data: LiveWeather }>();
const BUNDLE_CACHE = new Map<string, { at: number; data: WeatherBundle }>();
const TTL_MS = 10 * 60 * 1000; // 10 min

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

export type HourlyPoint = {
  time: string; // ISO
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  precipMm: number;
  precipProb: number;
  weatherCode: number;
  windKph: number;
  cloudPct: number;
  uv: number;
};

export type DailyPoint = {
  date: string; // YYYY-MM-DD
  tMinC: number;
  tMaxC: number;
  weatherCode: number;
  precipMm: number;
  precipProb: number;
  windMaxKph: number;
  gustsMaxKph: number;
  uvMax: number;
  sunrise: string;
  sunset: string;
};

export type AirQuality = {
  aqi: number; // European AQI 0..100+
  pm2_5: number;
  pm10: number;
  co: number;
  no2: number;
  o3: number;
  so2: number;
};

export type SoilMetrics = {
  soilTempC: number;
  soilMoisture: number; // 0..1
  evapotranspirationMm: number;
};

export type WeatherBundle = {
  place: string; // display name
  lat: number;
  lon: number;
  fetchedAt: number;
  timezone: string;
  current: {
    tempC: number;
    feelsLikeC: number;
    humidity: number;
    dewPointC: number;
    pressureHpa: number;
    windKph: number;
    windDir: number; // degrees
    gustKph: number;
    visibilityKm: number;
    cloudPct: number;
    precipMm: number;
    weatherCode: number;
    sky: string;
    isDay: boolean;
    uv: number;
  };
  hourly: HourlyPoint[]; // next 24h
  daily: DailyPoint[]; // next up to 16 days
  air: AirQuality | null;
  soil: SoilMetrics | null;
  history: { date: string; tMinC: number; tMaxC: number; precipMm: number }[]; // past 7d
};

// Rough district → (lat, lon) index. Falls back to Hyderabad if unknown.
const COORDS: Record<string, [number, number]> = {
  Guntur: [16.3067, 80.4365],
  Krishna: [16.5062, 80.648],
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
  Hyderabad: [17.385, 78.4867],
  Warangal: [17.9784, 79.5941],
  Karimnagar: [18.4386, 79.1288],
  Nizamabad: [18.6725, 78.0941],
  Mahbubnagar: [16.7488, 77.9853],
  Nalgonda: [17.0575, 79.267],
  Medak: [18.0451, 78.2634],
  Nagpur: [21.1458, 79.0882],
  Pune: [18.5204, 73.8567],
  Nashik: [19.9975, 73.7898],
  Ahmednagar: [19.0948, 74.748],
  Kolhapur: [16.705, 74.2433],
  Ludhiana: [30.901, 75.8573],
  Amritsar: [31.634, 74.8723],
  Bathinda: [30.211, 74.9455],
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
  Thanjavur: [10.787, 79.1378],
  Kochi: [9.9312, 76.2673],
};

export function coordsFor(place: string): [number, number] {
  return COORDS[place] ?? COORDS.Hyderabad;
}

export function codeToSky(code: number): string {
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

export type WeatherKind =
  | "clear-day"
  | "clear-night"
  | "cloudy"
  | "overcast"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunder";

export function weatherKind(code: number, isDay = true): WeatherKind {
  if (code === 0) return isDay ? "clear-day" : "clear-night";
  if ([1, 2].includes(code)) return isDay ? "clear-day" : "clear-night";
  if (code === 3) return "overcast";
  if ([45, 48].includes(code)) return "fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "thunder";
  return "cloudy";
}

export function windDirLabel(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

export async function fetchLiveWeather(district: string): Promise<LiveWeather | null> {
  const key = district || "Hyderabad";
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;
  const [lat, lon] = coordsFor(key);
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
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
      windKph: Math.round(c.wind_speed_10m ?? 0),
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

/**
 * Rich bundle — current + 24h hourly + 15d daily + air + soil + 7d history.
 * Pass `{ fresh: true }` to bypass the cache entirely (live-only surfaces).
 */
export async function fetchWeatherBundle(
  place: string,
  coords?: [number, number],
  opts: { fresh?: boolean } = {},
): Promise<WeatherBundle | null> {
  const key = coords ? `${coords[0].toFixed(3)},${coords[1].toFixed(3)}` : place;
  if (!opts.fresh) {
    const cached = BUNDLE_CACHE.get(key);
    if (cached && Date.now() - cached.at < TTL_MS) return cached.data;
  }
  const [lat, lon] = coords ?? coordsFor(place);
  try {
    const forecastUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,` +
      `pressure_msl,surface_pressure,precipitation,weather_code,cloud_cover,visibility,` +
      `wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day,uv_index` +
      `&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,` +
      `precipitation_probability,weather_code,wind_speed_10m,cloud_cover,uv_index,` +
      `soil_temperature_6cm,soil_moisture_3_to_9cm,et0_fao_evapotranspiration` +
      `&daily=temperature_2m_min,temperature_2m_max,weather_code,precipitation_sum,` +
      `precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max,` +
      `sunrise,sunset` +
      `&forecast_days=16&past_days=7&timezone=auto`;

    const airUrl =
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
      `&current=european_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide` +
      `&timezone=auto`;

    const bust = opts.fresh ? `&_t=${Date.now()}` : "";
    const init: RequestInit | undefined = opts.fresh ? { cache: "no-store" } : undefined;
    const [fRes, aRes] = await Promise.all([
      fetch(forecastUrl + bust, init),
      fetch(airUrl + bust, init).catch(() => null),
    ]);
    if (!fRes.ok) return null;
    const f = await fRes.json();
    const a = aRes && aRes.ok ? await aRes.json() : null;

    const cur = f.current ?? {};
    const H = f.hourly ?? {};
    const D = f.daily ?? {};

    // Find the "now" index in hourly
    const nowIso = new Date().toISOString().slice(0, 13);
    const times: string[] = H.time ?? [];
    let startIdx = times.findIndex((t) => t.startsWith(nowIso));
    if (startIdx < 0) startIdx = 0;

    const hourly: HourlyPoint[] = [];
    for (let i = startIdx; i < Math.min(startIdx + 24, times.length); i++) {
      hourly.push({
        time: times[i],
        tempC: Math.round(H.temperature_2m?.[i] ?? 0),
        feelsLikeC: Math.round(H.apparent_temperature?.[i] ?? 0),
        humidity: Math.round(H.relative_humidity_2m?.[i] ?? 0),
        precipMm: Number(H.precipitation?.[i] ?? 0),
        precipProb: Number(H.precipitation_probability?.[i] ?? 0),
        weatherCode: Number(H.weather_code?.[i] ?? 0),
        windKph: Math.round(H.wind_speed_10m?.[i] ?? 0),
        cloudPct: Math.round(H.cloud_cover?.[i] ?? 0),
        uv: Number(H.uv_index?.[i] ?? 0),
      });
    }

    // Soil snapshot at current hour
    const soil: SoilMetrics | null =
      H.soil_temperature_6cm?.[startIdx] != null
        ? {
            soilTempC: Number(H.soil_temperature_6cm[startIdx]),
            soilMoisture: Number(H.soil_moisture_3_to_9cm?.[startIdx] ?? 0),
            evapotranspirationMm: Number(H.et0_fao_evapotranspiration?.[startIdx] ?? 0),
          }
        : null;

    const daily: DailyPoint[] = (D.time ?? []).map((d: string, i: number) => ({
      date: d,
      tMinC: Math.round(D.temperature_2m_min?.[i] ?? 0),
      tMaxC: Math.round(D.temperature_2m_max?.[i] ?? 0),
      weatherCode: Number(D.weather_code?.[i] ?? 0),
      precipMm: Number(D.precipitation_sum?.[i] ?? 0),
      precipProb: Number(D.precipitation_probability_max?.[i] ?? 0),
      windMaxKph: Math.round(D.wind_speed_10m_max?.[i] ?? 0),
      gustsMaxKph: Math.round(D.wind_gusts_10m_max?.[i] ?? 0),
      uvMax: Number(D.uv_index_max?.[i] ?? 0),
      sunrise: D.sunrise?.[i] ?? "",
      sunset: D.sunset?.[i] ?? "",
    }));

    const today = new Date().toISOString().slice(0, 10);
    const history = daily
      .filter((d) => d.date < today)
      .slice(-7)
      .map((d) => ({ date: d.date, tMinC: d.tMinC, tMaxC: d.tMaxC, precipMm: d.precipMm }));
    const future = daily.filter((d) => d.date >= today).slice(0, 16);

    const ac = a?.current;
    const air: AirQuality | null = ac
      ? {
          aqi: Math.round(ac.european_aqi ?? 0),
          pm2_5: Number(ac.pm2_5 ?? 0),
          pm10: Number(ac.pm10 ?? 0),
          co: Number(ac.carbon_monoxide ?? 0),
          no2: Number(ac.nitrogen_dioxide ?? 0),
          o3: Number(ac.ozone ?? 0),
          so2: Number(ac.sulphur_dioxide ?? 0),
        }
      : null;

    const bundle: WeatherBundle = {
      place,
      lat,
      lon,
      fetchedAt: Date.now(),
      timezone: f.timezone ?? "auto",
      current: {
        tempC: Math.round(cur.temperature_2m ?? 0),
        feelsLikeC: Math.round(cur.apparent_temperature ?? cur.temperature_2m ?? 0),
        humidity: Math.round(cur.relative_humidity_2m ?? 0),
        dewPointC: Math.round(cur.dew_point_2m ?? 0),
        pressureHpa: Math.round(cur.pressure_msl ?? cur.surface_pressure ?? 0),
        windKph: Math.round(cur.wind_speed_10m ?? 0),
        windDir: Math.round(cur.wind_direction_10m ?? 0),
        gustKph: Math.round(cur.wind_gusts_10m ?? 0),
        visibilityKm: Math.round(((cur.visibility ?? 0) / 1000) * 10) / 10,
        cloudPct: Math.round(cur.cloud_cover ?? 0),
        precipMm: Number(cur.precipitation ?? 0),
        weatherCode: Number(cur.weather_code ?? 0),
        sky: codeToSky(Number(cur.weather_code ?? 0)),
        isDay: Number(cur.is_day ?? 1) === 1,
        uv: Number(cur.uv_index ?? 0),
      },
      hourly,
      daily: future,
      air,
      soil,
      history,
    };
    BUNDLE_CACHE.set(key, { at: Date.now(), data: bundle });
    return bundle;
  } catch {
    return null;
  }
}

export type PlaceName = {
  /** Village / town / city */
  city?: string;
  /** District (admin level 2) */
  district?: string;
  /** State */
  state?: string;
  /** Best human label — never coordinates. */
  label: string;
};

/**
 * Reverse geocode a live GPS fix into a human place name.
 * Never returns raw coordinates — if every provider fails the label is empty
 * and the UI keeps showing "Locating your area…".
 */
export async function reverseGeocodePlace(lat: number, lon: number): Promise<PlaceName> {
  const build = (city?: string, district?: string, state?: string): PlaceName => {
    // Prefer "City, District" and fall back to "District, State" / "City, State".
    const primary = city || district || state;
    const secondary =
      city && district && district !== city ? district : city && state ? state : district ? state : undefined;
    return {
      city,
      district,
      state,
      label: [primary, secondary].filter(Boolean).join(", "),
    };
  };

  // BigDataCloud is CORS-enabled and keyless; it resolves Indian districts well.
  try {
    const r0 = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    );
    if (r0.ok) {
      const j0 = await r0.json();
      const admins: { name?: string; adminLevel?: number }[] =
        j0?.localityInfo?.administrative ?? [];
      const district =
        admins.find((a) => a.adminLevel === 5)?.name ||
        admins.find((a) => a.adminLevel === 6)?.name ||
        j0.city ||
        undefined;
      const city = j0.locality || j0.city || undefined;
      const p = build(city, district, j0.principalSubdivision || undefined);
      if (p.label) return p;
    }
  } catch {
    /* fall through */
  }

  try {
    const r = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&format=json`,
    );
    if (r.ok) {
      const j = await r.json();
      const first = j?.results?.[0];
      if (first) return build(first.name, first.admin2, first.admin1);
    }
  } catch {
    /* fall through */
  }

  return { label: "" };
}

/** Back-compat string helper. Returns "" when the place can't be named. */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  return (await reverseGeocodePlace(lat, lon)).label;
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
  const m = d.getMonth() + 1;
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
