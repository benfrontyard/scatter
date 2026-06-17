import type { BrandEffects, EffectInheritanceCategory, EffectInstance, EffectTarget, StarterEffectId } from "@/types/effects";
import type { BrandPreset } from "@/types/brand";
import type { MotionBlockInstance } from "@/types/motion-block";
import { getTargetInheritanceCategories } from "@/config/blocks/effect-targets";
import { getDefaultEffectValues } from "./effect-definitions";
import type { ResolvedEffect, ResolvedTargetEffects } from "./types";

function shadowToValues(shadow: BrandEffects["defaultShadow"]): Record<string, unknown> {
  return { ...shadow };
}

function strokeToValues(stroke: BrandEffects["defaultStroke"]): Record<string, unknown> {
  return { ...stroke };
}

function blurToValues(blur: BrandEffects["defaultBlur"]): Record<string, unknown> {
  return { amount: blur.amount };
}

function glassToValues(glass: BrandEffects["defaultGlass"]): Record<string, unknown> {
  return { ...glass };
}

const CATEGORY_BRAND_DEFAULTS: Record<
  EffectInheritanceCategory,
  Array<{ effectId: StarterEffectId; getValues: (effects: BrandEffects) => Record<string, unknown> }>
> = {
  card: [
    {
      effectId: "corner-radius",
      getValues: (effects) => ({ radius: effects.defaultRadius.card }),
    },
    { effectId: "shadow", getValues: (effects) => shadowToValues(effects.defaultShadow) },
    { effectId: "stroke", getValues: (effects) => strokeToValues(effects.defaultStroke) },
  ],
  image: [
    {
      effectId: "corner-radius",
      getValues: (effects) => ({ radius: effects.defaultRadius.image }),
    },
    {
      effectId: "opacity",
      getValues: (effects) => ({ opacity: effects.defaultImageTreatment.opacity }),
    },
    {
      effectId: "layer-blur",
      getValues: (effects) => blurToValues(effects.defaultBlur),
    },
  ],
  text: [
    {
      effectId: "opacity",
      getValues: () => ({ opacity: 100 }),
    },
  ],
  background: [
    { effectId: "glass", getValues: (effects) => glassToValues(effects.defaultGlass) },
    {
      effectId: "opacity",
      getValues: () => ({ opacity: 100 }),
    },
  ],
  logo: [
    {
      effectId: "opacity",
      getValues: () => ({ opacity: 100 }),
    },
    {
      effectId: "layer-blur",
      getValues: (effects) => blurToValues(effects.defaultBlur),
    },
  ],
};

function getBrandDefaultsForTarget(
  brandEffects: BrandEffects,
  target: EffectTarget,
): Map<StarterEffectId, Record<string, unknown>> {
  const categories = getTargetInheritanceCategories(target);
  const defaults = new Map<StarterEffectId, Record<string, unknown>>();

  for (const category of categories) {
    const entries = CATEGORY_BRAND_DEFAULTS[category];
    for (const entry of entries) {
      if (!defaults.has(entry.effectId)) {
        defaults.set(entry.effectId, entry.getValues(brandEffects));
      }
    }
  }

  return defaults;
}

function mergeEffectValues(
  effectId: StarterEffectId,
  brandValues: Record<string, unknown> | undefined,
  blockValues: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const controlDefaults = getDefaultEffectValues(effectId);
  return {
    ...controlDefaults,
    ...brandValues,
    ...blockValues,
  };
}

export function resolveTargetEffects(
  brand: BrandPreset,
  block: MotionBlockInstance,
  target: EffectTarget,
): ResolvedEffect[] {
  const brandDefaults = getBrandDefaultsForTarget(brand.effects, target);
  const blockInstances = (block.effects ?? []).filter(
    (instance) => instance.target === target,
  );

  const blockByEffectId = new Map<string, EffectInstance>();
  for (const instance of blockInstances) {
    blockByEffectId.set(instance.effectId, instance);
  }

  const effectIds = new Set<StarterEffectId>([
    ...brandDefaults.keys(),
    ...blockInstances.map((instance) => instance.effectId as StarterEffectId),
  ]);

  const resolved: ResolvedEffect[] = [];

  for (const effectId of effectIds) {
    const blockInstance = blockByEffectId.get(effectId);
    const brandValues = brandDefaults.get(effectId);

    if (blockInstance) {
      resolved.push({
        effectId,
        target,
        enabled: blockInstance.enabled,
        values: mergeEffectValues(effectId, brandValues, blockInstance.values),
        source: "block",
        instanceId: blockInstance.id,
      });
      continue;
    }

    if (brandValues) {
      resolved.push({
        effectId,
        target,
        enabled: true,
        values: mergeEffectValues(effectId, brandValues, undefined),
        source: "brand",
      });
    }
  }

  return resolved;
}

export function resolveBlockEffects(
  brand: BrandPreset,
  block: MotionBlockInstance,
  targets: EffectTarget[],
): ResolvedTargetEffects[] {
  return targets.map((target) => ({
    target,
    effects: resolveTargetEffects(brand, block, target),
  }));
}

export function resolveEnabledTargetEffects(
  brand: BrandPreset,
  block: MotionBlockInstance,
  target: EffectTarget,
): ResolvedEffect[] {
  return resolveTargetEffects(brand, block, target).filter((effect) => effect.enabled);
}

export function getBrandDefaultValuesForEffect(
  brand: BrandPreset,
  target: EffectTarget,
  effectId: StarterEffectId,
): Record<string, unknown> | undefined {
  return getBrandDefaultValuesFromEffects(brand.effects, target, effectId);
}

export function getBrandDefaultValuesFromEffects(
  brandEffects: BrandEffects,
  target: EffectTarget,
  effectId: StarterEffectId,
): Record<string, unknown> | undefined {
  return getBrandDefaultsForTarget(brandEffects, target).get(effectId);
}

export function createEffectInstanceFromBrandDefault(
  target: EffectTarget,
  effectId: StarterEffectId,
  brand: BrandPreset,
): EffectInstance | null {
  const brandValues = getBrandDefaultValuesForEffect(brand, target, effectId);
  if (!brandValues) return null;

  return {
    id: crypto.randomUUID(),
    effectId,
    target,
    enabled: true,
    values: structuredClone(brandValues),
  };
}
