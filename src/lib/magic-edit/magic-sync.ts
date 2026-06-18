import { buildAudioMixSettings } from "@/lib/audio";
import type {
  AudioAnalysis,
  MagicEditInput,
  MagicEditResult,
  MotionBlockInstance,
  TimelineMarker,
} from "@/types";
import {
  applyBlockDurations,
  assignBlocksToPhrases,
  secondsToFrames,
  snapToNearestMarker,
} from "./block-timing";

export type MagicSyncInput = MagicEditInput & {
  preferBeats?: boolean;
};

function getSnapMarkers(
  voiceoverAnalysis: AudioAnalysis,
  musicAnalysis?: AudioAnalysis,
  preferBeats = true,
): TimelineMarker[] {
  const markers: TimelineMarker[] = [];

  if (preferBeats && musicAnalysis?.beatMarkers?.length) {
    const downbeats = musicAnalysis.beatMarkers.filter((m) => m.type === "bar");
    const beats = musicAnalysis.beatMarkers.filter((m) => m.type === "beat");
    markers.push(...downbeats, ...beats);
  }

  markers.push(...voiceoverAnalysis.phraseMarkers);

  return markers.sort((a, b) => a.time - b.time);
}

function alignBlockCutsToMarkers(
  blocks: MotionBlockInstance[],
  assignments: ReturnType<typeof assignBlocksToPhrases>,
  snapMarkers: TimelineMarker[],
  fps: number,
  lockedBlockIds: Set<string>,
): MotionBlockInstance[] {
  let updated = applyBlockDurations(blocks, assignments, lockedBlockIds);

  if (snapMarkers.length === 0) return updated;

  let accumulatedFrames = 0;
  updated = updated.map((block) => {
    if (lockedBlockIds.has(block.id)) {
      accumulatedFrames += block.duration;
      return block;
    }

    const startSec = accumulatedFrames / fps;
    const snapped = snapToNearestMarker(startSec, snapMarkers, 0.12);
    const snappedStartFrame = secondsToFrames(snapped.time, fps);
    const durationDelta = snappedStartFrame - accumulatedFrames;

    accumulatedFrames += block.duration + durationDelta;

    if (Math.abs(durationDelta) > 0) {
      return {
        ...block,
        duration: Math.max(1, block.duration - durationDelta),
        phraseMarkerId: snapped.markerId ?? block.phraseMarkerId,
      };
    }

    accumulatedFrames = snappedStartFrame + block.duration;
    return block;
  });

  return updated;
}

/**
 * Magic Sync: aligns block cuts to VO phrase boundaries and music beats.
 * Major block changes land on downbeats; text reveals can use smaller beats.
 */
export function runMagicSync(input: MagicSyncInput): MagicEditResult {
  const {
    blocks,
    voiceoverAnalysis,
    musicAnalysis,
    brand,
    fps,
    settings,
    lockedBlockIds = new Set(),
    preferBeats = true,
  } = input;

  const locked = settings.preserveManualEdits
    ? new Set([...lockedBlockIds, ...blocks.filter((b) => b.timingLocked).map((b) => b.id)])
    : lockedBlockIds;

  const phrases = voiceoverAnalysis.phraseMarkers;
  const snapMarkers = getSnapMarkers(voiceoverAnalysis, musicAnalysis, preferBeats);

  let updatedBlocks = [...blocks];

  if (phrases.length > 0) {
    const assignments = assignBlocksToPhrases(
      blocks,
      phrases,
      fps,
      settings.rhythm,
      locked,
    );
    updatedBlocks = alignBlockCutsToMarkers(
      blocks,
      assignments,
      snapMarkers,
      fps,
      locked,
    );
  } else if (snapMarkers.length > 0) {
    const totalSec = voiceoverAnalysis.duration;
    const perBlockSec = totalSec / blocks.length;
    let cursor = 0;

    updatedBlocks = blocks.map((block) => {
      if (locked.has(block.id)) return block;
      const snapped = snapToNearestMarker(cursor, snapMarkers, 0.15);
      const duration = secondsToFrames(perBlockSec, fps);
      cursor = snapped.time + perBlockSec;
      return {
        ...block,
        duration,
        phraseMarkerId: snapped.markerId,
      };
    });
  }

  const totalDurationFrames = updatedBlocks.reduce((sum, b) => sum + b.duration, 0);

  const markers: TimelineMarker[] = [
    ...voiceoverAnalysis.phraseMarkers,
    ...voiceoverAnalysis.wordMarkers,
    ...voiceoverAnalysis.pauseMarkers,
    ...(musicAnalysis?.beatMarkers ?? []),
  ].sort((a, b) => a.time - b.time);

  void brand;
  void settings.syncPriority;

  const mix = buildAudioMixSettings({
    ducking: settings.ducking,
    pauseCleanup: settings.pauseCleanup,
    voiceoverAnalysis,
  });

  return {
    blocks: updatedBlocks,
    markers,
    mix,
    voiceoverAnalysis,
    musicAnalysis,
    blockSuggestions: [],
    totalDurationFrames,
  };
}
