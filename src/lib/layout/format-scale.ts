import type { MotionFormat } from "@/types/format";

/** Reference short side for 1080p compositions (1080×1920, 1920×1080, etc.). */
export const REFERENCE_SHORT_SIDE = 1080;

/** Scale typography and spacing from the shorter canvas dimension — not height alone. */
export function getFormatLayoutScale(format: MotionFormat): number {
  return Math.min(format.width, format.height) / REFERENCE_SHORT_SIDE;
}
