import type {
  AlignmentMode,
  BrandComposition,
  CompositionStyle,
  GridStrength,
  LayoutZone,
  SafeAreaPreset,
} from "@/types/brand-composition";
import type { AspectRatioId } from "@/types/typography-role";
import type { BlockLayoutIntent } from "@/types/block-layout";
import type { TextAlign } from "@/types/typography";

export const DEFAULT_BRAND_COMPOSITION: BrandComposition = {
  style: "product",
  gridStrength: "balanced",
  defaultAlignment: "center",
  density: "balanced",
  safeArea: "standard",
  motionComposition: "stable",
  allowGridBreaks: false,
};

export const COMPOSITION_STYLE_LABELS: Record<CompositionStyle, string> = {
  swiss: "Swiss",
  editorial: "Editorial",
  premium: "Premium",
  product: "Product",
  social: "Social",
  expressive: "Expressive",
};

export const SAFE_AREA_INSETS: Record<
  SafeAreaPreset,
  { x: number; y: number }
> = {
  tight: { x: 0.05, y: 0.05 },
  standard: { x: 0.08, y: 0.07 },
  generous: { x: 0.1, y: 0.09 },
};

export const DENSITY_FACTORS = {
  spacious: { lineHeightMult: 1.12, spacingMult: 1.2, lineLengthMult: 0.9 },
  balanced: { lineHeightMult: 1, spacingMult: 1, lineLengthMult: 1 },
  compact: { lineHeightMult: 0.92, spacingMult: 0.85, lineLengthMult: 1.1 },
} as const;

export const GRID_STRENGTH_FACTORS: Record<GridStrength, number> = {
  strict: 1,
  balanced: 0.85,
  loose: 0.7,
  expressive: 0.55,
};

type ZoneAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
  alignItems: "flex-start" | "center" | "flex-end";
  justifyContent: "flex-start" | "center" | "flex-end";
  textAlign: TextAlign;
};

