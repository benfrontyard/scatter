# Scatter Motion Blocks — Implementation Plan

Turns the [styleframe composition study](./README.md) into a build-ready spec for Scatter. Maps archetypes to existing types (`MotionBlockLibraryEntry`, `MotionBlockInstance`, `BlockLayoutIntent`, `BlockLayoutOverride`) and defines what users see vs what the system resolves automatically.

**Wave 1 scope:** 8 blocks covering ~80% of product-marketing story beats (hook → intro → feature → proof → payoff).

---

## Build order

| Priority | Block ID | Archetype | `layoutIntent` | Family | Reuses / extends |
|----------|----------|-----------|----------------|--------|------------------|
| 1 | `editorial-statement` | Editorial Statement | `statement` | `typography` | New renderer |
| 2 | `hero-split-text-media` | Hero Split | `product-feature` | `ui-product` | Extends `editorial-split-media` library pattern |
| 3 | `centered-ui-feature` | Centered UI Card | `product-feature` | `ui-product` | New renderer (modal/card) |
| 4 | `hero-prompt-bar` | Hero Prompt Bar | `hero` | `ui-product` | New renderer |
| 5 | `brand-payoff` | Brand Payoff | `outro` | `brand-system` | Extends `cta-lockup` / `logo-reveal` |
| 6 | `card-collage-dof` | Card Collage DOF | `list` | `ui-product` | Extends `staggered-image-collage` |
| 7 | `big-stat-proof` | Big Stat Proof | `stat` | `typography` | Extends `stat-card` |
| 8 | `template-carousel` | Focused Carousel | `list` | `ui-product` | Extends `product-carousel` |

### Suggested sprint breakdown

**Sprint A (foundation):** shared void background, accent-word text renderer, card chrome primitives, DOF blur layer, carousel focus dimming.

**Sprint B (typography beats):** `editorial-statement`, `big-stat-proof`, `brand-payoff`.

**Sprint C (product beats):** `hero-split-text-media`, `centered-ui-feature`, `hero-prompt-bar`.

**Sprint D (system beats):** `template-carousel`, `card-collage-dof` + playground validation scenarios.

---

## Control visibility model

Three tiers. Aligns with the composer skill: **90% automatic** from brand + intent; expose overrides only when needed.

### Tier 1 — User-facing (primary editor panel)

Always visible in `UserBlockControls` / content panel for these blocks:

| Control | Maps to | Notes |
|---------|---------|-------|
| Text slots | `content.*` | Headline, subhead, CTA, stat, URL, etc. |
| Media upload | `content` + assets | Hero image, UI screenshot, background |
| Layout variation | `layoutIntent` preset | Per-block enum (see each block) |
| Motion intensity | `motion.controls.intensity/speed/stagger` | calm · normal · energetic |
| Optional elements | hide slot flags | Subhead, CTA, step rail, etc. |
| Focal point | `layoutOverrides.formats[id].mediaPosition` | When block has full-bleed/bg media |

### Tier 2 — User-facing (Layout section, collapsed by default)

Simple presets — **not** raw grid coordinates:

| Control | Maps to | When shown |
|---------|---------|------------|
| Media side | `mediaPosition`: left · right | Split blocks |
| Text alignment | `alignment` | Editorial, stat (if brand allows mixed) |
| Prompt position | `contentZone`: center · lower-third | `hero-prompt-bar` |
| Carousel focus | `motion.controls.activeIndex` | `template-carousel` |
| Hero card pick | `motion.controls.heroCardIndex` | `card-collage-dof` |
| Accent word | `content.accentWord` + picker | `editorial-statement` |

### Tier 3 — Advanced (hidden until "Customize layout" or validation warning)

| Control | Maps to |
|---------|---------|
| Text scale | `layoutOverrides.formats[id].textScale` |
| Max text width | `maxTextWidth` |
| Content zone | `contentZone` |
| Safe area override | `safeAreaOverride` |
| Break grid | `breakGrid` (requires `brand.allowGridBreaks`) |
| Padding / gap | `padding`, `gap` |
| Per-slot position | `advancedOverrides.slotOverrides` |

