"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "te" | "hi";

export const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
];

type Dict = Record<string, string>;

// System Commands & Metadata (Internal use only)
const COMMANDS = {
  market_enterprise_plan: `'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
                                        
                                            
                                            # Plan - Market & Analytics Enterprise Performance Upgrade

Optimize the Market and Analytics sections for speed, reliability, and accuracy through a multi-layer optimization of the data pipeline, caching, and AI integration.

## User Review Required

> [!IMPORTANT]
> The AI insights currently use a deterministic heuristic on the client and a server function for deeper analysis. I will preserve this structure but optimize the server-side AI calls to be more efficient and strictly validated.

- Data Privacy: Market data is sourced from public government APIs (Agmarknet). AI analysis only processes anonymized, aggregated market statistics.
- Accuracy: AI is used strictly for trend analysis and natural language summaries. Numerical price data is never 'hallucinated' or overwritten by AI.

## Proposed Changes

### Data Pipeline & Backend (src/lib/agmarknet.server.ts, src/lib/agmarknet.functions.ts)
- Implement server-side response caching (TTL: 5 minutes) for common market queries.
- Add Zod-based validation to the Agmarknet response normalization layer.
- Optimize the paged fetcher to use adaptive concurrency and better error recovery (exponential backoff).
- Implement request deduplication at the server level for identical concurrent queries.

### Caching & State Management (src/lib/market-intel.ts)
- Enhance useMarketFeed with a more robust client-side cache (using localStorage for offline persistence and in-memory for session speed).
- Add background pre-fetching for frequently visited crops/states.
- Implement request cancellation (AbortController) to stop obsolete fetches when filters change rapidly.

### AI Intelligence Layer (src/lib/market-insights.functions.ts)
- Optimize the prompt to use smaller, pre-aggregated data snapshots to reduce latency and token usage.
- Add a strictly validated JSON output schema check.
- Ensure multilingual support (English, Telugu, Hindi) for generated insights.

### UI Performance (src/routes/market.tsx, src/components/MarketCommandCenter.tsx)
- Implement virtualization for long lists of mandi rates.
- Add skeleton loaders and progressive rendering for charts.
- Debounce search and filter inputs (300ms) to prevent excessive API calls.
- Add 'Last Updated' and 'Source' metadata badges to every data point.

## Verification Plan
### Automated Tests
- Run vitest to verify data normalization and validation logic.
- Verify agmarknet.server.ts handles API failures and retries correctly.

### Manual Verification
- Test mobile responsiveness and scrolling smoothness on a simulated low-end device.
- Verify that toggling filters quickly does not result in 'stale' data landing over 'fresh' data (race condition check).
- Check the console for unnecessary re-renders in MarketCommandCenter.`
};


