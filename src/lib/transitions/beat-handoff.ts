import { getNearestBeatFrame } from "@/lib/audio/beat-alignment";
import type { BlockHandoffMode } from "@/remotion/handoff-motion";

/**
 * Shift enter start so the hero landing frame snaps to the nearest beat.
 * Returns frame delta applied to enter start (negative = start earlier).
 */
export function getBeatSyncedEnterShift(
  blockStartFrame: number,
  enterStartFrame: number,
  enterDurationFrames: number,
  beatMarkers: number[],
  handoff: BlockHandoffMode,
  toleranceFrames = 4,
): number {
  if (beatMarkers.length === 0 || handoff === "none" || handoff === "wrapper") {
    return 0;
  }

  const landingFrame = blockStartFrame + enterStartFrame + enterDurationFrames;
  const snappedLanding = getNearestBeatFrame(landingFrame, beatMarkers, toleranceFrames);

  if (snappedLanding === landingFrame) return 0;

  const maxShift = handoff === "match-cut" ? 6 : 8;
  const rawShift = snappedLanding - landingFrame;
  return Math.max(-maxShift, Math.min(maxShift, rawShift));
}

/**
 * Shift outgoing transition start toward the nearest beat for scene cuts.
 */
export function getBeatSyncedTransitionStart(
  transitionStartFrame: number,
  beatMarkers: number[],
  toleranceFrames = 5,
): number {
  if (beatMarkers.length === 0) return transitionStartFrame;
  return getNearestBeatFrame(transitionStartFrame, beatMarkers, toleranceFrames);
}
