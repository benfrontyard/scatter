import { Button } from "@/components/ui/button";
import {
  MOTION_BLOCK_STATUS_LABELS,
} from "@/lib/motion-block-library";
import { cn } from "@/lib/utils";
import type { MotionBlockLibraryEntry } from "@/types/motion-block-library";
import { statusBadgeClass } from "@/components/motion-playground/PlaygroundRightPanel";

type StudioContextualToolbarProps = {
  block: MotionBlockLibraryEntry | undefined;
  rendererLabel: string;
  onMarkNeedsReview: () => void;
  onMarkDraft: () => void;
};

export function StudioContextualToolbar({
  block,
  rendererLabel,
  onMarkNeedsReview,
  onMarkDraft,
}: StudioContextualToolbarProps) {
  if (!block) return null;

  return (
    <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border bg-muted/30 px-3">
      <span className="truncate text-xs font-medium">{block.name}</span>
      <span
        className={cn(
          "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase",
          statusBadgeClass(block.status),
        )}
      >
        {MOTION_BLOCK_STATUS_LABELS[block.status]}
      </span>
      <span className="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium uppercase text-amber-600">
        Session only
      </span>
      <span className="hidden text-[10px] text-muted-foreground sm:inline">
        Renderer: {rendererLabel}
      </span>
      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={onMarkDraft}>
          Mark draft
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={onMarkNeedsReview}>
          Needs review
        </Button>
      </div>
    </div>
  );
}