const en: Dict = {
  // Nav
  "nav.home": "Home",
  "nav.music": "Music",
  "nav.analytics": "Analytics",
  "nav.crops": "Crops",
  "nav.rotation": "Rotation",
  "nav.fertilizer": "Calculator",
  "nav.fertilizers": "Fertilizers",
  "nav.weather": "Weather",
  "nav.market": "Market",
  "nav.diseases": "Diseases",
  "nav.schemes": "Schemes",
  "nav.districts": "Districts",
  "nav.atlas": "Soil Atlas",
  "nav.paddyFuture": "Paddy Future",
  "nav.about": "About",
  "nav.contact": "Contact",
  // Common
  "common.search": "Search",
  "common.language": "Language",
  "common.theme": "Theme",
  "common.menu": "Menu",
  "aria.changeLanguage": "Change language",
  "aria.changeDistrict": "Change district",
  "aria.openSearch": "Open search",
  "aria.toggleTheme": "Toggle theme",
  "aria.toggleMenu": "Toggle menu",
  // Footer
  "footer.tagline":
    "Cinematic, science-backed advisory that turns every farmer into a data-driven agronomist.",
  "footer.platform": "Platform",
  "footer.insights": "Insights",
  "footer.company": "Company",
  "footer.rights": "All rights reserved.",
  // Paddy Future
  "paddy.eyebrow": "Outlook · 2025 → 2030",
  "paddy.title": "The Future of Paddy",
  "paddy.subtitle":
    "Where India's most important crop is headed — yields, prices, climate, and technology through 2030.",
  "paddy.msp": "MSP Trajectory",
  "paddy.mspCaption": "₹/quintal · Common paddy · Solid = actual, dashed = projected",
  "paddy.yield": "Yield Outlook",
  "paddy.yieldCaption": "kg/ha national average · target 3.3 t/ha by 2030",
  "paddy.climate": "Climate Risks",
  "paddy.tech": "Technology Frontier",
  "paddy.markets": "Market & Export",
  "paddy.policy": "Policy Signals",
  "paddy.kpi.msp": "Projected 2030 MSP (₹/qtl)",
  "paddy.kpi.yield": "Projected 2030 yield (kg/ha)",
  "paddy.kpi.export": "Export share by 2030",
  "paddy.kpi.stress": "Climate-stress districts",
  "paddy.cta.title": "Get the paddy playbook for your district",
  "paddy.cta.sub":
    "Sowing dates, fertilizer schedule, mandi price and disease alerts — tuned to your location.",
  "paddy.cta.open": "Open Paddy dossier",
  "paddy.cta.market": "Live mandi prices",
  "paddy.climate.b1": "Heat stress days (>35°C during flowering) up 22% by 2030 across Indo-Gangetic plain.",
  "paddy.climate.b2": "Erratic monsoon onset in AP & Odisha — 12–18 day variance projected.",
  "paddy.climate.b3": "Groundwater in Punjab-Haryana declining 40 cm/yr; shift to DSR & short-duration varieties inevitable.",
  "paddy.tech.b1": "Direct-Seeded Rice (DSR) coverage projected to hit 8 M ha by 2030 — saves 30% water.",
  "paddy.tech.b2": "AI-powered nitrogen advisory (leaf-colour + drone NDVI) cuts urea 18–24%.",
  "paddy.tech.b3": "Climate-resilient cultivars: DRR Dhan 42, CR Dhan 801 tolerant to submergence + drought.",
  "paddy.tech.b4": "Drone sowing & spraying subsidised at 40–50% under SMAM until 2027.",
  "paddy.market.b1": "India retains ~40% share of global rice exports; Basmati premium widening.",
  "paddy.market.b2": "Non-Basmati exports expected to rebound as buffer stocks stabilise post-2025.",
  "paddy.market.b3": "GI-tagged varieties (Sona Masuri, Gobindobhog) commanding 25–35% premium.",
  "paddy.policy.b1": "MSP indexed to A2+FL+50%; expected ₹2,980/qtl by 2030 for common paddy.",
  "paddy.policy.b2": "PM-PRANAM & fertilizer DBT pushing balanced NPK — urea overuse penalised from FY27.",
  "paddy.policy.b3": "PMFBY 2.0 offers weather-index insurance with 72-hr claim settlement.",
  // Crop library / filters
  "lib.eyebrow": "Library",
  "lib.title": "Crop Encyclopaedia",
  "lib.sub":
    "Every crop is a fully isolated dossier — data, images, diseases and rotations never cross over. Combine any of the filters below for a precise match.",
  "lib.recommended": "Recommended for",
  "lib.recSub": "crops thrive in your district's soil & climate.",
  "lib.searchPh": "Search crop, family, description…",
  "lib.filters": "Filters",
  "lib.reset": "Reset all",
  "lib.count": "of",
  "lib.crops": "crops",
  "lib.noMatch": "No crops match those filters.",
  "filter.district": "District",
  "filter.category": "Category",
  "filter.season": "Season",
  "filter.water": "Water need",
  "filter.soil": "Soil",
  "filter.duration": "Duration",
  "filter.profit": "Profit ≥",
  "filter.tag": "Tag",
  "opt.All": "All",
  "opt.Kharif": "Kharif",
  "opt.Rabi": "Rabi",
  "opt.Perennial": "Perennial",
  "opt.Low": "Low",
  "opt.Medium": "Medium",
  "opt.High": "High",
  "opt.Alluvium": "Alluvium",
  "opt.BlackCotton": "Black cotton",
  "opt.RedLoam": "Red loam",
  "opt.SandyLoam": "Sandy loam",
  "opt.Laterite": "Laterite",
  "opt.dur.short": "≤90 d",
  "opt.dur.med": "91–150 d",
  "opt.dur.long": "150+ d",
  "opt.profit.30": "≥30%",
  "opt.profit.45": "≥45%",
  "opt.profit.60": "≥60%",
};