### Tier 4 — Internal / brand-only (never in user panel)

Resolved by `resolveBlockLayout()` + library `layoutRules`:

- Slot anchors, width, height, zIndex
- Grid columns, snap factor, baseline
- Motion phase ratios (defaults from library; admin editable in Block Builder)
- DOF blur radius, carousel dim opacity, void color fallback
- Typography role → px mapping from `BrandTypography`
- `autoShrinkText`, `reflowOnVertical`, `hideOptionalOnTight` triggers

---

## Shared schema extensions

Minimal additions to support wave 1 without over-engineering.

### 1. Block content keys (convention)

Keep `BlockContent = Record<string, string>`. Wave-1 keys by convention:

```typescript
// Shared keys across blocks
type SharedContentKeys =
  | "headline" | "subhead" | "body" | "cta" | "url"
  | "accentWord" | "accentWordIndex"   // editorial-statement
  | "statValue" | "statPrefix" | "statSuffix" | "statWrapper"  // big-stat-proof
  | "promptText" | "hintText"          // hero-prompt-bar
  | "backgroundImage" | "media" | "screenshot" | "uiScreenshot"
  | "backgroundColor" | "accentColor"  // style fallbacks
  | "logoText" | "message";

// card-collage-dof: card-1-title, card-1-image, … card-N-* (N ≤ 6)
// template-carousel: item-1-title, item-1-media, item-1-meta, … item-N-*
```

### 2. Block-specific motion controls

Extend `motion.controls` per block (already `Record<string, number | string>`):

```typescript
type Wave1MotionControls = {
  intensity?: "subtle" | "standard" | "hero";
  speed?: "calm" | "standard" | "fast";
  stagger?: number;
  direction?: "up" | "down" | "left" | "right";
  // block-specific
  activeIndex?: number;       // carousel
  heroCardIndex?: number;     // collage DOF
  dimOpacity?: number;        // carousel inactive cards (internal default 0.25)
  blurAmount?: number;        // collage satellites (internal default 12)
  countUpDuration?: number;   // big-stat-proof
  typeOn?: boolean;           // prompt-bar, ui-feature
  glowAccent?: boolean;       // editorial accent word
};
```

### 3. New layout intent (optional, phase 2)

`prompt` intent for hero-prompt-bar — **or** map to existing `hero` with format zone overrides. Recommend **reuse `hero`** in wave 1 to avoid resolver churn.

### 4. Register in config

Each block needs entries in:

- `src/config/blocks/library/blocks.ts` — `MotionBlockLibraryEntry`
- `src/config/blocks/index.ts` — `MotionBlockDefinition` (editor timeline)
- `src/config/blocks/layout-intents.ts` — intent + slot roles
- Renderer in `src/remotion/blocks/` or `LibraryBlockRenderer`

---

## Responsive layout matrix (all 8 blocks)

Global rules applied by `responsiveRules` + `resolveBlockLayout`:

| Format | Text scale | Zone bias | Stack | Hide optional |
|--------|------------|-----------|-------|---------------|
| **16:9** | 1.0 | intent default | row for splits | — |
| **9:16** | 1.08 | `center-safe` / `upper-third` | column | step rail, subhead, flanks |
| **1:1** | 0.9 | `top-center` | column | carousel flanks, extra cards |
| **4:5** | 0.96 | `top-center` | column | same as 1:1 |

All blocks: `hardSafe: true`, `softSafe: true`, `respectVerticalDanger: true` (9:16).

---

## Block 1: `editorial-statement`

**Story beats:** hook · transition · payoff  
**Duration:** 90f (3s @ 30fps)

### Content schema

```typescript
defaultContent: {
  headline: "You can make serious money.",
  subhead: "",                    // optional
  accentWord: "money",            // optional — one word highlighted
  backgroundColor: "",            // falls back to brand bg or void
}
```

