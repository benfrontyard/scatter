import type { BlockTransitionPose } from "@/types/block-transition";
import type { BlockHandoffMode } from "@/remotion/handoff-motion";
import { interpolate } from "remotion";

export type PoseEnterModifiers = {
  /** Multiplier on directional enter travel */
  travelScale: number;
  /** Extra scale multiplier during enter */
  scaleMultiplier: number;
};

export type PoseExitModifiers = {
  /** Multiplier on cut-on-action exit momentum */
  momentumScale: number;
};

const DEFAULT_ENTER: PoseEnterModifiers = {
  travelScale: 1,
  scaleMultiplier: 1,
};

const DEFAULT_EXIT: PoseExitModifiers = {
  momentumScale: 1,
};

const POSE_ENTER: Partial<Record<BlockTransitionPose, Partial<PoseEnterModifiers>>> = {
  "hero-headline": { travelScale: 0.85 },
  "carousel-card": { travelScale: 0.45, scaleMultiplier: 0.96 },
  "stat-center": { travelScale: 0.4, scaleMultiplier: 0.94 },
  "split-media": { travelScale: 0.7 },
  "ui-card": { travelScale: 0.6, scaleMultiplier: 0.97 },
  "logo-cta": { travelScale: 0.55, scaleMultiplier: 0.95 },
};

const POSE_EXIT: Partial<Record<BlockTransitionPose, Partial<PoseExitModifiers>>> = {
  "carousel-card": { momentumScale: 0.7 },
  "stat-center": { momentumScale: 0.5 },
  "hero-headline": { momentumScale: 0.85 },
  "split-media": { momentumScale: 0.9 },
  "ui-card": { momentumScale: 0.75 },
  "logo-cta": { momentumScale: 0.6 },
};

function handoffEnterBoost(handoff: BlockHandoffMode): number {
  if (handoff === "match-cut") return 0.55;
  if (handoff === "cut-on-action") return 0.75;
  return 1;
}

export function getPoseEnterModifiers(
  pose: BlockTransitionPose | undefined,
  enterProgress: number,
  handoff: BlockHandoffMode,
): PoseEnterModifiers {
  if (!pose) return DEFAULT_ENTER;

  const profile = POSE_ENTER[pose] ?? {};
  const boost = handoffEnterBoost(handoff);
  const settle = interpolate(enterProgress, [0, 0.5, 1], [boost, boost * 0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scaleSettle = interpolate(enterProgress, [0, 1], [profile.scaleMultiplier ?? 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return {
    travelScale: (profile.travelScale ?? 1) * settle,
    scaleMultiplier: scaleSettle,
  };
}

export function getPoseExitModifiers(
  pose: BlockTransitionPose | undefined,
): PoseExitModifiers {
  if (!pose) return DEFAULT_EXIT;
  return { ...DEFAULT_EXIT, ...POSE_EXIT[pose] };
}
