import type { AudioAnalysis, MusicFitMode } from "@/types";
import { markersToTimelineMetadata } from "@/types/timeline-audio";
import { beatsToMarkers, detectBeats } from "./beat-detection";
import { decodeAudioFromDataUrl } from "./decode-audio";

export type AnalyzeMusicInput = {
  dataUrl: string;
  targetDuration?: number;
  fitMode?: MusicFitMode;
};

export type MusicAnalysisResult = {
  analysis: AudioAnalysis;
  trimEnd?: number;
  loopCount?: number;
};

/**
 * Phase 1: duration + basic confidence stub.
 * Beat detection (Phase 2) will populate beatMarkers and bpm.
 */
export async function analyzeMusic(
  input: AnalyzeMusicInput,
): Promise<MusicAnalysisResult> {
  const buffer = await decodeAudioFromDataUrl(input.dataUrl);
  const duration = buffer.duration;
  const targetDuration = input.targetDuration ?? duration;
  const fitMode = input.fitMode ?? "trim";

  let trimEnd = duration;
  let loopCount = 1;

  if (fitMode === "trim" && duration > targetDuration) {
    trimEnd = targetDuration;
  } else if (fitMode === "loop" && duration < targetDuration) {
    loopCount = Math.ceil(targetDuration / duration);
  }

  const beatResult = detectBeats(buffer);
  const beatMarkers = beatsToMarkers(beatResult);

  const analysis: AudioAnalysis = {
    duration,
    bpm: beatResult.bpm,
    beatMarkers,
    phraseMarkers: [],
    wordMarkers: [],
    pauseMarkers: [],
    confidence: beatResult.confidence,
    timelineMetadata: markersToTimelineMetadata(
      { bpm: beatResult.bpm, confidence: beatResult.confidence },
      beatResult.beatTimes,
      beatResult.downbeatTimes,
      beatResult.energyPeaks,
    ),
  };

  return { analysis, trimEnd, loopCount };
}
