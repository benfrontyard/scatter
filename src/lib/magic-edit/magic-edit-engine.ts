import { buildAudioMixSettings } from "@/lib/audio";
import type {
  BlockTimingSuggestion,
  MagicEditInput,
  MagicEditResult,
  TimelineMarker,
} from "@/types";
import {
  applyBlockDurations,
  assignBlocksToPhrases,
  secondsToFrames,
} from "./block-timing";

export function runMagicEdit(input: MagicEditInput): MagicEditResult {
  const {
    blocks,
    voiceoverAnalysis,
    musicAnalysis,
    brand,
    fps,
    settings,
    lockedBlockIds = new Set(),
  } = input;

  const locked = settings.preserveManualEdits
    ? new Set([...lockedBlockIds, ...blocks.filter((b) => b.timingLocked).map((b) => b.id)])
    : lockedBlockIds;

  const phrases = voiceoverAnalysis.phraseMarkers;
  let updatedBlocks = [...blocks];

  if (phrases.length > 0) {
    const assignments = assignBlocksToPhrases(
      blocks,
      phrases,
      fps,
      settings.rhythm,
      locked,
    );
    updatedBlocks = applyBlockDurations(blocks, assignments, locked);
  } else {
    updatedBlocks = blocks.map((block) => {
      if (locked.has(block.id)) return block;
      const defaultDuration = secondsToFrames(voiceoverAnalysis.duration / blocks.length, fps);
      return { ...block, duration: defaultDuration };
    });
  }

  const totalDurationFrames = updatedBlocks.reduce((sum, block) => sum + block.duration, 0);

  const mix = buildAudioMixSettings({
    ducking: settings.ducking,
    pauseCleanup: settings.pauseCleanup,
    voiceoverAnalysis,
  });

  const markers: TimelineMarker[] = [
    ...voiceoverAnalysis.phraseMarkers,
    ...voiceoverAnalysis.wordMarkers,
    ...voiceoverAnalysis.pauseMarkers,
    ...(musicAnalysis?.beatMarkers ?? []),
  ].sort((a, b) => a.time - b.time);

  const blockSuggestions: BlockTimingSuggestion[] = updatedBlocks
    .filter((b) => !locked.has(b.id))
    .map((block, index) => {
      const phrase = phrases[index];
      return {
        blockId: block.id,
        startFrame: updatedBlocks
          .slice(0, index)
          .reduce((sum, b) => sum + b.duration, 0),
        duration: block.duration,
        phraseMarkerId: block.phraseMarkerId ?? phrase?.id,
        emphasisWords: phrase?.label?.split(" ").filter((w) => w.length > 4),
      };
    });

  void brand;
  void settings.syncPriority;

  return {
    blocks: updatedBlocks,
    markers,
    mix,
    voiceoverAnalysis,
    musicAnalysis,
    blockSuggestions,
    totalDurationFrames,
  };
}
