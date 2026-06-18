import type {
  AudioAnalysis,
  PauseCleanup,
  VoiceoverTrack,
  WordTimestamp,
} from "@/types";
import { markersToTimelineMetadata } from "@/types/timeline-audio";
import { decodeAudioFromDataUrl } from "./decode-audio";
import {
  applyPauseCompression,
  computeTrimBounds,
  detectPausesFromBuffer,
  pausesToMarkers,
  type DetectedPause,
} from "./pause-detection";
import {
  groupWordsIntoPhrases,
  transcriptToEstimatedWords,
  wordsToMarkers,
} from "./phrase-chunking";

export type AnalyzeVoiceoverInput = {
  dataUrl: string;
  transcript?: string;
  wordTimestamps?: WordTimestamp[];
  pauseCleanup?: PauseCleanup;
};

export type VoiceoverAnalysisResult = {
  analysis: AudioAnalysis;
  trimStart: number;
  trimEnd: number;
  adjustedWords: WordTimestamp[];
  pauses: DetectedPause[];
};

function getPauseOptions(pauseCleanup: PauseCleanup) {
  switch (pauseCleanup) {
    case "off":
      return { longPauseThreshold: Infinity };
    case "light":
      return { longPauseThreshold: 1.2, compressedPauseDuration: 0.5 };
    case "tight":
      return { longPauseThreshold: 0.5, compressedPauseDuration: 0.25 };
    case "standard":
    default:
      return { longPauseThreshold: 0.7, compressedPauseDuration: 0.375 };
  }
}

function adjustWordTimestamps(
  words: WordTimestamp[],
  pauses: DetectedPause[],
  pauseCleanup: PauseCleanup,
): WordTimestamp[] {
  if (pauseCleanup === "off") return words;

  return words.map((word) => ({
    ...word,
    startTime: applyPauseCompression(word.startTime, pauses.filter((p) => p.isLong)),
    endTime: applyPauseCompression(word.endTime, pauses.filter((p) => p.isLong)),
  }));
}

export async function analyzeVoiceover(
  input: AnalyzeVoiceoverInput,
): Promise<VoiceoverAnalysisResult> {
  const pauseCleanup = input.pauseCleanup ?? "standard";
  const buffer = await decodeAudioFromDataUrl(input.dataUrl);
  const duration = buffer.duration;

  const pauseOptions = getPauseOptions(pauseCleanup);
  const pauses = detectPausesFromBuffer(buffer, pauseOptions);
  const { trimStart, trimEnd } =
    pauseCleanup === "off"
      ? { trimStart: 0, trimEnd: duration }
      : computeTrimBounds(pauses, duration);

  let words: WordTimestamp[];

  if (input.wordTimestamps && input.wordTimestamps.length > 0) {
    words = input.wordTimestamps;
  } else if (input.transcript?.trim()) {
    words = transcriptToEstimatedWords(input.transcript, trimEnd - trimStart);
    words = words.map((w) => ({
      ...w,
      startTime: w.startTime + trimStart,
      endTime: w.endTime + trimStart,
    }));
  } else {
    words = [];
  }

  const longPauses = pauseCleanup === "off" ? [] : pauses.filter((p) => p.isLong);
  const adjustedWords = adjustWordTimestamps(words, longPauses, pauseCleanup);

  const phraseMarkers = groupWordsIntoPhrases(adjustedWords);
  const wordMarkers = wordsToMarkers(adjustedWords);
  const pauseMarkers = pausesToMarkers(pauses);

  const effectiveDuration =
    pauseCleanup === "off"
      ? duration
      : applyPauseCompression(trimEnd, longPauses) -
        applyPauseCompression(trimStart, longPauses);

  const analysis: AudioAnalysis = {
    duration: Math.max(effectiveDuration, 0.1),
    phraseMarkers,
    wordMarkers,
    pauseMarkers,
    beatMarkers: [],
    confidence: input.wordTimestamps?.length ? 0.95 : input.transcript ? 0.6 : 0.4,
    timelineMetadata: markersToTimelineMetadata({
      phraseMarkers,
      pauseMarkers,
      confidence: input.wordTimestamps?.length ? 0.95 : input.transcript ? 0.6 : 0.4,
    }),
  };

  return {
    analysis,
    trimStart,
    trimEnd,
    adjustedWords,
    pauses,
  };
}

export async function analyzeVoiceoverTrack(
  track: VoiceoverTrack,
  dataUrl: string,
  pauseCleanup: PauseCleanup = "standard",
): Promise<VoiceoverAnalysisResult> {
  return analyzeVoiceover({
    dataUrl,
    transcript: track.transcript,
    wordTimestamps: track.wordTimestamps,
    pauseCleanup,
  });
}
