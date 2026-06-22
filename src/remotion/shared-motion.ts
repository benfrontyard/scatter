import {
  getEasingFunction,
  normalizeBrandMotion,
  resolveBlockEntranceEasing,
  resolveBlockExitEasing,
} from "@/lib/easing";
import type { EasingPreset } from "@/types/easing";
import { interpolate } from "remotion";
import type { BrandPreset, MotionBlockInstance } from "@/types";

export type MotionDirection = "up" | "down" | "left" | "right";
export type MotionIntensity = "subtle" | "standard" | "hero";
export type MotionSpeed = "calm" | "standard" | "energetic";

const INTENSITY_MAP: Record<MotionIntensity, { distance: number; scale: number }> = {
  subtle: { distance: 0.04, scale: 0.04 },
  standard: { distance: 0.07, scale: 0.06 },
  hero: { distance: 0.12, scale: 0.1 },
};

const SPEED_MAP: Record<MotionSpeed, number> = {
  calm: 1.35,
  standard: 1,
  energetic: 0.7,
};

export function parseMotionDirection(value: unknown): MotionDirection {
  if (value === "down" || value === "left" || value === "right") return value;
  return "up";
}

export function parseMotionIntensity(value: unknown): MotionIntensity {
  if (value === "subtle" || value === "hero") return value;
  return "standard";
}

export function parseMotionSpeed(value: unknown): MotionSpeed {
  if (value === "calm" || value === "energetic") return value;
  return "standard";
}

export function getSpeedFactor(speed: MotionSpeed): number {
  return SPEED_MAP[speed];
}

export function getEnterProgress(
  frame: number,
  start: number,
  enterFrames: number,
  speed: MotionSpeed,
  easingPreset?: EasingPreset,
): number {
  if (enterFrames <= 0) return 1;
  const speedFactor = SPEED_MAP[speed];
  const adjustedFrames = Math.max(Math.round(enterFrames * speedFactor), 1);
  const localFrame = frame - start;
  if (localFrame <= 0) return 0;
  if (localFrame >= adjustedFrames) return 1;

  const easingFn = easingPreset ? getEasingFunction(easingPreset) : undefined;

  return interpolate(localFrame, [0, adjustedFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    ...(easingFn ? { easing: easingFn } : {}),
  });
}

export function getFadeOpacity(progress: number): number {
  return interpolate(progress, [0, 1], [0, 1], { extrapolateRight: "clamp" });
}

export function getTranslate(
  progress: number,
  direction: MotionDirection,
  formatWidth: number,
  formatHeight: number,
  intensity: MotionIntensity,
): { x: number; y: number } {
  const { distance: distanceRatio } = INTENSITY_MAP[intensity];
  const distanceX = formatWidth * distanceRatio;
  const distanceY = formatHeight * distanceRatio;
  const offset = 1 - progress;

  switch (direction) {
    case "down":
      return { x: 0, y: -distanceY * offset };
    case "left":
      return { x: distanceX * offset, y: 0 };
    case "right":
      return { x: -distanceX * offset, y: 0 };
    case "up":
    default:
      return { x: 0, y: distanceY * offset };
  }
}

export function getScale(progress: number, intensity: MotionIntensity): number {
  const { scale: scaleDelta } = INTENSITY_MAP[intensity];
  const from = 1 - scaleDelta;
  return interpolate(progress, [0, 1], [from, 1], { extrapolateRight: "clamp" });
}

/** Premium settle with subtle anticipation and overshoot — not cartoony. */
export function getScaleWithSettle(progress: number, intensity: MotionIntensity): number {
  const { scale: scaleDelta } = INTENSITY_MAP[intensity];
  const from = 1 - scaleDelta;
  const compress = from * 0.985;
  const overshoot =
    intensity === "hero" ? 1.018 : intensity === "standard" ? 1.012 : 1.006;

  if (progress <= 0) return compress;
  if (progress >= 1) return 1;

  return interpolate(progress, [0, 0.12, 0.78, 1], [compress, from, overshoot, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function getMaskReveal(progress: number): string {
  const inset = interpolate(progress, [0, 1], [100, 0], { extrapolateRight: "clamp" });
  return `inset(0 0 ${inset}% 0 round 0)`;
}

export function getOutroOpacity(
  frame: number,
  duration: number,
  outroRatio = 0.12,
  easingPreset?: EasingPreset,
  transitionOverlapFrames = 0,
): number {
  // Sequence transition overlay handles the handoff — avoid double-fading layers.
  if (transitionOverlapFrames > 0) {
    const overlapStart = Math.max(duration - transitionOverlapFrames, 0);
    if (frame >= overlapStart) return 1;
  }

  const outroFrames = Math.round(duration * outroRatio);
  if (outroFrames <= 0) return 1;

  const overlapStart =
    transitionOverlapFrames > 0 ? Math.max(duration - transitionOverlapFrames, 0) : duration;
  const outroEnd = Math.min(duration - 1, overlapStart);
  const outroStart = Math.max(0, outroEnd - outroFrames);

  if (frame < outroStart) return 1;

  const easingFn = easingPreset ? getEasingFunction(easingPreset) : undefined;

  return interpolate(frame, [outroStart, outroEnd], [1, 0.92], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    ...(easingFn ? { easing: easingFn } : {}),
  });
}

export function getIntroTiming(duration: number, stagger: number, speed: MotionSpeed) {
  const speedFactor = SPEED_MAP[speed];
  const introFrames = Math.round(duration * 0.45 * speedFactor);
  const enterFrames = Math.max(Math.round(introFrames * 0.6), 12);
  const staggerOffset = Math.round(enterFrames * 0.32);

  return {
    enterFrames,
    primaryStart: 0,
    secondaryStart: staggerOffset + stagger,
    tertiaryStart: staggerOffset + stagger * 2,
  };
}

export function resolveBlockMotionParams(brand: BrandPreset, block: MotionBlockInstance) {
  const motion = normalizeBrandMotion(brand.motion);
  const direction = parseMotionDirection(
    block.motion.controls.direction ?? motion.directionBias,
  );
  const intensity = parseMotionIntensity(block.motion.controls.intensity);
  const speed = parseMotionSpeed(block.motion.controls.speed);
  const stagger = Math.round(
    Number(block.motion.controls.stagger ?? motion.stagger) * motion.speed,
  );
  const entranceEasing = resolveBlockEntranceEasing(brand, block);
  const exitEasing = resolveBlockExitEasing(brand, block);

  return { direction, intensity, speed, stagger, brand, entranceEasing, exitEasing };
}
