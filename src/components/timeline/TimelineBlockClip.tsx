import { blockCategories, motionBlockMap } from "@/config/blocks";
import {
  pxDeltaToFrames,
  TIMELINE_PX_PER_SECOND,
  type TimelineLayoutItem,
} from "@/lib/timeline-layout";
import { cn } from "@/lib/utils";
import type { BlockCategory } from "@/types";
import { GripVertical, Trash2 } from "lucide-react";
import { useCallback, useRef, type ReactNode } from "react";

const BLOCK_COLORS: Record<string, string> = {
  "logo-reveal":
    "border-blue-500/35 bg-blue-500/10 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-100",
  "feature-announcement":
    "border-violet-500/35 bg-violet-500/10 text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-100",
  "product-carousel":
    "border-cyan-500/35 bg-cyan-500/10 text-cyan-800 dark:border-cyan-500/40 dark:bg-cyan-500/15 dark:text-cyan-100",
  "stat-card":
    "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-100",
  "cta-lockup":
    "border-amber-500/35 bg-amber-500/10 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-100",
  "editorial-statement":
    "border-slate-500/35 bg-slate-500/10 text-slate-800 dark:border-slate-500/40 dark:bg-slate-500/15 dark:text-slate-100",
  "big-stat-proof":
    "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-100",
  "brand-payoff":
    "border-amber-500/35 bg-amber-500/10 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-100",
  "hero-split-text-media":
    "border-violet-500/35 bg-violet-500/10 text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-100",
  "centered-ui-feature":
    "border-cyan-500/35 bg-cyan-500/10 text-cyan-800 dark:border-cyan-500/40 dark:bg-cyan-500/15 dark:text-cyan-100",
  "hero-prompt-bar":
    "border-blue-500/35 bg-blue-500/10 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-100",
  "card-collage-dof":
    "border-fuchsia-500/35 bg-fuchsia-500/10 text-fuchsia-800 dark:border-fuchsia-500/40 dark:bg-fuchsia-500/15 dark:text-fuchsia-100",
  "template-carousel":
    "border-cyan-500/35 bg-cyan-500/10 text-cyan-800 dark:border-cyan-500/40 dark:bg-cyan-500/15 dark:text-cyan-100",
};

const CATEGORY_COLORS: Record<BlockCategory, string> = {
  intro: "bg-blue-400",
  logo: "bg-sky-400",
  product: "bg-violet-400",
  proof: "bg-emerald-400",
  cta: "bg-amber-400",
};

export const TIMELINE_MIN_BLOCK_FRAMES = 30;
export const TIMELINE_MAX_BLOCK_FRAMES = 300;

const DRAG_THRESHOLD_PX = 4;
const HANDLE_WIDTH_PX = 8;

type DragMode = "idle" | "resize-left" | "resize-right" | "reorder";

function clampDuration(frames: number): number {
  return Math.max(TIMELINE_MIN_BLOCK_FRAMES, Math.min(TIMELINE_MAX_BLOCK_FRAMES, frames));
}

function formatDurationLabel(frames: number, fps: number): string {
  return `${(frames / fps).toFixed(1)}s`;
}

function TimelineTooltip({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="group/tip relative h-full w-full">
      {children}
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-50 w-max max-w-[220px] -translate-x-1/2 rounded-md border border-border bg-popover px-2.5 py-1.5 text-[11px] leading-snug text-popover-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-visible/tip:opacity-100"
      >
        {label}
      </div>
    </div>
  );
}

type TimelineBlockClipProps = {
  item: TimelineLayoutItem & { kind: "block" };
  fps: number;
  isSelected: boolean;
  canDelete: boolean;
  isDragging: boolean;
  previewDuration?: number;
  onSelect: () => void;
  onSeek: () => void;
  onDelete: () => void;
  onResizeStart: () => void;
  onResize: (duration: number) => void;
  onResizeEnd: (duration: number) => void;
  onReorderStart: () => void;
  onReorderMove: (clientX: number) => void;
  onReorderEnd: (clientX: number) => void;
};

