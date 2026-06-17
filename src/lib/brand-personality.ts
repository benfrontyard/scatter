import type { BrandMotion, BrandPreset, BrandPersonality } from "@/types/brand";

export type { BrandPersonality };

export const BRAND_PERSONALITIES: BrandPersonality[] = [
  "calm",
  "precise",
  "editorial",
  "playful",
  "premium",
];

export const BRAND_PERSONALITY_LABELS: Record<BrandPersonality, string> = {
  calm: "Calm",
  precise: "Precise",
  editorial: "Editorial",
  playful: "Playful",
  premium: "Premium",
};

const PERSONALITY_MOTION: Record<BrandPersonality, Partial<BrandMotion>> = {
  calm: {
    speed: 0.85,
    intensity: 0.75,
    stagger: 12,
    defaultEasingId: "soft-reveal",
    entranceEasingId: "soft-reveal",
    exitEasingId: "calm",
  },
  precise: {
    speed: 1,
    intensity: 0.9,
    stagger: 6,
    defaultEasingId: "ease-in-out",
    entranceEasingId: "ease-in-out",
    exitEasingId: "ease-out",
  },
  editorial: {
    speed: 0.85,
    intensity: 0.75,
    stagger: 12,
    defaultEasingId: "soft-reveal",
    entranceEasingId: "soft-reveal",
    exitEasingId: "calm",
    directionBias: "up",
  },
  playful: {
    speed: 1.15,
    intensity: 1.25,
    stagger: 6,
    defaultEasingId: "snappy",
    entranceEasingId: "snappy",
    exitEasingId: "ease-out",
    directionBias: "left",
  },
  premium: {
    speed: 0.95,
    intensity: 1.1,
    stagger: 10,
    defaultEasingId: "expressive-out",
    entranceEasingId: "expressive-out",
    exitEasingId: "ease-in-out",
    directionBias: "up",
  },
};

export function applyPersonalityToBrand(
  brand: BrandPreset,
  personality: BrandPersonality,
): BrandPreset {
  return {
    ...brand,
    personality,
    motion: {
      ...brand.motion,
      ...PERSONALITY_MOTION[personality],
    },
  };
}

export function exportBrandJson(brand: BrandPreset): string {
  return JSON.stringify(brand, null, 2);
}

export function importBrandJson(json: string): BrandPreset {
  const parsed = JSON.parse(json) as BrandPreset;
  if (!parsed.name || !parsed.colors || !parsed.typography || !parsed.motion || !parsed.effects) {
    throw new Error("Invalid brand JSON.");
  }
  return parsed;
}
