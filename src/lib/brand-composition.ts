import { DEFAULT_BRAND_COMPOSITION } from "@/config/composition/defaults";
import type { BrandComposition } from "@/types/brand-composition";

export function normalizeBrandComposition(composition: unknown): BrandComposition {
  if (!composition || typeof composition !== "object") {
    return { ...DEFAULT_BRAND_COMPOSITION };
  }

  const value = composition as Partial<BrandComposition>;

  return {
    style: value.style ?? DEFAULT_BRAND_COMPOSITION.style,
    gridStrength: value.gridStrength ?? DEFAULT_BRAND_COMPOSITION.gridStrength,
    defaultAlignment: value.defaultAlignment ?? DEFAULT_BRAND_COMPOSITION.defaultAlignment,
    density: value.density ?? DEFAULT_BRAND_COMPOSITION.density,
    safeArea: value.safeArea ?? DEFAULT_BRAND_COMPOSITION.safeArea,
    motionComposition:
      value.motionComposition ?? DEFAULT_BRAND_COMPOSITION.motionComposition,
    allowGridBreaks: value.allowGridBreaks ?? DEFAULT_BRAND_COMPOSITION.allowGridBreaks,
  };
}
