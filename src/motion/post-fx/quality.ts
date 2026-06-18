import type { ExportFXQuality, PostFXQuality } from "@/types/post-fx";

export function getPreviewQualityScale(quality: PostFXQuality): number {
  switch (quality) {
    case "off":
    case "auto":
      return 0;
    case "low":
      return 0.35;
    case "medium":
      return 0.55;
    case "high":
      return 0.85;
    default:
      return 0.55;
  }
}

export function getExportQualityScale(quality: ExportFXQuality): number {
  switch (quality) {
    case "standard":
      return 1;
    case "high":
      return 1.25;
    case "max":
      return 1.6;
    default:
      return 1.25;
  }
}

export function scaleValue(value: number, scale: number, min = 0): number {
  return Math.max(min, value * scale);
}

export function deterministicNoiseSeed(frame: number, effectId: string): number {
  let hash = frame;
  for (let i = 0; i < effectId.length; i += 1) {
    hash = (hash * 31 + effectId.charCodeAt(i)) % 10000;
  }
  return hash;
}
