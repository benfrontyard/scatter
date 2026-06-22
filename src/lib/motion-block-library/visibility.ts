import { motionBlockMap } from "@/config/blocks";
import type { MotionBlockLibraryEntry } from "@/types/motion-block-library";

export type LibraryVisibilityIssue =
  | "missing-editor-block-id"
  | "editor-block-not-found"
  | "missing-supported-formats"
  | "missing-family"
  | "missing-thumbnail";

/** Reasons an approved block may not appear in the user-facing library. */
export function getApprovedBlockVisibilityIssues(
  block: MotionBlockLibraryEntry,
): LibraryVisibilityIssue[] {
  if (block.status !== "approved" && block.status !== "published") return [];

  const issues: LibraryVisibilityIssue[] = [];

  if (!block.editorBlockId) {
    issues.push("missing-editor-block-id");
  } else if (!motionBlockMap[block.editorBlockId]) {
    issues.push("editor-block-not-found");
  }

  if (!block.supportedFormats?.length) {
    issues.push("missing-supported-formats");
  }

  if (!block.family) {
    issues.push("missing-family");
  }

  if (!block.debugMetadata?.rendererId && !block.editorBlockId) {
    issues.push("missing-thumbnail");
  }

  return issues;
}

export function isApprovedBlockUserLibraryReady(block: MotionBlockLibraryEntry): boolean {
  return getApprovedBlockVisibilityIssues(block).length === 0;
}

export const LIBRARY_VISIBILITY_WARNING =
  "Published block is not visible in Canvas library. Check required metadata, thumbnail, supported formats, and registry source.";
