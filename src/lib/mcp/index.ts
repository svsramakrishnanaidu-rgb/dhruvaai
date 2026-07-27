import { defineMcp } from "@lovable.dev/mcp-js";
import listCrops from "./tools/list-crops";
import getCrop from "./tools/get-crop";
import getDistricts from "./tools/get-districts";
import getWeather from "./tools/get-weather";
import getMarketPrices from "./tools/get-market-prices";
import calculateFertilizer from "./tools/calculate-fertilizer";
import findCropDiseases from "./tools/find-crop-diseases";

export default defineMcp({
  name: "krish-sense-mcp",
  title: "Krish Sense — Agricultural Advisory",
  version: "0.1.0",
  instructions:
    "Public agricultural advisory tools for India from Krish Sense. Use `list_crops` and `get_crop` for crop agronomy guides, `get_districts` for Andhra Pradesh district profiles, `find_crop_diseases` for pest/disease diagnosis, `calculate_fertilizer` to scale a crop's fertilizer schedule to a land size, `get_weather` for live weather from Open-Meteo, and `get_market_prices` for live mandi rates from the government Agmarknet dataset. All data is public reference information — always advise confirming doses with a local soil test.",
  tools: [listCrops, getCrop, getDistricts, findCropDiseases, calculateFertilizer, getWeather, getMarketPrices],
});
