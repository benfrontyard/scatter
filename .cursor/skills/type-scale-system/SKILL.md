---
name: type-scale-system
description: >-
  Create ratio-based type scales with design tokens, line-height, letter-spacing,
  and responsive clamp() rules. Use when working on typography, type scales,
  font sizes, heading hierarchy, CSS type tokens, Figma type styles, or
  Scatter brand typography.
---

# Type Scale System

## Purpose

Generate consistent, mathematically related type sizes from a **base size** and **ratio**. Use this skill to produce readable hierarchy, reusable CSS/design tokens, and handoff specs that scale across mobile UI, web product, editorial, posters, and motion graphics.

## When to Use This Skill

- Creating or auditing brand typography tokens
- Defining heading/body/caption/label sizes for a new brand
- Building responsive type for Scatter motion blocks or templates
- Writing Figma type styles or CSS custom properties
- Fixing hierarchy problems (headlines too close to body, display type unreadable)
- Converting a fixed px scale to a ratio-based system

---

## Core Formula

```
fontSize(step) = baseSize × ratio^step
```

| Variable | Meaning |
|----------|---------|
| `baseSize` | Body/reference size in px (typically 14–18 for web, 16–24 for mobile UI, 24–32 for motion at 1080p) |
| `ratio` | Multiplier between steps |
| `step` | Integer offset from base (negative = smaller, positive = larger) |

**Example:** base 16px, ratio 1.25 (Major Third)

| Step | Calculation | Size |
|------|-------------|------|
| −2 | 16 × 1.25⁻² | 10.24 → **10px** |
| −1 | 16 × 1.25⁻¹ | 12.8 → **13px** |
| 0 | 16 × 1.25⁰ | **16px** (base) |
| 1 | 16 × 1.25¹ | **20px** |
| 2 | 16 × 1.25² | **25px** |
| 3 | 16 × 1.25³ | **31.25 → 31px** |
| 4 | 16 × 1.25⁴ | **39px** |
| 5 | 16 × 1.25⁵ | **49px** |

Round to whole px for screen; keep one decimal for print specs.

---

## Common Ratios

| Name | Ratio | Character |
|------|-------|-----------|
| Minor Second | 1.067 | Very subtle; dense dashboards, data-heavy UI |
| Major Second | 1.125 | Compact mobile UI, tight product screens |
| Minor Third | 1.2 | Balanced mobile/web; safe default for apps |
| Major Third | 1.25 | Classic web/product; clear hierarchy |
| Perfect Fourth | 1.333 | Editorial, marketing, posters |
| Augmented Fourth | 1.414 | Dramatic editorial; √2 proportion |
| Perfect Fifth | 1.5 | Bold poster/display; strong contrast |
| Golden Ratio | 1.618 | Luxury, editorial, art-directed layouts |

---

## Recommendations by Context

| Context | Base (px) | Ratio | Notes |
|---------|-----------|-------|-------|
| **Mobile UI** | 14–16 | 1.125–1.2 | Fewer steps; prioritize legibility at arm's length |
| **Web / product** | 16–18 | 1.2–1.25 | 5–7 visible steps; pair with 8px spacing grid |
| **Editorial** | 16–20 | 1.25–1.333 | Wider line lengths; generous body line-height |
| **Poster / print** | 10–12 pt body | 1.333–1.5 | Scale up display; negative tracking on large type |
| **Motion graphics (1080p ref)** | 24–32 body equiv. | 1.25–1.333 | Clamp sizes per aspect ratio; test at 9:16 and 16:9 |

### Scatter motion reference

At 1080px reference height, Scatter roles map roughly to scale steps:

| Scatter role | Typical step | Notes |
|--------------|--------------|-------|
| `label` | −2 to −1 | Uppercase, positive tracking |
| `caption` | −1 | Supporting detail |
| `body` | 0 (base) | Primary readable text |
| `subheading` | +1 | Secondary headline |
| `heading` | +2 to +3 | Primary headline |
| `display` | +4 to +5 | Hero/display; tightest line-height |
| `stat` | +2 to +4 | Large numerals; tabular figures if available |

---

## Token Naming

Use semantic names, not pixel values:

```css
--font-size-xs:     /* step −2 */
--font-size-sm:     /* step −1 */
--font-size-base:   /* step 0 */
--font-size-md:     /* step +1 */
--font-size-lg:     /* step +2 */
--font-size-xl:     /* step +3 */
--font-size-2xl:    /* step +4 */
--font-size-3xl:    /* step +5 */
--font-size-4xl:    /* step +6 */
--font-size-display: /* step +7 or hero override */
```

Map to role names when generating Scatter or app tokens:

| CSS token | Scatter role | Usage role |
|-----------|--------------|------------|
| `--font-size-xs` | — | Fine print, metadata |
| `--font-size-sm` | `caption` | Supporting text |
| `--font-size-base` | `body` | Body copy |
| `--font-size-md` | `subheading` | Secondary headline |
| `--font-size-lg` | `heading` | Primary headline |
| `--font-size-xl` | `heading` (large) | Hero headline |
| `--font-size-2xl` | `display` | Display type |
| `--font-size-display` | `display` | Full-bleed hero |

---

## Line-Height Rules

| Role | Line-height | Rationale |
|------|-------------|-----------|
| Body | 1.4–1.6 | Looser for readability; scales with density |
| Subheading | 1.2–1.35 | Bridge between body and heading |
| Heading | 1.05–1.2 | Tighter; multi-line headlines need ≥1.1 |
| Display | 0.95–1.05 | Tightest; often single line |
| Label (uppercase) | 1.1–1.25 | Compact; tracking adds perceived width |
| Stat / numerals | 1.0–1.1 | Tabular alignment; tight |

