import { getTransitionBetweenBlocks } from "@/lib/sequence-utils";
import type { MotionSequence, TransitionDirection, TransitionType } from "@/types";
import { interpolate } from "remotion";
import { getEasing } from "./motion-behaviors";

export type TransitionOverlayStyle = {
  opacity: number;
  transform: string;
};

function getOverlapFrames(transitionDuration: number, overlap: number): number {
  return Math.round(transitionDuration * overlap);
}

function getEasedProgress(progress: number, easing: Parameters<typeof getEasing>[0]): number {
  return interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: getEasing(easing),
  });
}

function getPushOffset(
  direction: TransitionDirection,
  progress: number,
  formatWidth: number,
  formatHeight: number,
  incoming: boolean,
): { x: number; y: number } {
  const factor = incoming ? 1 - progress : -progress;

  switch (direction) {
    case "right":
      return { x: formatWidth * factor, y: 0 };
    case "up":
      return { x: 0, y: formatHeight * factor };
    case "down":
      return { x: 0, y: -formatHeight * factor };
    case "left":
    default:
      return { x: -formatWidth * factor, y: 0 };
  }
}

function applyTransitionType(
  type: TransitionType,
  progress: number,
  direction: TransitionDirection,
  formatWidth: number,
  formatHeight: number,
  incoming: boolean,
): TransitionOverlayStyle {
  switch (type) {
    case "crossfade":
      return {
        opacity: incoming ? progress : 1 - progress,
        transform: "none",
      };
    case "push": {
      const offset = getPushOffset(direction, progress, formatWidth, formatHeight, incoming);
      return {
        opacity: 1,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      };
    }
    case "cut":
    default:
      return { opacity: 1, transform: "none" };
  }
}

export function getBlockTransitionOverlay(
  blockIndex: number,
  localFrame: number,
  blockDuration: number,
  sequence: MotionSequence,
  formatWidth: number,
  formatHeight: number,
): TransitionOverlayStyle {
  let opacity = 1;
  let transform = "none";

  const incomingTransition =
    blockIndex > 0 ? getTransitionBetweenBlocks(sequence, blockIndex - 1) : undefined;

  if (incomingTransition && incomingTransition.type !== "cut") {
    const overlap = getOverlapFrames(incomingTransition.duration, incomingTransition.overlap);
    if (overlap > 0 && localFrame < overlap) {
      const rawProgress = localFrame / overlap;
      const progress = getEasedProgress(rawProgress, incomingTransition.easing);
      const incoming = applyTransitionType(
        incomingTransition.type,
        progress,
        incomingTransition.direction,
        formatWidth,
        formatHeight,
        true,
      );
      opacity *= incoming.opacity;
      transform = incoming.transform;
    }
  }

  const outgoingTransition = getTransitionBetweenBlocks(sequence, blockIndex);

  if (outgoingTransition && outgoingTransition.type !== "cut") {
    const overlap = getOverlapFrames(outgoingTransition.duration, outgoingTransition.overlap);
    const overlapStart = blockDuration - overlap;

    if (overlap > 0 && localFrame >= overlapStart) {
      const rawProgress = (localFrame - overlapStart) / overlap;
      const progress = getEasedProgress(rawProgress, outgoingTransition.easing);
      const outgoing = applyTransitionType(
        outgoingTransition.type,
        progress,
        outgoingTransition.direction,
        formatWidth,
        formatHeight,
        false,
      );
      opacity *= outgoing.opacity;
      transform =
        outgoing.transform === "none" ? transform : combineTransforms(transform, outgoing.transform);
    }
  }

  return { opacity, transform };
}

function combineTransforms(a: string, b: string): string {
  if (a === "none") return b;
  if (b === "none") return a;
  return `${a} ${b}`;
}

export const INTERNAL_MOTION_BLOCK_IDS = new Set([
  "logo-reveal",
  "feature-announcement",
  "stat-card",
  "cta-lockup",
]);
