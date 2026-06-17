import type { MotionSequence, SequenceTimelineItem } from "@/types";
import { buildTimelineItems, getBlockStartFrame } from "./sequence-utils";

export const TIMELINE_PX_PER_SECOND = 56;
export const TIMELINE_PADDING_START = 24;
export const TIMELINE_PADDING_END = 48;
export const MIN_BLOCK_WIDTH = 72;

export type TimelineLayoutItem = SequenceTimelineItem & {
  startFrame: number;
  durationFrames: number;
  widthPx: number;
  leftPx: number;
};

export function getTimelineWidthPx(totalFrames: number, fps: number): number {
  const contentWidth = (totalFrames / fps) * TIMELINE_PX_PER_SECOND;
  return TIMELINE_PADDING_START + contentWidth + TIMELINE_PADDING_END;
}

export function frameToPx(frame: number, fps: number): number {
  return TIMELINE_PADDING_START + (frame / fps) * TIMELINE_PX_PER_SECOND;
}

export function pxToFrame(px: number, fps: number): number {
  const adjusted = Math.max(0, px - TIMELINE_PADDING_START);
  return Math.round((adjusted / TIMELINE_PX_PER_SECOND) * fps);
}

export function buildTimelineLayout(
  sequence: MotionSequence,
  fps: number,
  compact?: boolean,
): TimelineLayoutItem[] {
  const items = buildTimelineItems(sequence);

  const layouts = items.map((item) => {
    if (item.kind === "block") {
      const durationFrames = item.block.duration;
      const startFrame = getBlockStartFrame(sequence, item.index);
      const widthPx = Math.max(
        compact ? 64 : MIN_BLOCK_WIDTH,
        (durationFrames / fps) * TIMELINE_PX_PER_SECOND,
      );
      const layout: TimelineLayoutItem = {
        ...item,
        startFrame,
        durationFrames,
        widthPx,
        leftPx: frameToPx(startFrame, fps),
      };
      return layout;
    }

    const block = sequence.blocks[item.afterBlockIndex];
    const transitionDuration = item.transition.duration;
    const overlap = Math.round(transitionDuration * item.transition.overlap);
    const blockStart = getBlockStartFrame(sequence, item.afterBlockIndex);
    const blockEnd = blockStart + block.duration;
    const startFrame = overlap > 0 ? blockEnd - overlap : blockEnd;
    const displayFrames = overlap > 0 ? overlap : transitionDuration;
    const layout: TimelineLayoutItem = {
      ...item,
      startFrame,
      durationFrames: displayFrames,
      widthPx: (displayFrames / fps) * TIMELINE_PX_PER_SECOND,
      leftPx: frameToPx(startFrame, fps),
    };
    return layout;
  });

  return layouts;
}

export function getRulerMarkers(
  totalFrames: number,
  fps: number,
  compact?: boolean,
): { frame: number; label: string; leftPx: number }[] {
  const totalSeconds = totalFrames / fps;
  let interval = 1;
  if (totalSeconds > 120) interval = 10;
  else if (totalSeconds > 60) interval = 5;
  else if (totalSeconds > 30) interval = 2;
  if (compact && totalSeconds > 30) interval = Math.max(interval, 2);

  const markers: { frame: number; label: string; leftPx: number }[] = [];
  const maxSeconds = Math.ceil(totalSeconds);

  for (let sec = 0; sec <= maxSeconds; sec += interval) {
    const frame = sec * fps;
    if (frame > totalFrames + fps) break;
    markers.push({
      frame,
      label: `${sec}s`,
      leftPx: frameToPx(frame, fps),
    });
  }

  return markers;
}
