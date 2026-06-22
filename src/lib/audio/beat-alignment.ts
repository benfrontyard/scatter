import type { TimelineMarker } from "@/types";

/**
 * Snap a target frame to the nearest beat marker within tolerance.
 * Returns the original frame if no beat is close enough.
 */
export function getNearestBeatFrame(
  targetFrame: number,
  beatMarkers: number[],
  toleranceFrames: number,
): number {
  if (beatMarkers.length === 0) return targetFrame;

  let closest = targetFrame;
  let closestDist = Infinity;

  for (const beat of beatMarkers) {
    const dist = Math.abs(beat - targetFrame);
    if (dist <= toleranceFrames && dist < closestDist) {
      closestDist = dist;
      closest = beat;
    }
  }

  return closest;
}

/** Convert timeline beat markers (seconds) to frames. */
export function beatMarkersToFrames(
  markers: TimelineMarker[],
  fps: number,
  types: TimelineMarker["type"][] = ["beat", "bar"],
): number[] {
  return markers
    .filter((m) => types.includes(m.type))
    .map((m) => Math.round(m.time * fps));
}
