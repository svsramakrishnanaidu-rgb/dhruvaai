## Scope (v1)

Given the size of the ask, I'll ship a **polished, cinematic v1** with mock JSON data across all modules, and 4 fully-populated crop detail pages as reference implementations. The design system, animations, and data schema are set up so more crops slot in trivially.

Region default: **Andhra Pradesh + Telangana** (English only, i18n scaffolding left for later).
Imagery: **AI-generated** stylized crop hero images for consistency; disease imagery generated too.
Loader: **shortened cinematic** (single GSAP + Three.js scene, ~3s, skippable) — the full 3-scene sequence is deferred to keep FPS high on mid-range devices.

## What gets built

### Tech
- TanStack Start (existing) + React 19 + Tailwind v4 (existing stack — the "vanilla JS" ask is incompatible with this project's TanStack Start runtime; I'll keep the same premium feel using React components).
- three.js + @react-three/fiber + drei for 3D scenes
- gsap + @gsap/react for timelines; framer-motion for component motion
- lenis for smooth scroll
- recharts for market/weather charts
- lucide-react (installed) for icons

### Design system (src/styles.css)
- Agri palette: deep loam, sunrise gold, leaf green, sky, monsoon; gradients + shadow tokens
- Glass surface tokens (`--glass-bg`, `--glass-border`), neon-glow shadow, radial spotlight
- Dark mode variant with neon accents
- Motion tokens (durations, easings), reduced-motion overrides

### Routes
```
/                      Home (hero + trending + weather teaser + stats)
/districts             State → District → Mandal selector, sets global context
/crops                 Crop library grid with filters (season/soil/water/profit)
/crops/$slug           Immersive crop detail (rice, cotton, groundnut, maize)
/rotation              Rotation wheel visualizer
/fertilizer            Land-size fertilizer calculator
/weather               Live-style weather dashboard (mock)
/market                Market prices with trend charts (mock)
/diseases              Disease library grid + detail modal
/schemes               Government schemes list
/about                 Team (Bhaskar, Ravi, Ramakrishna, Vinay) + mission
/contact               Contact form (mock submit)
```
Each route gets its own `head()` metadata.

### Global chrome
- Sticky glass nav with magnetic hover, animated active indicator, dark-mode toggle, language stub, global search dialog (Cmd+K), district chip
- Animated background layer: WebGL particles + drifting leaves + gradient sweep (single canvas, reused across pages, respects `prefers-reduced-motion`)
- Cinematic loader on first visit only (sessionStorage flag), skippable

### Home
- Hero: animated headline "Smart Agricultural Advisory Platform", subtitle, dual CTA
- 3D scene: low-poly tractor + growing wheat + soft god-rays (r3f), auto-rotates on idle
- Trending crops carousel with tilt/glow cards
- Live counters (farmers, crops, districts)
- Weather + soil status strip driven by selected district
- Seasonal indicator ring (Kharif/Rabi/Zaid)

### Crop detail (immersive)
Per-crop JSON module (`src/data/crops/rice.ts`, `cotton.ts`, `groundnut.ts`, `maize.ts`) — strictly isolated. Schema mirrors the full spec (climate, soil, land prep timeline, seed, spacing, irrigation, fertilizer schedule, weeds, pests, diseases, harvest, yield, MSP, rotation, tips, references).

Detail page sections:
1. Cinematic cover with parallax + generated crop image
2. Quick facts glass grid (season, water, soil, yield, profit)
3. Animated land-prep timeline (6 steps)
4. Fertilizer schedule table with per-stage animated bars
5. Irrigation schedule
6. Disease/pest gallery (from crop's own list — never mixed)
7. Rotation preview linking to `/rotation`
8. Market price mini-chart + MSP
9. Expert tips + references (YouTube/PDF links stubbed)

### Modules
- **Fertilizer calculator**: land size input (acres/hectares), computes Urea/DAP/20-20/Potash/Zinc/Gypsum/Compost with animated counters, per-acre + total, uses selected crop's schedule.
- **Rotation wheel**: SVG circular timeline with GSAP rotation, chosen crop → suggested rotations, gap durations, benefits.
- **Weather**: mock 7-day forecast, animated icons, temp/humidity/wind/sunrise/sunset, season alerts. Charts via recharts.
- **Market**: nearby markets list, today/yesterday/weekly/monthly trend charts, profit estimator using crop yield × price.
- **Disease library**: HD generated images, severity meter, symptoms/causes/solutions, organic + chemical control.

### Search
Global command palette (fuse.js) over crops, diseases, schemes, districts. Filter chips: district, crop, season, profit, soil, water. Voice search via `SpeechRecognition` (webkit) with graceful fallback.

### Accessibility & perf
- Semantic landmarks, aria labels on icon buttons, focus rings
- `prefers-reduced-motion` disables 3D scene + particle canvas, keeps essential transitions
- Lazy-load heavy scenes (`React.lazy` behind `<ClientOnly>` gate for Three.js modules — no SSR of WebGL)
- Images generated at appropriate sizes, `loading="lazy"`, `aspect-*` wrappers

### Data isolation guarantee
Each crop is a standalone module exporting a typed `Crop` object. Detail page reads only `crops[slug]` — no shared arrays, no cross-crop merging. Diseases and fertilizer schedules live inside each crop's file.

### Generated assets
~12 AI images (4 crop covers, 4 crop icons, 4 disease samples) saved to `src/assets/`.

## Out of scope for v1 (called out so we can add later)
- Real weather/market APIs (currently mock; swap layer isolated in `src/lib/api/`)
- Full 3-scene cinematic loader (shortened version ships)
- Multilingual UI (English only; strings centralized for later i18n)
- Backend/auth (no Lovable Cloud — this is a marketing/advisory frontend). Say the word if you want profiles, saved farms, or submitted queries.
- Rain/snow/butterflies/birds background layers (kept to particles + leaves for FPS)
- Rotation wheel gets 4 crops (matches the 4 detail pages)

## Technical notes
- No `src/pages/` — TanStack file-based routes under `src/routes/`
- 3D components wrapped in `<ClientOnly>` + `React.lazy` to keep SSR clean
- Lenis initialized in root; disabled when reduced motion
- All colors via semantic tokens; no hardcoded hex in components
- SEO: distinct head() per route; og:image only on leaf routes with cover art

Ready to build on approval.