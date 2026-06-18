import type { AudioAnalysis, AudioMixSettings, PauseCleanup } from "@/types";
import { DEFAULT_AUDIO_MIX } from "@/types/audio";

export function buildAudioMixSettings(options: {
  ducking?: boolean;
  pauseCleanup?: PauseCleanup;
  voiceoverAnalysis?: AudioAnalysis;
}): AudioMixSettings {
  const mix: AudioMixSettings = { ...DEFAULT_AUDIO_MIX };

  if (options.ducking === false) {
    mix.duckingEnabled = false;
  }

  if (options.pauseCleanup === "tight") {
    mix.musicFadeInMs = 300;
    mix.musicFadeOutMs = 700;
  } else if (options.pauseCleanup === "light") {
    mix.musicFadeInMs = 700;
    mix.musicFadeOutMs = 1500;
  }

  return mix;
}

export function computeMusicVolumeAtTime(
  mix: AudioMixSettings,
  timeSec: number,
  voActive: boolean,
  totalDurationSec: number,
): number {
  let volume = voActive && mix.duckingEnabled ? mix.musicVolumeUnderVo : mix.musicVolume;

  const fadeInSec = mix.musicFadeInMs / 1000;
  const fadeOutSec = mix.musicFadeOutMs / 1000;

  if (timeSec < fadeInSec) {
    volume *= timeSec / fadeInSec;
  }

  const fadeOutStart = totalDurationSec - fadeOutSec;
  if (timeSec > fadeOutStart && fadeOutStart > 0) {
    volume *= Math.max(0, (totalDurationSec - timeSec) / fadeOutSec);
  }

  return Math.max(0, Math.min(1, volume));
}

export function isVoiceoverActive(
  analysis: AudioAnalysis | undefined,
  timeSec: number,
): boolean {
  if (!analysis) return false;

  return analysis.phraseMarkers.some((phrase) => {
    const end = phrase.endTime ?? phrase.time;
    return timeSec >= phrase.time && timeSec <= end;
  });
}