const te: Dict = {
  "nav.home": "హోమ్",
  "nav.music": "సంగీతం",
  "nav.analytics": "విశ్లేషణ",
  "nav.crops": "పంటలు",
  "nav.rotation": "పంట మార్పిడి",
  "nav.fertilizer": "ఎరువులు",
  "nav.fertilizers": "ఎరువుల లైబ్రరీ",
  "nav.weather": "వాతావరణం",
  "nav.market": "మార్కెట్",
  "nav.diseases": "వ్యాధులు",
  "nav.schemes": "పథకాలు",
  "nav.districts": "జిల్లాలు",
  "nav.atlas": "నేల పరీక్ష అట్లాస్",
  "nav.paddyFuture": "వరి భవిష్యత్తు",
  "nav.about": "మా గురించి",
  "nav.contact": "సంప్రదించండి",
  "common.search": "వెతకండి",
  "common.language": "భాష",
  "common.theme": "థీమ్",
  "common.menu": "మెనూ",
  "aria.changeLanguage": "భాష మార్చండి",
  "aria.changeDistrict": "జిల్లా మార్చండి",
  "aria.openSearch": "శోధన తెరవండి",
  "aria.toggleTheme": "థీమ్ మార్చండి",
  "aria.toggleMenu": "మెనూ మార్చండి",
  "footer.tagline":
    "సినిమాటిక్, శాస్త్రీయ ఆధారిత సలహాలతో ప్రతి రైతును డేటా ఆధారిత వ్యవసాయ నిపుణుడిగా మారుస్తుంది.",
  "footer.platform": "ప్లాట్‌ఫారమ్",
  "footer.insights": "అంతర్దృష్టులు",
  "footer.company": "కంపెనీ",
  "footer.rights": "అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.",
  "paddy.eyebrow": "అవలోకనం · 2025 → 2030",
  "paddy.title": "వరి భవిష్యత్తు",
  "paddy.subtitle":
    "భారత్‌లో అత్యంత ముఖ్యమైన పంట — దిగుబడి, ధరలు, వాతావరణం, సాంకేతికత 2030 వరకు.",
  "paddy.msp": "కనీస మద్దతు ధర ధోరణి",
  "paddy.mspCaption": "₹/క్వింటాల్ · సాధారణ వరి · నిండైనది = వాస్తవం, డాష్ = అంచనా",
  "paddy.yield": "దిగుబడి అంచనా",
  "paddy.yieldCaption": "కిలో/హెక్టార్ జాతీయ సగటు · 2030 నాటికి 3.3 టన్/హె లక్ష్యం",
  "paddy.climate": "వాతావరణ ముప్పులు",
  "paddy.tech": "సాంకేతిక భవిష్యత్తు",
  "paddy.markets": "మార్కెట్ & ఎగుమతి",
  "paddy.policy": "విధాన సంకేతాలు",
  "paddy.kpi.msp": "2030 అంచనా MSP (₹/క్వి)",
  "paddy.kpi.yield": "2030 అంచనా దిగుబడి (కి/హె)",
  "paddy.kpi.export": "2030 నాటికి ఎగుమతి వాటా",
  "paddy.kpi.stress": "వాతావరణ-ప్రభావిత జిల్లాలు",
  "paddy.cta.title": "మీ జిల్లా కోసం వరి ప్లేబుక్ పొందండి",
  "paddy.cta.sub":
    "విత్తనం తేదీలు, ఎరువుల షెడ్యూల్, మండీ ధర మరియు వ్యాధి హెచ్చరికలు — మీ ప్రాంతం కోసం.",
  "paddy.cta.open": "వరి డోసియర్ తెరవండి",
  "paddy.cta.market": "ప్రత్యక్ష మండీ ధరలు",
  "paddy.climate.b1": "పూత సమయంలో ఉష్ణ ఒత్తిడి రోజులు (>35°C) 2030 నాటికి ఇండో-గంగా మైదానంలో 22% పెరుగుతాయి.",
  "paddy.climate.b2": "ఏపీ & ఒడిశాలో అస్థిర రుతుపవన ప్రారంభం — 12–18 రోజుల వైవిధ్యం అంచనా.",
  "paddy.climate.b3": "పంజాబ్-హర్యానాలో భూగర్భజలం 40 సెం.మీ/సం తగ్గుతోంది; DSR & స్వల్పకాలిక రకాలకు మార్పు తప్పనిసరి.",
  "paddy.tech.b1": "డైరెక్ట్-సీడెడ్ రైస్ (DSR) విస్తీర్ణం 2030 నాటికి 8 మిలియన్ హెక్టార్లకు — 30% నీరు ఆదా.",
  "paddy.tech.b2": "AI ఆధారిత నత్రజని సలహా (ఆకు రంగు + డ్రోన్ NDVI) యూరియా 18–24% తగ్గిస్తుంది.",
  "paddy.tech.b3": "వాతావరణ-సహన రకాలు: DRR ధాన్ 42, CR ధాన్ 801 — ములుగుట & కరువును తట్టుకుంటాయి.",
  "paddy.tech.b4": "SMAM కింద 2027 వరకు డ్రోన్ విత్తనం & స్ప్రేయింగ్‌కు 40–50% సబ్సిడీ.",
  "paddy.market.b1": "ప్రపంచ బియ్యం ఎగుమతుల్లో భారత్ ~40% వాటా; బాస్మతి ప్రీమియం విస్తరిస్తోంది.",
  "paddy.market.b2": "బఫర్ నిల్వలు స్థిరపడిన తర్వాత 2025 అనంతరం నాన్-బాస్మతి ఎగుమతులు తిరిగి పుంజుకుంటాయి.",
  "paddy.market.b3": "GI-ట్యాగ్ రకాలు (సోనా మసూరి, గోబిందభోగ్) 25–35% ప్రీమియం పొందుతున్నాయి.",
  "paddy.policy.b1": "MSP A2+FL+50%కి అనుసంధానం; సాధారణ వరికి 2030 నాటికి ₹2,980/క్వి అంచనా.",
  "paddy.policy.b2": "PM-PRANAM & ఎరువుల DBT సమతుల్య NPK ప్రోత్సహిస్తోంది — FY27 నుండి యూరియా అధిక వాడకంపై జరిమానా.",
  "paddy.policy.b3": "PMFBY 2.0 వాతావరణ-ఇండెక్స్ ఇన్సూరెన్స్‌తో 72 గం క్లెయిమ్ పరిష్కారం.",
  "lib.eyebrow": "గ్రంథాలయం",
  "lib.title": "పంట విజ్ఞాన సర్వస్వం",
  "lib.sub":
    "ప్రతి పంట పూర్తిగా వేరుగా ఉన్న డోసియర్ — డేటా, చిత్రాలు, వ్యాధులు, మార్పిడులు కలవవు. క్రింది ఫిల్టర్‌లను కలిపి ఖచ్చితమైన మ్యాచ్ పొందండి.",
  "lib.recommended": "మీ జిల్లాకు సిఫారసు:",
  "lib.recSub": "పంటలు మీ జిల్లా నేల & వాతావరణంలో బాగా పండుతాయి.",
  "lib.searchPh": "పంట, కుటుంబం, వివరణ శోధించండి…",
  "lib.filters": "ఫిల్టర్లు",
  "lib.reset": "అన్నీ రీసెట్",
  "lib.count": "లో",
  "lib.crops": "పంటలు",
  "lib.noMatch": "ఆ ఫిల్టర్‌లకు పంటలు లేవు.",
  "filter.district": "జిల్లా",
  "filter.category": "వర్గం",
  "filter.season": "సీజన్",
  "filter.water": "నీటి అవసరం",
  "filter.soil": "నేల",
  "filter.duration": "వ్యవధి",
  "filter.profit": "లాభం ≥",
  "filter.tag": "ట్యాగ్",
  "opt.All": "అన్నీ",
  "opt.Kharif": "ఖరీఫ్",
  "opt.Rabi": "రబీ",
  "opt.Perennial": "శాశ్వత",
  "opt.Low": "తక్కువ",
  "opt.Medium": "మధ్యస్థం",
  "opt.High": "ఎక్కువ",
  "opt.Alluvium": "ఒండ్రు నేల",
  "opt.BlackCotton": "నల్ల రేగడి",
  "opt.RedLoam": "ఎర్ర ఇసుక నేల",
  "opt.SandyLoam": "ఇసుక ఇసుక నేల",
  "opt.Laterite": "లాటరైట్",
  "opt.dur.short": "≤90 రో",
  "opt.dur.med": "91–150 రో",
  "opt.dur.long": "150+ రో",
  "opt.profit.30": "≥30%",
  "opt.profit.45": "≥45%",
  "opt.profit.60": "≥60%",
};

