---
name: swiss-grid-system
description: >-
  Apply Josef Müller-Brockmann Swiss grid layout logic for columns, margins,
  gutters, safe areas, and baseline rhythm. Use when designing grids, layouts,
  posters, motion frames, Figma layout specs, or Scatter composition zones.
---

# Swiss Grid System

## Purpose

Apply Josef Müller-Brockmann / International Typographic Style grid logic to organize text, images, UI, color fields, and motion elements on any canvas. The grid is an **invisible structure** that creates rhythm, alignment, and confidence — not a cage.

## When to Use This Skill

- Laying out posters, motion frames, social graphics, or app screens
- Defining column counts, margins, gutters, and safe areas for Scatter blocks
- Writing Figma layout grids or CSS Grid specs
- Deciding where headlines, media, logos, and captions belong
- Planning intentional grid breaks for expressive compositions
- Handoff specs for developers or motion designers

---

## Core Principle

> The grid is an invisible system for organizing text, image, captions, color fields, UI, and motion elements.

Every element should **snap to, span, or consciously break** the grid. Random placement reads as amateur; grid-aware placement reads as designed.

---

## Grid Anatomy

| Term | Definition |
|------|------------|
| **Canvas** | Full artboard/frame (e.g. 1920×1080, 1080×1920) |
| **Safe area** | Region where critical content stays visible (platform UI, crop, bleed) |
| **Margins** | Outer inset from canvas edge to content; sets personality |
| **Columns** | Vertical divisions; content spans 1–n columns |
| **Gutters** | Space between columns; never place text across a gutter |
| **Rows** | Horizontal divisions (modular/hierarchical grids) |
| **Modules** | Column × row unit; building block of modular grids |
| **Baseline grid** | Horizontal rhythm line for type alignment (typically 4–8px) |
| **Type area** | Zone reserved for text hierarchy |
| **Image area** | Zone for photography, video, illustration |
| **Caption area** | Subordinate text tied to image edge or baseline |
| **Breakout zones** | Areas where elements may bleed or ignore grid for emphasis |

```
┌────────────────────────────────────────── Canvas
│ ░░░░░░░░░░░ Margin ░░░░░░░░░░░░░░░░░░░░ │
│ ░ ┌────┬────┬────┬────┬────┬────┐ ░░░░░ │
│ ░ │    │    │    │    │    │    │ ░░░░░ │  ← Columns
│ ░ ├────┴────┼────┴────┼────┴────┤ ░░░░░ │     Gutters (│)
│ ░ │  Type   │  Image  │ Caption │ ░░░░░ │  ← Modules
│ ░ │  area   │  area   │  area   │ ░░░░░ │
│ ░ └─────────┴─────────┴─────────┘ ░░░░░ │
│ ░░░░░░░░░░░ Safe area ░░░░░░░░░░░░░░░░░ │
└──────────────────────────────────────────
      ← Baseline grid (horizontal) →
```

---

## Grid Types

| Type | Structure | Best for |
|------|-----------|----------|
| **Manuscript** | Single column, margins only | Long-form text, quotes, statements |
| **Column grid** | Vertical columns only | Web, product UI, simple motion blocks |
| **Modular grid** | Columns + rows (modules) | Posters, editorial, complex layouts |
| **Hierarchical grid** | Irregular zones derived from a base grid | Split compositions, collage, expressive |

### Choosing a grid type

```
Text-heavy, single focus     → Manuscript or 4–6 column
Product / SaaS / UI          → 12-column
Poster / motion hero         → 6, 8, or 12-column modular
Social square                → 6 or 12-column
Vertical video (9:16)        → 4 or 6-column + strong safe zones
Landscape video (16:9)       → 12-column with split options
```

---

## Recommended Starting Points

### Mobile (app UI)
- **Columns:** 4
- **Margins:** 16–24px (or 4–6% of width)
- **Gutter:** 8–16px
- **Baseline:** 4px

