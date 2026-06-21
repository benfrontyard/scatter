# Scatter Motion Block Specs

Implementation-ready specs for the highest-priority motion blocks derived from the styleframe study. Each spec maps to `composition-archetypes.json` by `id`.

---

## 1. Editorial Statement

**Block ID:** `editorial-statement`

| Field | Spec |
|-------|------|
| **Best use** | Opening hook, chapter transition, single-message payoff |
| **Story beat** | hook · transition · payoff |
| **Aspect ratios** | 16:9 (primary), 9:16, 1:1, 4:5 |

**Grid:** 12 columns · 8 rows · baseline 8px · split N/A  
**Margins:** `generous` (10% × 9%) or `tight` void on dark brands  
**Type scale roles:** `display` or `heading` (primary line) · optional `body` (secondary) · accent word at same step with color override

| Zone | Placement |
|------|-----------|
| Primary text | center · cols 2–11 · row 3–5 |
| Secondary text | below primary · same width · row 5–6 |
| UI/image | — |
| Data/graph | — |
| Logo/CTA | optional bottom-center · row 7 |

**Layering:** void background → optional glow mid → type foreground  
**Motion:** text fade+tracking 0→-0.02em · accent word delay +300ms scale pulse · hold stable  
**Responsive:** 9:16 `center-safe` · textScale 1.08 · max 2 lines · 1:1 textScale 0.9  

**Brand controls:** `safeArea`, `typeScale.ratio`, accent color, void color  
**Block overrides:** `textScale`, `contentZone`, accent word index, `breakGrid` on accent only  
**Content inputs:** headline (≤60 chars), optional subline, optional accent word index  
**Do:** one message · max contrast · hold for read time  
**Don't:** add UI · multiple accent words · long paragraphs

---

## 2. Hero Split — Text Rail + Media

**Block ID:** `hero-split-text-media`

| Field | Spec |
|-------|------|
| **Best use** | Product intro, feature explanation with UI demo |
| **Story beat** | introduce product · explain feature |
| **Aspect ratios** | 16:9, 4:5, 1:1, 9:16 |

**Grid:** 12 col · 5/7 or 4/8 split  
**Margins:** `standard` (8% × 7%)  
**Type roles:** `heading` + `subheading` + `body` left · UI internal `body`/`label`

| Zone | Placement |
|------|-----------|
| Primary text | split-left · cols 1–5 · upper-third |
| Secondary text | cols 1–5 · below headline |
| UI/image | split-right · cols 6–12 · contained or split |
| Data/graph | inside UI zone if needed |
| Logo/CTA | bottom-left cols 1–3 or bottom-center |

**Layering:** bg (gradient or photo) → media mid → text + UI foreground  
**Motion:** headline resolve → subhead → media slide from right → interaction last  
**Responsive:** 9:16 column stack text top · `reflowOnVertical: true` · media `contained`  

**Brand controls:** margin preset, split ratio default, `mediaTreatment`  
**Block overrides:** `mediaPosition` (left/right), `headlineSize`, swap zones  
**Content inputs:** headline, subhead, body, media slot, optional CTA  
**Do:** align text to column edge · one media focal  
**Don't:** split 50/50 without hierarchy · text across gutter

---

## 3. Centered UI Feature Card

**Block ID:** `centered-ui-feature`

| Field | Spec |
|-------|------|
| **Best use** | Single-feature demo, modal moment, social compose |
| **Story beat** | explain feature |
| **Aspect ratios** | 16:9, 1:1, 4:5, 9:16 |

**Grid:** 12 col · card cols 3–10 · rows 2–7  
**Margins:** `generous` outer · medium card padding  
**Type roles:** `heading` in card · `body` for inputs · `label` for actions

| Zone | Placement |
|------|-----------|
| Primary text | in-card top |
| Secondary text | in-card body / hints |
| UI/image | center card · `contained` |
| Data/graph | in-card lower section if needed |
| Logo/CTA | in-card footer · optional top step rail |

**Layering:** void/blur bg → optional step rail → card → cursor  
**Motion:** card scale 0.92→1 · type-on · CTA pulse once · step rail fixed  
**Responsive:** 9:16 card 92% width · `center-safe` · hide optional rail  

