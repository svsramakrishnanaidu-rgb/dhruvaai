/**
 * Rule-based agricultural weather advisories derived from a WeatherBundle.
 * Deterministic (no AI calls) so it renders instantly and consistently.
 */
import type { WeatherBundle } from "@/lib/live-weather";

export type Advisory = {
  id: string;
  level: "info" | "good" | "watch" | "warn" | "danger";
  title: string;
  detail: string;
  icon: string; // emoji fallback
};

function next24Precip(b: WeatherBundle) {
  return b.hourly.reduce((s, h) => s + h.precipMm, 0);
}
function next24MaxProb(b: WeatherBundle) {
  return b.hourly.reduce((m, h) => Math.max(m, h.precipProb), 0);
}
function next24MaxWind(b: WeatherBundle) {
  return b.hourly.reduce((m, h) => Math.max(m, h.windKph), 0);
}
function next24MaxTemp(b: WeatherBundle) {
  return b.hourly.reduce((m, h) => Math.max(m, h.tempC), -100);
}
function next24MinTemp(b: WeatherBundle) {
  return b.hourly.reduce((m, h) => Math.min(m, h.tempC), 100);
}

export function buildAdvisories(b: WeatherBundle): Advisory[] {
  const out: Advisory[] = [];
  const cur = b.current;
  const rain24 = next24Precip(b);
  const rainProb = next24MaxProb(b);
  const windMax = next24MaxWind(b);
  const tMax = next24MaxTemp(b);
  const tMin = next24MinTemp(b);

  // Irrigation
  if (rain24 >= 10 || rainProb >= 70) {
    out.push({
      id: "irrigation-skip",
      level: "good",
      icon: "🚰",
      title: "Skip irrigation today",
      detail: `Expecting ${rain24.toFixed(1)}mm rain in the next 24h (peak probability ${rainProb}%). Save water and let the forecasted rain do the work.`,
    });
  } else if (b.soil && b.soil.soilMoisture < 0.18) {
    out.push({
      id: "irrigation-now",
      level: "warn",
      icon: "💧",
      title: "Irrigate at dawn or after sunset",
      detail: `Root-zone moisture is low (${(b.soil.soilMoisture * 100).toFixed(0)}%). Irrigate early morning or evening to minimise evaporation losses.`,
    });
  } else {
    out.push({
      id: "irrigation-normal",
      level: "info",
      icon: "🌱",
      title: "Normal irrigation window",
      detail: `Soil moisture adequate. Preferred irrigation window: 5–8 AM or after 6 PM.`,
    });
  }

  // Spray recommendation
  if (windMax > 20 || rainProb >= 50) {
    out.push({
      id: "spray-hold",
      level: "warn",
      icon: "🚫",
      title: "Hold pesticide / foliar spray",
      detail: `${windMax > 20 ? `Winds up to ${windMax} km/h cause drift. ` : ""}${rainProb >= 50 ? `Rain probability ${rainProb}% may wash off product.` : ""}`,
    });
  } else if (cur.humidity > 90) {
    out.push({
      id: "spray-humidity",
      level: "watch",
      icon: "🌫️",
      title: "Delay spray — high humidity",
      detail: `Humidity ${cur.humidity}%. Droplets stay on leaves longer than intended and evaporate slowly, raising phytotoxicity risk.`,
    });
  } else {
    out.push({
      id: "spray-go",
      level: "good",
      icon: "✅",
      title: "Good conditions for spraying",
      detail: `Wind ${cur.windKph} km/h, humidity ${cur.humidity}%. Spray between 6–9 AM or after 4 PM for best coverage.`,
    });
  }

  // Sowing
  const t3 = b.daily.slice(0, 3);
  const avgMin = t3.reduce((s, d) => s + d.tMinC, 0) / Math.max(1, t3.length);
  const avgMax = t3.reduce((s, d) => s + d.tMaxC, 0) / Math.max(1, t3.length);
  const rain3 = t3.reduce((s, d) => s + d.precipMm, 0);
  if (avgMin >= 15 && avgMax <= 35 && rain3 <= 30 && rain3 >= 3) {
    out.push({
      id: "sow-good",
      level: "good",
      icon: "🌾",
      title: "Favourable window for sowing",
      detail: `Next 3 days: ${avgMin.toFixed(0)}–${avgMax.toFixed(0)}°C with ~${rain3.toFixed(0)}mm rain. Ideal for germination of most Kharif/Rabi crops.`,
    });
  } else if (rain3 > 60) {
    out.push({
      id: "sow-hold",
      level: "warn",
      icon: "⏸️",
      title: "Delay sowing — heavy rain expected",
      detail: `~${rain3.toFixed(0)}mm forecast over next 3 days. Wait for fields to drain to avoid seed rot.`,
    });
  }

  // Fertilizer
  if (rainProb >= 60 && rain24 < 25) {
    out.push({
      id: "fert-good",
      level: "good",
      icon: "🧪",
      title: "Apply urea / top-dressing today",
      detail: `Light-to-moderate rain (${rainProb}% prob) will incorporate nitrogen into the soil. Apply before rainfall arrives.`,
    });
  } else if (rain24 > 30) {
    out.push({
      id: "fert-hold",
      level: "warn",
      icon: "🌧️",
      title: "Hold fertilizer — leaching risk",
      detail: `Heavy rain (${rain24.toFixed(0)}mm) will wash nutrients out of the root zone. Delay by 24–48 hours.`,
    });
  }

  // Harvest
  const rain7 = b.daily.slice(0, 7).reduce((s, d) => s + d.precipMm, 0);
  if (rain7 < 15) {
    out.push({
      id: "harvest-good",
      level: "good",
      icon: "🌾",
      title: "Dry spell — good for harvesting",
      detail: `Only ${rain7.toFixed(0)}mm rain expected in 7 days. Ideal for mature Rabi crops and drying operations.`,
    });
  } else if (rain7 > 80) {
    out.push({
      id: "harvest-warn",
      level: "warn",
      icon: "🚚",
      title: "Bring in mature produce",
      detail: `${rain7.toFixed(0)}mm rain expected this week. Harvest ready crops and store under cover.`,
    });
  }

  // Pest / disease pressure
  if (cur.humidity > 80 && cur.tempC >= 22 && cur.tempC <= 30) {
    out.push({
      id: "pest-risk",
      level: "watch",
      icon: "🐛",
      title: "Fungal & pest pressure rising",
      detail: `Warm-humid weather (${cur.tempC}°C, ${cur.humidity}%) favours blast, blight, leaf-spot and sucking pests. Scout fields and prep prophylactic spray.`,
    });
  }

  // Heat / cold / frost
  if (tMax >= 40) {
    out.push({
      id: "heatwave",
      level: "danger",
      icon: "🔥",
      title: "Heat-wave conditions",
      detail: `Peak ${tMax}°C in next 24h. Provide shade to livestock, mulch root zone, and irrigate early morning.`,
    });
  }
  if (tMin <= 4) {
    out.push({
      id: "frost",
      level: "danger",
      icon: "❄️",
      title: "Frost risk overnight",
      detail: `Low of ${tMin}°C. Light irrigation before dawn or smoke-line protection can save sensitive crops.`,
    });
  }

  // Wind / storm alerts
  const gust = Math.max(cur.gustKph, ...b.daily.slice(0, 3).map((d) => d.gustsMaxKph));
  if (gust >= 60) {
    out.push({
      id: "storm",
      level: "danger",
      icon: "🌪️",
      title: "High-wind / storm alert",
      detail: `Gusts up to ${gust} km/h forecast. Stake tall crops, secure sheds, avoid open-field operations.`,
    });
  }
  const stormy = b.hourly.some((h) => [95, 96, 99].includes(h.weatherCode));
  if (stormy) {
    out.push({
      id: "lightning",
      level: "warn",
      icon: "⚡",
      title: "Thunderstorms in the forecast",
      detail: `Lightning likely in the next 24h. Postpone field work during active storm cells and unplug pump-set controllers.`,
    });
  }

  // Livestock
  if (cur.tempC >= 35 && cur.humidity >= 60) {
    out.push({
      id: "livestock",
      level: "warn",
      icon: "🐄",
      title: "Livestock heat stress",
      detail: `Heat-index elevated. Provide shade, cool drinking water, and reschedule grazing to cooler hours.`,
    });
  }

  // Fog
  if ([45, 48].includes(cur.weatherCode)) {
    out.push({
      id: "fog",
      level: "watch",
      icon: "🌁",
      title: "Foggy conditions",
      detail: `Visibility reduced. Delay spraying until fog lifts and watch for downy-mildew risk on vegetables.`,
    });
  }

  // Drought watch
  if (rain7 < 2 && cur.humidity < 40 && tMax >= 34) {
    out.push({
      id: "drought",
      level: "warn",
      icon: "🏜️",
      title: "Dry-spell / drought watch",
      detail: `Negligible rain, low humidity and high temperatures. Prioritise drip irrigation and mulching.`,
    });
  }

  return out;
}

export function aqiCategory(aqi: number): { label: string; color: string; tone: string } {
  if (aqi <= 20) return { label: "Very Good", color: "#22c55e", tone: "Air is clean." };
  if (aqi <= 40) return { label: "Good", color: "#84cc16", tone: "Enjoy outdoor activity." };
  if (aqi <= 60) return { label: "Moderate", color: "#eab308", tone: "Acceptable for most." };
  if (aqi <= 80) return { label: "Poor", color: "#f97316", tone: "Sensitive groups take care." };
  if (aqi <= 100) return { label: "Very Poor", color: "#ef4444", tone: "Reduce prolonged exertion." };
  return { label: "Extremely Poor", color: "#a21caf", tone: "Avoid outdoor exposure." };
}

export function uvCategory(uv: number): { label: string; color: string } {
  if (uv < 3) return { label: "Low", color: "#22c55e" };
  if (uv < 6) return { label: "Moderate", color: "#eab308" };
  if (uv < 8) return { label: "High", color: "#f97316" };
  if (uv < 11) return { label: "Very High", color: "#ef4444" };
  return { label: "Extreme", color: "#a21caf" };
}
