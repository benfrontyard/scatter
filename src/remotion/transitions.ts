import { getTransitionBetweenBlocks } from "@/lib/sequence-utils";
import { getEasingFunction, resolveTransitionEasing } from "@/lib/easing";
import { resolveBrand } from "@/lib/brand-utils";
import {
  getResponsiveHandoffDirection,
  getResponsiveTravelScale,
  type AspectRatioLabel,
} from "@/lib/transitions/responsive-handoff";
import { getTransitionPresetId } from "@/lib/transitions/migrate-transition";
import {
  TRANSITION_PRESETS,
  type TransitionPresetId,
} from "@/lib/transitions/presets";
import type { BlockTransition, MotionSequence, TransitionDirection, TransitionType } from "@/types";
import { interpolate } from "remotion";

export type TransitionOverlayStyle = {
  opacity: number;
  transform: string;
  filter?: string;
  clipPath?: string;
};

function getOverlapFrames(transitionDuration: number, overlap: number): number {
  return Math.max(Math.round(transitionDuration * overlap), 0);
}

function getEasedProgress(progress: number, easingFn: (t: number) => number): number {
  return interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easingFn,
  });
}

function getPushOffset(
  direction: TransitionDirection,
  progress: number,
  formatWidth: number,
  formatHeight: number,
  incoming: boolean,
  driftY = 0,
  travelScale = 1,
): { x: number; y: number } {
  const factor = incoming ? 1 - progress : -progress;
  const w = formatWidth * travelScale;
  const h = formatHeight * travelScale;

  switch (direction) {
    case "right":
      return { x: w * factor, y: formatHeight * driftY * (1 - progress) };
    case "up":
      return { x: 0, y: h * factor * (1 + driftY) };
    case "down":
      return { x: 0, y: -h * factor * (1 + driftY) };
    case "left":
    default:
      return { x: -w * factor, y: formatHeight * driftY * (1 - progress) };
  }
}

