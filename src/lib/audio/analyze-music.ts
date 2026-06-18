import type { AudioAnalysis, MusicFitMode } from "@/types";
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

  const analysis: AudioAnalysis = {
    duration,
    bpm: undefined,
    beatMarkers: [],
    phraseMarkers: [],
    wordMarkers: [],
    pauseMarkers: [],
    confidence: 0.3,
  };

  return { analysis, trimEnd, loopCount };
}
