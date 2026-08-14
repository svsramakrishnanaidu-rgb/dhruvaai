## National Soil Testing Atlas Redesign

### User Requirements
- Premium interactive map interface (India-wide).
- Accurate map markers and clustering.
- Search/filter by State, District, Village, Pincode, Name, and Services.
- Detailed info panel: Distance, Address, Contact, Hours, Services, Charges, Navigation, Status.
- "Near Me" GPS functionality.
- Neo-glassmorphism/Agriculture-themed UI.
- Interactive animations.
- Responsive for mobile (Android/iOS) and desktop.
- High performance and fast loading.

### Technical Implementation

#### 1. Server-Side Improvements (`src/lib/soil-atlas.functions.ts`)
- Update `LabCenter` interface to include `state`, `district`, `pincode`, `services`, `charges`.
- Enhance `searchSoilLabs` to support structured search (State/District/etc).
- Add "services available" mock data or filter logic.

#### 2. Component Overhaul (`src/components/GoogleAtlasMap.tsx`)
- Implement Marker Clustering (using `@googlemaps/markerclusterer`).
- Custom markers with agricultural styling (gold/green).
- Smooth pan/zoom animations using GSAP on selection.

#### 3. Route Overhaul (`src/routes/atlas.tsx`)
- Implement a split-pane layout for desktop (Left: Filters & List, Right: Map).
- Implement a bottom-drawer or tabbed view for mobile.
- Add "Stats Bar" (Total centers, Open now, Nearby).
- Add "Service Filters" chips.
- Use `framer-motion` for list animations and detail panel transitions.

#### 4. UI/UX Refinement
- Apply `neo-glass-card` and gold accents from `styles.css`.
- Add cinematic background/overlays.
- Implement "Service" category icons.

### File Changes
- `src/lib/soil-atlas.functions.ts`: Expand schema and query logic.
- `src/components/GoogleAtlasMap.tsx`: Add clustering and custom markers.
- `src/routes/atlas.tsx`: Complete UI reconstruction.
- `src/components/ManualLocationPicker.tsx`: Ensure consistency with atlas search.
