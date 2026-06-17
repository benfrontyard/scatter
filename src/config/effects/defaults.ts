import type { BrandEffects } from "@/types/effects";

export const defaultBrandEffects: BrandEffects = {
  defaultShadow: {
    x: 0,
    y: 12,
    blur: 24,
    spread: 0,
    color: "#000000",
    opacity: 18,
  },
  defaultRadius: {
    card: 16,
    image: 12,
  },
  defaultStroke: {
    width: 1,
    color: "#ffffff",
    opacity: 10,
  },
  defaultBlur: {
    amount: 0,
  },
  defaultGlass: {
    blur: 12,
    opacity: 10,
    tintColor: "#ffffff",
    borderOpacity: 16,
  },
  defaultImageTreatment: {
    opacity: 100,
    radius: 12,
  },
  defaultGrain: {
    amount: 0,
    opacity: 0,
  },
};

export const editorialBrandEffects: BrandEffects = {
  ...defaultBrandEffects,
  defaultShadow: {
    x: 0,
    y: 16,
    blur: 32,
    spread: 0,
    color: "#1a1a1a",
    opacity: 10,
  },
  defaultRadius: {
    card: 8,
    image: 4,
  },
  defaultStroke: {
    width: 1,
    color: "#1a1a1a",
    opacity: 8,
  },
  defaultGlass: {
    blur: 8,
    opacity: 8,
    tintColor: "#faf9f7",
    borderOpacity: 12,
  },
  defaultGrain: {
    amount: 12,
    opacity: 6,
  },
};

export const saasBrandEffects: BrandEffects = {
  ...defaultBrandEffects,
  defaultShadow: {
    x: 0,
    y: 8,
    blur: 32,
    spread: -4,
    color: "#6366f1",
    opacity: 14,
  },
  defaultRadius: {
    card: 20,
    image: 16,
  },
  defaultStroke: {
    width: 1,
    color: "#6366f1",
    opacity: 12,
  },
  defaultBlur: {
    amount: 4,
  },
  defaultGlass: {
    blur: 16,
    opacity: 14,
    tintColor: "#ffffff",
    borderOpacity: 20,
  },
  defaultGrain: {
    amount: 0,
    opacity: 0,
  },
};

export function createBrandEffects(overrides?: Partial<BrandEffects>): BrandEffects {
  return {
    defaultShadow: {
      ...defaultBrandEffects.defaultShadow,
      ...overrides?.defaultShadow,
    },
    defaultRadius: {
      ...defaultBrandEffects.defaultRadius,
      ...overrides?.defaultRadius,
    },
    defaultStroke: {
      ...defaultBrandEffects.defaultStroke,
      ...overrides?.defaultStroke,
    },
    defaultBlur: {
      ...defaultBrandEffects.defaultBlur,
      ...overrides?.defaultBlur,
    },
    defaultGlass: {
      ...defaultBrandEffects.defaultGlass,
      ...overrides?.defaultGlass,
    },
    defaultImageTreatment: {
      ...defaultBrandEffects.defaultImageTreatment,
      ...overrides?.defaultImageTreatment,
    },
    defaultGrain: {
      ...defaultBrandEffects.defaultGrain,
      ...overrides?.defaultGrain,
    },
  };
}
