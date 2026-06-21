# Grayscale & Value Hierarchy Notes

Value-first reading guide for the styleframe composition study. Color is intentionally stripped from analysis — we care about **contrast relationships**, **layer separation**, and **where the eye lands in 3 seconds at thumbnail size**.

## Analysis assets

| Asset | Location | Purpose |
|-------|----------|---------|
| Grayscale thumbnails | `grayscale-thumbnails/{series}/` | Per-frame value study @ 320px |
| Contact sheets | `contact-sheet-{series}.jpg` | Series rhythm at a glance |

Original screenshots in `~/Desktop/video-screenshots/` are **not modified**.

## How to read contact sheets

1. Squint or view at 25% zoom — only high-contrast shapes should remain.
2. Ask: **What is brightest? What is largest? What is centered?**
3. If two elements fight for brightness, hierarchy is weak — fix before building the block.
4. Count distinct value bands: ideal product marketing frames use **3–4 bands** (background, mid, primary, accent).

## Value band taxonomy

| Band | Typical role | Grayscale range | Scatter token |
|------|--------------|-----------------|---------------|
| **Background void** | Stage, breathing room | 0–15% | `--value-bg-void` |
| **Background field** | Soft gradient, texture | 15–40% | `--value-bg-field` |
| **Mid UI / media** | Cards, photos, panels | 40–70% | `--value-mid` |
| **Primary content** | Headlines, hero UI, stats | 70–95% | `--value-primary` |
| **Accent punch** | CTA, cursor, highlight, logo | 95–100% | `--value-accent` |

In polished frames, **one element owns the accent band**. Secondary elements stay mid or primary.

## Cross-series value patterns

### Pattern A: Void + single accent (Framer editorial beats)

- Background: 0% (pure black)
- Primary text: 100%
- Optional highlight word: accent via glow (reads as mid-high in grayscale with soft edge)
- **Use for:** hook, transition, stat, CTA
- **Risk:** Flat if type scale too small relative to void

### Pattern B: Light field + dark type (Build editorial cards)

- Background: 85–95% (off-white)
- Display type: 5–10%
- Image insets: 40–60%
- **Use for:** editorial hero, collection drop, title cards
- **Risk:** Images and type compete if image contrast matches text

### Pattern C: Gradient field + white UI card (Grammarly workspace)

- Background gradient: 30–55%
- UI card: 95–100%
- Text on card: 5–15%
- Sidebar icons: accent (reads dark in grayscale)
- **Use for:** feature explain, document demo
- **Use DOF blur on background cards to preserve 3-band hierarchy**

### Pattern D: Dark void + bright card cluster (Framer proof wall, Build carousel)

- Background: 0–5%
- Card faces: 90–100%
- Card content (charts, avatars): 20–70%
- **Use for:** social proof, template gallery, ecosystem
- **Depth via size + blur, not value alone**

### Pattern E: Full-bleed media + overlay UI (Build prompt bar, lifestyle)

- Photo mid-tones: 40–65%
- UI pill: 95–100%
- Display type behind subjects: 80–90%
- **Use for:** hero prompt, lifestyle + product
- **UI must win value contrast or legibility fails**

### Pattern F: Mobile glow stack (Flipp 1:1)

- Background texture: 5–20%
- Glowing UI elements: 60–90% with soft falloff
- Accent button/check: 85–100%
- **Use for:** mobile payoff, success state, chart overlay
- **Glow reads as mid-value blob at thumbnail — keep one sharp anchor**

## Series-specific value notes

### build-a-website (16:9)

| Observation | Frames |
|-------------|--------|
| Strongest void-to-accent jumps | 0001, 0002, 0018 |
| Type sandwich (text behind + in front of photo) | 0013 |
| Card-on-black value isolation | 0006, 0012, 0017 |
| Blurred frame-within-frame depth | 0009 |

**Rhythm:** Opens light/soft → builds to dense collage → resolves to brand void.

### framer (16:9)

| Observation | Frames |
|-------------|--------|
| Consistent black-stage editorial | 0001–0002, 0005–0006, 0016–0018 |
| Carousel: center bright, flanks ~20% value | 0003 |
| Portfolio: display type highest, images low-key | 0007–0008 |
| Dashboard: white KPI on dark panel | 0013–0014 |
| Proof wall: card cloud on void | 0015 |

**Rhythm:** Statement → proof → UI depth → CTA → logo.

### grammarly (16:9)

| Observation | Frames |
|-------------|--------|
| Empty canvas = 95% white field | 0002 |
| Glass card + gradient = clear 3-layer | 0003–0007 |
| Feature rail right = vertical accent column | 0008–0011 |
| In-doc highlight = single dark line on faded body | 0012–0013 |
| DOF hero doc + blurred satellites | 0014 |
| Abstract transition (low contrast overall) | 0015 |

**Rhythm:** Calm workspace → feature depth → proof highlight → brand lift.

### flipp (1:1)

| Observation | Frames |
|-------------|--------|
| Center glow portal = highest value | 0001 |
| Vertical UI stack on dark texture | 0002 |
| Success pill on ring glow | 0003 |
| Icon grid = repeating mid-value modules | 0004 |
| Chart + stat card overlay | 0005 |
| Loading bar = single bright horizontal | 0006 |
| Pure void transition | 0007 |

**Rhythm:** Search → action → success → data proof. Very compressed story arc.

## Hierarchy QA checklist (grayscale)

- [ ] One clear brightest or darkest anchor per frame
- [ ] Headline readable at 320px width
- [ ] Background never competes with primary slot
- [ ] DOF/blur used to demote secondary cards
- [ ] Negative space reads intentional, not empty
- [ ] Grid alignment visible even without color (edges line up)

## Responsive value behavior

| Format | Value adjustment |
|--------|------------------|
| **16:9** | Reference — split layouts use left/right value contrast |
| **9:16** | Raise text value (lighter on dark or darker on light); reduce simultaneous bright zones |
| **1:1** | Center-weight; single column; avoid horizontal split value fights |
| **4:5** | Stack: headline top (high contrast), media mid, CTA bottom |

When reflowing split layouts to vertical, **do not stack two equal-value bright zones** — stagger entrance or dim one zone.

## Contact sheet filenames

- `contact-sheet-build-a-website.jpg` — 18 frames
- `contact-sheet-framer.jpg` — 20 frames
- `contact-sheet-grammarly.jpg` — 17 frames
- `contact-sheet-flipp.jpg` — 7 frames