/** Zone geometry as fractions within the safe content area (0–1). */
export const ZONE_ANCHORS: Record<LayoutZone, ZoneAnchor> = {
  center: {
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  "center-safe": {
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  "top-left": {
    x: 0,
    y: 0,
    width: 0.55,
    height: 0.38,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    textAlign: "left",
  },
  "top-center": {
    x: 0,
    y: 0,
    width: 1,
    height: 0.42,
    alignItems: "center",
    justifyContent: "flex-start",
    textAlign: "center",
  },
  "bottom-left": {
    x: 0,
    y: 0.58,
    width: 0.55,
    height: 0.38,
    alignItems: "flex-start",
    justifyContent: "flex-end",
    textAlign: "left",
  },
  "bottom-center": {
    x: 0.1,
    y: 0.62,
    width: 0.8,
    height: 0.34,
    alignItems: "center",
    justifyContent: "flex-end",
    textAlign: "center",
  },
  "split-left": {
    x: 0,
    y: 0.12,
    width: 0.48,
    height: 0.76,
    alignItems: "flex-start",
    justifyContent: "center",
    textAlign: "left",
  },
  "split-right": {
    x: 0.52,
    y: 0.12,
    width: 0.48,
    height: 0.76,
    alignItems: "flex-start",
    justifyContent: "center",
    textAlign: "left",
  },
  "upper-third": {
    x: 0.08,
    y: 0.04,
    width: 0.84,
    height: 0.3,
    alignItems: "center",
    justifyContent: "flex-start",
    textAlign: "center",
  },
  "lower-third": {
    x: 0.08,
    y: 0.64,
    width: 0.84,
    height: 0.3,
    alignItems: "center",
    justifyContent: "flex-end",
    textAlign: "center",
  },
};

type IntentLayoutRule = {
  zone: LayoutZone;
  alignment: TextAlign;
  stackDirection: "column" | "row";
  mediaPosition: import("@/types/brand-composition").MediaPosition;
  mediaScale: number;
  gapFactor: number;
  maxTextWidthFactor: number;
  textScale: number;
  formatZones?: Partial<Record<AspectRatioId, LayoutZone>>;
};

export const INTENT_LAYOUT_RULES: Record<BlockLayoutIntent, IntentLayoutRule> = {
  hero: {
    zone: "center",
    alignment: "center",
    stackDirection: "column",
    mediaPosition: "background",
    mediaScale: 1,
    gapFactor: 0.028,
    maxTextWidthFactor: 0.85,
    textScale: 1,
    formatZones: { "9:16": "upper-third", "4:5": "upper-third" },
  },
  statement: {
    zone: "center-safe",
    alignment: "center",
    stackDirection: "column",
    mediaPosition: "inline",
    mediaScale: 0.9,
    gapFactor: 0.024,
    maxTextWidthFactor: 0.78,
    textScale: 1,
  },
  quote: {
    zone: "center",
    alignment: "center",
    stackDirection: "column",
    mediaPosition: "inline",
    mediaScale: 0.85,
    gapFactor: 0.032,
    maxTextWidthFactor: 0.72,
    textScale: 0.96,
  },
  stat: {
    zone: "center",
    alignment: "center",
    stackDirection: "column",
    mediaPosition: "inline",
    mediaScale: 1,
    gapFactor: 0.018,
    maxTextWidthFactor: 0.65,
    textScale: 1.05,
  },
  "product-feature": {
    zone: "top-center",
    alignment: "center",
    stackDirection: "column",
    mediaPosition: "bottom",
    mediaScale: 1,
    gapFactor: 0.028,
    maxTextWidthFactor: 0.82,
    textScale: 1,
    formatZones: {
      "16:9": "top-center",
      "9:16": "upper-third",
      "1:1": "top-center",
      "4:5": "top-center",
    },
  },
  comparison: {
    zone: "center",
    alignment: "center",
    stackDirection: "row",
    mediaPosition: "inline",
    mediaScale: 0.92,
    gapFactor: 0.022,
    maxTextWidthFactor: 0.88,
    textScale: 0.94,
    formatZones: { "9:16": "center-safe", "4:5": "center-safe" },
  },
  testimonial: {
    zone: "center-safe",
    alignment: "center",
    stackDirection: "column",
    mediaPosition: "top",
    mediaScale: 0.8,
    gapFactor: 0.026,
    maxTextWidthFactor: 0.7,
    textScale: 0.98,
  },
  "logo-lockup": {
    zone: "center",
    alignment: "center",
    stackDirection: "column",
    mediaPosition: "inline",
    mediaScale: 0.75,
    gapFactor: 0.02,
    maxTextWidthFactor: 0.6,
    textScale: 1,
  },
  list: {
    zone: "split-left",
    alignment: "left",
    stackDirection: "column",
    mediaPosition: "right",
    mediaScale: 0.88,
    gapFactor: 0.02,
    maxTextWidthFactor: 0.45,
    textScale: 0.95,
    formatZones: { "9:16": "top-left", "1:1": "top-left", "4:5": "top-left" },
  },
  "before-after": {
    zone: "center",
    alignment: "center",
    stackDirection: "row",
    mediaPosition: "inline",
    mediaScale: 1,
    gapFactor: 0.018,
    maxTextWidthFactor: 0.9,
    textScale: 0.92,
    formatZones: { "9:16": "center-safe" },
  },
  outro: {
    zone: "bottom-center",
    alignment: "center",
    stackDirection: "column",
    mediaPosition: "inline",
    mediaScale: 0.7,
    gapFactor: 0.022,
    maxTextWidthFactor: 0.75,
    textScale: 0.98,
    formatZones: { "16:9": "center-safe", "9:16": "lower-third" },
  },
};

const STYLE_ALIGNMENT: Partial<Record<CompositionStyle, AlignmentMode>> = {
  swiss: "left",
  editorial: "mixed",
  premium: "center",
  product: "center",
  social: "center",
  expressive: "mixed",
};

export function alignmentForComposition(
  composition: BrandComposition,
  intentAlignment: TextAlign,
): TextAlign {
  if (composition.defaultAlignment === "mixed") {
    return intentAlignment;
  }
  if (composition.defaultAlignment === "left") {
    return "left";
  }
  return composition.defaultAlignment === "center" ? intentAlignment : intentAlignment;
}

export function resolveIntentZone(
  intent: BlockLayoutIntent,
  aspectRatio: string,
  composition: BrandComposition,
): LayoutZone {
  const rule = INTENT_LAYOUT_RULES[intent];
  const formatZone = rule.formatZones?.[aspectRatio as AspectRatioId];
  if (formatZone) return formatZone;

  if (composition.style === "editorial" && intent === "statement") {
    return "top-left";
  }
  if (composition.style === "social" && (intent === "hero" || intent === "stat")) {
    return aspectRatio === "9:16" ? "upper-third" : rule.zone;
  }
  return rule.zone;
}

export function compositionStyleAlignment(composition: BrandComposition): AlignmentMode {
  return STYLE_ALIGNMENT[composition.style] ?? composition.defaultAlignment;
}
