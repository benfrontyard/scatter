import {
  DEFAULT_TEXT_ANIMATION_PRESET_ID,
  getTextAnimationPreset,
  textAnimationPresetMap,
} from "@/config/text-animations/presets";
import type { BrandPreset } from "@/types/brand";
import type { EffectTarget } from "@/types/effects";
import type {
  BrandTextAnimationDefaults,
  MotionEnergy,
  SelectorDirection,
  TextAnimationAdvancedControls,
  TextAnimationInstance,
  TextAnimationMode,
  TextAnimationPreset,
  TextAnimationUserControls,
} from "@/types/text-animation";

export {
  TEXT_ANIMATION_PRESETS,
  DEFAULT_TEXT_ANIMATION_PRESET_ID,
  getTextAnimationPreset,
  textAnimationPresetMap,
} from "@/config/text-animations/presets";

export {
  TEXT_ANIMATION_CATEGORIES,
  TEXT_ANIMATION_CATEGORY_LABELS,
} from "@/config/text-animations/categories";

export {
  resolveTextAnimation,
  hasTextAnimation,
  applyTextAnimationAtFrame,
} from "@/motion/text-animation";

export { splitText, getAnimatableUnits } from "@/lib/text-split";

const DIRECTION_LABELS: Record<SelectorDirection, string> = {
  ltr: "Left to right",
  rtl: "Right to left",
  centerOut: "Center out",
  edgesIn: "Edges in",
  random: "Random",
};

const MOTION_ENERGY_LABELS: Record<MotionEnergy, string> = {
  calm: "Calm",
  balanced: "Balanced",
  expressive: "Expressive",
};

const DEFAULT_BRAND_TEXT_ANIMATION: Required<
  Pick<
    BrandTextAnimationDefaults,
    | "defaultPresetId"
    | "motionEnergy"
    | "speedMultiplier"
    | "staggerMultiplier"
    | "defaultRevealStyle"
    | "reducedMotionBehavior"
    | "allowedPresetFamilies"
  >
> = {
  defaultPresetId: DEFAULT_TEXT_ANIMATION_PRESET_ID,
  motionEnergy: "balanced",
  speedMultiplier: 1,
  staggerMultiplier: 1,
  defaultRevealStyle: "fade",
  reducedMotionBehavior: "simple-fade",
  allowedPresetFamilies: ["subtle", "editorial", "kinetic", "flick", "premium", "utility"],
};

export function normalizeBrandTextAnimationDefaults(
  defaults: BrandTextAnimationDefaults | undefined,
): BrandTextAnimationDefaults {
  const speedMultiplier =
    defaults?.speedMultiplier ?? defaults?.durationMultiplier ?? DEFAULT_BRAND_TEXT_ANIMATION.speedMultiplier;

  return {
    defaultPresetId: defaults?.defaultPresetId ?? DEFAULT_BRAND_TEXT_ANIMATION.defaultPresetId,
    motionEnergy: defaults?.motionEnergy ?? DEFAULT_BRAND_TEXT_ANIMATION.motionEnergy,
    defaultEasing: defaults?.defaultEasing,
    speedMultiplier,
    durationMultiplier: speedMultiplier,
    staggerMultiplier: defaults?.staggerMultiplier ?? DEFAULT_BRAND_TEXT_ANIMATION.staggerMultiplier,
    defaultRevealStyle: defaults?.defaultRevealStyle ?? DEFAULT_BRAND_TEXT_ANIMATION.defaultRevealStyle,
    reducedMotionBehavior:
      defaults?.reducedMotionBehavior ?? DEFAULT_BRAND_TEXT_ANIMATION.reducedMotionBehavior,
    allowedPresetFamilies:
      defaults?.allowedPresetFamilies ?? DEFAULT_BRAND_TEXT_ANIMATION.allowedPresetFamilies,
    slotDefaults: defaults?.slotDefaults,
  };
}

function migrateLegacyControls(
  controls: TextAnimationUserControls | undefined,
): Pick<TextAnimationInstance, "speed" | "intensity" | "direction" | "advanced"> {
  if (!controls) return {};

  const advanced: TextAnimationAdvancedControls = {
    targetUnit: controls.target,
    duration: controls.duration,
    delay: controls.delay,
    stagger: controls.stagger,
    easingId: controls.easingId,
    randomSeed: controls.randomSeed,
    accentColor: controls.accentColor,
  };

  return {
    speed: controls.speed,
    intensity: controls.intensity,
    direction: controls.direction,
    advanced: Object.values(advanced).some((value) => value !== undefined) ? advanced : undefined,
  };
}

