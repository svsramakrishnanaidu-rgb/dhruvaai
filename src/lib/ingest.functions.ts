import { createServerFn } from "@tanstack/react-start";
import { CROP_LIST } from "@/data/crops";
import { DISEASE_DATABASE } from "@/data/diseases";
import { DISTRICTS, MACRO } from "@/data/pdf-data";
import { ingestDocument } from "./rag.functions";

export const populateKnowledgeBase = createServerFn({ method: "POST" })
  .handler(async () => {
    const chunks: Array<{ content: string; metadata: any }> = [];

    // 1. Chunk Crops
    CROP_LIST.forEach((crop) => {
      chunks.push({
        content: `Crop: ${crop.name} (${crop.scientificName}). Category: ${crop.category}. Growing Season: ${crop.growingSeason}. Suitable Districts: ${crop.suitableDistricts.join(", ")}. Soil: ${crop.soilType}. Temperature: ${crop.temperature}. Rainfall: ${crop.rainfall}.`,
        metadata: { type: "crop", slug: crop.slug }
      });
      
      if (crop.landPreparation) {
        chunks.push({
          content: `Land Preparation for ${crop.name}: ${crop.landPreparation.fieldCleaning} ${crop.landPreparation.ploughing} ${crop.landPreparation.bedPreparation}`,
          metadata: { type: "agronomy", slug: crop.slug, section: "land-prep" }
        });
      }
    });

    // 2. Chunk Diseases
    DISEASE_DATABASE.forEach((disease) => {
      chunks.push({
        content: `Disease: ${disease.name} (${disease.scientificName}). Affected Crops: ${disease.affectedCrops.join(", ")}. Severity: ${disease.severity}. Symptoms: ${disease.symptoms.early} ${disease.symptoms.mid} ${disease.symptoms.advanced}`,
        metadata: { type: "disease", slug: disease.slug }
      });
    });

    // 3. Chunk Production Data
    DISTRICTS.forEach((d) => {
      chunks.push({
        content: `Production Data: In ${d.district}, ${d.state}, the ${d.season} ${d.crop} production is ${d.productionMT} MT with a yield of ${d.yieldKgHa} kg/ha over ${d.areaHa} hectares.`,
        metadata: { type: "production", state: d.state, district: d.district, crop: d.crop }
      });
    });

    // 4. Ingest Chunks (serial for safety in server function)
    for (const chunk of chunks) {
      try {
        await ingestDocument({ data: chunk });
      } catch (err) {
        console.error("Ingestion failed for chunk", chunk.metadata, err);
      }
    }

    return { totalIngested: chunks.length };
  });
