import type { TransitionDefinition, TransitionDirection, TransitionType } from "@/types";

/** Named transition presets for stable, brand-aware block handoffs. */
export type TransitionPresetId =
  | "cut"
  | "hold-cut"
  | "soft-dissolve"
  | "scale-handoff"
  | "match-cut"
  | "cut-on-action"
  | "mask-reveal"
  | "texture-wipe"
  | "directional-push"
  | "soft-fade"
  | "slide-up"
  | "push-left"
  | "scale-fade"
  | "wipe"
  | "brand-blur";

export type TransitionPreset = {
  id: TransitionPresetId;
  name: string;
  type: TransitionType;
  defaultDuration: number;
  defaultDirection: TransitionDirection;
  /** 0–1 overlap with adjacent block */
  defaultOverlap: number;
  defaultEasingId: string;
  /** Optional y-offset ratio for soft entrance (0–1 of format height) */
  driftY?: number;
  /** Reduced-motion fallback: instant cut */
  reducedMotionFallback: TransitionPresetId;
  /** Legacy presets — hidden from default auto-selection */
  legacy?: boolean;
};

export const TRANSITION_PRESETS: Record<TransitionPresetId, TransitionPreset> = {
  cut: {
    id: "cut",
    name: "Cut",
    type: "cut",
    defaultDuration: 1,
    defaultDirection: "left",
    defaultOverlap: 0,
    defaultEasingId: "linear",
    reducedMotionFallback: "cut",
  },
  "hold-cut": {
    id: "hold-cut",
    name: "Hold Cut",
    type: "cut",
    defaultDuration: 1,
    defaultDirection: "left",
    defaultOverlap: 0,
    defaultEasingId: "linear",
    reducedMotionFallback: "cut",
  },
  "soft-dissolve": {
    id: "soft-dissolve",
    name: "Soft Dissolve",
    type: "crossfade",
    defaultDuration: 14,
    defaultDirection: "up",
    defaultOverlap: 0.25,
    defaultEasingId: "ease-out",
    driftY: 0.005,
    reducedMotionFallback: "cut",
  },
  "scale-handoff": {
    id: "scale-handoff",
    name: "Scale Handoff",
    type: "scale-through",
    defaultDuration: 15,
    defaultDirection: "left",
    defaultOverlap: 0.3,
    defaultEasingId: "ease-in-out",
    reducedMotionFallback: "cut",
  },
  "match-cut": {
    id: "match-cut",
    name: "Match Cut",
    type: "cut",
    defaultDuration: 4,
    defaultDirection: "left",
    defaultOverlap: 0.1,
    defaultEasingId: "linear",
    reducedMotionFallback: "cut",
  },
  "cut-on-action": {
    id: "cut-on-action",
    name: "Cut on Action",
    type: "cut",
    defaultDuration: 4,
    defaultDirection: "left",
    defaultOverlap: 0.1,
    defaultEasingId: "linear",
    reducedMotionFallback: "cut",
  },
  "mask-reveal": {
    id: "mask-reveal",
    name: "Mask Reveal",
    type: "mask-reveal",
    defaultDuration: 18,
    defaultDirection: "up",
    defaultOverlap: 0.28,
    defaultEasingId: "soft-reveal",
    reducedMotionFallback: "cut",
  },
  "texture-wipe": {
    id: "texture-wipe",
    name: "Texture Wipe",
    type: "wipe",
    defaultDuration: 16,
    defaultDirection: "right",
    defaultOverlap: 0.25,
    defaultEasingId: "sharp-in-out",
    reducedMotionFallback: "cut",
  },
  "directional-push": {
    id: "directional-push",
    name: "Directional Push",
    type: "push",
    defaultDuration: 15,
    defaultDirection: "left",
    defaultOverlap: 0.28,
    defaultEasingId: "ease-out",
    reducedMotionFallback: "cut",
  },
  "soft-fade": {
    id: "soft-fade",
    name: "Soft Fade (Legacy)",
    type: "crossfade",
    defaultDuration: 18,
    defaultDirection: "up",
    defaultOverlap: 0.55,
    defaultEasingId: "ease-out",
    driftY: 0.025,
    reducedMotionFallback: "cut",
    legacy: true,
  },
  "slide-up": {
    id: "slide-up",
    name: "Slide Up (Legacy)",
    type: "push",
    defaultDuration: 20,
    defaultDirection: "up",
    defaultOverlap: 0.45,
    defaultEasingId: "ease-out",
    reducedMotionFallback: "cut",
    legacy: true,
  },
  "push-left": {
    id: "push-left",
    name: "Push Left (Legacy)",
    type: "push",
    defaultDuration: 20,
    defaultDirection: "left",
    defaultOverlap: 0.35,
    defaultEasingId: "ease-out",
    reducedMotionFallback: "cut",
    legacy: true,
  },
  "scale-fade": {
    id: "scale-fade",
    name: "Scale Fade (Legacy)",
    type: "scale-through",
    defaultDuration: 20,
    defaultDirection: "left",
    defaultOverlap: 0.4,
    defaultEasingId: "ease-in-out",
    reducedMotionFallback: "cut",
    legacy: true,
  },
  wipe: {
    id: "wipe",
    name: "Wipe (Legacy)",
    type: "wipe",
    defaultDuration: 18,
    defaultDirection: "right",
    defaultOverlap: 0.25,
    defaultEasingId: "sharp-in-out",
    reducedMotionFallback: "cut",
    legacy: true,
  },
  "brand-blur": {
    id: "brand-blur",
    name: "Brand Blur (Legacy)",
    type: "mask-reveal",
    defaultDuration: 22,
    defaultDirection: "up",
    defaultOverlap: 0.35,
    defaultEasingId: "soft-reveal",
    reducedMotionFallback: "cut",
    legacy: true,
  },
};

