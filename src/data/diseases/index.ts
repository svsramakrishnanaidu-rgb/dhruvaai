import { Disease } from "./types";
import { IMAGE_PRESETS } from "@/lib/smart-image";

export const DISEASE_DATABASE: Disease[] = [
  {
    slug: "rice-blast",
    name: "Rice Blast",
    scientificName: "Magnaporthe oryzae",
    category: "Fungal",
    affectedCrops: ["rice"],
    severity: "Critical",
    yieldLossEstimation: "30% - 100% in severe cases",
    images: [IMAGE_PRESETS.disease("Rice", "Blast")],
    symptoms: {
      early: "Small bluish-green spots on leaves that look like water-soaked lesions.",
      mid: "Spots enlarge into spindle-shaped lesions with grey centers and brown borders.",
      advanced: "Lesions coalesce, leaves wither; neck rot causes panicles to break or produce empty grains."
    },
    causes: "Fungal pathogen Magnaporthe oryzae.",
    environmentalConditions: "High humidity (>90%), leaf wetness for 10-12 hours, and night temperatures of 20-25°C.",
    lifecycle: "Produces spores called conidia that are wind-borne; can survive in seeds and stubble for over a year.",
    prevention: [
      "Use resistant varieties.",
      "Balanced nitrogen application (split doses).",
      "Seed treatment with Carbendazim (2g/kg).",
      "Proper spacing to allow airflow."
    ],
    organicTreatment: [
      "Neem seed kernel extract (5%) spray.",
      "Foliar spray of cow urine diluted with water (1:10).",
      "Application of wood ash."
    ],
    biologicalControl: [
      "Seed treatment with Trichoderma viride @ 4g/kg.",
      "Soil application of Pseudomonas fluorescens @ 1kg/acre."
    ],
    chemicalTreatment: [
      {
        activeIngredient: "Tricyclazole 75% WP",
        dosage: "0.6 g/L of water",
        applicationMethod: "Foliar spray",
        timing: "On first appearance of leaf blast or at booting stage for neck blast."
      },
      {
        activeIngredient: "Azoxystrobin 25% SC",
        dosage: "1 ml/L of water",
        applicationMethod: "Foliar spray",
        timing: "Preventive or early curative."
      }
    ],
    safetyPrecautions: [
      "Wear protective clothing, masks, and gloves.",
      "Spray in the direction of wind.",
      "Avoid spraying during peak sunlight hours."
    ],
    bestTimeForTreatment: "Early morning or late evening when wind speed is low.",
    recoveryTimeline: "10-15 days for vegetative recovery; neck blast damage is irreversible.",
    weatherRisks: "Cloudy weather with intermittent drizzles and cool nights.",
    earlyWarningSigns: "Tiny spindle spots appearing on the younger leaves near the base.",
    similarDiseases: [
      {
        name: "Brown Spot",
        differentiation: "Brown spots are circular/oval with yellow halos, while Blast is spindle-shaped."
      }
    ],
    faqs: [
      {
        question: "Can Blast spread to other crops?",
        answer: "Rice blast specifically targets rice, but similar species can affect finger millet (Ragi)."
      }
    ],
    expertTips: [
      "Avoid excessive water stagnation during the vegetative phase.",
      "Destroy infected stubble immediately after harvest."
    ]
  },
  {
    slug: "cotton-leaf-curl",
    name: "Cotton Leaf Curl",
    scientificName: "Cotton Leaf Curl Virus (CLCuV)",
    category: "Viral",
    affectedCrops: ["cotton"],
    severity: "Critical",
    yieldLossEstimation: "20% - 80% depending on stage of infection",
    images: [IMAGE_PRESETS.disease("Cotton", "Leaf Curl Virus")],
    symptoms: {
      early: "Thickening of veins on the underside of young leaves.",
      mid: "Leaves begin to curl upwards or downwards; leaves become leathery.",
      advanced: "Severe stunting of the plant; formation of cup-like outgrowths (enations) on the underside of veins."
    },
    causes: "Begomovirus transmitted by Whiteflies (Bemisia tabaci).",
    environmentalConditions: "Hot and humid weather favors whitefly multiplication.",
    lifecycle: "Virus is not seed-borne; survives on weed hosts and is spread rapidly by feeding whiteflies.",
    prevention: [
      "Plant resistant BT hybrids.",
      "Maintain field sanitation; remove weed hosts like Abutilon.",
      "Sow early to avoid peak whitefly populations."
    ],
    organicTreatment: [
      "Yellow sticky traps (10-12 per acre) to catch whiteflies.",
      "Spray neem oil (5ml/L) or neem soap."
    ],
    biologicalControl: [
      "Release of predatory lacewings (Chrysoperla).",
      "Use of fungal biopesticides like Verticillium lecanii."
    ],
    chemicalTreatment: [
      {
        activeIngredient: "Diafenthiuron 50% WP",
        dosage: "240 g/acre",
        applicationMethod: "Foliar spray",
        timing: "When whitefly population reaches Economic Threshold Level (ETL)."
      }
    ],
    safetyPrecautions: [
      "Ensure proper PPE.",
      "Do not eat or smoke during application."
    ],
    bestTimeForTreatment: "Early stages of whitefly infestation.",
    recoveryTimeline: "Viral diseases don't have a 'cure'; management focuses on preventing spread to new growth.",
    weatherRisks: "Prolonged dry spells followed by humidity.",
    earlyWarningSigns: "Presence of small white insects on the underside of leaves.",
    similarDiseases: [
      {
        name: "Jassid Injury",
        differentiation: "Jassid causes 'hopper burn' (yellowing/reddening of margins) without vein thickening."
      }
    ],
    faqs: [
      {
        question: "Is there a vaccine for the plant?",
        answer: "No, resistance must be bred into the variety itself."
      }
    ],
    expertTips: [
      "Uniform sowing in the entire village helps manage the vector effectively.",
      "Avoid growing alternative hosts like Bhindi (Okra) near cotton fields."
    ]
  }
];
