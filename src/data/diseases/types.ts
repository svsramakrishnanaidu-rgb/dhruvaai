export type DiseaseSeverity = "Low" | "Medium" | "High" | "Critical";

export type DiseaseCategory = 
  | "Fungal" 
  | "Bacterial" 
  | "Viral" 
  | "Nematode" 
  | "Nutritional Deficiency"
  | "Physiological Disorder";

export interface TreatmentRecommendation {
  activeIngredient: string;
  dosage: string;
  applicationMethod: string;
  timing: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Disease {
  slug: string;
  name: string;
  scientificName: string;
  category: DiseaseCategory;
  affectedCrops: string[];
  severity: DiseaseSeverity;
  yieldLossEstimation: string;
  
  // UI Assets
  images: string[];
  
  // Knowledge Sections
  symptoms: {
    early: string;
    mid: string;
    advanced: string;
  };
  causes: string;
  environmentalConditions: string;
  lifecycle: string;
  
  // Management
  prevention: string[];
  organicTreatment: string[];
  biologicalControl: string[];
  chemicalTreatment: TreatmentRecommendation[];
  safetyPrecautions: string[];
  
  // Timeline
  bestTimeForTreatment: string;
  recoveryTimeline: string;
  
  // Risk Factors
  weatherRisks: string;
  earlyWarningSigns: string;
  
  // Comparison
  similarDiseases: {
    name: string;
    differentiation: string;
  }[];
  
  // Extras
  faqs: FAQ[];
  expertTips: string[];
}