/** Primary V2 presets shown in the default transition picker. */
export const V2_TRANSITION_PRESET_IDS: TransitionPresetId[] = [
  "cut",
  "hold-cut",
  "soft-dissolve",
  "scale-handoff",
  "match-cut",
  "cut-on-action",
  "mask-reveal",
  "texture-wipe",
  "directional-push",
];

/** Legacy presets kept for compatibility — gated from auto-selection. */
export const LEGACY_TRANSITION_PRESET_IDS: TransitionPresetId[] = [
  "soft-fade",
  "slide-up",
  "push-left",
  "scale-fade",
  "wipe",
  "brand-blur",
];

/** Safe fallbacks when role/brand presets are incompatible. */
export const SAFE_FALLBACK_PRESET_IDS: TransitionPresetId[] = [
  "cut",
  "hold-cut",
  "soft-dissolve",
  "scale-handoff",
];

/** Default handoff — confident direct cut. */
export const DEFAULT_TRANSITION_PRESET_ID: TransitionPresetId = "cut";

/** Map demo brand kit transition names to editor presets. */
export const BRAND_TRANSITION_MAP: Record<string, TransitionPresetId> = {
  "soft-slide-mask": "scale-handoff",
  "depth-slide": "texture-wipe",
  "card-swipe-stack": "directional-push",
  crossfade: "soft-dissolve",
  fade: "soft-dissolve",
  push: "directional-push",
  wipe: "texture-wipe",
  cut: "cut",
};

export function isLegacyTransitionPreset(presetId: TransitionPresetId): boolean {
  return TRANSITION_PRESETS[presetId]?.legacy === true;
}

export function isTransitionPresetCompatible(
  presetId: TransitionPresetId,
  compatibleList: string[],
): boolean {
  if (compatibleList.includes(presetId)) return true;
  const preset = TRANSITION_PRESETS[presetId];
  if (!preset) return false;
  return compatibleList.includes(preset.type);
}

export function pickSafeFallbackPreset(
  compatibleList: string[],
  brandPresetId?: string,
): TransitionPresetId {
  for (const presetId of SAFE_FALLBACK_PRESET_IDS) {
    if (isTransitionPresetCompatible(presetId, compatibleList)) {
      return presetId;
    }
  }

  const brandDefault = brandPresetId
    ? BRAND_KIT_TRANSITION_DEFAULTS[brandPresetId]?.preset
    : undefined;

  if (
    brandDefault &&
    !isLegacyTransitionPreset(brandDefault) &&
    isTransitionPresetCompatible(brandDefault, compatibleList)
  ) {
    return brandDefault;
  }

  if (compatibleList.includes("cut")) return "cut";
  return DEFAULT_TRANSITION_PRESET_ID;
}

export function getTransitionPreset(id: string): TransitionPreset {
  return TRANSITION_PRESETS[id as TransitionPresetId] ?? TRANSITION_PRESETS[DEFAULT_TRANSITION_PRESET_ID];
}

export function presetToTransitionDefinition(preset: TransitionPreset): TransitionDefinition {
  return {
    id: preset.id,
    name: preset.name,
    type: preset.type,
    defaultDuration: preset.defaultDuration,
    defaultDirection: preset.defaultDirection,
    defaultOverlap: preset.defaultOverlap,
    defaultEasingId: preset.defaultEasingId,
  };
}

export function resolveBrandTransitionPreset(
  brandKitTransitionPrimary?: string,
  fallback: TransitionPresetId = DEFAULT_TRANSITION_PRESET_ID,
): TransitionPresetId {
  if (!brandKitTransitionPrimary) return fallback;
  return BRAND_TRANSITION_MAP[brandKitTransitionPrimary] ?? fallback;
}

/** Brand-specific default transition preferences (V2-first). */
export const BRAND_KIT_TRANSITION_DEFAULTS: Record<
  string,
  { preset: TransitionPresetId; easingId?: string; intensity?: "soft" | "medium" | "controlled" | "high" }
> = {
  "default-dark": { preset: "soft-dissolve", easingId: "ease-out", intensity: "medium" },
  nimbo: { preset: "scale-handoff", easingId: "soft-reveal", intensity: "soft" },
  ledgerly: { preset: "texture-wipe", easingId: "sharp-in-out", intensity: "controlled" },
  draftly: { preset: "directional-push", easingId: "expressive-out", intensity: "high" },
};
