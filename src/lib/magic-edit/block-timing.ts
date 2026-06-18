import type { MotionBlockInstance, TimelineMarker } from "@/types";
import type { RhythmDensity } from "@/types/magic-edit";

const MIN_READABLE_SECONDS: Record<RhythmDensity, number> = {
  calm: 2.5,
  balanced: 2,
  "high-energy": 1.5,
};

const SNAP_THRESHOLD_SEC = 0.15;

export function secondsToFrames(seconds: number, fps: number): number {
  return Math.max(1, Math.round(seconds * fps));
}

export function framesToSecondsValue(frames: number, fps: number): number {
  return frames / fps;
}

export function snapToNearestMarker(
  timeSec: number,
  markers: TimelineMarker[],
  thresholdSec = SNAP_THRESHOLD_SEC,
): { time: number; markerId?: string } {
  let closest = timeSec;
  let closestDist = Infinity;
  let markerId: string | undefined;

  for (const marker of markers) {
    const dist = Math.abs(marker.time - timeSec);
    if (dist < closestDist && dist <= thresholdSec) {
      closestDist = dist;
      closest = marker.time;
      markerId = marker.id;
    }
  }

  return { time: closest, markerId };
}

export type PhraseBlockAssignment = {
  blockId: string;
  phraseMarker: TimelineMarker;
  durationFrames: number;
  startFrame: number;
};

export function assignBlocksToPhrases(
  blocks: MotionBlockInstance[],
  phrases: TimelineMarker[],
  fps: number,
  rhythm: RhythmDensity,
  lockedBlockIds: Set<string>,
): PhraseBlockAssignment[] {
  if (phrases.length === 0 || blocks.length === 0) return [];

  const minReadableSec = MIN_READABLE_SECONDS[rhythm];
  const editableBlocks = blocks.filter((b) => !lockedBlockIds.has(b.id));
  const lockedBlocks = blocks.filter((b) => lockedBlockIds.has(b.id));

  if (editableBlocks.length === 0) return [];

  const phraseCount = phrases.length;
  const blockCount = editableBlocks.length;

  const assignments: PhraseBlockAssignment[] = [];
  let phraseIndex = 0;
  let accumulatedStart = 0;

  for (let blockIdx = 0; blockIdx < editableBlocks.length; blockIdx++) {
    const block = editableBlocks[blockIdx]!;
    const phrasesPerBlock = Math.max(1, Math.round(phraseCount / blockCount));
    const startPhrase = phrases[phraseIndex];
    if (!startPhrase) break;

    let endPhraseIndex = Math.min(phraseIndex + phrasesPerBlock - 1, phraseCount - 1);
    let endPhrase = phrases[endPhraseIndex]!;

    let spanSec = (endPhrase.endTime ?? endPhrase.time) - startPhrase.time;
    while (spanSec < minReadableSec && endPhraseIndex < phraseCount - 1) {
      endPhraseIndex++;
      endPhrase = phrases[endPhraseIndex]!;
      spanSec = (endPhrase.endTime ?? endPhrase.time) - startPhrase.time;
    }

    const durationFrames = secondsToFrames(spanSec, fps);
    const snapped = snapToNearestMarker(startPhrase.time, phrases);

    assignments.push({
      blockId: block.id,
      phraseMarker: startPhrase,
      durationFrames,
      startFrame: secondsToFrames(snapped.time, fps),
    });

    phraseIndex = endPhraseIndex + 1;
    accumulatedStart += durationFrames;
    void accumulatedStart;
  }

  void lockedBlocks;
  return assignments;
}

export function applyBlockDurations(
  blocks: MotionBlockInstance[],
  assignments: PhraseBlockAssignment[],
  lockedBlockIds: Set<string>,
): MotionBlockInstance[] {
  const assignmentMap = new Map(assignments.map((a) => [a.blockId, a]));

  return blocks.map((block) => {
    if (lockedBlockIds.has(block.id)) return block;
    const assignment = assignmentMap.get(block.id);
    if (!assignment) return block;

    return {
      ...block,
      duration: assignment.durationFrames,
      phraseMarkerId: assignment.phraseMarker.id,
    };
  });
}

export function distributeEvenlyAcrossPhrases(
  blocks: MotionBlockInstance[],
  totalDurationSec: number,
  fps: number,
  lockedBlockIds: Set<string>,
): MotionBlockInstance[] {
  const editable = blocks.filter((b) => !lockedBlockIds.has(b.id));
  if (editable.length === 0) return blocks;

  const perBlockSec = totalDurationSec / editable.length;
  const perBlockFrames = secondsToFrames(perBlockSec, fps);

  return blocks.map((block) => {
    if (lockedBlockIds.has(block.id)) return block;
    return { ...block, duration: perBlockFrames };
  });
}
