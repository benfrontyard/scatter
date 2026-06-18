import type { BrandPreset } from "./brand";
import type { MotionBlockInstance } from "./motion-block";
import type { AudioAnalysis, AudioMixSettings, TimelineMarker } from "./audio";

export type RhythmDensity = "calm" | "balanced" | "high-energy";

export type SyncPriority = "voice-first" | "beat-first" | "balanced";

export type PauseCleanup = "off" | "light" | "standard" | "tight";

export type MagicEditSettings = {
  rhythm: RhythmDensity;
  syncPriority: SyncPriority;
  musicFit: "trim" | "loop" | "stretch";
  pauseCleanup: PauseCleanup;
  ducking: boolean;
  preserveManualEdits: boolean;
  sfxEnabled: boolean;
};

export const DEFAULT_MAGIC_EDIT_SETTINGS: MagicEditSettings = {
  rhythm: "balanced",
  syncPriority: "voice-first",
  musicFit: "trim",
  pauseCleanup: "standard",
  ducking: true,
  preserveManualEdits: true,
  sfxEnabled: false,
};

export type BlockTimingSuggestion = {
  blockId: string;
  startFrame: number;
  duration: number;
  phraseMarkerId?: string;
  transitionInMs?: number;
  emphasisWords?: string[];
};

export type MagicEditResult = {
  blocks: MotionBlockInstance[];
  markers: TimelineMarker[];
  mix: AudioMixSettings;
  voiceoverAnalysis: AudioAnalysis;
  musicAnalysis?: AudioAnalysis;
  blockSuggestions: BlockTimingSuggestion[];
  totalDurationFrames: number;
};

export type MagicEditInput = {
  blocks: MotionBlockInstance[];
  voiceoverAnalysis: AudioAnalysis;
  musicAnalysis?: AudioAnalysis;
  brand: BrandPreset;
  fps: number;
  projectDurationFrames?: number;
  settings: MagicEditSettings;
  lockedBlockIds?: Set<string>;
};
