import { createServerFn } from "@tanstack/react-start";
import { CROP_LIST } from "@/data/crops";
import { DISEASE_DATABASE } from "@/data/diseases";
import { DISTRICTS } from "@/data/pdf-data";
import { ingestDocument } from "./rag.functions";

/**
 * Populates the RAG Knowledge Base with chunks from crops, diseases, and production data.
 */
export const populateKnowledgeBase = createServerFn({ method: "POST" })
  .handler(async () => {
    const chunks: Array<{ content: string; metadata: any }> = [];

    // 1. Chunk Crops
    CROP_LIST.forEach((crop) => {
      chunks.push({
        content: `Crop: ${crop.name} (${crop.scientificName}). Season: ${crop.season}. Suitable Districts: ${crop.suitableDistricts.join(", ")}. Soil: ${crop.soilType}. Temperature: ${crop.temperature}. Rainfall: ${crop.rainfall}.`,
        metadata: { type: "crop", slug: crop.slug }
      });
      
      if (crop.landPrep && crop.landPrep.length > 0) {
        const prepStr = crop.landPrep.map(s => `${s.title}: ${s.description}`).join("; ");
        chunks.push({
          content: `Land Preparation for ${crop.name}: ${prepStr}`,
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
        content: `Production Data: In ${d.district}, ${d.state}, the ${d.season} ${d.crop} production is ${d.productionMT} Metric Tonnes with a yield of ${d.yieldKgHa} kg/ha over ${d.areaHa} hectares.`,
        metadata: { type: "production", state: d.state, district: d.district, crop: d.crop }
      });
    });

    // 4. Ingest Chunks
    let count = 0;
    for (const chunk of chunks) {
      try {
        await ingestDocument({ data: chunk });
        count++;
      } catch (err) {
        console.error("Ingestion failed for chunk", chunk.metadata, err);
      }
    }

    return { totalIngested: count };
  });
