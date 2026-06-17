import { getEasingFunction, getEasingPreset, getAllEasingPresets, legacyEasingToId, normalizeBrandMotion } from "@/lib/easing";
import type { BrandMotion, EasingName, MotionBehaviorName } from "@/types";
import { interpolate } from "remotion";

export function getEasing(easing: EasingName | string) {
  const presetIds = new Set(getAllEasingPresets().map((p) => p.id));
  const id = presetIds.has(easing) ? easing : legacyEasingToId(easing as EasingName);
  return getEasingFunction(getEasingPreset(id));
}

export function getBrandEasing(brandMotion: BrandMotion) {
  const motion = normalizeBrandMotion(brandMotion);
  return getEasingFunction(getEasingPreset(motion.entranceEasingId));
}

export function applyBehaviorOpacity(
  behavior: MotionBehaviorName,
  localFrame: number,
  phaseFrames: number,
  brandMotion: BrandMotion,
): number {
  if (phaseFrames <= 0) return 1;

  const progress = localFrame / phaseFrames;
  const easedProgress = interpolate(progress, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
    easing: getBrandEasing(brandMotion),
  });

  switch (behavior) {
    case "fade":
    case "scale-in":
    case "slide-up":
    case "slide-down":
      return interpolate(easedProgress, [0, 1], [0, 1], { extrapolateRight: "clamp" });
    case "fade-out":
    case "slide-out":
      return interpolate(easedProgress, [0, 1], [1, 0], { extrapolateRight: "clamp" });
    case "hold":
    default:
      return 1;
  }
}

export function applyBehaviorTransform(
  behavior: MotionBehaviorName,
  localFrame: number,
  phaseFrames: number,
  formatHeight: number,
  brandMotion: BrandMotion,
): string {
  if (phaseFrames <= 0) return "none";

  const progress = localFrame / phaseFrames;
  const intensity = brandMotion.intensity;
  const directionMultiplier =
    brandMotion.directionBias === "down" || brandMotion.directionBias === "left" ? -1 : 1;

  switch (behavior) {
    case "scale-in": {
      const scale = interpolate(progress, [0, 1], [0.6, 1], { extrapolateRight: "clamp" });
      const adjusted = 1 - (1 - scale) * intensity;
      return `scale(${adjusted})`;
    }
    case "slide-up": {
      const distance = formatHeight * 0.08 * intensity * directionMultiplier;
      const y = interpolate(progress, [0, 1], [distance, 0], { extrapolateRight: "clamp" });
      return `translateY(${y}px)`;
    }
    case "slide-down": {
      const distance = formatHeight * 0.08 * intensity * -directionMultiplier;
      const y = interpolate(progress, [0, 1], [distance, 0], { extrapolateRight: "clamp" });
      return `translateY(${y}px)`;
    }
    case "slide-out": {
      const y = interpolate(progress, [0, 1], [0, -formatHeight * 0.06 * intensity], {
        extrapolateRight: "clamp",
      });
      return `translateY(${y}px)`;
    }
    default:
      return "none";
  }
}

export function getBlockMotionStyle(
  localFrame: number,
  duration: number,
  inBehavior: MotionBehaviorName,
  mainBehavior: MotionBehaviorName,
  outBehavior: MotionBehaviorName,
  inRatio: number,
  mainRatio: number,
  outRatio: number,
  formatHeight: number,
  brandMotion: BrandMotion,
) {
  const speed = brandMotion.speed;
  const total = (inRatio + mainRatio + outRatio) / speed;
  const inFrames = Math.round((inRatio / speed / total) * duration);
  const outFrames = Math.round((outRatio / speed / total) * duration);
  const mainFrames = Math.max(duration - inFrames - outFrames, 0);

  let behavior: MotionBehaviorName = mainBehavior;
  let phaseFrame = localFrame;
  let phaseFrames = mainFrames;

  if (localFrame < inFrames) {
    behavior = inBehavior;
    phaseFrame = localFrame;
    phaseFrames = inFrames;
  } else if (localFrame >= duration - outFrames) {
    behavior = outBehavior;
    phaseFrame = localFrame - (duration - outFrames);
    phaseFrames = outFrames;
  } else {
    behavior = mainBehavior;
    phaseFrame = localFrame - inFrames;
    phaseFrames = mainFrames;
  }

  const opacity = applyBehaviorOpacity(behavior, phaseFrame, phaseFrames, brandMotion);
  const transform = applyBehaviorTransform(
    behavior,
    phaseFrame,
    phaseFrames,
    formatHeight,
    brandMotion,
  );

  return { opacity, transform };
}
