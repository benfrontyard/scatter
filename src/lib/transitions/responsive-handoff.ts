import type { MotionDirection } from "@/remotion/shared-motion";

export type AspectRatioLabel = "9:16" | "1:1" | "4:5" | "16:9" | string;

/** Reduce travel distance on narrow / portrait formats. */
export function getResponsiveTravelScale(aspectRatio: AspectRatioLabel): number {
  switch (aspectRatio) {
    case "9:16":
      return 0.62;
    case "4:5":
      return 0.78;
    case "1:1":
      return 0.88;
    case "16:9":
    default:
      return 1;
  }
}

/** Prefer vertical handoff movement in portrait. */
export function getResponsiveHandoffDirection(
  direction: MotionDirection,
  aspectRatio: AspectRatioLabel,
): MotionDirection {
  if (aspectRatio === "9:16" && (direction === "left" || direction === "right")) {
    return "up";
  }
  if (aspectRatio === "4:5" && direction === "left") {
    return "up";
  }
  return direction;
}

/** Scale transition overlap intensity for dense portrait layouts. */
export function getResponsiveOverlapScale(aspectRatio: AspectRatioLabel): number {
  switch (aspectRatio) {
    case "9:16":
      return 0.85;
    case "4:5":
      return 0.92;
    default:
      return 1;
  }
}

/** Gate full-frame push presets on portrait unless explicitly vertical. */
export function isDirectionalPushSafe(
  aspectRatio: AspectRatioLabel,
  direction: MotionDirection,
): boolean {
  if (aspectRatio === "9:16" && (direction === "left" || direction === "right")) {
    return false;
  }
  return true;
}