**Density modifiers** (apply as multiplier):

- Spacious: ×1.12
- Balanced: ×1.0
- Compact: ×0.92

---

## Letter-Spacing Rules

| Role | Tracking (em) | Notes |
|------|---------------|-------|
| Body | 0 to +0.01 | Near zero; only adjust for font quirks |
| Caption | 0 to +0.02 | Slight openness at small sizes |
| Label (uppercase) | +0.06 to +0.12 | Required for legibility |
| Heading | −0.02 to 0 | Slight tightening at large sizes |
| Display | −0.03 to −0.01 | Negative tracking prevents gaps |
| Stat | 0 to −0.02 | Tight numerals |

Convert em to CSS: `letter-spacing: 0.06em;`

---

## Responsive Type with `clamp()`

### Pattern

```css
--font-size-base: clamp(14px, 0.875rem + 0.5vw, 18px);
--font-size-lg:   clamp(20px, 1.25rem + 1vw, 32px);
--font-size-display: clamp(32px, 2rem + 3vw, 72px);
```

### Motion / format-aware scaling

For fixed-aspect motion frames, scale from reference height:

```css
/* 1080p reference; format height drives scale */
font-size: clamp(
  var(--role-min-px),
  calc(var(--role-base-px) * (var(--format-height) / 1080)),
  var(--role-max-px)
);
```

### Aspect ratio adjustments

| Aspect ratio | Size scale | Max width factor |
|--------------|------------|------------------|
| 16:9 | 1.0 | 0.85 |
| 9:16 | 1.08 | 0.88 |
| 1:1 | 0.9 | 0.82 |
| 4:5 | 0.96 | 0.84 |

---

## Output Format

When generating a type scale, always output a table:

| Token | Step | px | rem | Line-height | Letter-spacing | Usage role |
|-------|------|----|-----|-------------|----------------|------------|
| `--font-size-xs` | −2 | 10 | 0.625 | 1.4 | 0.04em | Metadata |
| `--font-size-sm` | −1 | 13 | 0.8125 | 1.4 | 0.02em | Caption |
| `--font-size-base` | 0 | 16 | 1 | 1.5 | 0 | Body |
| `--font-size-md` | +1 | 20 | 1.25 | 1.3 | 0 | Subheading |
| `--font-size-lg` | +2 | 25 | 1.5625 | 1.15 | −0.01em | Heading |
| `--font-size-xl` | +3 | 31 | 1.9375 | 1.1 | −0.02em | Large heading |
| `--font-size-2xl` | +4 | 39 | 2.4375 | 1.05 | −0.02em | Display |
| `--font-size-display` | +5 | 49 | 3.0625 | 1.0 | −0.03em | Hero display |

Include at the top:

```
Base size: 16px
Ratio: 1.25 (Major Third)
Reference height: 1080px (motion) or 16px root (web)
```

### Code output template

```css
:root {
  --type-base: 16;
  --type-ratio: 1.25;

  --font-size-xs:      calc(var(--type-base) * pow(var(--type-ratio), -2) * 1px);
  --font-size-sm:      calc(var(--type-base) * pow(var(--type-ratio), -1) * 1px);
  --font-size-base:    calc(var(--type-base) * 1px);
  --font-size-md:      calc(var(--type-base) * var(--type-ratio) * 1px);
  --font-size-lg:      calc(var(--type-base) * pow(var(--type-ratio), 2) * 1px);
  --font-size-xl:      calc(var(--type-base) * pow(var(--type-ratio), 3) * 1px);
  --font-size-2xl:     calc(var(--type-base) * pow(var(--type-ratio), 4) * 1px);
  --font-size-display: calc(var(--type-base) * pow(var(--type-ratio), 5) * 1px);

  --line-height-body:    1.5;
  --line-height-heading: 1.15;
  --line-height-display: 1.0;

  --tracking-body:    0;
  --tracking-label:   0.08em;
  --tracking-display: -0.02em;
}
```

For handoff, also emit JSON:

```json
{
  "baseSize": 16,
  "ratio": 1.25,
  "referenceHeight": 1080,
  "tokens": [
    { "name": "font-size-base", "step": 0, "px": 16, "rem": 1, "lineHeight": 1.5, "letterSpacing": "0", "role": "body" }
  ]
}
```

---

## QA Checklist

### Readability
- [ ] Body ≥14px (web) or ≥24px at 1080p (motion)
- [ ] Contrast ratio ≥4.5:1 for body, ≥3:1 for large type
- [ ] Line length 45–75 characters for body; ≤12 words per headline line
- [ ] No two adjacent hierarchy levels differ by <1.1× (too subtle)

### Hierarchy
- [ ] Clear visual jump between body → subheading → heading → display
- [ ] Only one display-level element per composition
- [ ] Label/caption visually subordinate to body

### Spacing
- [ ] Line-height increases as size decreases
- [ ] Paragraph spacing ≈ 0.75–1× body line-height
- [ ] Heading margin-top ≥1.5× heading line-height

### Responsive behavior
- [ ] Sizes clamp between min/max at all breakpoints
- [ ] 9:16 text not oversized vs 16:9
- [ ] Long headlines tested with `autoShrinkText` or wrap fallback
- [ ] Uppercase labels remain legible at smallest size

---

## Quick Reference: Generate a Scale

1. Pick **base size** from context table
2. Pick **ratio** from personality (conservative = 1.2, expressive = 1.333+)
3. Assign steps −2 through +5 to token names
4. Apply line-height and tracking rules per role
5. Add `clamp()` min/max for responsive
6. Output table + CSS/JSON
7. Run QA checklist