**Brand controls:** corner radius, shadow depth, void color  
**Block overrides:** card width, step rail visibility, `annotationVisibility`  
**Content inputs:** card title, body/input text, button label, optional step index  
**Do:** one task · blur background · stable rail  
**Don't:** multiple cards competing · sharp busy bg

---

## 4. Hero Prompt Bar

**Block ID:** `hero-prompt-bar`

| Field | Spec |
|-------|------|
| **Best use** | AI/search moment, creation hook, prompt entry |
| **Story beat** | hook · introduce product |
| **Aspect ratios** | 16:9, 9:16, 1:1, 4:5 |

**Grid:** 12 col · bar cols 3–10 · vertical center or lower-third  
**Margins:** `generous`  
**Type roles:** `subheading` above bar · `body` inside bar · highlight word via style slot

| Zone | Placement |
|------|-----------|
| Primary text | inside pill bar |
| Secondary text | above bar center |
| UI/image | bar + submit control |
| Data/graph | — |
| Logo/CTA | end-of-bar action button |

**Layering:** full-bleed media/gradient bg → prompt text → bar foreground  
**Motion:** bg slow parallax · bar scale-in · type-on · highlight word color resolve  
**Responsive:** 9:16 bar lower-third · 1:1 bar 85% width  

**Brand controls:** bar radius, bg treatment (gradient vs media)  
**Block overrides:** bar width, mediaPosition, highlight word indices  
**Content inputs:** prompt string, hint text, bg media, icon slots  
**Do:** keep bar brightest element · max 1 highlight phrase  
**Don't:** full-width bar · static busy bg without depth

---

## 5. Big Stat Proof

**Block ID:** `big-stat-proof`

| Field | Spec |
|-------|------|
| **Best use** | Revenue share, growth number, key metric payoff |
| **Story beat** | show proof · payoff |
| **Aspect ratios** | 16:9, 1:1, 9:16 |

**Grid:** 12 col · center · stat visually dominant  
**Margins:** `generous`  
**Type roles:** `stat` for numeral · `heading` for wrapper copy · `caption` for qualifier

| Zone | Placement |
|------|-----------|
| Primary text | center · stat + surrounding line |
| Secondary text | optional top step rail |
| UI/image | — |
| Data/graph | stat IS the data |
| Logo/CTA | optional bottom |

**Layering:** void → optional step rail → stat foreground  
**Motion:** count-up on stat · wrapper text fade · step rail stable  
**Responsive:** 9:16 stat textScale 1.05 · break stat to own line  

**Brand controls:** void color, stat font (tabular figures)  
**Block overrides:** stat value, prefix/suffix, count-up duration  
**Content inputs:** stat number, unit, supporting sentence, step index  
**Do:** one number owns frame · tabular figures  
**Don't:** add charts · secondary stats same size

---

## 6. Card Collage DOF

**Block ID:** `card-collage-dof`

| Field | Spec |
|-------|------|
| **Best use** | Ecosystem breadth, multi-feature overview, social proof cluster |
| **Story beat** | introduce · explain · show proof |
| **Aspect ratios** | 16:9, 4:5, 1:1 |

**Grid:** 12 col hierarchical · hero ~center · 3–5 satellite modules  
**Margins:** `generous` frame · medium card gutters  
**Type roles:** per-card `heading` + `caption` · hero card +1 text step

| Zone | Placement |
|------|-----------|
| Primary text | hero card headline |
| Secondary text | satellite card titles |
| UI/image | card faces · photos inside |
| Data/graph | optional mini chart in one card |
| Logo/CTA | optional corner badge on hero |

**Layering:** gradient/blur bg → blurred cards → sharp hero → text  
**Motion:** satellites drift parallax · hero snap focus last · blur animates 8px→0  
**Responsive:** 9:16 max 2 sharp cards · 1:1 hero only + 2 blur  

**Brand controls:** blur amount, card radius, bg gradient  
**Block overrides:** card count, hero index, `chartVisibility`  
**Content inputs:** 3–6 card objects (title, image, optional stat)  
**Do:** one sharp hero · depth via blur/size  
**Don't:** all cards equal focus · >6 cards legible

---

## 7. Split Feature Explain

**Block ID:** `split-feature-explain`

Alias of `hero-split-text-media` with **UI panel right, notes left** — optimized for Grammarly-style demos.

| Field | Spec |
|-------|------|
| **Best use** | Side-by-side notes + feature picker |
| **Story beat** | explain feature |
| **Aspect ratios** | 16:9, 4:5, 9:16 |

