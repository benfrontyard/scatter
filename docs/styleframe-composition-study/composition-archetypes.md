# Composition Archetypes

Reusable composition patterns extracted from 62 product marketing styleframes. Each archetype describes **layout logic**, not brand-specific UI. Use with Swiss grid + type scale skills for implementation.

---

## Archetype index

| ID | Name | Frames (examples) | Story beats |
|----|------|-------------------|-------------|
| `editorial-statement` | Editorial Statement | framer/0001–0002, 0005–0006, 0016 | hook, transition, payoff |
| `brand-payoff` | Brand Payoff | framer/0019–0020, grammarly/0016–0017, build-a-website/0018 | payoff, CTA |
| `hero-split-text-media` | Hero Split — Text Rail + Media | grammarly/0008–0011, build-a-website/0016 | introduce, explain |
| `centered-ui-feature` | Centered UI Feature Card | build-a-website/0009, framer/0011–0012 | explain feature |
| `hero-prompt-bar` | Hero Prompt / Input Bar | build-a-website/0002–0004 | hook, introduce |
| `big-stat-proof` | Big Stat / Value Proof | framer/0006 | show proof, payoff |
| `card-collage-dof` | Card Collage with Depth | grammarly/0005, 0014, build-a-website/0015, framer/0015 | introduce, show proof |
| `template-carousel` | Focused Carousel | framer/0003, build-a-website/0006 | introduce, compare |
| `editorial-display-hero` | Editorial Display Hero | build-a-website/0005, 0013, 0014, framer/0007–0008 | hook, introduce |
| `floating-media-window` | Floating Media Window | framer/0004 | introduce, transition |
| `builder-walkthrough` | Builder / App Walkthrough | build-a-website/0008, framer/0009–0010 | explain feature |
| `hero-product-rail` | Hero Product + Side Rail | build-a-website/0007 | introduce product |
| `dashboard-proof` | Dashboard / KPI Proof | framer/0013–0014 | show proof |
| `social-proof-wall` | Social Proof Wall | framer/0015 | show proof, payoff |
| `split-screen-list` | Split Screen + List Panel | build-a-website/0016 | explain, show proof |
| `card-fan-stack` | 3D Card Fan Stack | build-a-website/0017 | introduce ecosystem |
| `site-collage-wall` | Site Collage Wall | build-a-website/0012 | introduce ecosystem |
| `glass-document-panel` | Glass Document Panel | grammarly/0002–0007 | introduce, explain |
| `in-doc-highlight` | In-Document Highlight | grammarly/0012–0013 | show proof, explain |
| `lifestyle-annotation` | Lifestyle + Annotation | build-a-website/0010 | payoff, explain |
| `collage-editorial-hero` | Collage Editorial Hero | build-a-website/0011 | introduce, editorial |
| `mobile-ui-stack` | Mobile UI Stack | flipp/0002 | explain, payoff |
| `chart-stat-overlay` | Chart + Stat Overlay | flipp/0005 | show proof |
| `icon-ecosystem-grid` | Icon Ecosystem Grid | flipp/0004 | introduce ecosystem |
| `portal-search` | Portal + Search | flipp/0001 | hook |
| `success-state` | Success / Confirmation | flipp/0003 | payoff |
| `loading-transition` | Loading Transition | flipp/0006 | transition |
| `abstract-transition` | Abstract Transition | grammarly/0015, flipp/0007 | transition |
| `step-rail-sequence` | Step Rail Sequence | framer/0005, 0011–0012 | transition, explain |

---

## Archetype definitions

### 1. Editorial Statement

**What it is:** One or two lines of type centered on a void (usually dark). Optional accent on one word or number.

**Grid:** 12-col, text centered cols 3–10, vertical center or upper-center.  
**Margins:** Generous (10–15%).  
**Type roles:** `display` or `heading` for main line; `body` for secondary if needed.  
**Value:** Maximum contrast — type owns the frame.  
**Motion:** Text resolves first; accent word glows or scales second. Hold 2–3s.  
**Don't:** Add UI chrome; split the headline across too many lines.

**Reference frames:** framer/0001, 0002, 0005, 0006, 0016

---

### 2. Brand Payoff

**What it is:** Centered logo or URL with optional CTA line. Final or opening brand beat.

