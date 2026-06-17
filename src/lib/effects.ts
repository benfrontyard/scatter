import { createBrandEffects } from "@/config/effects/defaults";
import type { BrandEffects, EffectInstance, EffectTarget, StarterEffectId } from "@/types/effects";
import {
  effectDefinitionMap,
  getDefaultEffectValues,
  getEffectDefinition,
  isEffectCompatibleWithTarget,
} from "@/motion/effects/effect-definitions";
import { getBrandDefaultValuesFromEffects } from "@/motion/effects/resolveEffects";

export {
  createBrandEffects,
  defaultBrandEffects,
  editorialBrandEffects,
  saasBrandEffects,
} from "@/config/effects/defaults";

export {
  EFFECT_DEFINITIONS,
  effectDefinitionMap,
  getDefaultEffectValues,
  getEffectDefinition,
  isEffectCompatibleWithTarget,
} from "@/motion/effects/effect-definitions";

export {
  applyEffect,
  applyEffects,
  applyEffectsToCss,
  BLUR_WARNING_THRESHOLD,
  MAX_BLUR_PX,
} from "@/motion/effects/applyEffects";

export {
  createEffectInstanceFromBrandDefault,
  getBrandDefaultValuesForEffect,
  getBrandDefaultValuesFromEffects,
  resolveBlockEffects,
  resolveEnabledTargetEffects,
  resolveTargetEffects,
} from "@/motion/effects/resolveEffects";

function isStructuredBrandEffects(value: unknown): value is BrandEffects {
  return (
    typeof value === "object" &&
    value !== null &&
    "defaultShadow" in value &&
    "defaultRadius" in value &&
    "defaultStroke" in value &&
    "defaultBlur" in value &&
    "defaultGlass" in value &&
    "defaultImageTreatment" in value
  );
}

export function normalizeBrandEffects(effects: unknown): BrandEffects {
  if (isStructuredBrandEffects(effects)) {
    return createBrandEffects(effects);
  }
  return createBrandEffects();
}

export function normalizeBlockEffects(effects: unknown): EffectInstance[] {
  if (!Array.isArray(effects)) return [];
  return effects.filter(isValidEffectInstance);
}

function isValidEffectInstance(value: unknown): value is EffectInstance {
  if (typeof value !== "object" || value === null) return false;
  const instance = value as EffectInstance;
  return (
    typeof instance.id === "string" &&
    typeof instance.effectId === "string" &&
    typeof instance.target === "string" &&
    typeof instance.enabled === "boolean" &&
    typeof instance.values === "object" &&
    instance.values !== null &&
    getEffectDefinition(instance.effectId) !== undefined
  );
}

export function createEffectInstance(
  effectId: StarterEffectId,
  target: EffectTarget,
  values?: Record<string, unknown>,
  enabled = true,
): EffectInstance {
  return {
    id: crypto.randomUUID(),
    effectId,
    target,
    enabled,
    values: {
      ...getDefaultEffectValues(effectId),
      ...values,
    },
  };
}

export function getCompatibleEffectsForTarget(target: EffectTarget): StarterEffectId[] {
  return Object.keys(effectDefinitionMap).filter((effectId) =>
    isEffectCompatibleWithTarget(effectId as StarterEffectId, target),
  ) as StarterEffectId[];
}

export function upsertBlockEffect(
  effects: EffectInstance[],
  instance: EffectInstance,
): EffectInstance[] {
  const index = effects.findIndex(
    (entry) =>
      entry.id === instance.id ||
      (entry.target === instance.target && entry.effectId === instance.effectId),
  );

  if (index === -1) return [...effects, instance];

  const next = [...effects];
  next[index] = instance;
  return next;
}

export function removeBlockEffect(
  effects: EffectInstance[],
  instanceId: string,
): EffectInstance[] {
  return effects.filter((entry) => entry.id !== instanceId);
}

export function toggleBlockEffect(
  effects: EffectInstance[],
  instanceId: string,
  enabled: boolean,
): EffectInstance[] {
  return effects.map((entry) => (entry.id === instanceId ? { ...entry, enabled } : entry));
}

export function resetBlockTargetEffectsToBrandDefaults(
  blockEffects: EffectInstance[],
  target: EffectTarget,
  brandEffects: BrandEffects,
): EffectInstance[] {
  const withoutTarget = blockEffects.filter((entry) => entry.target !== target);
  const brandInstances: EffectInstance[] = [];

  for (const effectId of Object.keys(effectDefinitionMap) as StarterEffectId[]) {
    if (!isEffectCompatibleWithTarget(effectId, target)) continue;

    const values = getBrandDefaultValuesFromEffects(brandEffects, target, effectId);
    if (!values) continue;

    brandInstances.push(createEffectInstance(effectId, target, values, true));
  }

  return [...withoutTarget, ...brandInstances];
}

export function clearTargetEffectOverrides(
  effects: EffectInstance[],
  target: EffectTarget,
): EffectInstance[] {
  return effects.filter((entry) => entry.target !== target);
}

export function hasTargetEffectOverrides(
  effects: EffectInstance[] | undefined,
  target: EffectTarget,
): boolean {
  return (effects ?? []).some((entry) => entry.target === target);
}

export function setBlockEffectOverride(
  effects: EffectInstance[],
  target: EffectTarget,
  effectId: StarterEffectId,
  patch: { values?: Record<string, unknown>; enabled?: boolean },
  brand: { effects: BrandEffects },
): EffectInstance[] {
  const existing = effects.find(
    (entry) => entry.target === target && entry.effectId === effectId,
  );

  if (existing) {
    return upsertBlockEffect(effects, {
      ...existing,
      enabled: patch.enabled ?? existing.enabled,
      values: { ...existing.values, ...patch.values },
    });
  }

  const brandValues = getBrandDefaultValuesFromEffects(brand.effects, target, effectId);

  return upsertBlockEffect(
    effects,
    createEffectInstance(
      effectId,
      target,
      { ...brandValues, ...patch.values },
      patch.enabled ?? true,
    ),
  );
}