**Grid:** 12 col · notes cols 1–6 · panel cols 7–11 · rail col 12  
**Margins:** `standard` left · panel bleeds to gradient cols 9–12  
**Type roles:** `body` notes · `heading` panel title · `label` buttons

| Zone | Placement |
|------|-----------|
| Primary text | left notes or oversized narrative cols 1–5 |
| Secondary text | panel description |
| UI/image | center-right panel + icon rail |
| Data/graph | in notes as bullets |
| Logo/CTA | panel action buttons |

**Layering:** white field left → panel → gradient strip right → cursor  
**Motion:** panel slide from right · cursor to button · notes stable  
**Responsive:** 9:16 stack notes above panel · hide oversized side text  

**Brand controls:** gradient strip, rail icon set  
**Block overrides:** panel position, button list, `annotationVisibility`  
**Content inputs:** notes lines, panel title, 3–5 options, cursor target  
**Do:** cursor tells story · gradient anchors right edge  
**Don't:** panel smaller than notes visually

---

## 8. Template Carousel

**Block ID:** `template-carousel`

| Field | Spec |
|-------|------|
| **Best use** | Template gallery, product variants, portfolio browse |
| **Story beat** | introduce · compare |
| **Aspect ratios** | 16:9, 1:1, 4:5 |

**Grid:** 12 col · center card cols 4–9 · header col 1  
**Margins:** `generous` on void stages  
**Type roles:** `label` step/category · `heading` card title · `caption` price/meta

| Zone | Placement |
|------|-----------|
| Primary text | below center card |
| Secondary text | top-left category + step |
| UI/image | center preview card |
| Data/graph | — |
| Logo/CTA | optional header actions |

**Layering:** void → dimmed flanks → bright center → labels  
**Motion:** horizontal slide · center promote brightness 100% flanks 25% · label crossfade  
**Responsive:** 1:1 single card · swipe hint arrows · hide flanks  

**Brand controls:** dim amount, card aspect, void color  
**Block overrides:** active index, card count, header step  
**Content inputs:** array of previews (image, title, meta)  
**Do:** center wins value · smooth slide  
**Don't:** equal brightness on all cards

---

## 9. Editorial Display Hero

**Block ID:** `editorial-display-hero`

| Field | Spec |
|-------|------|
| **Best use** | Brand campaign, collection drop, portfolio name card |
| **Story beat** | hook · introduce |
| **Aspect ratios** | 16:9, 4:5, 9:16, 1:1 |

**Grid:** 12 col modular · display spans 2–11 · images in assigned modules  
**Margins:** `tight` horizontal OK · `standard` vertical  
**Type roles:** `display` hero · `label` meta rails · `subheading` supporting

| Zone | Placement |
|------|-----------|
| Primary text | full-width display top and/or bottom |
| Secondary text | corner meta rails |
| UI/image | inset modules + full-bleed photo zones |
| Data/graph | — |
| Logo/CTA | corner logo · bracket CTA bottom-right |

**Layering:** photo/bg → display type (sandwich) → UI chrome → CTA  
**Motion:** type mask reveal · photo rise · optional type behind subject parallax  
**Responsive:** 9:16 stack type top · photo center · allow `breakGrid: true`  

**Brand controls:** allowGridBreaks, display scale, meta rail density  
**Block overrides:** text sandwich depth, image modules, ticker visibility  
**Content inputs:** display lines, meta strings, hero photo, inset assets  
**Do:** scale contrast · one display owner · grid-break with anchor  
**Don't:** shrink display to fit safe area on 16:9

---

## 10. Dashboard Proof

**Block ID:** `dashboard-proof`

| Field | Spec |
|-------|------|
| **Best use** | Analytics credibility, creator earnings, SaaS metrics |
| **Story beat** | show proof |
| **Aspect ratios** | 16:9, 1:1 (KPI only) |

**Grid:** 12 col · sidebar 2 · main 10 · KPI row 4–5 equal cols  
**Margins:** `standard` · panel inset on void optional  
**Type roles:** `stat` KPI · `label` headers · `caption` table cells

| Zone | Placement |
|------|-----------|
| Primary text | KPI numerals center-right |
| Secondary text | table rows |
| UI/image | dashboard shell |
| Data/graph | KPI row + table |
| Logo/CTA | sidebar nav · primary action top-right |

