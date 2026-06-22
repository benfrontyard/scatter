import { brandPresetMap, brandPresets } from "@/config/brands";
import { studioBrandPresetMap, studioBrandPresets } from "@/lib/brand-motion-kit-adapter";
import { normalizeBrandColors } from "@/lib/brand-colors";
import { normalizeBrandComposition } from "@/lib/brand-composition";
import { normalizeBrandLogoSystem } from "@/lib/brand-logo";
import { normalizeBrand } from "@/lib/easing";
import { normalizeBrandEffects } from "@/lib/effects";
import { normalizeBrandTypography } from "@/lib/typography";
import type { BrandPreset } from "@/types";

export const CUSTOM_BRAND_ID = "custom";

export function resolveBrand(
  brandPresetId: string,
  customBrands: BrandPreset[],
): BrandPreset {
  let brand: BrandPreset;
  const fallback = studioBrandPresets[0] ?? brandPresets[0];
  if (brandPresetId === CUSTOM_BRAND_ID) {
    brand = customBrands.find((b) => b.id === CUSTOM_BRAND_ID) ?? fallback;
  } else {
    const custom = customBrands.find((b) => b.id === brandPresetId);
    brand =
      custom ??
      studioBrandPresetMap[brandPresetId] ??
      brandPresetMap[brandPresetId] ??
      fallback;
  }

  return normalizeBrand({
    ...brand,
    colors: normalizeBrandColors(brand.colors),
    typography: normalizeBrandTypography(brand.typography),
    composition: normalizeBrandComposition(brand.composition),
    logos: normalizeBrandLogoSystem(brand.logos, brand.name),
    effects: normalizeBrandEffects(brand.effects),
  });
}

export function getAllBrands(customBrands: BrandPreset[]): BrandPreset[] {
  const customIds = new Set(customBrands.map((b) => b.id));
  const demos = studioBrandPresets.filter((b) => !customIds.has(b.id));
  const savedCustom = customBrands.filter((b) => b.id !== CUSTOM_BRAND_ID);
  return [...demos, ...savedCustom];
}

export function duplicateBrandAsCustom(source: BrandPreset): BrandPreset {
  return {
    ...structuredClone(source),
    id: CUSTOM_BRAND_ID,
    name: `${source.name} (Custom)`,
  };
}

export function createEmptyCustomBrand(base?: BrandPreset): BrandPreset {
  const source = base ?? studioBrandPresets[0] ?? brandPresets[0];
  return {
    id: CUSTOM_BRAND_ID,
    name: "Custom Brand",
    colors: normalizeBrandColors(source.colors),
    typography: normalizeBrandTypography(source.typography),
    composition: normalizeBrandComposition(source.composition),
    logos: normalizeBrandLogoSystem(source.logos, source.name),
    effects: normalizeBrandEffects(source.effects),
    motion: { ...source.motion },
  };
}
