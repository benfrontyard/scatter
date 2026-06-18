export type TimelineMarkerType =
  | "beat"
  | "bar"
  | "phrase"
  | "word"
  | "pause"
  | "section"
  | "sfx";

export type TimelineMarkerSource = "voiceover" | "music" | "manual" | "ai";

export type TimelineMarker = {
  id: string;
  type: TimelineMarkerType;
  /** Start time in seconds */
  time: number;
  /** End time in seconds (for spans like phrases and pauses) */
  endTime?: number;
  confidence?: number;
  label?: string;
  source: TimelineMarkerSource;
  /** Emphasis score 0–1 for phrase/word markers */
  emphasis?: number;
};

export type WordTimestamp = {
  word: string;
  startTime: number;
  endTime: number;
  emphasis?: number;
};

export type AudioAnalysis = {
  duration: number;
  bpm?: number;
  beatMarkers: TimelineMarker[];
  phraseMarkers: TimelineMarker[];
  wordMarkers: TimelineMarker[];
  pauseMarkers: TimelineMarker[];
  confidence: number;
};

export type VoiceoverProvider = "upload" | "elevenlabs" | "custom";

export type VoiceoverTrack = {
  assetId: string;
  provider: VoiceoverProvider;
  transcript?: string;
  wordTimestamps?: WordTimestamp[];
  analysis?: AudioAnalysis;
  /** Trim leading silence in seconds (applied at playback) */
  trimStart?: number;
  /** Trim trailing silence in seconds */
  trimEnd?: number;
};

export type MusicFitMode = "trim" | "loop" | "stretch";

export type MusicTrack = {
  assetId: string;
  fitMode?: MusicFitMode;
  analysis?: AudioAnalysis;
  loopCount?: number;
};

export type AudioMixSettings = {
  voiceoverVolume: number;
  musicVolume: number;
  musicVolumeUnderVo: number;
  duckingEnabled: boolean;
  musicFadeInMs: number;
  musicFadeOutMs: number;
  voiceoverFadeInMs: number;
  voiceoverFadeOutMs: number;
};

export type SequenceAudio = {
  voiceover?: VoiceoverTrack;
  music?: MusicTrack;
  mix: AudioMixSettings;
  markers: TimelineMarker[];
};

export const DEFAULT_AUDIO_MIX: AudioMixSettings = {
  voiceoverVolume: 1,
  musicVolume: 0.35,
  musicVolumeUnderVo: 0.12,
  duckingEnabled: true,
  musicFadeInMs: 500,
  musicFadeOutMs: 1200,
  voiceoverFadeInMs: 0,
  voiceoverFadeOutMs: 300,
};