### Slots

| Slot ID | Type | Role | Required | maxLength |
|---------|------|------|----------|-----------|
| headline | text | headline | yes | 60 |
| subhead | text | subhead | no | 90 |
| accent | text | body | no | 24 |

### Layout rules

| Format | Zone | Alignment | Notes |
|--------|------|-----------|-------|
| 16:9 | center | center | cols 2–11, rows 3–5 |
| 9:16 | center-safe | center | max 2 lines headline |
| 1:1 | center | center | textScale 0.9 |
| 4:5 | center | center | textScale 0.96 |

```typescript
layoutIntent: "statement"
responsiveRules: { autoShrinkText: true, maxElements: 2 }
stylePreset: { textAlign: "center", emphasis: "hero", contrast: "high" }
motionPreset: { in: "fade", main: "hold", out: "fade-out"; stagger: 8; glowAccent: true }
```

### Controls

| Control | Tier |
|---------|------|
| Headline, subhead | 1 |
| Accent word + word picker | 2 |
| Layout variation: compact / hero | 1 |
| Motion intensity | 1 |
| Text scale, content zone | 3 |
| Void color (fallback) | 4 (brand bg) |
| Glow radius, tracking | 4 |

---

## Block 2: `hero-split-text-media`

**Story beats:** introduce product · explain feature  
**Duration:** 120f

### Content schema

```typescript
defaultContent: {
  headline: "Easy scheduling ahead",
  subhead: "Everything you need to launch faster.",
  body: "",
  media: "",           // asset id — UI screenshot or photo
  cta: "",
}
```

### Slots

| Slot ID | Type | Role | Required | maxLength |
|---------|------|------|----------|-----------|
| headline | text | headline | yes | 56 |
| subhead | text | subhead | no | 120 |
| body | text | body | no | 160 |
| media | media | media-primary | yes | — |
| cta | text | cta | no | 40 |

### Layout rules

| Format | mediaTreatment | stackDirection | Text zone | Media zone |
|--------|----------------|----------------|-----------|------------|
| 16:9 | split | row | split-left cols 1–5 | split-right cols 6–12 |
| 9:16 | contained | column | upper-third | center 84% width |
| 1:1 | contained | column | top-center | below text |
| 4:5 | contained | column | top-center | top hero 40% height |

```typescript
layoutIntent: "product-feature"
responsiveRules: { autoShrinkText: true, reflowOnVertical: true, hideOptionalOnTight: true, maxElements: 4 }
```

### Controls

| Control | Tier |
|---------|------|
| Headline, subhead, body, CTA | 1 |
| Media upload + focal point | 1 |
| Layout variation: text-left · text-right · stacked | 1 |
| Media side (left/right) | 2 |
| Motion intensity | 1 |
| Optional: hide subhead, body, cta | 1 |
| textScale, maxTextWidth, padding | 3 |
| Split ratio 5/7 vs 4/8 | 4 |

---

## Block 3: `centered-ui-feature`

**Story beats:** explain feature  
**Duration:** 120f

### Content schema

```typescript
defaultContent: {
  headline: "Create Image",
  body: "Describe what you want to generate.",
  inputText: "A website for my brand",
  cta: "Create",
  uiScreenshot: "",    // optional — or generic card chrome
  showStepRail: "true",
  stepLabel: "1 Premium Templates",
}
```

### Slots

| Slot ID | Type | Role | Required | maxLength |
|---------|------|------|----------|-----------|
| headline | text | headline | yes | 48 |
| body | text | body | no | 120 |
| input | text | body | no | 80 |
| cta | text | cta | no | 24 |
| ui | media | media-primary | no | — |
| step | text | label | no | 40 |

### Layout rules

| Format | Card span | Background |
|--------|-----------|------------|
| 16:9 | cols 3–10, rows 2–7 | void or heavy blur |
| 9:16 | 92% width, center-safe | same |
| 1:1 | 85% width | same |
| 4:5 | 88% width | same |

