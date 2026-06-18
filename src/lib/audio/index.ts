export { decodeAudioFromDataUrl, getAudioDuration } from "./decode-audio";
export {
  getCachedAudioBuffer,
  getOrDecodeAudioBuffer,
  preloadAudioAssets,
  clearAudioBufferCache,
} from "./audio-buffer-cache";
export { WebAudioEngine } from "./audio-engine";
export type { AudioEngineConfig, AudioEngineTrack } from "./audio-engine";
export { detectBeats, beatsToMarkers } from "./beat-detection";
export type { BeatAnalysisResult } from "./beat-detection";
export {
  detectPausesFromBuffer,
  pausesToMarkers,
  computeTrimBounds,
  applyPauseCompression,
} from "./pause-detection";
export {
  groupWordsIntoPhrases,
  mergeShortPhrases,
  transcriptToEstimatedWords,
  wordsToMarkers,
} from "./phrase-chunking";
export { analyzeVoiceover, analyzeVoiceoverTrack } from "./analyze-voiceover";
export { analyzeMusic } from "./analyze-music";
export { buildAudioMixSettings, computeMusicVolumeAtTime, isVoiceoverActive } from "./audio-mix";
export { parseElevenLabsWordTimestamps, parseWordTimestampsJson } from "./parse-timestamps";
