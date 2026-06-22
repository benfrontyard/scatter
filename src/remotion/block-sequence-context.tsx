import { beatMarkersToFrames } from "@/lib/audio/beat-alignment";
import { getBeatSyncedEnterShift } from "@/lib/transitions/beat-handoff";
import {
  getResponsiveHandoffDirection,
  getResponsiveTravelScale,
  type AspectRatioLabel,
} from "@/lib/transitions/responsive-handoff";
import { getBlockStartFrame, getTransitionBetweenBlocks, getTransitionOverlapFrames } from "@/lib/sequence-utils";
import {
  blocksShareHeroGeometry,
  getBlockTransitionMetadata,
} from "@/lib/transitions/block-metadata";
import { getTransitionPresetId } from "@/lib/transitions/migrate-transition";
import type { TransitionPresetId } from "@/lib/transitions/presets";
import type { MotionSequence } from "@/types";
import { EDITOR_FPS } from "@/types/editor";
import { createContext, useContext, useMemo } from "react";
import { useCurrentFrame } from "remotion";
import {
  getHandoffAdjustedEnterProgress,
  getHandoffEnterFrameScale,
  getHandoffExitOffset,
  isHandoffEnterPhase,
  isHandoffExitPhase,
  resolveHandoffMode,
  type BlockHandoffMode,
} from "./handoff-motion";
import {
  getOutroOpacity,
  getEnterProgress,
  type MotionSpeed,
  type MotionDirection,
  type MotionIntensity,
} from "./shared-motion";
import type { EasingPreset } from "@/types/easing";
import type { BlockTransitionPose } from "@/types/block-transition";
import { getMatchCutSpatialOffset } from "@/lib/transitions/hero-geometry";
import { getPoseEnterModifiers, getPoseExitModifiers } from "@/lib/transitions/pose-motion";

export type HandoffHeroTransform = {
  x: number;
  y: number;
  scale: number;
  travelScale: number;
};

export type BlockSequenceContextValue = {
  blockIndex: number;
  blockId: string;
  blockStartFrame: number;
  outgoingOverlapFrames: number;
  incomingOverlapFrames: number;
  incomingPresetId?: TransitionPresetId;
  outgoingPresetId?: TransitionPresetId;
  incomingHandoff: BlockHandoffMode;
  outgoingHandoff: BlockHandoffMode;
  sharedHeroGeometry: boolean;
  heroGeometryId?: string;
  prevHeroGeometryId?: string;
  prevExitPose?: BlockTransitionPose;
  preferredEntryPose?: BlockTransitionPose;
  preferredExitPose?: BlockTransitionPose;
  aspectRatio: AspectRatioLabel;
  travelScale: number;
  beatMarkerFrames: number[];
};

const BlockSequenceContext = createContext<BlockSequenceContextValue>({
  blockIndex: 0,
  blockId: "",
  blockStartFrame: 0,
  outgoingOverlapFrames: 0,
  incomingOverlapFrames: 0,
  incomingHandoff: "none",
  outgoingHandoff: "none",
  sharedHeroGeometry: false,
  aspectRatio: "16:9",
  travelScale: 1,
  beatMarkerFrames: [],
});

type BlockSequenceProviderProps = {
  blockIndex: number;
  sequence: MotionSequence;
  formatAspectRatio?: AspectRatioLabel;
  children: React.ReactNode;
};

export function BlockSequenceProvider({
  blockIndex,
  sequence,
  formatAspectRatio = "16:9",
  children,
}: BlockSequenceProviderProps) {
  const value = useMemo(() => {
    const block = sequence.blocks[blockIndex];
    const prevBlock = blockIndex > 0 ? sequence.blocks[blockIndex - 1] : undefined;
    const incomingTransition =
      blockIndex > 0 ? getTransitionBetweenBlocks(sequence, blockIndex - 1) : undefined;
    const outgoingTransition = getTransitionBetweenBlocks(sequence, blockIndex);

    const incomingPresetId = incomingTransition
      ? getTransitionPresetId(incomingTransition)
      : undefined;
    const outgoingPresetId = outgoingTransition
      ? getTransitionPresetId(outgoingTransition)
      : undefined;

    const metadata = block ? getBlockTransitionMetadata(block.blockId) : {};
    const prevMetadata = prevBlock ? getBlockTransitionMetadata(prevBlock.blockId) : {};
    const fps = sequence.fps ?? EDITOR_FPS;
    const beatMarkerFrames = beatMarkersToFrames(sequence.audio?.markers ?? [], fps);

    return {
      blockIndex,
      blockId: block?.blockId ?? "",
      blockStartFrame: getBlockStartFrame(sequence, blockIndex),
      incomingOverlapFrames: getTransitionOverlapFrames(incomingTransition),
      outgoingOverlapFrames: getTransitionOverlapFrames(outgoingTransition),
      incomingPresetId,
      outgoingPresetId,
      incomingHandoff: resolveHandoffMode(incomingPresetId),
      outgoingHandoff: resolveHandoffMode(outgoingPresetId),
      sharedHeroGeometry:
        prevBlock && block
          ? blocksShareHeroGeometry(prevBlock.blockId, block.blockId)
          : false,
      heroGeometryId: metadata.heroGeometryId,
      prevHeroGeometryId: prevMetadata.heroGeometryId,
      prevExitPose: prevMetadata.preferredExitPose,
      preferredEntryPose: metadata.preferredEntryPose,
      preferredExitPose: metadata.preferredExitPose,
      aspectRatio: formatAspectRatio,
      travelScale: getResponsiveTravelScale(formatAspectRatio),
      beatMarkerFrames,
    };
  }, [blockIndex, sequence, formatAspectRatio]);

  return (
    <BlockSequenceContext.Provider value={value}>{children}</BlockSequenceContext.Provider>
  );
}