```typescript
layoutIntent: "product-feature"
// Override zone to center for all formats via layoutOverrides
responsiveRules: { autoShrinkText: true, hideOptionalOnTight: true, maxElements: 5 }
motionPreset: { card scale 0.92→1; typeOn input; cta pulse }
```

### Controls

| Control | Tier |
|---------|------|
| Headline, body, input text, CTA | 1 |
| UI screenshot upload | 1 |
| Toggle step rail | 1 |
| Step label text | 2 |
| Motion intensity | 1 |
| Card width preset: narrow · standard · wide | 2 |
| Background blur amount | 4 |
| Card radius, shadow | 4 (brand) |

---

## Block 4: `hero-prompt-bar`

**Story beats:** hook · introduce product  
**Duration:** 105f

### Content schema

```typescript
defaultContent: {
  hintText: "First, what are you building?",
  promptText: "I want to create a website for my fashion brand",
  highlightPhrase: "fashion brand",
  backgroundImage: "",
  backgroundColor: "",
}
```

### Slots

| Slot ID | Type | Role | Required | maxLength |
|---------|------|------|----------|-----------|
| hint | text | subhead | no | 60 |
| prompt | text | body | yes | 100 |
| highlight | text | body | no | 40 |
| bg | media | media-primary | no | — |

### Layout rules

| Format | Bar zone | Bar max width | Background |
|--------|----------|---------------|------------|
| 16:9 | center | 70% | full-bleed media or gradient |
| 9:16 | lower-third | 88% | same |
| 1:1 | center | 85% | same |
| 4:5 | center | 86% | same |

```typescript
layoutIntent: "hero"
layoutOverrides.formats["format-9-16"]: { contentZone: "lower-third" }
responsiveRules: { autoShrinkText: true, reflowOnVertical: true }
motionPreset: { bg parallax; bar scale-in; typeOn; highlight color resolve }
```

### Controls

| Control | Tier |
|---------|------|
| Hint, prompt text | 1 |
| Highlight phrase | 2 |
| Background image upload + focal | 1 |
| Bar position: center · lower-third | 2 |
| Motion intensity | 1 |
| Bar width preset | 2 |
| Gradient vs media mode | 2 |
| Parallax strength | 4 |

---

## Block 5: `brand-payoff`

**Story beats:** payoff · CTA  
**Duration:** 90f

### Content schema

```typescript
defaultContent: {
  logoText: "",          // fallback if no logo asset
  cta: "Get started today",
  url: "yourbrand.com",
  message: "",
}
```

Uses brand logo asset when available (`includeLogo: true`).

### Slots

| Slot ID | Type | Role | Required |
|---------|------|------|----------|
| logo | logo | logo | yes* |
| cta | text | cta | no |
| url | text | caption | no |
| message | text | subhead | no |

### Layout rules

| Format | Logo zone | CTA zone |
|--------|-----------|----------|
| 16:9 | center rows 3–5 | bottom-center row 7 |
| 9:16 | center-safe | lower-third (respect bottom danger) |
| 1:1 | center | bottom-center |
| 4:5 | center | bottom-center |

```typescript
layoutIntent: "outro"
responsiveRules: { maxElements: 3 }
motionPreset: { logo scale 0.95→1; cta fade up +15f delay }
```

### Controls

| Control | Tier |
|---------|------|
| CTA, URL | 1 |
| Optional message | 1 |
| Toggle URL visibility | 1 |
| Motion intensity | 1 |
| Logo scale preset: small · medium · large | 2 |
| Logo asset | 1 (brand) |
| Safe area, vertical offset | 3 |

---

## Block 6: `card-collage-dof`

**Story beats:** introduce · explain · show proof  
**Duration:** 150f

### Content schema

```typescript
defaultContent: {
  headline: "",                    // optional overlay
  "card-1-title": "Project Recap",
  "card-1-body": "",
  "card-1-image": "",
  "card-2-title": "Q4 Proposal",
  "card-2-image": "",
  "card-3-title": "Essay Prep",
  "card-3-image": "",
  // … up to card-6-*
  heroCardIndex: "1",
}
```

