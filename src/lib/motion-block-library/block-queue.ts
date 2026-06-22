import type { BrandPreset } from "@/types";
import type {
  MotionAspectRatio,
  MotionBlockLibraryEntry,
  MotionBlockWarning,
} from "@/types/motion-block-library";
import { getApprovalChecklist } from "./approval-checklist";
import { canUseProductionPlaygroundRenderer } from "./playground-preview";
import { normalizeBlockStatus, isPublishedStatus } from "./status-lifecycle";
import { getApprovedBlockVisibilityIssues, isApprovedBlockUserLibraryReady } from "./visibility";
import { validateMotionBlock } from "./validate";
import { buildSlotContent } from "@/config/motion-playground/test-scenarios";

export type BlockQueueRow = {
  block: MotionBlockLibraryEntry;
  familyLabel: string;
  status: ReturnType<typeof normalizeBlockStatus>;
  rendererHealth: "production" | "fallback" | "none";
  supportedAspectRatios: MotionAspectRatio[];
  canvasVisible: boolean;
  validationState: "pass" | "warn" | "fail";
  mainBlocker: string | null;
  lastEdited: string | null;
  needsAttention: boolean;
};

function getMainBlocker(
  block: MotionBlockLibraryEntry,
  warnings: MotionBlockWarning[],
  checklistFailed: string | null,
): string | null {
  const critical = warnings.find((w) => w.severity === "error");
  if (critical) return critical.message;

  if (checklistFailed) return checklistFailed;

  const visibility = getApprovedBlockVisibilityIssues(block);
  if (isPublishedStatus(block.status) && visibility.length > 0) {
    return `Not visible in Canvas: ${visibility.join(", ")}`;
  }

  if (!canUseProductionPlaygroundRenderer(block)) {
    return "No production renderer bridge";
  }

  return null;
}

export function buildBlockQueueRow(
  block: MotionBlockLibraryEntry,
  brands: BrandPreset[],
  familyLabel: string,
): BlockQueueRow {
  const content = buildSlotContent(block.id, "default", brands[0]?.logos.textFallback ?? "BRAND");
  const usesProduction = canUseProductionPlaygroundRenderer(block);
  const warnings = validateMotionBlock(block, "16:9", content, {}, brands[0], "default");
  const criticalCount = warnings.filter((w) => w.severity === "error").length;

  const checklist = getApprovalChecklist({
    block,
    aspectRatio: "16:9",
    warnings,
    previewRenderable: criticalCount === 0 && Boolean(block.layoutRules["16:9"]),
    productionRendererAvailable: usesProduction,
    productionRendererSucceeded: usesProduction,
    usingFallbackRenderer: !usesProduction,
  });

  const failedCheck = checklist.find((item) => item.required && !item.passed);

  let validationState: BlockQueueRow["validationState"] = "pass";
  if (criticalCount > 0 || Boolean(failedCheck)) validationState = "fail";
  else if (warnings.some((w) => w.severity === "warning")) validationState = "warn";

  const normalized = normalizeBlockStatus(block.status);
  const canvasVisible =
    isPublishedStatus(block.status) && isApprovedBlockUserLibraryReady(block);

  const needsAttention =
    normalized !== "published" &&
    normalized !== "deprecated" &&
    (validationState === "fail" || Boolean(failedCheck) || !usesProduction);

  return {
    block,
    familyLabel,
    status: normalized,
    rendererHealth: usesProduction ? "production" : block.editorBlockId ? "fallback" : "none",
    supportedAspectRatios: (block.supportedFormats ?? []) as MotionAspectRatio[],
    canvasVisible,
    validationState,
    mainBlocker: getMainBlocker(block, warnings, failedCheck?.detail ?? failedCheck?.label ?? null),
    lastEdited: block.debugMetadata?.notes?.includes("Edited")
      ? block.debugMetadata.notes
      : block.debugMetadata?.version ?? null,
    needsAttention,
  };
}

export function sortQueueRows(rows: BlockQueueRow[]): BlockQueueRow[] {
  return [...rows].sort((a, b) => {
    if (a.needsAttention !== b.needsAttention) return a.needsAttention ? -1 : 1;
    const statusOrder = ["needs-review", "candidate", "ready-to-publish", "draft", "published", "deprecated"];
    const aIdx = statusOrder.indexOf(a.status);
    const bIdx = statusOrder.indexOf(b.status);
    if (aIdx !== bIdx) return aIdx - bIdx;
    return a.block.name.localeCompare(b.block.name);
  });
}
