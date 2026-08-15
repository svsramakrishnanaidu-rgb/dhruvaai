# Krish Sense — Midnight Forest Redesign (Website Only)

Reconstruct the desktop/tablet interface with a premium "Midnight Forest" Glassmorphism theme while keeping the mobile version untouched.

## Visual Language
- **Theme:** Midnight Forest (Emerald, Leaf, Harvest Gold, Deep Forest).
- **Glassmorphism:** Enhanced depth (40px blur), saturated backgrounds (180%), and metallic accents.
- **Typography:** "Unbounded" for statements (Hero), "Plus Jakarta Sans" for UI/Navigation, "Instrument Sans" for body.

## Proposed Changes

### 1. Global Styles (`src/styles.css`)
- Define website-specific CSS variables (isolated from mobile tokens).
- Add "Japan Ramen" / "Unbounded" font stack.
- Implement high-performance glass effects with GPU acceleration.

### 2. Desktop Navigation (`src/components/Navbar.tsx`)
- Branch the desktop view to a floating glass navbar.
- Enhanced hover states with magnetic effects and golden highlights.

### 3. Hero Section & Background (`src/routes/index.tsx`)
- Redesign the desktop-only `HeroSection`.
- Implement a scroll-controlled cinematic background (trees, light rays, moving leaves).
- Update typography to "Japan Ramen" for the main statement.

### 4. Component Redesign (Website Version)
- **Market & Analytics:** Transition to heavy glass panels with saturated emerald/gold tints.
- **Weather:** Enhance the AI dashboard with futuristic soil/AQI visuals.
- **Footer:** Metallic gold gradients for links and logos.

### 5. AI Interface
- Reposition the AI experience as a central, high-visibility glass panel on the website.

## Technical Details
- **Website Isolation:** Use the existing `useIsDesktop()` hook and `lg:` / `xl:` Tailwind breakpoints to ensure zero impact on mobile.
- **Typography:** Adding Google Fonts for "Unbounded" and "Plus Jakarta Sans" in `src/routes/__root.tsx`.
- **Performance:** Using CSS containment and `backdrop-filter` optimizations for 60fps scrolling on desktop.
