import { brandPresetMap, brandPresets } from "@/config/brands";
import { normalizeBrand } from "@/lib/easing";
import { normalizeBrandTypography } from "@/lib/typography";
import type { BrandPreset } from "@/types";

export const CUSTOM_BRAND_ID = "custom";

export function resolveBrand(
  brandPresetId: string,
  customBrands: BrandPreset[],
): BrandPreset {
  let brand: BrandPreset;
  if (brandPresetId === CUSTOM_BRAND_ID) {
    brand = customBrands.find((b) => b.id === CUSTOM_BRAND_ID) ?? brandPresets[0];
  } else {
    const custom = customBrands.find((b) => b.id === brandPresetId);
    brand = custom ?? brandPresetMap[brandPresetId] ?? brandPresets[0];
  }

  return normalizeBrand({
    ...brand,
    typography: normalizeBrandTypography(brand.typography),
  });
}

export function getAllBrands(customBrands: BrandPreset[]): BrandPreset[] {
  const customIds = new Set(customBrands.map((b) => b.id));
  const builtins = brandPresets.filter((b) => !customIds.has(b.id));
  return [...builtins, ...customBrands];
}

export function duplicateBrandAsCustom(source: BrandPreset): BrandPreset {
  return {
    ...structuredClone(source),
    id: CUSTOM_BRAND_ID,
    name: `${source.name} (Custom)`,
  };
}

export function createEmptyCustomBrand(base?: BrandPreset): BrandPreset {
  const source = base ?? brandPresets[0];
  return {
    id: CUSTOM_BRAND_ID,
    name: "Custom Brand",
    colors: { ...source.colors },
    typography: normalizeBrandTypography(source.typography),
    motion: { ...source.motion },
  };
}
