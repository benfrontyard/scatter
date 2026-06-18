import type { MotionSequence } from "@/types";
import { getBlockStartFrame, getSequenceDurationInFrames } from "@/lib/sequence-utils";

export type CachedBlockTiming = {
  blockId: string;
  index: number;
  startFrame: number;
  endFrame: number;
  durationFrames: number;
  startSec: number;
  endSec: number;
};

export type TimelineCache = {
  fps: number;
  totalFrames: number;
  totalSec: number;
  blocks: CachedBlockTiming[];
  builtAt: number;
};

export function buildTimelineCache(sequence: MotionSequence): TimelineCache {
  const fps = sequence.fps ?? 30;
  const totalFrames = getSequenceDurationInFrames(sequence);
  const totalSec = totalFrames / fps;

  const blocks: CachedBlockTiming[] = sequence.blocks.map((block, index) => {
    const startFrame = getBlockStartFrame(sequence, index);
    const endFrame = startFrame + block.duration;
    return {
      blockId: block.id,
      index,
      startFrame,
      endFrame,
      durationFrames: block.duration,
      startSec: startFrame / fps,
      endSec: endFrame / fps,
    };
  });

  return {
    fps,
    totalFrames,
    totalSec,
    blocks,
    builtAt: Date.now(),
  };
}

export function getBlockAtFrame(
  cache: TimelineCache,
  frame: number,
): CachedBlockTiming | undefined {
  return cache.blocks.find((b) => frame >= b.startFrame && frame < b.endFrame);
}

export function getBlockAtTime(
  cache: TimelineCache,
  timeSec: number,
): CachedBlockTiming | undefined {
  return cache.blocks.find((b) => timeSec >= b.startSec && timeSec < b.endSec);
}
