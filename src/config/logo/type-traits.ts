import type {
  LogoAssetType,
  LogoBackgroundCompatibility,
  LogoMotionStyle,
  LogoPreferredUse,
  LogoVariantRole,
} from "@/types/brand-logo";
import type { LayoutZone } from "@/types/brand-composition";
import type { AspectRatioId } from "@/types/typography-role";

export type LogoTypeTraits = {
  label: string;
  description: string;
  typicalAspectRatio: number;
  minScale: number;
  maxScale: number;
  clearSpace: number;
  lockupGapRatio?: number;
  needsHorizontalSpace: boolean;
  opticalWeight: number;
  canCrop: boolean;
  canUseSmall: boolean;
  canAnimateParts: boolean;
  preferredZones: LayoutZone[];
  verticalZones: LayoutZone[];
  motionStyle: LogoMotionStyle;
  defaultPreferredUse: LogoPreferredUse[];
  defaultBackgroundCompatibility: LogoBackgroundCompatibility[];
  formatVariantPreference: Partial<Record<AspectRatioId, LogoVariantRole>>;
  tightFormatVariant: LogoVariantRole;
  /** Default min/max width & height as format fractions */
  minWidth: number;
  maxWidth: number;
  minHeight: number;
};

export const LOGO_TYPE_TRAITS: Record<LogoAssetType, LogoTypeTraits> = {
  wordmark: {
    label: "Wordmark",
    description: "Text-only logo. Prioritize horizontal space; avoid scaling too small.",
    typicalAspectRatio: 3.2,
    minScale: 0.55,
    maxScale: 1,
    clearSpace: 0.15,
    needsHorizontalSpace: true,
    opticalWeight: 1,
    canCrop: false,
    canUseSmall: true,
    canAnimateParts: false,
    preferredZones: ["center", "bottom-center", "top-left", "bottom-left"],
    verticalZones: ["top-center", "center-safe"],
    motionStyle: "fade",
    defaultPreferredUse: ["intro", "outro", "hero"],
    defaultBackgroundCompatibility: ["light", "dark", "color"],
    formatVariantPreference: {
      "16:9": "primary",
      "1:1": "wordmarkOnly",
      "4:5": "stacked",
      "9:16": "symbolOnly",
    },
    tightFormatVariant: "smallSize",
    minWidth: 0.28,
    maxWidth: 0.72,
    minHeight: 0.04,
  },
  combination: {
    label: "Symbol + wordmark",
    description: "Lockup with symbol and wordmark. Switch to symbol-only in tight formats.",
    typicalAspectRatio: 2.4,
    minScale: 0.6,
    maxScale: 1,
    clearSpace: 0.18,
    lockupGapRatio: 0.12,
    needsHorizontalSpace: true,
    opticalWeight: 1.02,
    canCrop: false,
    canUseSmall: true,
    canAnimateParts: true,
    preferredZones: ["center", "bottom-left", "top-left", "split-left"],
    verticalZones: ["top-center", "center"],
    motionStyle: "scale",
    defaultPreferredUse: ["intro", "outro", "hero"],
    defaultBackgroundCompatibility: ["light", "dark", "color"],
    formatVariantPreference: {
      "16:9": "primary",
      "1:1": "primary",
      "4:5": "stacked",
      "9:16": "symbolOnly",
    },
    tightFormatVariant: "symbolOnly",
    minWidth: 0.22,
    maxWidth: 0.68,
    minHeight: 0.045,
  },
  symbol: {
    label: "Symbol",
    description: "Standalone symbol. Works as bug, watermark, or tight-composition mark.",
    typicalAspectRatio: 1,
    minScale: 0.35,
    maxScale: 1.2,
    clearSpace: 0.12,
    needsHorizontalSpace: false,
    opticalWeight: 0.92,
    canCrop: false,
    canUseSmall: true,
    canAnimateParts: true,
    preferredZones: ["top-left", "bottom-left", "center", "center-safe"],
    verticalZones: ["center", "upper-third"],
    motionStyle: "scale",
    defaultPreferredUse: ["cornerBug", "watermark", "socialFormat"],
    defaultBackgroundCompatibility: ["light", "dark", "color", "image"],
    formatVariantPreference: {
      "16:9": "symbolOnly",
      "1:1": "symbolOnly",
      "4:5": "symbolOnly",
      "9:16": "symbolOnly",
    },
    tightFormatVariant: "symbolOnly",
    minWidth: 0.04,
    maxWidth: 0.22,
    minHeight: 0.04,
  },
  monogram: {
    label: "Monogram",
    description: "Letter-based mark. Can scale large as a graphic element.",
    typicalAspectRatio: 1,
    minScale: 0.5,
    maxScale: 1.4,
    clearSpace: 0.14,
    needsHorizontalSpace: false,
    opticalWeight: 1.08,
    canCrop: false,
    canUseSmall: true,
    canAnimateParts: true,
    preferredZones: ["center", "center-safe", "upper-third"],
    verticalZones: ["center", "upper-third"],
    motionStyle: "reveal",
    defaultPreferredUse: ["hero", "intro"],
    defaultBackgroundCompatibility: ["light", "dark", "color"],
    formatVariantPreference: {
      "16:9": "symbolOnly",
      "1:1": "symbolOnly",
      "4:5": "symbolOnly",
      "9:16": "symbolOnly",
    },
    tightFormatVariant: "symbolOnly",
    minWidth: 0.06,
    maxWidth: 0.28,
    minHeight: 0.06,
  },
  mascot: {
    label: "Mascot",
    description: "Character-driven mark. Needs clear space; avoid tiny corner placement.",
    typicalAspectRatio: 1.1,
    minScale: 0.65,
    maxScale: 1.1,
    clearSpace: 0.22,
    needsHorizontalSpace: false,
    opticalWeight: 1.18,
    canCrop: false,
    canUseSmall: false,
    canAnimateParts: true,
    preferredZones: ["center", "center-safe", "upper-third"],
    verticalZones: ["center", "upper-third"],
    motionStyle: "character",
    defaultPreferredUse: ["hero", "intro", "backgroundGraphic"],
    defaultBackgroundCompatibility: ["light", "dark", "color"],
    formatVariantPreference: {
      "16:9": "primary",
      "1:1": "primary",
      "4:5": "stacked",
      "9:16": "stacked",
    },
    tightFormatVariant: "smallSize",
    minWidth: 0.12,
    maxWidth: 0.55,
    minHeight: 0.1,
  },
  badge: {
    label: "Badge / emblem",
    description: "Contained emblem. Centers well; may need larger size for detail.",
    typicalAspectRatio: 1,
    minScale: 0.7,
    maxScale: 1.15,
    clearSpace: 0.2,
    needsHorizontalSpace: false,
    opticalWeight: 1.12,
    canCrop: false,
    canUseSmall: false,
    canAnimateParts: false,
    preferredZones: ["center", "center-safe"],
    verticalZones: ["center", "upper-third"],
    motionStyle: "stamp",
    defaultPreferredUse: ["intro", "outro", "hero"],
    defaultBackgroundCompatibility: ["light", "dark", "color"],
    formatVariantPreference: {
      "16:9": "primary",
      "1:1": "primary",
      "4:5": "primary",
      "9:16": "primary",
    },
    tightFormatVariant: "smallSize",
    minWidth: 0.1,
    maxWidth: 0.42,
    minHeight: 0.1,
  },
  stacked: {
    label: "Stacked",
    description: "Symbol above wordmark. Preferred in vertical formats.",
    typicalAspectRatio: 0.75,
    minScale: 0.6,
    maxScale: 1,
    clearSpace: 0.16,
    needsHorizontalSpace: false,
    opticalWeight: 1.04,
    canCrop: false,
    canUseSmall: true,
    canAnimateParts: true,
    preferredZones: ["center", "top-center", "upper-third"],
    verticalZones: ["center", "upper-third", "top-center"],
    motionStyle: "fade",
    defaultPreferredUse: ["hero", "intro", "socialFormat"],
    defaultBackgroundCompatibility: ["light", "dark", "color"],
    formatVariantPreference: {
      "16:9": "stacked",
      "1:1": "stacked",
      "4:5": "stacked",
      "9:16": "stacked",
    },
    tightFormatVariant: "symbolOnly",
    minWidth: 0.14,
    maxWidth: 0.48,
    minHeight: 0.12,
  },
};

export const LOGO_TYPE_OPTIONS = Object.entries(LOGO_TYPE_TRAITS).map(([id, traits]) => ({
  id: id as LogoAssetType,
  label: traits.label,
  description: traits.description,
}));

export const LOGO_VARIANT_ROLE_LABELS: Record<LogoVariantRole, string> = {
  primary: "Primary",
  secondary: "One color",
  symbolOnly: "Symbol only",
  wordmarkOnly: "Wordmark only",
  stacked: "Vertical / stacked",
  light: "Light",
  dark: "Dark",
  fullColor: "Full color",
  smallSize: "Small size",
};

export const LOGO_PREFERRED_USE_LABELS: Record<LogoPreferredUse, string> = {
  default: "Default",
  intro: "Intro",
  outro: "Outro",
  cornerBug: "Corner mark",
  watermark: "Watermark",
  hero: "Hero",
  lowerThird: "Lower third",
  backgroundGraphic: "Background graphic",
  socialFormat: "Social format",
};

export const LOGO_BACKGROUND_LABELS: Record<LogoBackgroundCompatibility, string> = {
  light: "Light backgrounds",
  dark: "Dark backgrounds",
  color: "Color backgrounds",
  image: "Image backgrounds",
};