export function TimelineBlockClip({
  item,
  fps,
  isSelected,
  canDelete,
  isDragging,
  previewDuration,
  onSelect,
  onSeek,
  onDelete,
  onResizeStart,
  onResize,
  onResizeEnd,
  onReorderStart,
  onReorderMove,
  onReorderEnd,
}: TimelineBlockClipProps) {
  const definition = motionBlockMap[item.block.blockId];
  const colorClass =
    BLOCK_COLORS[item.block.blockId] ?? "bg-secondary border-border text-foreground";
  const category = definition?.category;
  const categoryLabel = blockCategories.find((entry) => entry.id === category)?.label;
  const blockName = definition?.name ?? item.block.blockId;

  const activeDuration = previewDuration ?? item.block.duration;
  const durationSeconds = activeDuration / fps;
  const widthPx = Math.max(item.widthPx, durationSeconds * TIMELINE_PX_PER_SECOND);
  const durationLabel = formatDurationLabel(activeDuration, fps);
  const showLabel = widthPx >= 56;

  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startDuration: number;
    didDrag: boolean;
  }>({ mode: "idle", startX: 0, startDuration: 0, didDrag: false });

  const callbacksRef = useRef({
    onSelect,
    onResizeStart,
    onResize,
    onResizeEnd,
    onReorderStart,
    onReorderMove,
    onReorderEnd,
  });
  callbacksRef.current = {
    onSelect,
    onResizeStart,
    onResize,
    onResizeEnd,
    onReorderStart,
    onReorderMove,
    onReorderEnd,
  };

  const beginDrag = useCallback((mode: DragMode, clientX: number, startDuration: number) => {
    dragRef.current = { mode, startX: clientX, startDuration, didDrag: false };

    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (drag.mode === "idle") return;

      const deltaX = event.clientX - drag.startX;

      if (!drag.didDrag && Math.abs(deltaX) < DRAG_THRESHOLD_PX) return;

      if (!drag.didDrag) {
        drag.didDrag = true;
        if (drag.mode === "resize-left" || drag.mode === "resize-right") {
          callbacksRef.current.onResizeStart();
        } else if (drag.mode === "reorder") {
          callbacksRef.current.onReorderStart();
        }
      }

      if (drag.mode === "resize-left") {
        const deltaFrames = -pxDeltaToFrames(deltaX, fps);
        callbacksRef.current.onResize(clampDuration(drag.startDuration + deltaFrames));
      } else if (drag.mode === "resize-right") {
        const deltaFrames = pxDeltaToFrames(deltaX, fps);
        callbacksRef.current.onResize(clampDuration(drag.startDuration + deltaFrames));
      } else if (drag.mode === "reorder") {
        callbacksRef.current.onReorderMove(event.clientX);
      }
    };

    const finishDrag = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (drag.mode === "idle") return;

      if (drag.mode === "resize-left" || drag.mode === "resize-right") {
        if (drag.didDrag) {
          const deltaX = event.clientX - drag.startX;
          const deltaFrames =
            drag.mode === "resize-right"
              ? pxDeltaToFrames(deltaX, fps)
              : -pxDeltaToFrames(deltaX, fps);
          callbacksRef.current.onResizeEnd(clampDuration(drag.startDuration + deltaFrames));
        }
      } else if (drag.mode === "reorder") {
        if (drag.didDrag) {
          callbacksRef.current.onReorderEnd(event.clientX);
        } else {
          callbacksRef.current.onSelect();
        }
      }

      dragRef.current = { mode: "idle", startX: 0, startDuration: 0, didDrag: false };
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
  }, [fps]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent, mode: DragMode) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      event.preventDefault();
      beginDrag(mode, event.clientX, item.block.duration);
      if (mode === "reorder") {
        onSelect();
      }
    },
    [beginDrag, item.block.duration, onSelect],
  );

  return (
    <div
      style={{
        position: "absolute",
        left: item.leftPx,
        width: widthPx,
        top: 6,
        bottom: 6,
        zIndex: isSelected || isDragging ? 40 : 10 + item.index,
      }}
      className={cn(
        "group/clip overflow-visible rounded-md border text-left transition-shadow",
        colorClass,
        isSelected
          ? "border-foreground/50 ring-2 ring-foreground ring-offset-1 ring-offset-card shadow-sm"
          : "hover:brightness-[0.97] dark:hover:brightness-110",
        isDragging && "opacity-50",
      )}
    >
      <div
        role="slider"
        aria-label={`Trim end of ${blockName}`}
        aria-valuemin={TIMELINE_MIN_BLOCK_FRAMES}
        aria-valuemax={TIMELINE_MAX_BLOCK_FRAMES}
        aria-valuenow={activeDuration}
        className={cn(
          "absolute right-0 top-0 z-20 h-full cursor-ew-resize touch-none rounded-r-md",
          "w-2.5 sm:w-3",
          isSelected
            ? "bg-foreground/15 hover:bg-foreground/25"
            : "opacity-0 group-hover/clip:opacity-100 group-hover/clip:bg-foreground/10",
        )}
        onPointerDown={(event) => handlePointerDown(event, "resize-right")}
      >
        <div
          className={cn(
            "absolute right-0.5 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-foreground/40",
            isSelected && "bg-foreground/70",
          )}
          aria-hidden
        />
      </div>

      <button
        type="button"
        className="absolute inset-x-2 inset-y-0 z-10 cursor-grab overflow-hidden rounded-sm active:cursor-grabbing"
        style={{ left: HANDLE_WIDTH_PX + 4, right: HANDLE_WIDTH_PX + 4 }}
        aria-pressed={isSelected}
        aria-label={`${blockName}, ${durationLabel}. Drag to reorder.`}
        onDoubleClick={(event) => {
          event.stopPropagation();
          onSeek();
        }}
        onPointerDown={(event) => handlePointerDown(event, "reorder")}
      >
        <TimelineTooltip
          label={
            <div className="space-y-0.5">
              <p className="font-medium">{blockName}</p>
              <p className="text-muted-foreground">
                {durationLabel}
                {categoryLabel ? ` · ${categoryLabel}` : ""}
              </p>
              <p className="text-muted-foreground">
                Click to edit · double-click to preview · drag to reorder
              </p>
            </div>
          }
        >
          <div className="flex h-full min-w-0 items-center gap-1 px-1 sm:px-1.5">
            <GripVertical
              className={cn(
                "h-3 w-3 shrink-0 text-foreground/30",
                isSelected && "text-foreground/50",
              )}
              aria-hidden
            />
            {showLabel ? (
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                {category && (
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      CATEGORY_COLORS[category],
                    )}
                    aria-hidden
                  />
                )}
                <span className="truncate text-[11px] font-medium leading-none sm:text-xs">
                  {blockName}
                </span>
              </div>
            ) : (
              <span className="sr-only">{blockName}</span>
            )}
            {isSelected ? (
              <span className="shrink-0 rounded bg-foreground/10 px-1 py-0.5 font-mono text-[9px] tabular-nums text-foreground/70">
                {durationLabel}
              </span>
            ) : null}
          </div>
        </TimelineTooltip>
      </button>

      {isSelected && canDelete ? (
        <button
          type="button"
          className="absolute -right-1 -top-1 z-30 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${blockName}`}
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      ) : null}
    </div>
  );
}
