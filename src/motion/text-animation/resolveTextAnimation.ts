import {
  getTextAnimationPreset,
} from "@/config/text-animations/presets";
import {
  getBrandDefaultTextPresetId,
  getMotionEnergyIntensityScale,
  getTextAnimationMode,
  instanceToUserControls,
  normalizeBrandTextAnimationDefaults,
} from "@/lib/text-animation";
import { getEasingPreset, normalizeBrandMotion, resolveBlockEntranceEasing } from "@/lib/easing";
import {
  filterUnitsByWordIndices,
  getAnimatableUnits,
  splitText,
} from "@/lib/text-split";
import type { BrandPreset } from "@/types/brand";
import type { EffectTarget } from "@/types/effects";
import type { MotionBlockInstance } from "@/types/motion-block";
import type {
  ResolvedTextAnimation,
  TextAnimationInstance,
  TextAnimationTarget,
  TextAnimationUserControls,
} from "@/types/text-animation";
import {
  applyBrandModifiersToProperties,
  applyBrandModifiersToSelector,
  getBrandMotionMultipliers,
  getReducedMotionProperties,
  getReducedMotionSelector,
} from "./brand-modifiers";
import { computeUnitTimings } from "./selector";

export type ResolveTextAnimationOptions = {
  reducedMotion?: boolean;
  startFrame?: number;
};

function findTextAnimationInstance(
  block: MotionBlockInstance,
  slot: EffectTarget,
): TextAnimationInstance | undefined {
  return (block.textAnimations ?? []).find((instance) => instance.target === slot);
}

function resolveControls(
  instance: TextAnimationInstance | undefined,
  brand: BrandPreset,
  slot: EffectTarget,
  mode: ReturnType<typeof getTextAnimationMode>,
): { presetId: string; controls: TextAnimationUserControls } {
  if (mode === "custom" && instance) {
    return {
      presetId: instance.presetId ?? getBrandDefaultTextPresetId(brand, slot),
      controls: instanceToUserControls(instance),
    };
  }

  return {
    presetId: getBrandDefaultTextPresetId(brand, slot),
    controls: {},
  };
}

export function resolveTextAnimation(
  brand: BrandPreset,
  block: MotionBlockInstance,
  slot: EffectTarget,
  text: string,
  options: ResolveTextAnimationOptions = {},
): ResolvedTextAnimation | null {
  const instance = findTextAnimationInstance(block, slot);
  const mode = getTextAnimationMode(block.textAnimations, slot);

  if (mode === "none") return null;

  const brandDefaults = normalizeBrandTextAnimationDefaults(brand.motion.textAnimation);

  if (options.reducedMotion && brandDefaults.reducedMotionBehavior === "disable") {
    return null;
  }

  const { presetId, controls } = resolveControls(instance, brand, slot, mode);
  const preset = getTextAnimationPreset(presetId);
  const brandMotion = normalizeBrandMotion(brand.motion);
  const energyScale = getMotionEnergyIntensityScale(brandDefaults.motionEnergy);
  const multipliers = getBrandMotionMultipliers(brand.personality, brandMotion.intensity * energyScale);

  const staggerMultiplier = brandDefaults.staggerMultiplier ?? 1;
  const durationMultiplier = brandDefaults.speedMultiplier ?? brandDefaults.durationMultiplier ?? 1;

  const respectReducedMotion =
    instance?.advanced?.respectReducedMotion ?? preset.brandBehavior.respectReducedMotion;

  const reducedMotion = options.reducedMotion === true && respectReducedMotion;

  const selector = reducedMotion
    ? getReducedMotionSelector(
        applyBrandModifiersToSelector(
          preset.selector,
          multipliers,
          controls,
          staggerMultiplier,
          durationMultiplier,
        ),
      )
    : applyBrandModifiersToSelector(
        preset.selector,
        multipliers,
        controls,
        staggerMultiplier,
        durationMultiplier,
      );

  const properties = reducedMotion
    ? getReducedMotionProperties()
    : applyBrandModifiersToProperties(preset.properties, preset, multipliers, controls);

  const target: TextAnimationTarget =
    controls.target ?? instance?.advanced?.targetUnit ?? preset.target;
  const units = filterUnitsByWordIndices(
    splitText(text, target, { respectNewlines: true }),
    controls.wordIndices,
  );
  const animatable = getAnimatableUnits(units);

  const unitTimings = computeUnitTimings(
    animatable.length,
    selector.direction,
    selector.stagger,
    selector.duration,
    selector.delay,
    instance?.advanced?.randomizeOrder ? (instance.advanced.randomSeed ?? selector.randomSeed) : selector.randomSeed,
  );

  const entranceEasing = resolveBlockEntranceEasing(brand, block);
  const brandTextEasing = brandDefaults.defaultEasing;
  const easingId =
    controls.easingId ??
    instance?.advanced?.easingId ??
    (preset.selector.easing === "inherit"
      ? brandTextEasing ?? entranceEasing.id
      : preset.selector.easing);

  const useBrandColors = instance?.advanced?.useBrandColors ?? preset.brandBehavior.useBrandColors;

  return {
    presetId: preset.id,
    presetName: preset.name,
    target,
    properties,
    unitTimings,
    easingId,
    renderer: preset.renderer ?? "standard",
    colors: {
      accent:
        !useBrandColors && instance?.advanced?.accentColor
          ? String(instance.advanced.accentColor)
          : instance?.advanced?.highlightColor && !useBrandColors
            ? instance.advanced.highlightColor
            : brand.colors.accent,
      primary: brand.colors.foreground,
      foreground: brand.colors.foreground,
    },
    reducedMotion,
    startFrame: options.startFrame ?? 0,
    wordIndices: controls.wordIndices,
  };
}

export function hasTextAnimation(
  brand: BrandPreset,
  block: MotionBlockInstance,
  slot: EffectTarget,
): boolean {
  const mode = getTextAnimationMode(block.textAnimations, slot);
  if (mode === "none") return false;
  return Boolean(getBrandDefaultTextPresetId(brand, slot));
}

export function getResolvedEasingFunction(resolved: ResolvedTextAnimation) {
  return getEasingPreset(resolved.easingId);
}
