# Plan - Website-Only Cinematic Moonlit Crimson Redesigns

Redesign the website Home Page using the uploaded Japanese moonlit landscape as the primary visual reference, applying a cinematic crimson and navy palette exclusively to the desktop version.

## User Review Required

> [!IMPORTANT]
> The redesign targets **website users only**. The mobile app, Android, and iOS native interfaces will remain exactly as they are currently to maintain their specialized KGF/Crimson theme.

- **Background Animation**: The static image will be transformed into a subtle 30s animated loop with drifting clouds, mist, and flickering lanterns.
- **Parallax**: Background depth will react dynamically to mouse-wheel scrolling for immersion.
- **Typography**: The custom "Japan Ramen" font will be used for the main hero headline: *"Farm with foresight, grow with clarity."*

## Proposed Changes

### Assets & Styling
- **Background Asset**: Create a CDN asset for `moonlit-japan.png` (uploaded file-6).
- **Fonts**: Integrate `Japan Ramen` (hero) and `Space Grotesk`/`Inter` (supporting) into `src/styles.css`.
- **Palette**: Define a new Midnight Navy (`#050B16`) and Crimson Red (`#E31937`) color system in `@theme`.
- **Glassmorphism**: Update `--neo-glass` tokens for deeper navy surfaces and crimson edge lighting.

### Home Page Redesign (`src/routes/index.tsx`)
- **Cinematic Background**: Replace the current hero image/video with the new animated moonlit landscape.
- **Hero Section**: 
  - Left-aligned headline in Japan Ramen font with character-reveal animations.
  - Supporting description and CTA buttons with crimson gradients and glow.
  - Compact stats cards (Season, Soil, Rain) with dark glass styling.
- **Featured Crop Card**: Upper-right floating glass card with Rice (Paddy) dossier info and photorealistic imagery.
- **Scroll Parallax**: Implement GPU-accelerated parallax motion for background layers using GSAP or CSS transforms.

### Global Website UI
- **Navbar**: Midnight navy glass surface with moonlight-white text and crimson active states.
- **Typography Multi-font System**: Apply Space Grotesk for headings and IBM Plex Mono for data points.
- **Contrast Zones**: Automatically apply dark gradient overlays and blur behind content to ensure perfect readability over the detailed background.

### Performance & Accessibility
- **Optimization**: Use optimized WebP fallback for the background and GPU-accelerated transitions to maintain 60FPS.
- **Reduced Motion**: Respect `prefers-reduced-motion` by disabling parallax and replacing the animated background with the static image.

## Verification Plan
- **Device Checks**: Verify that `isDesktop` (from `use-viewport`) correctly applies the new design ONLY to screens >1024px.
- **Animation Performance**: Monitor frame rates during scrolling to ensure no lag on 4K displays.
- **Visual Contrast**: Verify WCAG readability of white/crimson text against the moonlit background.
