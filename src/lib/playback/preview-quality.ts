import type { PostFXQuality } from "@/types/post-fx";

export type EffectivePreviewQuality = PostFXQuality | "auto";

const QUALITY_RANK: Record<PostFXQuality, number> = {
  off: 0,
  auto: 1,
  low: 1,
  medium: 2,
  high: 3,
};

const HEAVY_EFFECT_TYPES = new Set([
  "blur",
  "glow",
  "bloom",
  "motionBlur",
  "chromaticAberration",
  "grain",
  "noise",
]);

export function resolveEffectivePreviewQuality(
  setting: PostFXQuality | "auto",
  measuredFps: number,
  targetFps: number,
): PostFXQuality {
  if (setting !== "auto") return setting;

  const ratio = measuredFps / targetFps;
  if (ratio < 0.5) return "off";
  if (ratio < 0.7) return "low";
  if (ratio < 0.85) return "medium";
  return "high";
}

export function shouldSkipHeavyEffectInPreview(
  effectType: string,
  quality: PostFXQuality,
  isPlaying: boolean,
): boolean {
  if (!isPlaying) return false;
  if (quality === "off") return true;
  if (!HEAVY_EFFECT_TYPES.has(effectType)) return false;
  return QUALITY_RANK[quality] < QUALITY_RANK.high;
}

export function getAutoQualityFpsThresholds(targetFps: number): {
  off: number;
  low: number;
  medium: number;
} {
  return {
    off: targetFps * 0.5,
    low: targetFps * 0.7,
    medium: targetFps * 0.85,
  };
}