export function useBlockOutroOpacity(
  frame: number,
  duration: number,
  outroRatio = 0.12,
  easingPreset?: EasingPreset,
): number {
  const { outgoingOverlapFrames, outgoingHandoff } = useContext(BlockSequenceContext);
  if (outgoingHandoff === "match-cut" && outgoingOverlapFrames > 0) {
    return 1;
  }
  return getOutroOpacity(frame, duration, outroRatio, easingPreset, outgoingOverlapFrames);
}

export function useBlockSequenceMotion() {
  return useContext(BlockSequenceContext);
}

/** Enter progress adjusted for match-cut / cut-on-action incoming handoffs. */
export function useHandoffEnterProgress(
  frame: number,
  start: number,
  enterFrames: number,
  speed: MotionSpeed,
  easingPreset?: EasingPreset,
): number {
  const { incomingHandoff, beatMarkerFrames, blockStartFrame } =
    useContext(BlockSequenceContext);
  const scaledFrames = Math.max(
    Math.round(enterFrames * getHandoffEnterFrameScale(incomingHandoff)),
    1,
  );
  const beatShift = getBeatSyncedEnterShift(
    blockStartFrame,
    start,
    scaledFrames,
    beatMarkerFrames,
    incomingHandoff,
  );
  const base = getEnterProgress(
    frame,
    start + beatShift,
    scaledFrames,
    speed,
    easingPreset,
  );
  return getHandoffAdjustedEnterProgress(base, incomingHandoff);
}

export function useHandoffExitOffset(
  frame: number,
  duration: number,
  direction: MotionDirection,
  formatWidth: number,
  formatHeight: number,
  intensity: MotionIntensity,
) {
  const { outgoingHandoff, outgoingOverlapFrames, travelScale, aspectRatio, preferredExitPose } =
    useContext(BlockSequenceContext);
  const responsiveDirection = getResponsiveHandoffDirection(direction, aspectRatio);
  const exitMomentum = getPoseExitModifiers(preferredExitPose).momentumScale;
  const offset = getHandoffExitOffset(
    frame,
    duration,
    outgoingHandoff,
    outgoingOverlapFrames,
    responsiveDirection,
    formatWidth,
    formatHeight,
    intensity,
    travelScale,
  );
  return {
    x: offset.x * exitMomentum,
    y: offset.y * exitMomentum,
    opacityScale: offset.opacityScale,
  };
}

export function useHandoffPhase(frame: number, duration: number, enterFrames: number) {
  const ctx = useContext(BlockSequenceContext);
  return {
    isEnterHandoff: isHandoffEnterPhase(
      frame,
      ctx.incomingOverlapFrames,
      enterFrames,
      ctx.incomingHandoff,
    ),
    isExitHandoff: isHandoffExitPhase(
      frame,
      duration,
      ctx.outgoingOverlapFrames,
      ctx.outgoingHandoff,
    ),
    ...ctx,
  };
}

/** Spatial match-cut alignment + pose-specific enter modifiers for hero elements. */
export function useHandoffHeroTransform(
  pose: BlockTransitionPose,
  enterProgress: number,
  formatWidth: number,
  formatHeight: number,
): HandoffHeroTransform {
  const {
    incomingHandoff,
    prevHeroGeometryId,
    prevExitPose,
    heroGeometryId,
  } = useContext(BlockSequenceContext);

  const spatial =
    incomingHandoff === "match-cut"
      ? getMatchCutSpatialOffset(
          prevHeroGeometryId,
          prevExitPose,
          heroGeometryId,
          pose,
          enterProgress,
          formatWidth,
          formatHeight,
        )
      : { x: 0, y: 0, scale: 1 };

  const poseMods = getPoseEnterModifiers(pose, enterProgress, incomingHandoff);

  return {
    x: spatial.x,
    y: spatial.y,
    scale: spatial.scale * poseMods.scaleMultiplier,
    travelScale: poseMods.travelScale,
  };
}

/** Convenience: current frame + handoff-adjusted enter progress. */
export function useBlockEnterProgress(
  start: number,
  enterFrames: number,
  speed: MotionSpeed,
  easingPreset?: EasingPreset,
): number {
  const frame = useCurrentFrame();
  return useHandoffEnterProgress(frame, start, enterFrames, speed, easingPreset);
}
