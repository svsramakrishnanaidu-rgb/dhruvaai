"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "te" | "hi";

export const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.home": "Home",
  "nav.analytics": "Analytics",
  "nav.crops": "Crops",
  "nav.rotation": "Rotation",
  "nav.fertilizer": "Fertilizer",
  "nav.weather": "Weather",
  "nav.market": "Market",
  "nav.diseases": "Diseases",
  "nav.schemes": "Schemes",
  "nav.districts": "Districts",
  "nav.paddyFuture": "Paddy Future",
  "nav.about": "About",
  "nav.contact": "Contact",
  "common.search": "Search",
  "common.language": "Language",
  "common.theme": "Theme",
  "common.explore": "Explore crops",
  "common.setDistrict": "Set your district",
  "common.liveFor": "Live for",
  "footer.tagline": "Cinematic, science-backed advisory that turns every farmer into a data-driven agronomist.",
  "footer.platform": "Platform",
  "footer.insights": "Insights",
  "footer.company": "Company",
  "paddy.title": "The Future of Paddy",
  "paddy.subtitle": "Where India's most important crop is headed — yields, prices, climate, and technology through 2030.",
  "paddy.msp": "MSP Trajectory",
  "paddy.yield": "Yield Outlook",
  "paddy.climate": "Climate Risks",
  "paddy.tech": "Technology Frontier",
  "paddy.markets": "Market & Export",
  "paddy.policy": "Policy Signals",
};

const te: Dict = {
  "nav.home": "హోమ్",
  "nav.analytics": "విశ్లేషణ",
  "nav.crops": "పంటలు",
  "nav.rotation": "పంట మార్పిడి",
  "nav.fertilizer": "ఎరువులు",
  "nav.weather": "వాతావరణం",
  "nav.market": "మార్కెట్",
  "nav.diseases": "వ్యాధులు",
  "nav.schemes": "పథకాలు",
  "nav.districts": "జిల్లాలు",
  "nav.paddyFuture": "వరి భవిష్యత్తు",
  "nav.about": "మా గురించి",
  "nav.contact": "సంప్రదించండి",
  "common.search": "వెతకండి",
  "common.language": "భాష",
  "common.theme": "థీమ్",
  "common.explore": "పంటలను చూడండి",
  "common.setDistrict": "మీ జిల్లా ఎంచుకోండి",
  "common.liveFor": "ప్రత్యక్షంగా",
  "footer.tagline": "సినిమాటిక్, శాస్త్రీయ ఆధారిత సలహాలతో ప్రతి రైతును డేటా ఆధారిత వ్యవసాయ నిపుణుడిగా మారుస్తుంది.",
  "footer.platform": "ప్లాట్‌ఫారమ్",
  "footer.insights": "అంతర్దృష్టులు",
  "footer.company": "కంపెనీ",
  "paddy.title": "వరి భవిష్యత్తు",
  "paddy.subtitle": "భారత్‌లో అత్యంత ముఖ్యమైన పంట — దిగుబడి, ధరలు, వాతావరణం, సాంకేతికత 2030 వరకు.",
  "paddy.msp": "కనీస మద్దతు ధర ధోరణి",
  "paddy.yield": "దిగుబడి అంచనా",
  "paddy.climate": "వాతావరణ ముప్పులు",
  "paddy.tech": "సాంకేతిక భవిష్యత్తు",
  "paddy.markets": "మార్కెట్ & ఎగుమతి",
  "paddy.policy": "విధాన సంకేతాలు",
};

const hi: Dict = {
  "nav.home": "होम",
  "nav.analytics": "विश्लेषण",
  "nav.crops": "फसलें",
  "nav.rotation": "फसल चक्र",
  "nav.fertilizer": "उर्वरक",
  "nav.weather": "मौसम",
  "nav.market": "बाज़ार",
  "nav.diseases": "रोग",
  "nav.schemes": "योजनाएँ",
  "nav.districts": "जिले",
  "nav.paddyFuture": "धान का भविष्य",
  "nav.about": "हमारे बारे में",
  "nav.contact": "संपर्क",
  "common.search": "खोजें",
  "common.language": "भाषा",
  "common.theme": "थीम",
  "common.explore": "फसलें देखें",
  "common.setDistrict": "अपना जिला चुनें",
  "common.liveFor": "उपलब्ध",
  "footer.tagline": "सिनेमैटिक, विज्ञान-आधारित सलाह जो हर किसान को डेटा-आधारित कृषि विशेषज्ञ बनाती है।",
  "footer.platform": "प्लेटफ़ॉर्म",
  "footer.insights": "अंतर्दृष्टि",
  "footer.company": "कंपनी",
  "paddy.title": "धान का भविष्य",
  "paddy.subtitle": "भारत की सबसे महत्वपूर्ण फसल किस दिशा में जा रही है — 2030 तक उपज, कीमत, जलवायु और तकनीक।",
  "paddy.msp": "एमएसपी दिशा",
  "paddy.yield": "उपज पूर्वानुमान",
  "paddy.climate": "जलवायु जोखिम",
  "paddy.tech": "तकनीकी सीमांत",
  "paddy.markets": "बाज़ार व निर्यात",
  "paddy.policy": "नीति संकेत",
};

const DICTS: Record<Lang, Dict> = { en, te, hi };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18nCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("agri.lang") as Lang | null;
      if (saved && DICTS[saved]) setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("agri.lang", l);
      document.documentElement.lang = l;
    } catch {}
  };

  const t = (k: string) => DICTS[lang][k] ?? DICTS.en[k] ?? k;

  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}

export function useT() {
  return useContext(I18nCtx).t;
}
