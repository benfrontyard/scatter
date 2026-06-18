import type { TimelineMarker } from "@/types";
import { getRmsAmplitude } from "./decode-audio";

export type PauseDetectionOptions = {
  /** RMS threshold below which audio is considered silent */
  silenceThreshold?: number;
  /** Minimum pause duration to detect (seconds) */
  minPauseDuration?: number;
  /** Long pause threshold for compression suggestions (seconds) */
  longPauseThreshold?: number;
  /** Target duration when compressing long pauses (seconds) */
  compressedPauseDuration?: number;
  windowSizeMs?: number;
};

const DEFAULT_OPTIONS: Required<PauseDetectionOptions> = {
  silenceThreshold: 0.012,
  minPauseDuration: 0.15,
  longPauseThreshold: 0.7,
  compressedPauseDuration: 0.375,
  windowSizeMs: 50,
};

export type DetectedPause = {
  startTime: number;
  endTime: number;
  duration: number;
  isLong: boolean;
  suggestedEndTime: number;
};

export function detectPausesFromBuffer(
  buffer: AudioBuffer,
  options: PauseDetectionOptions = {},
): DetectedPause[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const windowSec = opts.windowSizeMs / 1000;
  const duration = buffer.duration;
  const pauses: DetectedPause[] = [];
  let inPause = false;
  let pauseStart = 0;

  for (let t = 0; t < duration; t += windowSec) {
    const rms = getRmsAmplitude(buffer, t, Math.min(t + windowSec, duration));
    const isSilent = rms < opts.silenceThreshold;

    if (isSilent && !inPause) {
      inPause = true;
      pauseStart = t;
    } else if (!isSilent && inPause) {
      inPause = false;
      const pauseDuration = t - pauseStart;
      if (pauseDuration >= opts.minPauseDuration) {
        const isLong = pauseDuration >= opts.longPauseThreshold;
        pauses.push({
          startTime: pauseStart,
          endTime: t,
          duration: pauseDuration,
          isLong,
          suggestedEndTime: isLong
            ? pauseStart + opts.compressedPauseDuration
            : t,
        });
      }
    }
  }

  if (inPause) {
    const pauseDuration = duration - pauseStart;
    if (pauseDuration >= opts.minPauseDuration) {
      const isLong = pauseDuration >= opts.longPauseThreshold;
      pauses.push({
        startTime: pauseStart,
        endTime: duration,
        duration: pauseDuration,
        isLong,
        suggestedEndTime: isLong
          ? pauseStart + opts.compressedPauseDuration
          : duration,
      });
    }
  }

  return pauses;
}

export function pausesToMarkers(pauses: DetectedPause[]): TimelineMarker[] {
  return pauses.map((pause, index) => ({
    id: `pause-${index}`,
    type: "pause" as const,
    time: pause.startTime,
    endTime: pause.endTime,
    label: pause.isLong ? "long pause" : "pause",
    source: "voiceover" as const,
    confidence: pause.isLong ? 0.9 : 0.7,
  }));
}

export function computeTrimBounds(
  pauses: DetectedPause[],
  duration: number,
): { trimStart: number; trimEnd: number } {
  const leading = pauses.find((p) => p.startTime < 0.05);
  const trailing = [...pauses].reverse().find((p) => p.endTime > duration - 0.05);

  return {
    trimStart: leading ? leading.suggestedEndTime : 0,
    trimEnd: trailing ? trailing.startTime + (trailing.isLong ? 0.375 : trailing.duration) : duration,
  };
}

export function applyPauseCompression(
  time: number,
  pauses: DetectedPause[],
): number {
  let offset = 0;

  for (const pause of pauses) {
    if (!pause.isLong) continue;
    if (time <= pause.startTime) break;

    const originalSpan = pause.endTime - pause.startTime;
    const compressedSpan = pause.suggestedEndTime - pause.startTime;
    const compression = originalSpan - compressedSpan;

    if (time >= pause.endTime) {
      offset += compression;
    } else if (time > pause.startTime) {
      const progress = (time - pause.startTime) / originalSpan;
      offset += compression * progress;
    }
  }

  return time - offset;
}
