import { motionBlockMap } from "@/config/blocks";
import { createBlockInstance } from "@/config/sequences/default";
import type { MotionSequence } from "@/types";
import type { MotionAspectRatio, MotionBlockLibraryEntry } from "@/types/motion-block-library";

const ASPECT_TO_FORMAT: Record<MotionAspectRatio, string> = {
  "16:9": "format-16-9",
  "9:16": "format-9-16",
  "1:1": "format-1-1",
  "4:5": "format-4-5",
};

export function canUseProductionPlaygroundRenderer(entry: MotionBlockLibraryEntry): boolean {
  return Boolean(entry.editorBlockId && motionBlockMap[entry.editorBlockId]);
}

export function buildPlaygroundPreviewSequence(
  entry: MotionBlockLibraryEntry,
  options: {
    brandPresetId: string;
    aspectRatio: MotionAspectRatio;
    content: Record<string, string>;
  },
): MotionSequence | null {
  if (!canUseProductionPlaygroundRenderer(entry) || !entry.editorBlockId) {
    return null;
  }

  const formatId = ASPECT_TO_FORMAT[options.aspectRatio];
  const defaults = createBlockInstance(entry.editorBlockId);

  return {
    id: `playground-${entry.id}`,
    name: entry.name,
    format: formatId,
    brandPresetId: options.brandPresetId,
    blocks: [
      createBlockInstance(entry.editorBlockId, {
        duration: entry.duration,
        content: { ...defaults.content, ...options.content },
      }),
    ],
    transitions: [],
  };
}
