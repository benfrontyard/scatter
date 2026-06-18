import type { MotionFormat } from "@/types";

export const motionFormats: MotionFormat[] = [
  {
    id: "format-9-16",
    label: "Vertical",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
  },
  {
    id: "format-1-1",
    label: "Square",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
  },
  {
    id: "format-4-5",
    label: "Portrait",
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
  },
  {
    id: "format-16-9",
    label: "Landscape",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
  },
  {
    id: "format-5-4",
    label: "Landscape 5:4",
    width: 1350,
    height: 1080,
    aspectRatio: "5:4",
  },
];

export const motionFormatMap = Object.fromEntries(
  motionFormats.map((format) => [format.id, format]),
) as Record<string, MotionFormat>;

export const defaultFormatId = "format-16-9";
