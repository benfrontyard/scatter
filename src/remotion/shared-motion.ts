import { Easing, interpolate } from "remotion";

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

export const BRAND_EASING = Easing.out(Easing.cubic);

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
): number {
  if (enterFrames <= 0) return 1;
  const speedFactor = SPEED_MAP[speed];
  const adjustedFrames = Math.max(Math.round(enterFrames * speedFactor), 1);
  const localFrame = frame - start;
  if (localFrame <= 0) return 0;
  if (localFrame >= adjustedFrames) return 1;

  return interpolate(localFrame, [0, adjustedFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: BRAND_EASING,
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

export function getMaskReveal(progress: number): string {
  const inset = interpolate(progress, [0, 1], [100, 0], { extrapolateRight: "clamp" });
  return `inset(0 0 ${inset}% 0 round 0)`;
}

export function getOutroOpacity(frame: number, duration: number, outroRatio = 0.12): number {
  const outroStart = Math.round(duration * (1 - outroRatio));
  if (frame < outroStart) return 1;

  return interpolate(frame, [outroStart, duration - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
}

export function getIntroTiming(duration: number, stagger: number, speed: MotionSpeed) {
  const speedFactor = SPEED_MAP[speed];
  const introFrames = Math.round(duration * 0.45 * speedFactor);
  const enterFrames = Math.max(Math.round(introFrames * 0.6), 12);

  return {
    enterFrames,
    primaryStart: 0,
    secondaryStart: Math.round(enterFrames * 0.2) + stagger,
    tertiaryStart: Math.round(enterFrames * 0.2) + stagger * 2,
  };
}