function inferModeFromLegacy(instance: TextAnimationInstance & { enabled?: boolean }): TextAnimationMode {
  if (instance.mode) return instance.mode;
  if (instance.enabled === false) return "none";
  if (instance.presetId || instance.controls) return "custom";
  return "brand-default";
}

export function normalizeTextAnimationInstance(value: unknown): TextAnimationInstance | null {
  if (typeof value !== "object" || value === null) return null;

  const raw = value as TextAnimationInstance & { enabled?: boolean; presetId?: string };
  if (typeof raw.id !== "string" || typeof raw.target !== "string") return null;

  const mode = inferModeFromLegacy(raw);
  const migrated = migrateLegacyControls(raw.controls);

  if (mode === "custom" && raw.presetId && getTextAnimationPreset(raw.presetId) === undefined) {
    return null;
  }

  return {
    id: raw.id,
    target: raw.target,
    mode,
    presetId: raw.presetId,
    speed: raw.speed ?? migrated.speed,
    intensity: raw.intensity ?? migrated.intensity,
    direction: raw.direction ?? migrated.direction,
    advanced: raw.advanced ?? migrated.advanced,
  };
}

export function normalizeBlockTextAnimations(animations: unknown): TextAnimationInstance[] {
  if (!Array.isArray(animations)) return [];
  return animations
    .map(normalizeTextAnimationInstance)
    .filter((instance): instance is TextAnimationInstance => instance !== null);
}

export function createTextAnimationInstance(
  target: EffectTarget,
  mode: TextAnimationMode = "brand-default",
  overrides: Partial<Omit<TextAnimationInstance, "id" | "target" | "mode">> = {},
): TextAnimationInstance {
  return {
    id: crypto.randomUUID(),
    target,
    mode,
    ...overrides,
  };
}

export function upsertTextAnimationInstance(
  animations: TextAnimationInstance[],
  instance: TextAnimationInstance,
): TextAnimationInstance[] {
  const index = animations.findIndex((entry) => entry.target === instance.target);

  if (index === -1) return [...animations, instance];

  const next = [...animations];
  next[index] = instance;
  return next;
}

export function removeTextAnimationForTarget(
  animations: TextAnimationInstance[],
  target: EffectTarget,
): TextAnimationInstance[] {
  return animations.filter((entry) => entry.target !== target);
}

export function getTextAnimationForTarget(
  animations: TextAnimationInstance[] | undefined,
  target: EffectTarget,
): TextAnimationInstance | undefined {
  return (animations ?? []).find((entry) => entry.target === target);
}

export function getTextAnimationMode(
  animations: TextAnimationInstance[] | undefined,
  target: EffectTarget,
): TextAnimationMode {
  const instance = getTextAnimationForTarget(animations, target);
  if (!instance) return "brand-default";
  return instance.mode;
}

export function instanceToUserControls(instance: TextAnimationInstance | undefined): TextAnimationUserControls {
  if (!instance) return {};

  const advanced = instance.advanced ?? {};

  return {
    intensity: instance.intensity,
    speed: instance.speed,
    direction: instance.direction,
    target: advanced.targetUnit,
    stagger: advanced.stagger,
    duration: advanced.duration,
    delay: advanced.delay,
    easingId: advanced.easingId,
    randomSeed: advanced.randomSeed,
    accentColor: advanced.accentColor,
  };
}

export function setTextAnimationMode(
  animations: TextAnimationInstance[],
  target: EffectTarget,
  mode: TextAnimationMode,
  brand: BrandPreset,
): TextAnimationInstance[] {
  const existing = getTextAnimationForTarget(animations, target);

  if (mode === "brand-default") {
    if (!existing) return animations;
    return upsertTextAnimationInstance(animations, { ...existing, mode: "brand-default" });
  }

  if (mode === "none") {
    if (existing) {
      return upsertTextAnimationInstance(animations, { ...existing, mode: "none" });
    }
    return upsertTextAnimationInstance(animations, createTextAnimationInstance(target, "none"));
  }

  const brandDefaults = normalizeBrandTextAnimationDefaults(brand.motion.textAnimation);
  const presetId =
    existing?.presetId ??
    brandDefaults.slotDefaults?.[target] ??
    brandDefaults.defaultPresetId ??
    DEFAULT_TEXT_ANIMATION_PRESET_ID;

  if (existing) {
    return upsertTextAnimationInstance(animations, {
      ...existing,
      mode: "custom",
      presetId,
    });
  }

  return upsertTextAnimationInstance(
    animations,
    createTextAnimationInstance(target, "custom", { presetId }),
  );
}