**Grid:** Center anchor; logo cols 5–8; CTA bottom-center cols 4–9.  
**Margins:** Generous to extreme.  
**Type roles:** `label` for URL; `subheading` for CTA.  
**Motion:** Logo scale 0.95→1 or draw-on; CTA fades up after 0.5s delay.  
**Don't:** Compete with secondary UI; use tight margins.

**Reference frames:** framer/0018–0020, grammarly/0017, build-a-website/0018

---

### 3. Hero Split — Text Rail + Media

**What it is:** Text block left (4–5 cols), UI panel or photo right (7–8 cols). Primary SaaS intro pattern.

**Grid:** 12-col 5/7 or 4/8 split at column boundary.  
**Margins:** Standard (8%).  
**Type roles:** `heading` + `body` left; UI uses `body`/`label` internally.  
**Motion:** Headline first, media slides from right; cursor/interaction last.  
**Don't:** Center the headline when split is the intent; straddle gutter with text.

**Reference frames:** grammarly/0008–0011, build-a-website/0016

---

### 4. Centered UI Feature Card

**What it is:** Single UI card floating in negative space — one task, one focal point.

**Grid:** Card spans cols 4–9, rows 2–7; optional top step rail.  
**Margins:** Generous outer; medium internal card padding.  
**Type roles:** `heading` in card; `caption` for hints.  
**Motion:** Card pop (scale 0.92→1); type-on for input; CTA pulse once.  
**Don't:** Fill frame with secondary panels; use busy backgrounds without blur.

**Reference frames:** build-a-website/0009, framer/0011–0012

---

### 5. Hero Prompt / Input Bar

**What it is:** Pill-shaped input bar over lifestyle photo or soft gradient. Signals AI / search / creation.

**Grid:** Bar centered cols 3–10, vertical center or lower-third.  
**Margins:** Generous; bar max-width ~70% safe area.  
**Type roles:** `body` inside bar; `subheading` above as prompt.  
**Motion:** Background slow parallax; bar scales in; type-on inside bar.  
**Don't:** Make bar full-width; hide the background entirely.

**Reference frames:** build-a-website/0002–0004

---

### 6. Big Stat / Value Proof

**What it is:** Centered statement with emphasized numeral or percentage on void.

**Grid:** Center; stat visually largest element.  
**Type roles:** `stat` for number; `heading` for surrounding copy.  
**Motion:** Count-up on stat; supporting text fade.  
**Don't:** Add charts here — keep single-message clarity.

**Reference frames:** framer/0006

---

### 7. Card Collage with Depth (DOF)

**What it is:** 3–6 cards at varied Z-depth; one sharp hero, others blurred or dimmed.

**Grid:** Loose modular — hero near center; satellites in peripheral modules.  
**Margins:** Generous frame; tight internal card gutters.  
**Motion:** Hero snaps to focus last; satellites drift with parallax.  
**Don't:** Make all cards equally sharp; overcrowd without depth cue.

**Reference frames:** grammarly/0005, 0014, build-a-website/0015, framer/0015

---

### 8. Focused Carousel

**What it is:** Horizontal cards; center item bright, flanks dimmed ~60% value.

**Grid:** Center card cols 4–9; flanks partially cropped.  
**Motion:** Horizontal slide; center promotes on snap.  
**Don't:** Show all cards at equal weight.

**Reference frames:** framer/0003, build-a-website/0006

---

### 9. Editorial Display Hero

**What it is:** Oversized display type spanning grid; photography breaks through or under type.

**Grid:** 12-col; type spans 2–11; images in assigned modules.  
**Margins:** Tight horizontal acceptable if vertical rhythm strong.  
**Type roles:** `display` at +4/+5 steps; `label` for meta.  
**Motion:** Type mask reveal; image rises into type break.  
**Don't:** Shrink display to fit — allow `autoShrinkText` only at small formats.

**Reference frames:** build-a-website/0005, 0013, 0014, framer/0007–0008

---

### 10. Dashboard / KPI Proof

**What it is:** Dark UI panel with KPI row + optional table. Credibility beat.

**Grid:** Sidebar ~2–3 cols; main 9–10 cols; KPI row equal columns.  
**Type roles:** `stat` for KPIs; `label` for headers; `caption` for table.  
**Motion:** Panel slide-in; KPI count-up; table rows stagger.  
**Don't:** Show empty tables; use fake data that looks realistic.

**Reference frames:** framer/0013–0014

---

### 11. Social Proof Wall

**What it is:** Many small cards (tweets, receipts, charts) in perspective cloud on void.