### Web / product
- **Columns:** 12
- **Margins:** 24–64px (fluid)
- **Gutter:** 16–32px
- **Baseline:** 8px

### Posters / motion graphics
- **Columns:** 6, 8, 12, or 16
- **Margins:** 5–12% of short edge
- **Gutter:** 1–2% of width
- **Baseline:** 8px at 1080p reference

### Square social (1:1)
- **Columns:** 6 or 12
- **Margins:** 6–10%
- **Gutter:** 2–3%
- **Safe area:** Platform overlay aware

### 9:16 vertical video
- **Columns:** 4 or 6
- **Margins:** 7–10% horizontal; 8–12% vertical
- **Safe zones:** Top 15% and bottom 20% often reserved (platform UI)
- **Readable center:** ~60% center zone for critical text

### 16:9 landscape video
- **Columns:** 12
- **Margins:** 5–8%
- **Split options:** 5/7, 6/6, 4/8 column splits
- **Lower-third zone:** Bottom 34% for titles

### Scatter format reference (1080p base)

| Format | Size | Columns | Margin preset |
|--------|------|---------|---------------|
| 16:9 | 1920×1080 | 12 | standard (8% × 7%) |
| 9:16 | 1080×1920 | 4–6 | standard + vertical danger |
| 1:1 | 1080×1080 | 6 | standard |
| 4:5 | 1080×1350 | 6 | standard |

Scatter safe area presets map to margin personality:

| Preset | Inset (x × y) | Personality |
|--------|---------------|-------------|
| `tight` | 5% × 5% | Loud, poster, streetwear |
| `standard` | 8% × 7% | Product, balanced |
| `generous` | 10% × 9% | Premium, editorial, luxury |

---

## Margin Personality

| Style | Margin % | Feel | Use when |
|-------|----------|------|----------|
| **Tight** | 3–6% | Loud, urgent, streetwear, poster | High energy, full-bleed media, music |
| **Medium** | 6–10% | Balanced, product, flexible | SaaS, app, general marketing |
| **Large** | 10–15% | Premium, luxury, editorial | Wellness, fashion, cultural |

Tight margins ≠ no margins. Always retain a minimum safe inset.

---

## Baseline Grid Rules

1. Set baseline unit: **4px** (mobile), **8px** (web/motion at 1080p)
2. All line-heights and vertical spacing should be multiples of baseline
3. Snap headline baselines to grid rows when using modular grids
4. Caption baselines align to image bottom edge or module boundary
5. Stack gaps between text blocks: 1–3 baseline units

```
Baseline = 8px
Body 16px / 1.5 LH = 24px line box → 3 baseline units ✓
Heading 32px / 1.15 LH = 36.8px → round to 40px (5 units) ✓
Gap between blocks = 16px (2 units) ✓
```

---

## Image Placement Rules

| Rule | Detail |
|------|--------|
| **Edge alignment** | Image edges align to column edges or margins, not gutters |
| **Span** | Hero images span 4–12 columns; thumbnails 2–4 |
| **Bleed** | Full-bleed images ignore margins but respect export bleed |
| **Caption tie** | Caption sits on baseline below image or in adjacent column |
| **Split** | 50/50 or 5/7 splits use column boundaries, not center of gutter |
| **Focus** | Subject focus point stays in readable center zone (9:16) |
| **Treatment** | `full-bleed`, `contained`, `split`, `collage`, `background` |

### Media treatment → grid behavior

| Treatment | Grid behavior |
|-----------|---------------|
| `full-bleed` | Ignores margins; text overlays use safe area |
| `contained` | Spans defined columns within safe area |
| `split` | Left/right or top/bottom at column boundary |
| `collage` | Multiple modules; may break strict alignment |
| `background` | Behind type area; type stays in grid |

---

## Rules for Intentionally Breaking the Grid

Breaking the grid only works when the grid is **already understood**:

