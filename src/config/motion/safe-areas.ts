/** Global safe-area and layout tokens for motion blocks (fractions 0–1). */
export const MOTION_SAFE_AREA_TOKENS = {
  hardSafe: 0.08,
  softSafe: 0.06,
  bleed: 0,
  verticalVideoTopDanger: 0.14,
  verticalVideoBottomDanger: 0.18,
  readableCenterZone: 0.68,
} as const;

export type MotionSafeAreaTokens = typeof MOTION_SAFE_AREA_TOKENS;

export type ResolvedMotionSafeAreas = {
  hard: { top: number; right: number; bottom: number; left: number };
  soft: { top: number; right: number; bottom: number; left: number };
  bleed: number;
  verticalDanger?: { top: number; bottom: number };
  readableCenter: { x: number; y: number; width: number; height: number };
};

export function resolveMotionSafeAreas(
  aspectRatio: string,
  respectVerticalDanger = false,
): ResolvedMotionSafeAreas {
  const { hardSafe, softSafe, bleed, verticalVideoTopDanger, verticalVideoBottomDanger, readableCenterZone } =
    MOTION_SAFE_AREA_TOKENS;

  const hard = {
    top: hardSafe,
    right: hardSafe,
    bottom: hardSafe,
    left: hardSafe,
  };

  const soft = {
    top: softSafe,
    right: softSafe,
    bottom: softSafe,
    left: softSafe,
  };

  const readableCenter = {
    x: (1 - readableCenterZone) / 2,
    y: (1 - readableCenterZone) / 2,
    width: readableCenterZone,
    height: readableCenterZone,
  };

  const verticalDanger =
    respectVerticalDanger && aspectRatio === "9:16"
      ? { top: verticalVideoTopDanger, bottom: verticalVideoBottomDanger }
      : undefined;

  return { hard, soft, bleed, verticalDanger, readableCenter };
}
