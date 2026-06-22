import type { BlockFormatLayoutOverrides, BlockLayoutOverride } from "@/types/block-layout";

/** Default per-format layout overrides for wave-1 blocks (applied when user has not customized). */
export const WAVE1_FORMAT_OVERRIDES: Record<
  string,
  Partial<Record<string, BlockLayoutOverride>>
> = {
  "editorial-statement": {
    "format-9-16": { contentZone: "center-safe", maxTextWidth: 0.88 },
    "format-1-1": { textScale: 0.9, maxTextWidth: 0.82 },
    "format-4-5": { textScale: 0.94, maxTextWidth: 0.84 },
  },
  "hero-split-text-media": {
    "format-9-16": {
      contentZone: "center-safe",
      stackDirection: "column",
      mediaPosition: "bottom",
    },
    "format-16-9": {
      contentZone: "split-left",
      stackDirection: "column",
      mediaPosition: "right",
    },
  },
  "centered-ui-feature": {
    "format-16-9": { contentZone: "center" },
    "format-1-1": { contentZone: "center" },
    "format-4-5": { contentZone: "center" },
    "format-9-16": { contentZone: "center-safe" },
  },
  "big-stat-proof": {
    "format-9-16": { contentZone: "center-safe", maxTextWidth: 0.88, textScale: 0.96 },
    "format-1-1": { textScale: 0.9, maxTextWidth: 0.82 },
  },
  "hero-prompt-bar": {
    "format-9-16": { contentZone: "lower-third", maxTextWidth: 0.88 },
  },
  "brand-payoff": {
    "format-9-16": { contentZone: "lower-third" },
  },
  "card-collage-dof": {
    "format-9-16": { maxTextWidth: 0.88 },
  },
  "template-carousel": {
    "format-1-1": { textScale: 0.9 },
    "format-4-5": { textScale: 0.94 },
  },
};

export function getWave1LayoutOverrides(blockId: string): BlockFormatLayoutOverrides | undefined {
  const formats = WAVE1_FORMAT_OVERRIDES[blockId];
  if (!formats) return undefined;
  return { formats: { ...formats } };
}

export function mergeWave1LayoutOverrides(
  blockId: string,
  existing?: BlockFormatLayoutOverrides,
): BlockFormatLayoutOverrides | undefined {
  const defaults = getWave1LayoutOverrides(blockId);
  if (!defaults) return existing;

  if (!existing?.formats || Object.keys(existing.formats).length === 0) {
    return defaults;
  }

  return {
    formats: {
      ...defaults.formats,
      ...existing.formats,
    },
  };
}
