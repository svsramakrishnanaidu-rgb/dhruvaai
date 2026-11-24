# DHRUVA AI — Agricultural decision-support engineering guide

Read the [project README](README.md) and original project brief before using this guide. Routes and technologies are documented in the README; the data-validation mechanisms below are proposed improvements unless verified in source and tests. DHRUVA is an independent educational application, not an official extension service.

## User journey

~~~mermaid
flowchart TD
 A[Farmer or learner] --> B[Choose district and season]
 B --> C[Browse crop information]
 C --> D{Choose tool}
 D --> E[Weather and market context]
 D --> F[Crop rotation information]
 D --> G[Calculator]
 E --> H[Show source and observation time]
 F --> I[Explain suitability constraints]
 G --> J[Validate units and assumptions]
 H --> K[Review with local expertise]
 I --> K
 J --> K
~~~

Location and season matter because crop suitability depends on rainfall, irrigation, soil, temperature and cultivar. A district selection is not a soil test. Even nearby farms can have different drainage and nutrient conditions. Present recommendations as conditional options, especially when the user has supplied only a district name.

## Proposed information architecture

~~~mermaid
flowchart LR
 S[Crop and district records] --> V[Schema validation]
 W[Weather source] --> V
 M[Market source] --> V
 V --> T[Normalize units and timestamps]
 T --> R[Route-specific views]
 R --> U[Accessible mobile interface]
 V --> F[Missing or invalid data state]
~~~

A record should include geography, source, observation date, unit, update frequency and quality status. Market quotations must identify whether they describe modal, minimum or maximum price, commodity grade, market and quantity unit. Never present sample prices as current quotations. Weather forecasts need a validity window and distinction between forecast and observation. Agricultural content should preserve the original citation and relevant region.

## Calculator mechanism

A generic area-based estimator multiplies a validated input rate by area expressed in the same unit. For example, if an explicitly supplied hypothetical rate is 10 units per hectare and the entered area is 0.5 hectares, the mathematical estimate is 5 units. This is an arithmetic example, not a fertilizer or pesticide recommendation. Reject negative, non-finite and ambiguous quantities. When converting acres to hectares, use a documented conversion constant and avoid early rounding. Display inputs, assumptions and final units so the result can be checked.

## Rotation and disease information

A proposed crop rotation tool should consider prior crop family, seasonal window, available water, expected harvest date and field constraints. A legume may provide useful rotation benefits but is not universally suitable. Disease photographs and AI classifications are not sufficient to prescribe chemical treatment; similar symptoms may result from nutrient deficiency, water stress or pests. Display uncertainty and encourage consultation with qualified agricultural advisers.

## Quality scenarios

| Case | Acceptance criterion |
| --- | --- |
| Weather unavailable | Explicit unavailable state rather than simulated live data |
| Market quotation old | Visible date and stale label |
| Invalid area or unit | Validation without a misleading result |
| District changed | Dependent data refreshed consistently |
| Unsupported crop | Clear missing-information state |
| Screen reader | Labeled controls and understandable navigation |

## Next milestones

First validate crop and district provenance; then add calculator fixtures, dataset freshness checks and accessibility checks. Build with the documented Bun lockfile and record the actual lint/build outcomes. Verify third-party permissions and server-side secret handling before public use. Agronomic claims and safety-critical guidance require domain review independently of software build success.
