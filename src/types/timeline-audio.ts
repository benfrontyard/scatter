import type { TimelineMarker } from "./audio";

/** Extended timeline metadata from async audio analysis pipeline */
export type TimelineAudioMetadata = {
  bpm?: number;
  beatTimes: number[];
  downbeatTimes: number[];
  speechSegments: Array<{ start: number; end: number; label?: string }>;
  silenceSegments: Array<{ start: number; end: number }>;
  energyPeaks: number[];
  confidence: number;
};

export function markersToTimelineMetadata(
  markers: {
    beatMarkers?: TimelineMarker[];
    phraseMarkers?: TimelineMarker[];
    pauseMarkers?: TimelineMarker[];
    bpm?: number;
    confidence?: number;
  },
  beatTimes: number[] = [],
  downbeatTimes: number[] = [],
  energyPeaks: number[] = [],
): TimelineAudioMetadata {
  const speechSegments = (markers.phraseMarkers ?? []).map((m) => ({
    start: m.time,
    end: m.endTime ?? m.time,
    label: m.label,
  }));

  const silenceSegments = (markers.pauseMarkers ?? []).map((m) => ({
    start: m.time,
    end: m.endTime ?? m.time,
  }));

  return {
    bpm: markers.bpm,
    beatTimes: beatTimes.length > 0
      ? beatTimes
      : (markers.beatMarkers ?? []).map((m) => m.time),
    downbeatTimes,
    speechSegments,
    silenceSegments,
    energyPeaks,
    confidence: markers.confidence ?? 0.5,
  };
}
