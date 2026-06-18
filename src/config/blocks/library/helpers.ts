import type {
  MotionAspectRatio,
  MotionBlockLibraryEntry,
  MotionLayoutRule,
  MotionPreset,
} from "@/types/motion-block-library";

const ALL_FORMATS: MotionAspectRatio[] = ["16:9", "9:16", "1:1", "4:5", "5:4"];

export function allFormats(): MotionAspectRatio[] {
  return [...ALL_FORMATS];
}

export function baseMotion(
  overrides: Partial<MotionPreset> & Pick<MotionPreset, "phases">,
): MotionPreset {
  return {
    easingId: "ease-out",
    entranceEasingId: "ease-out",
    exitEasingId: "ease-in-out",
    stagger: 8,
    controls: { direction: "up", intensity: "standard", speed: "standard" },
    ...overrides,
  };
}

export function layout(
  landscape: MotionLayoutRule,
  vertical?: Partial<MotionLayoutRule>,
  square?: Partial<MotionLayoutRule>,
): Partial<Record<MotionAspectRatio, MotionLayoutRule>> {
  return {
    "16:9": landscape,
    "5:4": { ...landscape, ...square },
    "1:1": square ? { ...landscape, ...square } : { ...landscape, gap: (landscape.gap ?? 0.02) * 1.1 },
    "4:5": vertical ? { ...landscape, ...vertical } : { ...landscape, stackDirection: "column" },
    "9:16": vertical ? { ...landscape, ...vertical } : { ...landscape, stackDirection: "column", gap: (landscape.gap ?? 0.02) * 1.2 },
  };
}

export function block(
  entry: Omit<MotionBlockLibraryEntry, "supportedFormats"> & {
    supportedFormats?: MotionAspectRatio[];
  },
): MotionBlockLibraryEntry {
  return {
    supportedFormats: ALL_FORMATS,
    ...entry,
  };
}
