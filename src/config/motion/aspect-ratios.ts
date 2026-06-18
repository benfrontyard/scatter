import type { MotionAspectRatio } from "@/types/motion-block-library";

export const MOTION_ASPECT_RATIOS: MotionAspectRatio[] = [
  "16:9",
  "9:16",
  "1:1",
  "4:5",
  "5:4",
];

export const MOTION_ASPECT_RATIO_LABELS: Record<MotionAspectRatio, string> = {
  "16:9": "Landscape (16:9)",
  "9:16": "Vertical (9:16)",
  "1:1": "Square (1:1)",
  "4:5": "Portrait (4:5)",
  "5:4": "Landscape (5:4)",
};

export const MOTION_FORMAT_ID_MAP: Record<MotionAspectRatio, string> = {
  "16:9": "format-16-9",
  "9:16": "format-9-16",
  "1:1": "format-1-1",
  "4:5": "format-4-5",
  "5:4": "format-5-4",
};

export const FORMAT_ID_TO_ASPECT: Record<string, MotionAspectRatio> = Object.fromEntries(
  Object.entries(MOTION_FORMAT_ID_MAP).map(([aspect, id]) => [id, aspect as MotionAspectRatio]),
) as Record<string, MotionAspectRatio>;
