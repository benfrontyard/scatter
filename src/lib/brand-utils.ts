import { brandPresetMap, brandPresets } from "@/config/brands";
import { normalizeBrand } from "@/lib/easing";
import type { BrandPreset } from "@/types";

export const CUSTOM_BRAND_ID = "custom";

export function resolveBrand(
  brandPresetId: string,
  customBrands: BrandPreset[],
): BrandPreset {
  if (brandPresetId === CUSTOM_BRAND_ID) {
    const custom = customBrands.find((b) => b.id === CUSTOM_BRAND_ID) ?? brandPresets[0];
    return normalizeBrand(custom);
  }

  const custom = customBrands.find((b) => b.id === brandPresetId);
  if (custom) return normalizeBrand(custom);

  return normalizeBrand(brandPresetMap[brandPresetId] ?? brandPresets[0]);
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
    typography: { ...source.typography },
    motion: { ...source.motion },
  };
}
