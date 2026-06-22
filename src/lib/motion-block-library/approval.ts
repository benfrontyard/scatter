import { motionBlockLibrary } from "@/config/blocks/library";
import { motionBlockDefinitions, motionBlockMap } from "@/config/blocks";
import type { MotionBlockDefinition } from "@/types";
import type { MotionBlockLibraryEntry } from "@/types/motion-block-library";

/** All library blocks — playground applies status filters in the UI. */
export function getPlaygroundBlocks(): MotionBlockLibraryEntry[] {
  return [...motionBlockLibrary];
}

/** Blocks published for the user-facing motion block library. */
export function getApprovedLibraryBlocks(): MotionBlockLibraryEntry[] {
  return motionBlockLibrary.filter(
    (block) => block.status === "approved" || block.status === "published",
  );
}

/** Editor timeline definitions for approved blocks that have a renderer bridge. */
export function getUserFacingBlockDefinitions(): MotionBlockDefinition[] {
  const approvedEditorIds = new Set(
    getApprovedLibraryBlocks()
      .map((block) => block.editorBlockId)
      .filter((id): id is string => Boolean(id)),
  );

  return motionBlockDefinitions.filter((def) => approvedEditorIds.has(def.id));
}

/** Resolve the editor block id to add to the timeline for a library entry. */
export function getEditorBlockIdForLibraryEntry(
  entry: MotionBlockLibraryEntry,
): string | null {
  if (entry.editorBlockId && motionBlockMap[entry.editorBlockId]) {
    return entry.editorBlockId;
  }
  return null;
}

export function isBlockApproved(blockId: string): boolean {
  const libBlock = motionBlockLibrary.find((b) => b.id === blockId);
  if (libBlock) return libBlock.status === "approved" || libBlock.status === "published";
  return getUserFacingBlockDefinitions().some((d) => d.id === blockId);
}

export function getBlocksByFamily(
  family: MotionBlockLibraryEntry["family"],
): MotionBlockLibraryEntry[] {
  return getPlaygroundBlocks().filter((block) => block.family === family);
}

export function getBlocksByStatus(
  status: MotionBlockLibraryEntry["status"],
): MotionBlockLibraryEntry[] {
  return motionBlockLibrary.filter((block) => block.status === status);
}

export const MOTION_BLOCK_FAMILIES: {
  id: MotionBlockLibraryEntry["family"];
  label: string;
}[] = [
  { id: "image-video", label: "Image & Video" },
  { id: "ui-product", label: "UI & Product" },
  { id: "data-graph", label: "Data & Graph" },
  { id: "typography", label: "Typography" },
  { id: "illustration-icon", label: "Illustration & Icon" },
  { id: "brand-system", label: "Brand System" },
];

export { MOTION_BLOCK_STATUS_LABELS, statusBadgeClass } from "./status-lifecycle";