### Slots

Dynamic: 3–6 card modules (title + optional image each) + optional headline.

### Layout rules

| Format | Sharp cards | Total cards | Hero position |
|--------|-------------|-------------|---------------|
| 16:9 | 1–2 | up to 6 | center |
| 9:16 | 1 | up to 3 | center-safe |
| 1:1 | 1 | up to 4 | center |
| 4:5 | 1 | up to 4 | upper-center |

```typescript
layoutIntent: "list"
mediaTreatment: "collage"
responsiveRules: { hideOptionalOnTight: true, maxElements: 6, reflowOnVertical: true }
motionPreset: { satellites parallax; hero snap focus; blur 12px→0 on hero }
```

### Controls

| Control | Tier |
|---------|------|
| Per-card title + image | 1 |
| Hero card selector | 2 |
| Card count (3 / 4 / 6) | 2 |
| Optional headline | 1 |
| Motion intensity | 1 |
| Background gradient | 4 (brand) |
| Blur amount, spread, Z depth | 4 |

---

## Block 7: `big-stat-proof`

**Story beats:** show proof · payoff  
**Duration:** 90f

### Content schema

```typescript
defaultContent: {
  statValue: "50%",
  statWrapper: "You get {stat} of that revenue for the first year",
  statPrefix: "",
  statSuffix: "",
  stepLabel: "1 Premium Templates",   // optional top rail
  showStepRail: "false",
}
```

`{stat}` placeholder replaced at render. Extends existing `stat-card`.

### Slots

| Slot ID | Type | Role | Required | maxLength |
|---------|------|------|----------|-----------|
| stat | stat | stat-value | yes | 12 |
| wrapper | text | headline | yes | 80 |
| step | text | label | no | 40 |

### Layout rules

| Format | Zone | Alignment |
|--------|------|-----------|
| 16:9 | center | center |
| 9:16 | center-safe | center — stat on own line |
| 1:1 | center | center |
| 4:5 | center | center |

```typescript
layoutIntent: "stat"
responsiveRules: { autoShrinkText: true, maxElements: 2 }
motionPreset: { countUp stat; wrapper fade; easing: soft-reveal }
```

### Controls

| Control | Tier |
|---------|------|
| Stat value, wrapper sentence | 1 |
| Toggle step rail + label | 1 |
| Motion intensity | 1 |
| Count-up on/off | 2 |
| textScale | 3 |
| Count-up duration | 4 |

---

## Block 8: `template-carousel`

**Story beats:** introduce · compare  
**Duration:** 150f

### Content schema

```typescript
defaultContent: {
  categoryLabel: "1 Premium Templates",
  "item-1-title": "In-House",
  "item-1-meta": "$49",
  "item-1-media": "",
  "item-2-title": "",
  "item-2-meta": "",
  "item-2-media": "",
  "item-3-title": "",
  "item-3-meta": "",
  "item-3-media": "",
  activeIndex: "1",
}
```

### Slots

Header label + 3–5 carousel items (title, meta, media each).

### Layout rules

| Format | Center card | Flanks | Header |
|--------|-------------|--------|--------|
| 16:9 | cols 4–9 | partial cols 1–3, 10–12 dimmed | top-left |
| 9:16 | full width 84% | hidden | top-left |
| 1:1 | centered 80% | hidden + swipe hint | top-left |
| 4:5 | centered 82% | one flank peek | top-left |

```typescript
layoutIntent: "list"
responsiveRules: { hideOptionalOnTight: true, maxElements: 5 }
motionPreset: { horizontal slide; dimOpacity 0.25 on inactive; stagger 6 }
```

### Controls

| Control | Tier |
|---------|------|
| Category label | 1 |
| Per-item title, meta, media | 1 |
| Active item (picker or arrows) | 2 |
| Item count (3 / 5) | 2 |
| Motion intensity | 1 |
| Dim opacity | 4 |
| Card aspect ratio | 4 |

