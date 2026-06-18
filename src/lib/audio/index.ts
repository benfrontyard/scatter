export { decodeAudioFromDataUrl, getAudioDuration } from "./decode-audio";
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