const hi: Dict = {
  "nav.home": "होम",
  "nav.music": "संगीत",
  "nav.analytics": "विश्लेषण",
  "nav.crops": "फसलें",
  "nav.rotation": "फसल चक्र",
  "nav.fertilizer": "उर्वरक",
  "nav.fertilizers": "उर्वरक लाइब्रेरी",
  "nav.weather": "मौसम",
  "nav.market": "बाज़ार",
  "nav.diseases": "रोग",
  "nav.schemes": "योजनाएँ",
  "nav.districts": "जिले",
  "nav.atlas": "मृदा परीक्षण एटलस",
  "nav.paddyFuture": "धान का भविष्य",
  "nav.about": "हमारे बारे में",
  "nav.contact": "संपर्क",
  "common.search": "खोजें",
  "common.language": "भाषा",
  "common.theme": "थीम",
  "common.menu": "मेन्यू",
  "aria.changeLanguage": "भाषा बदलें",
  "aria.changeDistrict": "जिला बदलें",
  "aria.openSearch": "खोज खोलें",
  "aria.toggleTheme": "थीम बदलें",
  "aria.toggleMenu": "मेन्यू टॉगल करें",
  "footer.tagline":
    "सिनेमैटिक, विज्ञान-आधारित सलाह जो हर किसान को डेटा-आधारित कृषि विशेषज्ञ बनाती है।",
  "footer.platform": "प्लेटफ़ॉर्म",
  "footer.insights": "अंतर्दृष्टि",
  "footer.company": "कंपनी",
  "footer.rights": "सर्वाधिकार सुरक्षित।",
  "paddy.eyebrow": "पूर्वानुमान · 2025 → 2030",
  "paddy.title": "धान का भविष्य",
  "paddy.subtitle":
    "भारत की सबसे महत्वपूर्ण फसल किस दिशा में जा रही है — 2030 तक उपज, कीमत, जलवायु और तकनीक।",
  "paddy.msp": "एमएसपी दिशा",
  "paddy.mspCaption": "₹/क्विंटल · सामान्य धान · ठोस = वास्तविक, धराशायी = अनुमानित",
  "paddy.yield": "उपज पूर्वानुमान",
  "paddy.yieldCaption": "किग्रा/हे राष्ट्रीय औसत · 2030 तक 3.3 टन/हे लक्ष्य",
  "paddy.climate": "जलवायु जोखिम",
  "paddy.tech": "तकनीकी सीमांत",
  "paddy.markets": "बाज़ार व निर्यात",
  "paddy.policy": "नीति संकेत",
  "paddy.kpi.msp": "2030 अनुमानित MSP (₹/क्वि)",
  "paddy.kpi.yield": "2030 अनुमानित उपज (किग्रा/हे)",
  "paddy.kpi.export": "2030 तक निर्यात हिस्सा",
  "paddy.kpi.stress": "जलवायु-प्रभावित ज़िले",
  "paddy.cta.title": "अपने ज़िले के लिए धान की गाइड पाएँ",
  "paddy.cta.sub":
    "बुवाई तिथियाँ, उर्वरक शेड्यूल, मंडी भाव और रोग चेतावनियाँ — आपके क्षेत्र के अनुसार।",
  "paddy.cta.open": "धान डोसियर खोलें",
  "paddy.cta.market": "लाइव मंडी भाव",
  "paddy.climate.b1": "फूल आने पर ताप-तनाव दिन (>35°C) 2030 तक इंडो-गंगा मैदान में 22% बढ़ेंगे।",
  "paddy.climate.b2": "आंध्र व ओडिशा में मानसून की अनियमित शुरुआत — 12–18 दिन का अंतर अनुमानित।",
  "paddy.climate.b3": "पंजाब-हरियाणा में भूजल 40 सेमी/वर्ष घट रहा; DSR व अल्पावधि किस्में अनिवार्य।",
  "paddy.tech.b1": "डायरेक्ट-सीडेड राइस (DSR) कवरेज 2030 तक 8 मिलियन हेक्टेयर — 30% पानी की बचत।",
  "paddy.tech.b2": "AI-आधारित नाइट्रोजन सलाह (पत्ती-रंग + ड्रोन NDVI) यूरिया 18–24% घटाती है।",
  "paddy.tech.b3": "जलवायु-सहनशील किस्में: DRR धान 42, CR धान 801 — जलमग्नता व सूखे में टिकाऊ।",
  "paddy.tech.b4": "SMAM के तहत 2027 तक ड्रोन बुवाई व छिड़काव पर 40–50% सब्सिडी।",
  "paddy.market.b1": "वैश्विक चावल निर्यात में भारत ~40% हिस्सा; बासमती प्रीमियम बढ़ रहा।",
  "paddy.market.b2": "बफर स्टॉक स्थिर होने पर 2025 के बाद गैर-बासमती निर्यात फिर बढ़ेगा।",
  "paddy.market.b3": "GI-टैग किस्मों (सोना मसूरी, गोविंदभोग) पर 25–35% प्रीमियम।",
  "paddy.policy.b1": "MSP A2+FL+50% पर आधारित; सामान्य धान के लिए 2030 तक ₹2,980/क्वि अनुमानित।",
  "paddy.policy.b2": "PM-PRANAM व उर्वरक DBT संतुलित NPK बढ़ा रहे — FY27 से यूरिया के अति-उपयोग पर दंड।",
  "paddy.policy.b3": "PMFBY 2.0 मौसम-सूचकांक बीमा, 72 घंटे में क्लेम निपटान।",
  "lib.eyebrow": "पुस्तकालय",
  "lib.title": "फसल विश्वकोश",
  "lib.sub":
    "हर फसल पूरी तरह से पृथक डोसियर है — डेटा, चित्र, रोग और फसल-चक्र कभी नहीं मिलते। सटीक मिलान के लिए नीचे के फिल्टर संयोजित करें।",
  "lib.recommended": "आपके ज़िले के लिए अनुशंसित:",
  "lib.recSub": "फसलें आपके ज़िले की मिट्टी व जलवायु में उपयुक्त हैं।",
  "lib.searchPh": "फसल, परिवार, विवरण खोजें…",
  "lib.filters": "फिल्टर",
  "lib.reset": "सब रीसेट",
  "lib.count": "में से",
  "lib.crops": "फसलें",
  "lib.noMatch": "इन फिल्टरों से मेल खाने वाली कोई फसल नहीं।",
  "filter.district": "ज़िला",
  "filter.category": "श्रेणी",
  "filter.season": "मौसम",
  "filter.water": "पानी की ज़रूरत",
  "filter.soil": "मिट्टी",
  "filter.duration": "अवधि",
  "filter.profit": "लाभ ≥",
  "filter.tag": "टैग",
  "opt.All": "सभी",
  "opt.Kharif": "खरीफ",
  "opt.Rabi": "रबी",
  "opt.Perennial": "बहुवर्षीय",
  "opt.Low": "कम",
  "opt.Medium": "मध्यम",
  "opt.High": "अधिक",
  "opt.Alluvium": "जलोढ़",
  "opt.BlackCotton": "काली मिट्टी",
  "opt.RedLoam": "लाल दोमट",
  "opt.SandyLoam": "बलुई दोमट",
  "opt.Laterite": "लैटेराइट",
  "opt.dur.short": "≤90 दि",
  "opt.dur.med": "91–150 दि",
  "opt.dur.long": "150+ दि",
  "opt.profit.30": "≥30%",
  "opt.profit.45": "≥45%",
  "opt.profit.60": "≥60%",
};

const DICTS: Record<Lang, Dict> = { en, te, hi };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18nCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      // 1) URL takes precedence so shareable links land in the right language.
      const url = new URL(window.location.href);
      const qp = url.searchParams.get("lang") as Lang | null;
      if (qp && DICTS[qp]) {
        setLangState(qp);
        window.localStorage.setItem("agri.lang", qp);
        document.documentElement.lang = qp;
        return;
      }
      // 2) Fall back to previous session preference.
      const saved = window.localStorage.getItem("agri.lang") as Lang | null;
      if (saved && DICTS[saved]) {
        setLangState(saved);
        document.documentElement.lang = saved;
        return;
      }
      // 3) Fall back to browser locale hint.
      const nav = (navigator.language || "").slice(0, 2).toLowerCase() as Lang;
      if (nav && DICTS[nav]) {
        setLangState(nav);
        document.documentElement.lang = nav;
      }
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("agri.lang", l);
      document.documentElement.lang = l;
      // Keep the URL in sync so refresh / copy-paste preserves the language.
      const url = new URL(window.location.href);
      if (l === "en") url.searchParams.delete("lang");
      else url.searchParams.set("lang", l);
      window.history.replaceState({}, "", url.toString());
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
