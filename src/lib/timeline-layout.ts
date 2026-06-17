import type { MotionSequence, SequenceTimelineItem } from "@/types";
import { buildTimelineItems } from "./sequence-utils";

export const TIMELINE_PX_PER_SECOND = 56;
export const TIMELINE_PADDING_START = 24;
export const TIMELINE_PADDING_END = 48;
export const MIN_BLOCK_WIDTH = 72;
export const MIN_TRANSITION_WIDTH = 32;
export const MAX_TRANSITION_WIDTH = 72;

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
  let cursorFrame = 0;

  return items.map((item) => {
    if (item.kind === "block") {
      const durationFrames = item.block.duration;
      const widthPx = Math.max(
        compact ? 64 : MIN_BLOCK_WIDTH,
        (durationFrames / fps) * TIMELINE_PX_PER_SECOND,
      );
      const layout: TimelineLayoutItem = {
        ...item,
        startFrame: cursorFrame,
        durationFrames,
        widthPx,
        leftPx: frameToPx(cursorFrame, fps),
      };
      cursorFrame += durationFrames;
      return layout;
    }

    const durationFrames = item.transition.duration;
    const widthPx = Math.min(
      MAX_TRANSITION_WIDTH,
      Math.max(
        compact ? 28 : MIN_TRANSITION_WIDTH,
        (durationFrames / fps) * TIMELINE_PX_PER_SECOND * 0.6,
      ),
    );
    const layout: TimelineLayoutItem = {
      ...item,
      startFrame: cursorFrame,
      durationFrames,
      widthPx,
      leftPx: frameToPx(cursorFrame, fps),
    };
    return layout;
  });
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