---

## `layoutOverrides` defaults per block

Auto-applied per format when user has not customized (`source: "auto"`):

```typescript
const WAVE1_FORMAT_OVERRIDES: Record<string, Partial<Record<string, BlockLayoutOverride>>> = {
  "editorial-statement": {
    "format-9-16": { contentZone: "center-safe", textScale: 1.08 },
    "format-1-1": { textScale: 0.9, maxTextWidth: 0.82 },
  },
  "hero-split-text-media": {
    "format-9-16": { contentZone: "upper-third", stackDirection: "column", mediaPosition: "bottom" },
    "format-16-9": { contentZone: "split-left", stackDirection: "row", mediaPosition: "right" },
  },
  "hero-prompt-bar": {
    "format-9-16": { contentZone: "lower-third", textScale: 1.05 },
  },
  "brand-payoff": {
    "format-9-16": { contentZone: "lower-third" },
  },
  "card-collage-dof": {
    "format-9-16": { textScale: 1.05, maxTextWidth: 0.88 },
  },
  "template-carousel": {
    "format-1-1": { textScale: 0.9 },
  },
};
```

---

## Brand-level mapping

These brand settings drive wave-1 blocks without per-block tuning:

| Brand field | Effect on wave 1 |
|-------------|------------------|
| `composition.safeArea` | All margins — tight for editorial void, standard for splits |
| `composition.style` | `product` → center bias; `editorial` → statement top-left option |
| `composition.gridStrength` | Snap strictness on split edges and card alignment |
| `composition.allowGridBreaks` | Enables display-hero tier-3 `breakGrid` (wave 2) |
| `composition.density` | Line-height + stack gap multipliers |
| `typography.baseSize` + `ratio` | All role sizes via resolver |
| Logo system | `brand-payoff`, optional `hero-split` watermark |

---

## Validation & playground scenarios

Each block must pass `validateMotionBlock` with scenarios:

| Block | Required scenarios |
|-------|-------------------|
| editorial-statement | long-text, short-text, low-contrast |
| hero-split-text-media | long-text, missing-assets, bad-crop |
| centered-ui-feature | long-text, missing-assets |
| hero-prompt-bar | long-text, missing-assets |
| brand-payoff | missing-assets (no logo), wide-logo |
| card-collage-dof | missing-assets (partial cards) |
| big-stat-proof | long-text |
| template-carousel | missing-assets, bad-crop |

Debug layers: `hard-safe`, `soft-safe`, `vertical-danger`, `text-boxes`, `slot-labels`.

---

## Files to create / modify (engineering checklist)

| Action | Path |
|--------|------|
| Add 8 library entries | `src/config/blocks/library/blocks.ts` |
| Add 8 editor definitions | `src/config/blocks/index.ts` |
| Register intents + slot roles | `src/config/blocks/layout-intents.ts` |
| Add format override presets | `src/config/composition/wave1-overrides.ts` (new) |
| Renderers (8) | `src/remotion/blocks/wave1/` (new) |
| Extend UserBlockControls | Per-block tier-1/tier-2 control schemas |
| Playground fixtures | `src/config/blocks/library/scenarios/wave1.ts` (new) |
| Link library → editor | `editorBlockId` on each entry |

---

## Wave 2 (after wave 1 ships)

From the study, build next:

9. `editorial-display-hero` — needs `allowGridBreaks`  
10. `glass-document-panel` — doc + icon rail  
11. `dashboard-proof` — KPI + table  
12. `social-proof-wall` — perspective card cloud  

Requires: native 9:16 reference testing, chart slot type hardening, before/after intent.

---

## Related docs

- [composition-archetypes.json](./composition-archetypes.json) — machine-readable archetypes  
- [scatter-motion-block-specs.md](./scatter-motion-block-specs.md) — design-director specs  
- [screenshot-analysis.md](./screenshot-analysis.md) — per-frame evidence  
