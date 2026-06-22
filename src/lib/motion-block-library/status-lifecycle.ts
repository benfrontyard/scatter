import type { MotionBlockStatus } from "@/types/motion-block-library";

/** Legacy `approved` is treated as published in UI and lifecycle logic. */
export function normalizeBlockStatus(status: MotionBlockStatus): MotionBlockStatus {
  return status === "approved" ? "published" : status;
}

export const MOTION_BLOCK_STATUS_LABELS: Record<MotionBlockStatus, string> = {
  draft: "Draft",
  candidate: "Candidate",
  "needs-review": "Needs Review",
  "ready-to-publish": "Ready to Publish",
  published: "Published",
  deprecated: "Deprecated",
  approved: "Published",
};

export const STUDIO_STATUS_ORDER: MotionBlockStatus[] = [
  "draft",
  "candidate",
  "needs-review",
  "ready-to-publish",
  "published",
  "approved",
  "deprecated",
];

export function statusBadgeClass(status: MotionBlockStatus): string {
  const normalized = normalizeBlockStatus(status);
  switch (normalized) {
    case "published":
      return "bg-emerald-500/15 text-emerald-600";
    case "ready-to-publish":
      return "bg-sky-500/15 text-sky-600";
    case "needs-review":
      return "bg-amber-500/15 text-amber-600";
    case "candidate":
      return "bg-violet-500/15 text-violet-600";
    case "deprecated":
      return "bg-red-500/15 text-red-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export type BlockPrimaryAction = {
  label: string;
  description: string;
  nextStatus?: MotionBlockStatus;
  variant: "default" | "outline";
  action: "status-change" | "export-review" | "export-publish" | "copy-patch" | "duplicate" | "deprecate";
};

export function getBlockPrimaryAction(
  status: MotionBlockStatus,
  canAdvance: boolean,
): BlockPrimaryAction {
  const normalized = normalizeBlockStatus(status);

  switch (normalized) {
    case "draft":
      return {
        label: "Send to Review",
        description: "Mark as candidate and queue for cross-brand testing.",
        nextStatus: "candidate",
        variant: "default",
        action: "status-change",
      };
    case "candidate":
      return {
        label: "Start Review",
        description: "Move into active review — run the test matrix across brands and formats.",
        nextStatus: "needs-review",
        variant: "default",
        action: "status-change",
      };
    case "needs-review":
      return {
        label: canAdvance ? "Mark Ready to Publish" : "Complete checklist first",
        description: canAdvance
          ? "All required checks pass — mark ready for Canvas handoff."
          : "Resolve blockers in the checklist before advancing.",
        nextStatus: canAdvance ? "ready-to-publish" : undefined,
        variant: "default",
        action: "status-change",
      };
    case "ready-to-publish":
      return {
        label: "Export Publish Package",
        description: "Generate a handoff package — Studio cannot write to blocks.ts yet.",
        variant: "default",
        action: "export-publish",
      };
    case "published":
      return {
        label: "Deprecate Block",
        description: "Mark this version deprecated in the session registry.",
        nextStatus: "deprecated",
        variant: "outline",
        action: "deprecate",
      };
    case "deprecated":
      return {
        label: "Export Review Package",
        description: "Export block JSON for archival or re-import.",
        variant: "outline",
        action: "export-review",
      };
    default:
      return {
        label: "Send to Review",
        description: "Mark as candidate and queue for cross-brand testing.",
        nextStatus: "candidate",
        variant: "default",
        action: "status-change",
      };
  }
}

export function isPublishedStatus(status: MotionBlockStatus): boolean {
  const normalized = normalizeBlockStatus(status);
  return normalized === "published";
}
