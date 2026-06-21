---
name: responsive-type-grid-composer
description: >-
  Combine type scales and Swiss grids into responsive brand layouts for motion
  blocks, templates, and Figma handoff. Use when designing Scatter blocks,
  brand systems, responsive templates, posters, social graphics, or
  multi-aspect-ratio compositions.
---

# Responsive Type + Grid Composer

## Purpose

Combine the **Type Scale System** and **Swiss Grid System** into one practical workflow for designing responsive brand layouts. This is the primary skill for Scatter motion blocks, templates, posters, social graphics, app screens, and Figma handoff specs.

**Read first when composing:**
- `type-scale-system` skill — ratio math, tokens, line-height, tracking
- `swiss-grid-system` skill — columns, margins, zones, baseline

---

## When to Use This Skill

- Designing Scatter motion blocks or block library entries
- Creating responsive templates across 1:1, 4:5, 9:16, 16:9, print
- Building brand layout systems with override layers
- Writing Figma handoff specs with exact values and reasoning
- Generating semantic design tokens for code implementation
- Auditing existing layouts for hierarchy or grid issues

---

## Inputs to Request or Infer

Gather or infer these before composing:

| Input | Options / examples |
|-------|-------------------|
| **Brand personality** | minimal/premium, product/SaaS, editorial, streetwear, luxury |
| **Canvas size** | 1920×1080, 1080×1920, 1080×1080, A4 |
| **Aspect ratio** | 1:1, 4:5, 9:16, 16:9, A4/print |
| **Primary content type** | headline, quote, stat, product feature, media hero |
| **Amount of text** | none, short (≤40 chars), medium, long |
| **Image count** | 0, 1 hero, 2+ collage |
| **Logo type** | wordmark, symbol, lockup, none |
| **Typeface category** | grotesk, serif, display, mono |
| **Density** | spacious, balanced, compact |
| **Energy** | calm, stable, dynamic, cinematic |
| **Export medium** | motion video, static social, web, print |
| **Motion or static** | animated entrance/exit or still frame |
| **Guideline strictness** | strict Swiss, balanced, loose/expressive |

If inputs are missing, default to **product/SaaS**, **16:9**, **balanced density**, **standard safe area**.

---

## Personality Mapping

For each personality, apply these defaults. Override at brand or block level when needed.

### Minimal / Premium

| Setting | Value |
|---------|-------|
| Margin style | Large (10–15%) — `generous` safe area |
| Density | Spacious |
| Type ratio | 1.25–1.333 (Major Third → Perfect Fourth) |
| Grid type | Column or modular, 12 columns |
| Layout behavior | Asymmetric whitespace; left-aligned type; single focal point |
| Composition style | `premium` |
| Grid strength | `strict` or `balanced` |
| Allow breaks | false |

### Product / SaaS

| Setting | Value |
|---------|-------|
| Margin style | Medium (6–10%) — `standard` safe area |
| Density | Balanced |
| Type ratio | 1.2–1.25 (Minor/Major Third) |
| Grid type | 12-column |
| Layout behavior | Center or split-left; clear CTA zone; contained media |
| Composition style | `product` |
| Grid strength | `balanced` |
| Allow breaks | false |

### Editorial / Cultural

| Setting | Value |
|---------|-------|
| Margin style | Medium to large |
| Density | Spacious |
| Type ratio | 1.333–1.414 (Perfect Fourth → Augmented Fourth) |
| Grid type | Modular, 6–8 columns |
| Layout behavior | Strong headline; image-caption pairs; baseline rhythm |
| Composition style | `editorial` |
| Grid strength | `balanced` |
| Allow breaks | true (caption offsets, pull quotes) |

### Streetwear / Music / Poster

| Setting | Value |
|---------|-------|
| Margin style | Tight (3–6%) — `tight` safe area |
| Density | Compact to balanced |
| Type ratio | 1.333–1.5 (Perfect Fourth → Perfect Fifth) |
| Grid type | Hierarchical or modular, 6–8 columns |
| Layout behavior | Oversized display type; full-bleed media; grid breaks |
| Composition style | `expressive` or `social` |
| Grid strength | `loose` or `expressive` |
| Allow breaks | true |

### Luxury / Wellness

| Setting | Value |
|---------|-------|
| Margin style | Large — `generous` |
| Density | Spacious |
| Type ratio | 1.25–1.618 (Major Third → Golden Ratio) |
| Grid type | Manuscript or 4-column |
| Layout behavior | Centered; generous breathing room; serif-friendly |
| Composition style | `premium` |
| Grid strength | `strict` |
| Allow breaks | false |