1. **One breakout element per composition** — oversized type, bleeding image, rotated label
2. **Break from a clear anchor** — element starts on-grid, extends past margin
3. **Maintain one alignment axis** — break horizontally but keep left edge aligned
4. **Use for hierarchy** — breakout = most important element
5. **Set `allowGridBreaks: true`** at brand level; use `breakGrid: true` at block level in Scatter

Expressive styles (streetwear, music, grunge) may break more often but still need one strong anchor.

---

## Layout Zones (Scatter mapping)

Pre-defined zones as fractions of safe area:

| Zone | Use |
|------|-----|
| `center` | Balanced hero, statements |
| `top-left` / `top-center` | Headlines, logos |
| `bottom-left` / `bottom-center` | CTAs, lower-thirds |
| `split-left` / `split-right` | Side-by-side text + media |
| `upper-third` / `lower-third` | Video-safe title placement |
| `center-safe` | Critical text in readable center (9:16) |

---

## Output Format

When generating a grid spec, output:

```
## Grid System Spec

Canvas:        1920 × 1080 (16:9)
Columns:       12
Rows:          8 (modular)
Margins:       154px L/R (8%), 76px T/B (7%) — standard preset
Gutters:       24px (1.25%)
Baseline:      8px
Safe area:     hard 5%, soft 8%, readable center 60%

Layout rules:
- Headline spans columns 2–7, top row 2
- Media spans columns 7–12, rows 1–6
- Logo: top-left, columns 1–2
- Caption: column 7, baseline row 7

Responsive behavior:
- 9:16: reflow to single column; headline center-safe
- 1:1: media contained, headline top-center
- 4:5: split-left text, right media

Grid strength: balanced (0.85 snap factor)
Allow breaks: false
```

### Token output

```css
:root {
  --grid-columns: 12;
  --grid-gutter: 24px;
  --grid-margin-x: 8%;
  --grid-margin-y: 7%;
  --grid-baseline: 8px;
  --grid-module-width: calc((100% - 11 * var(--grid-gutter)) / 12);
}
```

```json
{
  "canvas": { "width": 1920, "height": 1080, "aspectRatio": "16:9" },
  "columns": 12,
  "rows": 8,
  "margins": { "top": 76, "right": 154, "bottom": 76, "left": 154 },
  "gutters": 24,
  "baseline": 8,
  "safeArea": { "preset": "standard", "hard": 0.05, "soft": 0.08 },
  "layoutRules": ["headline: cols 2-7", "media: cols 7-12"],
  "responsiveBehavior": { "9:16": "single-column reflow" }
}
```

---

## Quality Checklist

### Structure
- [ ] Column count appropriate for aspect ratio
- [ ] Margins consistent on all sides (or intentionally asymmetric with reason)
- [ ] Gutters uniform; no text straddling gutters
- [ ] Baseline rhythm maintained in vertical stacks

### Content placement
- [ ] Every element anchors to column, row, margin, or optical point
- [ ] Image edges align to grid lines
- [ ] Logo has clear zone; not competing with headline
- [ ] Caption visually tied to its image

### Safe areas
- [ ] Critical text inside hard safe area
- [ ] 9:16 respects top/bottom platform danger zones
- [ ] Full-bleed media has text overlay in soft safe / readable center

### Hierarchy
- [ ] Primary element spans most grid real estate
- [ ] Secondary elements subordinate in size and position
- [ ] White space is intentional, not leftover

### Breaks
- [ ] If breaking grid: one focal break, one anchor axis maintained
- [ ] Break serves hierarchy, not decoration

---

## Quick Reference: Build a Grid

1. Identify canvas size and aspect ratio
2. Choose column count from starting points table
3. Set margin personality (tight / medium / large)
4. Calculate gutters (1–2% width or 16–32px)
5. Set baseline unit (4 or 8px)
6. Assign type, image, caption, logo zones
7. Define responsive reflow per aspect ratio
8. Output spec + tokens
9. Run quality checklist
