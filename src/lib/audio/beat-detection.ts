import type { TimelineMarker } from "@/types";
import { getRmsAmplitude } from "./decode-audio";

export type BeatAnalysisResult = {
  bpm: number;
  beatTimes: number[];
  downbeatTimes: number[];
  energyPeaks: number[];
  confidence: number;
};

const WINDOW_SEC = 0.05;
const HOP_SEC = 0.025;
const MIN_BPM = 60;
const MAX_BPM = 200;

function computeEnergyEnvelope(buffer: AudioBuffer): { times: number[]; energies: number[] } {
  const times: number[] = [];
  const energies: number[] = [];
  const duration = buffer.duration;

  for (let t = 0; t < duration; t += HOP_SEC) {
    const end = Math.min(t + WINDOW_SEC, duration);
    times.push(t);
    energies.push(getRmsAmplitude(buffer, t, end));
  }

  return { times, energies };
}

function findPeaks(times: number[], energies: number[]): number[] {
  if (energies.length < 3) return [];

  const mean = energies.reduce((a, b) => a + b, 0) / energies.length;
  const variance =
    energies.reduce((sum, e) => sum + (e - mean) ** 2, 0) / energies.length;
  const threshold = mean + Math.sqrt(variance) * 0.6;

  const peaks: number[] = [];
  const minGapSec = 0.2;

  for (let i = 1; i < energies.length - 1; i++) {
    const e = energies[i]!;
    if (e > threshold && e > (energies[i - 1] ?? 0) && e >= (energies[i + 1] ?? 0)) {
      const time = times[i]!;
      if (peaks.length === 0 || time - peaks[peaks.length - 1]! >= minGapSec) {
        peaks.push(time);
      }
    }
  }

  return peaks;
}

function estimateBpm(onsetTimes: number[]): { bpm: number; confidence: number } {
  if (onsetTimes.length < 4) {
    return { bpm: 120, confidence: 0.2 };
  }

  const intervals: number[] = [];
  for (let i = 1; i < onsetTimes.length; i++) {
    const interval = onsetTimes[i]! - onsetTimes[i - 1]!;
    if (interval > 0.2 && interval < 1.5) {
      intervals.push(interval);
    }
  }

  if (intervals.length === 0) {
    return { bpm: 120, confidence: 0.2 };
  }

  intervals.sort((a, b) => a - b);
  const medianInterval = intervals[Math.floor(intervals.length / 2)]!;
  let bpm = 60 / medianInterval;

  while (bpm < MIN_BPM) bpm *= 2;
  while (bpm > MAX_BPM) bpm /= 2;

  const beatPeriod = 60 / bpm;
  let aligned = 0;
  for (const interval of intervals) {
    const ratio = interval / beatPeriod;
    const nearest = Math.round(ratio);
    if (nearest > 0 && Math.abs(ratio - nearest) < 0.15) {
      aligned++;
    }
  }

  const confidence = Math.min(1, aligned / intervals.length);

  return { bpm: Math.round(bpm), confidence };
}

function generateBeatGrid(
  bpm: number,
  duration: number,
  firstBeatTime = 0,
): { beatTimes: number[]; downbeatTimes: number[] } {
  const beatPeriod = 60 / bpm;
  const beatTimes: number[] = [];
  const downbeatTimes: number[] = [];

  let t = firstBeatTime;
  let beatIndex = 0;
  while (t < duration) {
    beatTimes.push(t);
    if (beatIndex % 4 === 0) {
      downbeatTimes.push(t);
    }
    t += beatPeriod;
    beatIndex++;
  }

  return { beatTimes, downbeatTimes };
}

export function detectBeats(buffer: AudioBuffer): BeatAnalysisResult {
  const { times, energies } = computeEnergyEnvelope(buffer);
  const onsetTimes = findPeaks(times, energies);
  const { bpm, confidence } = estimateBpm(onsetTimes);

  const firstBeat = onsetTimes[0] ?? 0;
  const { beatTimes, downbeatTimes } = generateBeatGrid(bpm, buffer.duration, firstBeat);

  return {
    bpm,
    beatTimes,
    downbeatTimes,
    energyPeaks: onsetTimes,
    confidence,
  };
}

export function beatsToMarkers(beats: BeatAnalysisResult): TimelineMarker[] {
  const markers: TimelineMarker[] = [];

  for (const time of beats.beatTimes) {
    const isDownbeat = beats.downbeatTimes.includes(time);
    markers.push({
      id: `beat-${time.toFixed(3)}`,
      type: isDownbeat ? "bar" : "beat",
      time,
      confidence: beats.confidence,
      source: "music",
    });
  }

  return markers;
}
