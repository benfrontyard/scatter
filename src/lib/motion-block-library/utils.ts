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
