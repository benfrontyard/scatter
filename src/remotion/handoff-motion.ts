import type { TransitionPresetId } from "@/lib/transitions/presets";
import { interpolate } from "remotion";
import type { MotionDirection, MotionIntensity } from "./shared-motion";

export type BlockHandoffMode = "none" | "match-cut" | "cut-on-action" | "wrapper";

const INTENSITY_DISTANCE: Record<MotionIntensity, number> = {
  subtle: 0.04,
  standard: 0.07,
  hero: 0.12,
};

export function resolveHandoffMode(presetId?: TransitionPresetId): BlockHandoffMode {
  if (presetId === "match-cut") return "match-cut";
  if (presetId === "cut-on-action") return "cut-on-action";
  if (
    presetId === "cut" ||
    presetId === "hold-cut" ||
    !presetId
  ) {
    return "none";
  }
  return "wrapper";
}

/** Adjust enter progress for block-aware handoffs — less travel, faster settle. */
export function getHandoffAdjustedEnterProgress(
  progress: number,
  handoff: BlockHandoffMode,
): number {
  if (handoff === "match-cut") {
    return interpolate(progress, [0, 0.2, 0.55, 1], [0.9, 0.96, 0.99, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  if (handoff === "cut-on-action") {
    return interpolate(progress, [0, 0.35, 0.7, 1], [0.72, 0.88, 0.96, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  return progress;
}

/** Shorter effective enter window during match-cut / cut-on-action. */
export function getHandoffEnterFrameScale(handoff: BlockHandoffMode): number {
  if (handoff === "match-cut") return 0.45;
  if (handoff === "cut-on-action") return 0.6;
  return 1;
}

export type HandoffExitOffset = {
  x: number;
  y: number;
  opacityScale: number;
};

/** Momentum exit for cut-on-action — outgoing hero continues moving into the cut. */
export function getHandoffExitOffset(
  frame: number,
  duration: number,
  handoff: BlockHandoffMode,
  outgoingOverlapFrames: number,
  direction: MotionDirection,
  formatWidth: number,
  formatHeight: number,
  intensity: MotionIntensity,
  travelScale = 1,
): HandoffExitOffset {
  if (handoff !== "cut-on-action") {
    return { x: 0, y: 0, opacityScale: 1 };
  }

  const leadIn = 6;
  const exitStart = Math.max(duration - Math.max(outgoingOverlapFrames, leadIn) - leadIn, 0);
  if (frame < exitStart) {
    return { x: 0, y: 0, opacityScale: 1 };
  }

  const exitEnd = duration;
  const t = (frame - exitStart) / Math.max(exitEnd - exitStart, 1);
  const push = interpolate(t, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const distance = INTENSITY_DISTANCE[intensity] * travelScale;

  switch (direction) {
    case "down":
      return {
        x: 0,
        y: formatHeight * distance * push * 0.55,
        opacityScale: 1,
      };
    case "left":
      return {
        x: -formatWidth * distance * push * 0.55,
        y: 0,
        opacityScale: 1,
      };
    case "right":
      return {
        x: formatWidth * distance * push * 0.55,
        y: 0,
        opacityScale: 1,
      };
    case "up":
    default:
      return {
        x: 0,
        y: -formatHeight * distance * push * 0.55,
        opacityScale: 1,
      };
  }
}

/** Match-cut blocks hold composition — suppress default outro fade during handoff. */
export function getHandoffOutroOpacityScale(
  frame: number,
  duration: number,
  handoff: BlockHandoffMode,
  outgoingOverlapFrames: number,
): number {
  if (handoff !== "match-cut" || outgoingOverlapFrames <= 0) return 1;
  const overlapStart = Math.max(duration - outgoingOverlapFrames, 0);
  if (frame < overlapStart) return 1;
  return 1;
}

export function isHandoffEnterPhase(
  frame: number,
  incomingOverlapFrames: number,
  enterFrames: number,
  handoff: BlockHandoffMode,
): boolean {
  if (handoff === "none" || handoff === "wrapper") return false;
  const window = Math.max(
    incomingOverlapFrames,
    Math.round(enterFrames * getHandoffEnterFrameScale(handoff)),
  );
  return frame <= window;
}

export function isHandoffExitPhase(
  frame: number,
  duration: number,
  outgoingOverlapFrames: number,
  handoff: BlockHandoffMode,
): boolean {
  if (handoff !== "cut-on-action") return false;
  const exitStart = Math.max(duration - Math.max(outgoingOverlapFrames, 6) - 6, 0);
  return frame >= exitStart;
}