---

## Responsive Aspect Ratio Rules

### 1:1 (Square)

- **Columns:** 6 or 12
- **Type scale:** ×0.9 size scale; shorter lines
- **Layout:** Center-weighted; headline top-center or center
- **Media:** Contained or background; avoid edge-to-edge text competition
- **Zone default:** `top-center` or `center`

### 4:5 (Portrait social)

- **Columns:** 6
- **Type scale:** ×0.96
- **Layout:** Vertical stack; headline upper, CTA lower
- **Media:** Contained or top-half hero
- **Zone default:** `top-center` + `bottom-center`

### 9:16 (Vertical video)

- **Columns:** 4–6
- **Type scale:** ×1.08 (slightly larger for arm's-length viewing)
- **Layout:** Single column reflow; respect vertical danger zones
- **Safe area:** Top 15%, bottom 20% soft-danger; use `center-safe` for critical text
- **Zone default:** `center-safe`, `lower-third`, or `top-center`
- **Responsive rule:** `reflowOnVertical: true`

### 16:9 (Landscape)

- **Columns:** 12
- **Type scale:** ×1.0 (reference)
- **Layout:** Split compositions (5/7, 6/6); lower-thirds for titles
- **Media:** Split or full-bleed background
- **Zone default:** `split-left`, `lower-third`, or `center`

### A4 / Print

- **Columns:** 6 or 12 (modular with rows)
- **Type scale:** pt-based; ratio 1.25–1.333
- **Margins:** 12–20mm minimum
- **Baseline:** 12pt grid common
- **Layout:** Manuscript or modular; bleed for full-bleed images

### Cross-format responsive matrix

| Element | 16:9 | 9:16 | 1:1 | 4:5 |
|---------|------|------|-----|-----|
| Headline zone | split-left / lower-third | center-safe / top-center | top-center | top-center |
| Media treatment | split / background | contained / full-bleed | contained | top hero |
| Logo | top-left | top-center | top-center | top-left |
| Text max width | 0.85 | 0.88 | 0.82 | 0.84 |
| Stack direction | row (split) | column | column | column |

---

## Type + Grid Relationship

**Every type element must anchor to one of:**

1. **Column edge** — left/right text alignment
2. **Row / module boundary** — vertical position
3. **Baseline** — line box snaps to baseline grid
4. **Margin** — inset from canvas edge
5. **Image edge** — caption tied to media
6. **Center axis** — centered headlines
7. **Optical alignment point** — logo, icon, stat numeral

Never float text in arbitrary pixel coordinates without naming its anchor.

### Slot → role → zone mapping (Scatter)

| Slot role | Typography role | Typical zone | Grid span |
|-----------|-----------------|--------------|-----------|
| `headline` | `heading` or `display` | top-center, split-left | 4–8 cols |
| `subhead` | `subheading` | below headline | same width |
| `body` | `body` | center, bottom-left | 4–6 cols |
| `quote` | `heading` | center | 6–8 cols |
| `stat-value` | `stat` | center, split-left | 2–4 cols |
| `stat-label` | `label` | below stat | 2–4 cols |
| `caption` | `caption` | image-adjacent | 2–3 cols |
| `cta` | `label` | bottom-center | 2–4 cols |
| `logo` | — | top-left, top-center | 1–2 cols |

---

## Token Output

Always emit three token layers:

### 1. Type tokens

```css
--type-base: 16;
--type-ratio: 1.25;
--font-size-base: 16px;
--font-size-lg: 25px;
--font-size-display: 49px;
--line-height-body: 1.5;
--line-height-heading: 1.15;
--tracking-label: 0.08em;
--tracking-display: -0.02em;
```

Map to Scatter `BrandTypography.roles`:

```typescript
roles: {
  display:   { fontSize: 140, lineHeight: 1.0,  letterSpacing: -0.02, ... },
  heading:   { fontSize: 70,  lineHeight: 1.08, letterSpacing: 0,    ... },
  subheading:{ fontSize: 45,  lineHeight: 1.15, letterSpacing: 0,    ... },
  body:      { fontSize: 30,  lineHeight: 1.45, letterSpacing: 0,    ... },
  caption:   { fontSize: 24,  lineHeight: 1.4,  letterSpacing: 0.04, ... },
  label:     { fontSize: 18,  lineHeight: 1.2,  letterSpacing: 0.1,  ... },
  stat:      { fontSize: 80,  lineHeight: 1.05, letterSpacing: -0.01,... },
}
```

### 2. Grid tokens

```css
--grid-columns: 12;
--grid-gutter: 24px;
--grid-margin-x: 8%;
--grid-margin-y: 7%;
--grid-baseline: 8px;
--safe-area-preset: standard;
--grid-strength: 0.85;
```

Map to Scatter `BrandComposition`:

```typescript
composition: {
  style: "product",
  gridStrength: "balanced",
  defaultAlignment: "center",
  density: "balanced",
  safeArea: "standard",
  motionComposition: "stable",
  allowGridBreaks: false,
}
```

### 3. Layout tokens

```css
--layout-zone: center;
--layout-padding: 0.07;
--layout-gap: 0.04;
--layout-max-text-width: 0.85;
--layout-text-scale: 1.0;
--layout-stack-direction: column;
--media-treatment: contained;
```

Map to Scatter block `layoutOverrides.formats[formatId]`:

```typescript
layoutOverrides: {
  formats: {
    "format-16-9": {
      contentZone: "split-left",
      textScale: 1.0,
      maxTextWidth: 0.85,
      gap: 0.04,
      mediaTreatment: "split",
    },
    "format-9-16": {
      contentZone: "center-safe",
      textScale: 1.08,
      reflowOnVertical: true,
    },
  },
}
```

---

## Advanced Override Rules

### Three-layer model

```
Brand defaults  →  Block intent  →  Format override
(composition)     (layoutIntent)    (per aspect ratio)
```

1. **Brand-level** — `BrandComposition` + `BrandTypography`: ratio, margins, density, grid strength, safe area
2. **Block-level** — `BlockLayoutIntent` + `layoutRules` per aspect ratio: zones, media treatment, slot layout
3. **Format override** — `BlockLayoutOverride` per format: textScale, contentZone, breakGrid, padding

### Override principles

- **90% automatic:** Brand + intent resolve layout without manual tweaks
- **Hide advanced controls** unless user opens overrides or warnings fire
- **Block overrides win over brand** for that block only
- **Format overrides win over block defaults** for that aspect ratio only
- **`useBrandLayout: false`** resets to intent defaults (ignores brand composition zones)
- **`breakGrid: true`** allows one focal element to break snap (requires `allowGridBreaks` at brand level)

### Scatter override fields

| Field | Scope | Effect |
|-------|-------|--------|
| `safeArea` | Brand | tight / standard / generous margins |
| `gridStrength` | Brand | snap strictness (1.0 → 0.55) |
| `density` | Brand | line-height + spacing multipliers |
| `layoutIntent` | Block | hero, quote, stat, product-feature, etc. |
| `layoutRules` | Block | per-aspect slot positions |
| `contentZone` | Format override | zone within safe area |
| `textScale` | Format override | multiplier on intent text scale |
| `breakGrid` | Format override | allow focal breakout |
| `slotOverrides` | Advanced | per-slot position/size |

---

## Layout Generation Process

Follow these 10 steps in order:

### 1. Identify hierarchy
- What is the single most important element? (headline, stat, media, logo)
- Rank slots: primary → secondary → tertiary
- Choose `BlockLayoutIntent`: hero, statement, quote, stat, product-feature, etc.

### 2. Choose type ratio
- Map personality → ratio from personality table
- Set base size for export medium (1080p motion: ~30px body equiv.)
- Generate scale table (see `type-scale-system` skill)

### 3. Choose grid
- Map aspect ratio → column count
- Set margin personality → safe area preset
- Pick grid type: column, modular, or hierarchical

### 4. Assign text zones
- Map each text slot to a `LayoutZone`
- Set column span and alignment
- Define max text width factor

### 5. Assign image zones
- Choose media treatment: full-bleed, contained, split, collage, background
- Align image edges to column boundaries
- Reserve caption area if needed

### 6. Define margins and safe area
- Apply safe area preset
- Add platform-specific danger zones (9:16)
- Set padding and gap from density

### 7. Check readability
- Run type QA checklist
- Verify contrast, line length, min font sizes
- Enable `autoShrinkText` if content length varies

### 8. Add optional grid break
- Only if personality allows and hierarchy needs emphasis
- One break maximum; maintain one anchor axis

### 9. Confirm responsive behavior
- Define per-format overrides for all target aspect ratios
- Set reflow, hide-optional, and scale rules
- Test longest headline and most text-heavy scenario

### 10. Output tokens and rules
- Emit Composition Strategy, Type Scale, Grid System, Layout Rules, Responsive Rules, Override Rules

---

## QA Checklist

### Composition
- [ ] One clear focal point
- [ ] Hierarchy readable in 3 seconds at thumbnail size
- [ ] White space intentional
- [ ] Logo not competing with headline

### Type
- [ ] Scale ratio matches personality
- [ ] Line-height and tracking per role rules
- [ ] All sizes within min/max clamps per format
- [ ] Long text has shrink/truncate/wrap fallback

### Grid
- [ ] Elements anchor to columns, rows, or margins
- [ ] Gutters clean; no text straddling
- [ ] Baseline rhythm in vertical stacks
- [ ] Safe areas respected on all formats

### Responsive
- [ ] All target aspect ratios have layout rules or overrides
- [ ] 9:16 text in readable center / safe zones
- [ ] Reflow rules defined for vertical formats
- [ ] Optional slots hidden when space is tight

### Overrides
- [ ] Brand defaults documented
- [ ] Block-level deviations justified
- [ ] Advanced overrides scoped to specific formats
- [ ] `breakGrid` used sparingly and intentionally

---

## Output Format

Always deliver this structure:

```markdown
## Composition Strategy
- Personality: Product / SaaS
- Intent: hero
- Focal element: headline
- Energy: stable
- Anchor: left column edge, baseline row 3

## Type Scale
| Token | px @1080 | rem | LH | Tracking | Role |
|-------|----------|-----|----|---------| -----|
| ...   | ...      | ... | ...| ...     | ...  |
Base: 30px body @1080 | Ratio: 1.25

## Grid System
Canvas: 1920×1080 | Columns: 12 | Gutters: 24px
Margins: standard (8%×7%) | Baseline: 8px
Safe area: hard 5%, readable center 60%

## Layout Rules
- Headline: split-left, cols 1–5, zone upper-third
- Media: split-right, cols 6–12, full-bleed contained
- Logo: top-left, cols 1–2
- CTA: bottom-center, cols 5–8

## Responsive Rules
| Format | Zone | Text scale | Media | Notes |
|--------|------|------------|-------|-------|
| 16:9   | split-left | 1.0 | split | default |
| 9:16   | center-safe | 1.08 | contained | reflow column |
| 1:1    | top-center | 0.9 | background | shorter lines |
| 4:5    | top-center | 0.96 | top hero | vertical stack |

## Override Rules
- Brand: gridStrength balanced, allowGridBreaks false
- Block: layoutIntent hero, autoShrinkText true
- Format (9:16): contentZone center-safe, maxTextWidth 0.88
- Advanced: breakGrid false (hidden unless opened)
```

### Figma handoff addendum

Include for each frame:
- Frame size and aspect ratio label
- Layout grid settings (columns, margin, gutter, baseline)
- Type styles with px, line-height, letter-spacing, and font
- Component zones named matching Scatter slots
- Safe area overlays (hard, soft, vertical danger)
- Notes on responsive differences per format variant

### Code handoff addendum

Include:
- CSS custom properties or Tailwind theme extension
- Scatter `BrandComposition` + `BrandTypography` JSON
- `MotionBlockLibraryEntry` with `layoutRules`, `responsiveRules`, `safeAreas`
- `layoutOverrides` per format ID

---

## Scatter Block Library Template

Use when creating a new motion block entry:

```typescript
{
  id: "block-hero-split",
  family: "typography",
  supportedFormats: ["16:9", "9:16", "1:1", "4:5"],
  slots: [
    { id: "headline", type: "text", role: "headline", required: true, maxLength: 60 },
    { id: "subhead", type: "text", role: "subhead", required: false, maxLength: 120 },
    { id: "media", type: "media", role: "media-primary", required: true },
    { id: "logo", type: "logo", role: "logo", required: false },
  ],
  layoutRules: {
    "16:9": {
      slots: [/* slotId, zone, anchor, width, height */],
      mediaTreatment: "split",
      stackDirection: "row",
      gap: 0.04,
    },
    "9:16": {
      mediaTreatment: "contained",
      stackDirection: "column",
      gap: 0.05,
    },
  },
  safeAreas: {
    hardSafe: true,
    softSafe: true,
    respectVerticalDanger: true,
    readableCenter: true,
  },
  responsiveRules: {
    autoShrinkText: true,
    reflowOnVertical: true,
    hideOptionalOnTight: true,
    maxElements: 4,
  },
  advancedOverrides: {
    breakGrid: false,
  },
}
```

---

## Quick Start

1. Infer or ask for personality + aspect ratios + content type
2. Look up personality mapping table
3. Generate type scale (base + ratio → tokens)
4. Generate grid spec (columns + margins + zones)
5. Map slots to zones and typography roles
6. Write responsive overrides for each format
7. Run QA checklist
8. Output full spec in standard format