export function resetTextAnimationToBrandDefault(
  animations: TextAnimationInstance[],
  target: EffectTarget,
): TextAnimationInstance[] {
  return removeTextAnimationForTarget(animations, target);
}

export function setTextAnimationForTarget(
  animations: TextAnimationInstance[],
  target: EffectTarget,
  presetId: string,
  patch: Partial<Omit<TextAnimationInstance, "id" | "target">> = {},
): TextAnimationInstance[] {
  const existing = getTextAnimationForTarget(animations, target);

  if (existing) {
    return upsertTextAnimationInstance(animations, {
      ...existing,
      mode: "custom",
      presetId,
      ...patch,
    });
  }

  return upsertTextAnimationInstance(
    animations,
    createTextAnimationInstance(target, "custom", { presetId, ...patch }),
  );
}

export function updateTextAnimationInstance(
  animations: TextAnimationInstance[],
  target: EffectTarget,
  patch: Partial<Omit<TextAnimationInstance, "id" | "target">>,
): TextAnimationInstance[] {
  const existing = getTextAnimationForTarget(animations, target);

  if (!existing) {
    return upsertTextAnimationInstance(
      animations,
      createTextAnimationInstance(target, "custom", {
        presetId: patch.presetId ?? DEFAULT_TEXT_ANIMATION_PRESET_ID,
        ...patch,
      }),
    );
  }

  return upsertTextAnimationInstance(animations, {
    ...existing,
    mode: existing.mode === "brand-default" ? "custom" : existing.mode,
    ...patch,
    advanced: patch.advanced
      ? { ...existing.advanced, ...patch.advanced }
      : existing.advanced,
  });
}

/** @deprecated Use updateTextAnimationInstance */
export function updateTextAnimationControls(
  animations: TextAnimationInstance[],
  target: EffectTarget,
  patch: TextAnimationUserControls,
): TextAnimationInstance[] {
  return updateTextAnimationInstance(animations, target, {
    intensity: patch.intensity,
    speed: patch.speed,
    direction: patch.direction,
    advanced: {
      targetUnit: patch.target,
      stagger: patch.stagger,
      duration: patch.duration,
      delay: patch.delay,
      easingId: patch.easingId,
      randomSeed: patch.randomSeed,
      accentColor: patch.accentColor,
    },
  });
}

export function getPresetsByCategory(): Record<string, TextAnimationPreset[]> {
  const grouped: Record<string, TextAnimationPreset[]> = {};

  for (const preset of Object.values(textAnimationPresetMap)) {
    if (!grouped[preset.category]) grouped[preset.category] = [];
    grouped[preset.category].push(preset);
  }

  return grouped;
}

export function getBrandDefaultTextPresetId(brand: BrandPreset, slot: EffectTarget): string {
  const defaults = normalizeBrandTextAnimationDefaults(brand.motion.textAnimation);
  return defaults.slotDefaults?.[slot] ?? defaults.defaultPresetId ?? DEFAULT_TEXT_ANIMATION_PRESET_ID;
}

export function getAllowedPresets(brand: BrandPreset): TextAnimationPreset[] {
  const defaults = normalizeBrandTextAnimationDefaults(brand.motion.textAnimation);
  const allowed = new Set(defaults.allowedPresetFamilies);
  return Object.values(textAnimationPresetMap).filter((preset) => allowed.has(preset.category));
}

export function getBrandTextAnimationSummary(
  brand: BrandPreset,
  target: EffectTarget,
): string {
  const defaults = normalizeBrandTextAnimationDefaults(brand.motion.textAnimation);
  const presetId = defaults.slotDefaults?.[target] ?? defaults.defaultPresetId ?? DEFAULT_TEXT_ANIMATION_PRESET_ID;
  const preset = getTextAnimationPreset(presetId);
  const energy = MOTION_ENERGY_LABELS[defaults.motionEnergy ?? "balanced"];
  const direction = DIRECTION_LABELS[preset.selector.direction];

  return `Using Brand Default: ${preset.name} · ${energy} · ${direction}`;
}

export function getMotionEnergyIntensityScale(energy: MotionEnergy | undefined): number {
  switch (energy) {
    case "calm":
      return 0.75;
    case "expressive":
      return 1.25;
    default:
      return 1;
  }
}