**Layering:** void → panel → KPI → highlight row  
**Motion:** panel slide · KPI count-up · rows stagger 50ms · highlight row glow  
**Responsive:** 1:1 KPI 2×2 · hide table · 9:16 sidebar collapse icon  

**Brand controls:** panel radius, accent button color  
**Block overrides:** KPI count, table rows, highlight index  
**Content inputs:** 2–5 KPIs, 3–6 table rows, nav labels  
**Do:** tabular nums · row highlight for story  
**Don't:** empty states · illegible small table on 9:16

---

## 11. Social Proof Wall

**Block ID:** `social-proof-wall`

| Field | Spec |
|-------|------|
| **Best use** | Testimonials, payment receipts, tweet wall, creator love |
| **Story beat** | show proof · payoff |
| **Aspect ratios** | 16:9, 1:1 |

**Grid:** hierarchical perspective · center-weight  
**Margins:** `generous` void  
**Type roles:** `caption` in cards · `stat` for amounts · `label` handles

| Zone | Placement |
|------|-----------|
| Primary text | center card quote/amount |
| Secondary text | surrounding cards |
| UI/image | card chrome · avatars |
| Data/graph | mini charts in cards |
| Logo/CTA | — |

**Layering:** void → depth-blurred cards → sharp center → orbit motion  
**Motion:** cards fly from Z · slow orbit · exit push into center card  
**Responsive:** 1:1 reduce to 5 cards · center only sharp  

**Brand controls:** card template, void color, depth range  
**Block overrides:** card count, center index, blur curve  
**Content inputs:** 5–12 proof cards (avatar, name, snippet, optional chart)  
**Do:** legible center · depth variation  
**Don't:** all cards sharp · unreadable snippets

---

## 12. Brand Payoff

**Block ID:** `brand-payoff`

| Field | Spec |
|-------|------|
| **Best use** | End card, logo reveal, URL + CTA |
| **Story beat** | payoff · CTA |
| **Aspect ratios** | 16:9, 9:16, 1:1, 4:5 |

**Grid:** center anchor · logo rows 3–5 · CTA row 7  
**Margins:** `generous` to extreme  
**Type roles:** logo slot · `subheading` CTA · `caption` URL

| Zone | Placement |
|------|-----------|
| Primary text | — (logo is visual) |
| Secondary text | CTA + URL bottom-center |
| UI/image | center logo lockup |
| Data/graph | — |
| Logo/CTA | center + bottom |

**Layering:** gradient or void bg → logo → CTA  
**Motion:** logo scale/draw · CTA fade up +500ms · hold  
**Responsive:** all formats center · 9:16 respect bottom danger zone for URL  

**Brand controls:** bg gradient, logo size, CTA style  
**Block overrides:** show/hide URL, CTA string, logo variant  
**Content inputs:** logo asset, CTA text, URL string  
**Do:** breathing room · high contrast  
**Don't:** extra UI · competing taglines

---

## Implementation notes

### Block library entry shape

```typescript
{
  id: "hero-split-text-media",
  family: "product",
  layoutIntent: "product-feature",
  supportedFormats: ["16:9", "9:16", "1:1", "4:5"],
  slots: [
    { id: "headline", type: "text", role: "headline", required: true, maxLength: 60 },
    { id: "subhead", type: "text", role: "subhead", required: false, maxLength: 120 },
    { id: "media", type: "media", role: "media-primary", required: true },
    { id: "cta", type: "text", role: "cta", required: false, maxLength: 40 },
  ],
  layoutRules: { /* per format — see JSON */ },
  responsiveRules: {
    autoShrinkText: true,
    reflowOnVertical: true,
    hideOptionalOnTight: true,
  },
}
```

### Priority build order

1. editorial-statement  
2. hero-split-text-media  
3. centered-ui-feature  
4. hero-prompt-bar  
5. brand-payoff  
6. card-collage-dof  
7. big-stat-proof  
8. template-carousel  
9. editorial-display-hero  
10. glass-document-panel (extend centered-ui)  
11. dashboard-proof  
12. social-proof-wall  

### QA before ship

- [ ] Hierarchy readable at 320px grayscale thumbnail  
- [ ] One focal point · one accent  
- [ ] Grid snap on primary anchors  
- [ ] 9:16 reflow defined  
- [ ] Brand defaults work without block overrides  
