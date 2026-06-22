import { defaultBrandPresetId } from "@/config/brands";
import { defaultFormatId } from "@/config/formats";
import { EDITOR_FPS } from "@/types/editor";
import type { MotionSequence } from "@/types";

export function buildEmptySequence(name = "Untitled video"): MotionSequence {
  return {
    id: crypto.randomUUID(),
    name,
    format: defaultFormatId,
    brandPresetId: defaultBrandPresetId,
    fps: EDITOR_FPS,
    blocks: [],
    transitions: [],
  };
}