**Grid:** Hierarchical / perspective — not strict column snap.  
**Motion:** Cards fly in from Z; slow orbit; push into one card to exit.  
**Don't:** Make cards illegible at hero size — limit to 5–7 sharp cards.

**Reference frames:** framer/0015

---

### 12. Glass Document Panel

**What it is:** Large rounded doc window on gradient; optional avatar overlap; right icon rail.

**Grid:** Doc cols 2–11; rail col 12; avatar overlaps col 2.  
**Type roles:** `heading` doc title; `body` greeked lines; rail icons only.  
**Motion:** Window scale-in; headline first; text bars stagger; avatar slide.  
**Don't:** Fill doc with real long copy — use greeked lines for motion.

**Reference frames:** grammarly/0002–0007

---

## Archetype → story beat matrix

| Archetype | Hook | Introduce | Explain | Proof | Compare | Transition | Payoff |
|-----------|------|-----------|---------|-------|---------|------------|--------|
| editorial-statement | ● | ○ | ○ | ○ | ○ | ● | ● |
| brand-payoff | ○ | ○ | ○ | ○ | ○ | ○ | ● |
| hero-split-text-media | ○ | ● | ● | ○ | ○ | ○ | ○ |
| centered-ui-feature | ○ | ○ | ● | ○ | ○ | ○ | ○ |
| hero-prompt-bar | ● | ● | ○ | ○ | ○ | ○ | ○ |
| big-stat-proof | ○ | ○ | ○ | ● | ○ | ○ | ● |
| card-collage-dof | ○ | ● | ● | ● | ○ | ○ | ○ |
| template-carousel | ○ | ● | ○ | ○ | ● | ○ | ○ |
| editorial-display-hero | ● | ● | ○ | ○ | ○ | ○ | ○ |
| dashboard-proof | ○ | ○ | ○ | ● | ○ | ○ | ○ |
| social-proof-wall | ○ | ○ | ○ | ● | ○ | ○ | ● |
| glass-document-panel | ○ | ● | ● | ○ | ○ | ○ | ○ |
| in-doc-highlight | ○ | ○ | ● | ● | ○ | ○ | ○ |
| abstract-transition | ○ | ○ | ○ | ○ | ○ | ● | ○ |

● = primary fit · ○ = usable with adaptation

---

## Grouping for Scatter block families

| Family | Archetypes |
|--------|------------|
| **Typography** | editorial-statement, brand-payoff, big-stat-proof, editorial-display-hero |
| **Product** | hero-split-text-media, centered-ui-feature, hero-prompt-bar, glass-document-panel, builder-walkthrough |
| **Media** | floating-media-window, lifestyle-annotation, hero-product-rail, collage-editorial-hero |
| **Proof** | dashboard-proof, social-proof-wall, chart-stat-overlay, in-doc-highlight |
| **System** | template-carousel, card-collage-dof, card-fan-stack, site-collage-wall, icon-ecosystem-grid |
| **Utility** | step-rail-sequence, loading-transition, abstract-transition, success-state |

---

## Swiss grid behavior summary

| Archetype | Columns @ 16:9 | Rows | Margin preset | Grid strength |
|-----------|----------------|------|---------------|---------------|
| editorial-statement | 12 | 8 | generous | strict |
| hero-split-text-media | 12 | 8 | standard | balanced |
| centered-ui-feature | 12 | 8 | generous | balanced |
| editorial-display-hero | 12 | 8 | tight–standard | loose (breaks OK) |
| card-collage-dof | 12 | 8 | generous | loose |
| dashboard-proof | 12 | 8 | standard | strict |
| glass-document-panel | 12 | 8 | standard | balanced |
| mobile-ui-stack (1:1) | 6 | 8 | generous | balanced |

---

## Responsive reflow rules (inferred)

| Archetype | 9:16 | 1:1 | 4:5 |
|-----------|------|-----|-----|
| hero-split-text-media | column stack; text top | text top, media below | vertical stack |
| centered-ui-feature | `center-safe`; card 90% width | centered; reduce card height | same |
| editorial-display-hero | type `center-safe`; break one line | type top-center; shrink display | type top, media below |
| template-carousel | single card + swipe hint | one card centered | vertical card |
| card-collage-dof | 2 cards max sharp | single hero + 2 blur | reduce to 3 cards |
| dashboard-proof | hide table; KPIs 2×2 | KPIs only | KPI stack |
