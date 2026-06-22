import type { BlockTransitionPose } from "@/types/block-transition";
import { interpolate } from "remotion";

export type HeroGeometryRect = {
  /** Normalized center X (0–1) */
  centerX: number;
  /** Normalized center Y (0–1) */
  centerY: number;
  /** Width as fraction of format width */
  width: number;
  /** Height as fraction of format height */
  height: number;
};

/** Settled hero regions used for spatial match-cut alignment. */
export const HERO_GEOMETRY_RECTS: Record<string, HeroGeometryRect> = {
  "headline-center": { centerX: 0.5, centerY: 0.44, width: 0.72, height: 0.28 },
  "center-hero": { centerX: 0.5, centerY: 0.4, width: 0.56, height: 0.44 },
  "split-media": { centerX: 0.38, centerY: 0.5, width: 0.44, height: 0.58 },
  "ui-card": { centerX: 0.5, centerY: 0.46, width: 0.4, height: 0.52 },
  "logo-cta": { centerX: 0.5, centerY: 0.54, width: 0.36, height: 0.22 },
};

/** Pose nudges within a shared geometry region. */
const POSE_GEOMETRY_NUDGE: Partial<
  Record<BlockTransitionPose, Partial<Pick<HeroGeometryRect, "centerX" | "centerY" | "width" | "height">>>
> = {
  "carousel-card": { centerY: 0.36, width: 0.48, height: 0.38 },
  "stat-center": { centerY: 0.42, width: 0.52, height: 0.32 },
  "hero-headline": { centerY: 0.44 },
  "split-media": { centerX: 0.36 },
  "ui-card": { centerY: 0.44 },
  "logo-cta": { centerY: 0.52, height: 0.2 },
};

export function resolveHeroGeometryRect(
  geometryId: string | undefined,
  pose?: BlockTransitionPose,
): HeroGeometryRect | undefined {
  if (!geometryId) return undefined;
  const base = HERO_GEOMETRY_RECTS[geometryId];
  if (!base) return undefined;
  const nudge = pose ? POSE_GEOMETRY_NUDGE[pose] : undefined;
  if (!nudge) return base;
  return {
    centerX: nudge.centerX ?? base.centerX,
    centerY: nudge.centerY ?? base.centerY,
    width: nudge.width ?? base.width,
    height: nudge.height ?? base.height,
  };
}

export type MatchCutSpatialOffset = {
  x: number;
  y: number;
  scale: number;
};

/**
 * Spatial offset so incoming hero starts at outgoing hero position during match-cut.
 * `enterProgress` is handoff-adjusted enter progress (0 → 1 settled).
 */
export function getMatchCutSpatialOffset(
  fromGeometryId: string | undefined,
  fromPose: BlockTransitionPose | undefined,
  toGeometryId: string | undefined,
  toPose: BlockTransitionPose | undefined,
  enterProgress: number,
  formatWidth: number,
  formatHeight: number,
): MatchCutSpatialOffset {
  const from = resolveHeroGeometryRect(fromGeometryId, fromPose);
  const to = resolveHeroGeometryRect(toGeometryId, toPose);
  if (!from || !to) {
    return { x: 0, y: 0, scale: 1 };
  }

  const alignAmount = interpolate(enterProgress, [0, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scaleRatio = from.width / Math.max(to.width, 0.01);
  const scale = interpolate(alignAmount, [0, 1], [1, scaleRatio], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return {
    x: (from.centerX - to.centerX) * formatWidth * alignAmount,
    y: (from.centerY - to.centerY) * formatHeight * alignAmount,
    scale,
  };
}
