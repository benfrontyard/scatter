import type {
  MotionAspectRatio,
  MotionBlockLibraryEntry,
  MotionBlockSlot,
  MotionLayoutRule,
} from "@/types/motion-block-library";

export function getLayoutForFormat(
  block: MotionBlockLibraryEntry,
  aspectRatio: MotionAspectRatio,
): MotionLayoutRule | undefined {
  return block.layoutRules[aspectRatio];
}

export function getRequiredSlots(block: MotionBlockLibraryEntry): MotionBlockSlot[] {
  return block.slots.filter((slot) => slot.required);
}

export function getOptionalSlots(block: MotionBlockLibraryEntry): MotionBlockSlot[] {
  return block.slots.filter((slot) => !slot.required);
}

export function duplicateBlock(
  block: MotionBlockLibraryEntry,
  newId?: string,
): MotionBlockLibraryEntry {
  const id = newId ?? `${block.id}-copy-${Date.now()}`;
  return {
    ...structuredClone(block),
    id,
    name: `${block.name} (copy)`,
    status: "draft",
    debugMetadata: {
      ...block.debugMetadata,
      notes: `Duplicated from ${block.id}`,
    },
  };
}

export function updateBlockStatus(
  block: MotionBlockLibraryEntry,
  status: MotionBlockLibraryEntry["status"],
): MotionBlockLibraryEntry {
  return { ...block, status };
}

/** Create a minimal draft block from Builder wizard output. */
export function createDraftBlockFromBuilder(options: {
  name: string;
  family: MotionBlockLibraryEntry["family"];
  primitive: string;
  slotLabels: string[];
}): MotionBlockLibraryEntry {
  const id = `draft-${options.name.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`;
  const slots = options.slotLabels.map((label, i) => ({
    id: `slot-${i}`,
    type: (label === "Image" || label === "Video" ? "media" : label === "Logo" ? "logo" : "text") as MotionBlockLibraryEntry["slots"][number]["type"],
    role: "headline" as const,
    label,
    required: i === 0,
  }));

  return {
    id,
    name: options.name || "Untitled Block",
    description: `Draft block — ${options.primitive} layout`,
    family: options.family,
    tags: ["draft"],
    useCases: [],
    duration: 90,
    status: "draft",
    slots,
    requiredAssets: [],
    optionalAssets: [],
    layoutRules: {},
    safeAreas: { hardSafe: true, softSafe: true, respectVerticalDanger: true },
    responsiveRules: { autoShrinkText: true, reflowOnVertical: true },
    motionPreset: {
      phases: { in: "fade", main: "hold", out: "fade-out", inRatio: 0.3, mainRatio: 0.5, outRatio: 0.2 },
      easingId: "ease-out",
      entranceEasingId: "ease-out",
      exitEasingId: "ease-in-out",
      stagger: 8,
      controls: { direction: "up", intensity: "standard", speed: "standard" },
    },
    stylePreset: { textAlign: "left", emphasis: "standard" },
    fallbackRules: { missingMedia: "gradient", longText: "shrink" },
    supportedFormats: ["16:9", "9:16", "1:1", "4:5"],
    debugMetadata: { version: "0.1", notes: `Created from Builder (${options.primitive})` },
  };
}
