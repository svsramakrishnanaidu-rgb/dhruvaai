import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

type GeoResult = { name: string; latitude: number; longitude: number; admin1?: string; country?: string };

/** Live weather for any place in India via the public Open-Meteo API. */
export default defineTool({
  name: "get_weather",
  title: "Live weather",
  description:
    "Get live weather and a 5-day forecast for a place (village, town, district or city). Uses the public Open-Meteo service — no personal location data is involved.",
  inputSchema: {
    place: z.string().describe("Place name, e.g. 'Guntur' or 'Anantapur'."),
    countryCode: z.string().optional().describe("ISO country code to disambiguate; defaults to IN."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ place, countryCode }) => {
    const country = (countryCode ?? "IN").toUpperCase();
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      place,
    )}&count=1&language=en&format=json&countryCode=${country}`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) {
      return { content: [{ type: "text", text: `Geocoding failed (${geoRes.status}).` }], isError: true };
    }
    const geo = (await geoRes.json()) as { results?: GeoResult[] };
    const hit = geo.results?.[0];
    if (!hit) {
      return { content: [{ type: "text", text: `No place found for "${place}".` }], isError: true };
    }

    const wUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max` +
      `&timezone=auto&forecast_days=5`;
    const wRes = await fetch(wUrl);
    if (!wRes.ok) {
      return { content: [{ type: "text", text: `Weather lookup failed (${wRes.status}).` }], isError: true };
    }
    const weather = await wRes.json();
    const payload = {
      place: { name: hit.name, state: hit.admin1, country: hit.country, latitude: hit.latitude, longitude: hit.longitude },
      current: weather.current,
      units: weather.current_units,
      daily: weather.daily,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
