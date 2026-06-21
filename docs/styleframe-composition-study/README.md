# Styleframe Composition Study

A composition intelligence reference for Scatter motion blocks, derived from product marketing styleframe screenshots. This study treats each frame as a **composition reference**, not a UI audit — we extract reusable layout, hierarchy, rhythm, and motion patterns without copying brands, exact UI, colors, or product details.

## Source material

| Series | Frames | Native ratio | Notes |
|--------|--------|--------------|-------|
| `build-a-website` | 18 | 16:9 (1920×1080) | AI builder journey: prompt → site previews → editor → payoff |
| `framer` | 20 | 16:9 (3840×2160) | Creator program: editorial beats → templates → dashboard → proof wall |
| `grammarly` | 17 | 16:9 (1920×1080) | Document workspace: empty canvas → feature panels → highlight → brand |
| `flipp` | 7 | 1:1 (320×320) | Mobile-first: search, UI stack, chart proof, ecosystem grid |

**Total analyzed:** 62 screenshots  
**Originals:** `~/Desktop/video-screenshots/` (unchanged)

## Analysis method

1. Read frames as **grayscale/value studies** — hierarchy from contrast, not color.
2. Map each frame to an underlying **Swiss grid** (columns, margins, zones, baseline).
3. Identify **composition archetypes** that repeat across series.
4. Translate patterns into **Scatter motion block specs** with brand-level and block-level controls.

Grayscale contact sheets and thumbnails live in this folder for quick value review:

- `contact-sheet-{series}.jpg` — full series at a glance
- `grayscale-thumbnails/{series}/` — 320px analysis copies (originals not modified)

## Files in this study

| File | Purpose |
|------|---------|
| [screenshot-analysis.md](./screenshot-analysis.md) | Per-frame composition breakdown (all 62 frames) |
| [composition-archetypes.md](./composition-archetypes.md) | Grouped reusable patterns with design-director notes |
| [scatter-motion-block-specs.md](./scatter-motion-block-specs.md) | Full block specs ready for Scatter library implementation |
| [grayscale-value-notes.md](./grayscale-value-notes.md) | Value hierarchy patterns and contact-sheet reading guide |
| [composition-archetypes.json](./composition-archetypes.json) | Machine-readable archetype definitions for template system |
| [scatter-implementation-plan.md](./scatter-implementation-plan.md) | Wave-1 build plan: 8 blocks, props/schema, responsive rules, control tiers |

## Design framework

This study applies three project skills:

- **Swiss Grid System** — columns, margins, gutters, safe areas, zone mapping
- **Type Scale System** — role-based hierarchy (display → label), ratio math, responsive clamps
- **Responsive Type + Grid Composer** — brand → block → format override model

Default Scatter assumptions unless overridden:

- **Personality:** Product / SaaS
- **Safe area:** `standard` (8% × 7%)
- **Grid:** 12-column @ 16:9; 4–6 column @ 9:16
- **Type base @ 1080p:** ~30px body equiv., ratio 1.25

## Strongest cross-series patterns

1. **Editorial void + centered type** — hook, transition, stat, CTA on black or light field
2. **Split text rail + media** — headline left (4–5 cols), UI or photo right (7–8 cols)
3. **Centered UI card in negative space** — one task, one card, generous margins
4. **Floating card collage with DOF** — 3–6 cards, one sharp hero, blurred satellites
5. **Hero prompt / input bar** — pill-shaped UI over lifestyle or gradient background
6. **Display-type editorial hero** — oversized wordmark spanning grid, image breaks through type
7. **Dashboard / data proof** — KPI row + table or chart, dark UI on void
8. **Brand payoff** — centered logo + optional URL/CTA, maximum breathing room

## Top motion blocks to build first

Priority order for Scatter block library:

1. `editorial-statement` — Hook / transition title card
2. `hero-split-text-media` — Primary product intro split
3. `centered-ui-feature` — Single feature in floating card
4. `hero-prompt-bar` — AI/search prompt over media
5. `big-stat-proof` — Centered value proposition number
6. `card-collage-dof` — Multi-card ecosystem with depth
7. `split-feature-explain` — Text left, UI panel right
8. `template-carousel` — Focused center card, dimmed neighbors
9. `editorial-display-hero` — Giant type + supporting media
10. `dashboard-proof` — KPI + data table
11. `social-proof-wall` — Testimonial / receipt card cloud
12. `brand-payoff` — Logo + CTA outro

See [scatter-motion-block-specs.md](./scatter-motion-block-specs.md) for full specs.

## Gaps in the reference set

| Gap | Impact | Suggested addition |
|-----|--------|-------------------|
| No native **9:16** or **4:5** frames | Vertical reflow rules are inferred, not observed | Capture mobile story frames or re-crop key patterns |
| No **before/after comparison** | Compare story beat underrepresented | Add side-by-side or slider-style frames |
| No **device frame / phone mockup** hero | Device-in-hand pattern missing | Add hardware bezel compositions |
| **Flipp** frames are 320×320 | Mobile patterns exist but low resolution | Re-export at 1080×1080 minimum |
| Limited **pure chart/data** frames | Data viz zone specs are thin | Add stat-only and chart-hero frames |
| No **print / A4** references | Print token path untested | Optional poster-format captures |

## Scatter mapping

### Brand-level controls (from patterns)

```typescript
BrandComposition: {
  style: "product",
  safeArea: "standard" | "tight" | "generous",
  gridStrength: "balanced",
  density: "balanced" | "spacious" | "compact",
  allowGridBreaks: false,
  motionComposition: "stable" | "cinematic",
}

BrandTypography: {
  baseSize: 30,        // @1080p motion
  ratio: 1.25,
  roles: { display, heading, subheading, body, caption, label, stat }
}
```

### Block-level overrides (from patterns)

```typescript
layoutOverrides.formats["16:9"]: {
  contentZone: "split-left" | "center" | "center-safe",
  textScale: 1.0,
  maxTextWidth: 0.85,
  mediaTreatment: "split" | "contained" | "background",
  breakGrid: false,
}
```

Archetype → `layoutIntent` mapping lives in [composition-archetypes.json](./composition-archetypes.json).

## Usage

1. Pick a **story beat** (hook, feature, proof, payoff).
2. Find matching **archetype** in [composition-archetypes.md](./composition-archetypes.md).
3. Apply **block spec** from [scatter-motion-block-specs.md](./scatter-motion-block-specs.md).
4. Tune via brand defaults; override per block or format only when needed.
5. Validate hierarchy at thumbnail size using grayscale contact sheets.