function applyTransitionType(
  type: TransitionType,
  presetId: TransitionPresetId,
  progress: number,
  direction: TransitionDirection,
  formatWidth: number,
  formatHeight: number,
  incoming: boolean,
  reducedMotion: boolean,
  travelScale = 1,
  aspectRatio: AspectRatioLabel = "16:9",
): TransitionOverlayStyle {
  if (reducedMotion) {
    return { opacity: 1, transform: "none" };
  }

  const preset = TRANSITION_PRESETS[presetId] ?? TRANSITION_PRESETS["soft-dissolve"];
  const driftY = preset.driftY ?? 0;

  switch (type) {
    case "crossfade": {
      const yDrift = incoming ? driftY * formatHeight * (1 - progress) : 0;
      return {
        opacity: incoming ? progress : 1 - progress,
        transform: yDrift ? `translateY(${yDrift}px)` : "none",
      };
    }
    case "push": {
      const responsiveDirection = getResponsiveHandoffDirection(direction, aspectRatio);
      const offset = getPushOffset(
        responsiveDirection,
        progress,
        formatWidth,
        formatHeight,
        incoming,
        driftY,
        travelScale,
      );
      return {
        opacity: 1,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      };
    }
    case "scale-through": {
      const scale = incoming
        ? interpolate(progress, [0, 0.72, 1], [0.96, 1.012, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        : interpolate(progress, [0, 1], [1, 1.035], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
      const opacity = incoming ? progress : 1 - progress * 0.75;
      return {
        opacity,
        transform: `scale(${scale})`,
      };
    }
    case "wipe": {
      const inset = incoming
        ? interpolate(progress, [0, 1], [100, 0])
        : interpolate(progress, [0, 1], [0, 100]);
      const axis =
        direction === "up" || direction === "down"
          ? `inset(${direction === "up" ? inset : 0}% 0 ${direction === "down" ? inset : 0}% 0)`
          : `inset(0 ${direction === "right" ? inset : 0}% 0 ${direction === "left" ? inset : 0}%)`;
      return {
        opacity: 1,
        transform: "none",
        clipPath: axis,
      };
    }
    case "mask-reveal": {
      const maxBlur = presetId === "brand-blur" ? 12 : 6;
      const blur = incoming
        ? interpolate(progress, [0, 1], [maxBlur, 0])
        : interpolate(progress, [0, 1], [0, maxBlur * 0.65]);
      const opacity = incoming ? progress : 1 - progress * 0.7;
      const inset = interpolate(progress, [0, 1], [100, 0]);
      return {
        opacity,
        transform: "none",
        filter: blur > 0.5 ? `blur(${blur}px)` : undefined,
        clipPath: incoming ? `inset(0 0 ${inset}% 0 round 0)` : undefined,
      };
    }
    case "frame-split": {
      const split = interpolate(progress, [0, 1], [50, 0]);
      return {
        opacity: incoming ? progress : 1 - progress,
        transform: incoming ? `translateX(${split * (incoming ? 1 : -1)}%)` : "none",
      };
    }
    case "cut":
    default:
      return { opacity: 1, transform: "none" };
  }
}

function shouldRenderTransitionWrapper(transition: BlockTransition): boolean {
  const presetId = getTransitionPresetId(transition);
  if (
    presetId === "cut" ||
    presetId === "hold-cut" ||
    presetId === "match-cut" ||
    presetId === "cut-on-action"
  ) {
    return false;
  }
  return transition.overlap > 0;
}

export function getBlockTransitionOverlay(
  blockIndex: number,
  localFrame: number,
  blockDuration: number,
  sequence: MotionSequence,
  formatWidth: number,
  formatHeight: number,
  customBrands: Parameters<typeof resolveBrand>[1] = [],
  reducedMotion = false,
  formatAspectRatio: AspectRatioLabel = "16:9",
): TransitionOverlayStyle {
  let opacity = 1;
  let transform = "none";
  let filter: string | undefined;
  let clipPath: string | undefined;

  const brand = resolveBrand(sequence.brandPresetId, customBrands);
  const travelScale = getResponsiveTravelScale(formatAspectRatio);

  const incomingTransition =
    blockIndex > 0 ? getTransitionBetweenBlocks(sequence, blockIndex - 1) : undefined;

  if (incomingTransition && shouldRenderTransitionWrapper(incomingTransition)) {
    const overlap = getOverlapFrames(incomingTransition.duration, incomingTransition.overlap);
    if (overlap > 0 && localFrame < overlap) {
      const rawProgress = localFrame / overlap;
      const presetId = getTransitionPresetId(incomingTransition);
      const easingFn = getEasingFunction(resolveTransitionEasing(brand, incomingTransition));
      const progress = getEasedProgress(rawProgress, easingFn);
      const incoming = applyTransitionType(
        incomingTransition.type,
        presetId,
        progress,
        incomingTransition.direction,
        formatWidth,
        formatHeight,
        true,
        reducedMotion,
        travelScale,
        formatAspectRatio,
      );
      opacity = incoming.opacity;
      transform = incoming.transform;
      filter = incoming.filter;
      clipPath = incoming.clipPath;
    }
  }

  const outgoingTransition = getTransitionBetweenBlocks(sequence, blockIndex);

  if (outgoingTransition && shouldRenderTransitionWrapper(outgoingTransition)) {
    const overlap = getOverlapFrames(outgoingTransition.duration, outgoingTransition.overlap);
    const overlapStart = Math.max(blockDuration - overlap, 0);

    if (overlap > 0 && localFrame >= overlapStart) {
      const rawProgress = (localFrame - overlapStart) / overlap;
      const presetId = getTransitionPresetId(outgoingTransition);
      const easingFn = getEasingFunction(resolveTransitionEasing(brand, outgoingTransition));
      const progress = getEasedProgress(rawProgress, easingFn);
      const outgoing = applyTransitionType(
        outgoingTransition.type,
        presetId,
        progress,
        outgoingTransition.direction,
        formatWidth,
        formatHeight,
        false,
        reducedMotion,
        travelScale,
        formatAspectRatio,
      );
      opacity *= outgoing.opacity;
      transform =
        outgoing.transform === "none" ? transform : combineTransforms(transform, outgoing.transform);
      if (outgoing.filter) filter = outgoing.filter;
      if (outgoing.clipPath) clipPath = outgoing.clipPath;
    }
  }

  return { opacity, transform, filter, clipPath };
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
