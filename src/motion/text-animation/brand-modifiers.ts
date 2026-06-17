import type { BrandPersonality } from "@/types/brand";
import type {
  AnimatableProperty,
  TextAnimationBrandBehavior,
  TextAnimationPreset,
  TextAnimationProperties,
  TextAnimationUserControls,
} from "@/types/text-animation";

export type BrandMotionMultipliers = {
  y: number;
  x: number;
  blur: number;
  rotate: number;
  stagger: number;
  scale: number;
  duration: number;
};

const PERSONALITY_MULTIPLIERS: Record<BrandPersonality, BrandMotionMultipliers> = {
  calm: { y: 0.6, x: 0.7, blur: 0, rotate: 0, stagger: 1.2, scale: 0.9, duration: 1.15 },
  precise: { y: 0.85, x: 0.85, blur: 0.3, rotate: 0.2, stagger: 0.9, scale: 0.95, duration: 1 },
  editorial: { y: 0.75, x: 0.8, blur: 0.2, rotate: 0, stagger: 1.1, scale: 0.92, duration: 1.1 },
  playful: { y: 1.2, x: 1.15, blur: 1, rotate: 1.3, stagger: 0.85, scale: 1.1, duration: 0.9 },
  premium: { y: 0.75, x: 0.8, blur: 0.3, rotate: 0, stagger: 1.05, scale: 0.95, duration: 1.05 },
};

const BEHAVIOR_INTENSITY_SCALE: Record<TextAnimationBrandBehavior["intensity"], number> = {
  subtle: 0.7,
  balanced: 1,
  expressive: 1.25,
};

const PROPERTY_MULTIPLIER_KEY: Partial<Record<AnimatableProperty, keyof BrandMotionMultipliers>> = {
  y: "y",
  x: "x",
  blur: "blur",
  rotate: "rotate",
  scale: "scale",
  tracking: "scale",
};

export function getBrandMotionMultipliers(
  personality: BrandPersonality | undefined,
  brandIntensity: number,
): BrandMotionMultipliers {
  const base = PERSONALITY_MULTIPLIERS[personality ?? "precise"];
  const intensityFactor = 0.75 + brandIntensity * 0.5;

  return {
    y: base.y * intensityFactor,
    x: base.x * intensityFactor,
    blur: base.blur * intensityFactor,
    rotate: base.rotate * intensityFactor,
    stagger: base.stagger,
    scale: base.scale * intensityFactor,
    duration: base.duration,
  };
}

function scaleTuple(
  value: [number, number],
  property: AnimatableProperty,
  multipliers: BrandMotionMultipliers,
  behaviorScale: number,
  userIntensity: number,
): [number, number] {
  const key = PROPERTY_MULTIPLIER_KEY[property];
  const multiplier = key ? multipliers[key] : 1;
  const scale = multiplier * behaviorScale * (0.6 + userIntensity * 0.8);

  if (property === "opacity" || property === "scale") {
    if (property === "scale") {
      const delta = value[1] - value[0];
      return [value[0], value[0] + delta * scale];
    }
    return value;
  }

  return [value[0] * scale, value[1] * scale];
}

export function applyBrandModifiersToProperties(
  properties: TextAnimationProperties,
  preset: TextAnimationPreset,
  multipliers: BrandMotionMultipliers,
  controls: TextAnimationUserControls,
): TextAnimationProperties {
  const behaviorScale = BEHAVIOR_INTENSITY_SCALE[preset.brandBehavior.intensity];
  const userIntensity = controls.intensity ?? 0.65;

  const next: TextAnimationProperties = { ...properties };

  for (const key of Object.keys(properties) as AnimatableProperty[]) {
    const value = properties[key];
    if (!value || typeof value !== "object" || !Array.isArray(value)) continue;
    next[key] = scaleTuple(value, key, multipliers, behaviorScale, userIntensity);
  }

  if (properties.clipReveal) {
    next.clipReveal = properties.clipReveal;
  }

  return next;
}

export function applyBrandModifiersToSelector(
  selector: TextAnimationPreset["selector"],
  multipliers: BrandMotionMultipliers,
  controls: TextAnimationUserControls,
  brandStaggerMultiplier = 1,
  brandDurationMultiplier = 1,
): TextAnimationPreset["selector"] {
  const speed = controls.speed ?? 1;
  const durationScale = multipliers.duration * brandDurationMultiplier * (1 / speed);
  const staggerScale = multipliers.stagger * brandStaggerMultiplier * (1 / speed);

  return {
    ...selector,
    direction: controls.direction ?? selector.direction,
    stagger: Math.round((controls.stagger ?? selector.stagger) * staggerScale),
    duration: Math.round((controls.duration ?? selector.duration) * durationScale),
    delay: Math.round((controls.delay ?? selector.delay) * durationScale),
    randomSeed: controls.randomSeed ?? selector.randomSeed,
  };
}

export function getReducedMotionProperties(): TextAnimationProperties {
  return { opacity: [0, 1] };
}

export function getReducedMotionSelector(
  selector: TextAnimationPreset["selector"],
): TextAnimationPreset["selector"] {
  return {
    ...selector,
    stagger: 0,
    duration: 10,
    delay: selector.delay,
  };
}
