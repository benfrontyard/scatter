import { blockCategories, motionBlockMap } from "@/config/blocks";
import { transitionDefinitionMap } from "@/config/transitions";
import { useEditor } from "@/context/editor-context";
import {
  buildTimelineLayout,
  frameToPx,
  getRulerMarkers,
  getTimelineWidthPx,
  pxToFrame,
  TIMELINE_PADDING_END,
  TIMELINE_PADDING_START,
} from "@/lib/timeline-layout";
import { framesToSeconds, getSequenceDurationInFrames } from "@/lib/sequence-utils";
import { cn } from "@/lib/utils";
import type { BlockCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

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
};

const CATEGORY_COLORS: Record<BlockCategory, string> = {
  intro: "bg-blue-400",
  logo: "bg-sky-400",
  product: "bg-violet-400",
  proof: "bg-emerald-400",
  cta: "bg-amber-400",
};

type BlockTimelineProps = {
  className?: string;
  compact?: boolean;
};

function formatTimelineTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  return `${secs}.${tenths}s`;
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

function DurationControl({
  label,
  seconds,
  frames,
  minFrames,
  maxFrames,
  onChange,
  compact,
}: {
  label: string;
  seconds: string;
  frames: number;
  minFrames: number;
  maxFrames: number;
  onChange: (frames: number) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", compact ? "flex-1" : "shrink-0")}>
      {!compact && (
        <Label className="shrink-0 text-[10px] text-muted-foreground sm:text-xs">{label}</Label>
      )}
      <Input
        type="number"
        inputMode="decimal"
        step={0.1}
        min={minFrames / 30}
        max={maxFrames / 30}
        value={seconds}
        onChange={(event) => {
          const nextSeconds = Number.parseFloat(event.target.value);
          if (!Number.isNaN(nextSeconds)) {
            onChange(Math.round(nextSeconds * 30));
          }
        }}
        className="h-7 w-14 shrink-0 px-2 text-xs tabular-nums sm:w-16"
        aria-label={`${label} in seconds`}
      />
      <Slider
        className="min-w-[72px] flex-1 sm:min-w-[96px]"
        value={[frames]}
        min={minFrames}
        max={maxFrames}
        step={1}
        onValueChange={([value]) => onChange(value)}
        aria-label={label}
      />
    </div>
  );
}

export function BlockTimeline({ className, compact }: BlockTimelineProps) {
  const {
    sequence,
    fps,
    currentFrame,
    selectedBlockId,
    selectedTransitionId,
    selectBlock,
    selectTransition,
    clearSelection,
    deleteSelectedBlock,
    updateBlockDuration,
    updateTransitionDuration,
    seekToFrame,
  } = useEditor();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  const totalFrames = useMemo(() => getSequenceDurationInFrames(sequence), [sequence]);
  const layoutItems = useMemo(
    () => buildTimelineLayout(sequence, fps, compact),
    [sequence, fps, compact],
  );
  const markers = useMemo(
    () => getRulerMarkers(totalFrames, fps, compact),
    [totalFrames, fps, compact],
  );
  const timelineWidth = useMemo(
    () => getTimelineWidthPx(totalFrames, fps),
    [totalFrames, fps],
  );
  const playheadLeft = frameToPx(currentFrame, fps);

  const selectedBlock = sequence.blocks.find((block) => block.id === selectedBlockId);
  const selectedTransition = sequence.transitions.find(
    (transition) => transition.id === selectedTransitionId,
  );
  const selectedBlockDef = selectedBlock ? motionBlockMap[selectedBlock.blockId] : undefined;
  const selectedTransitionDef = selectedTransition
    ? transitionDefinitionMap[selectedTransition.type]
    : undefined;
  const canDeleteBlock = Boolean(selectedBlock) && sequence.blocks.length > 1;

  const currentTime = currentFrame / fps;
  const totalTime = totalFrames / fps;

  const handleTimelineClick = useCallback(
    (clientX: number, container: HTMLElement) => {
      const rect = container.getBoundingClientRect();
      const scrollLeft = container.scrollLeft;
      const x = clientX - rect.left + scrollLeft;
      const frame = pxToFrame(x, fps);
      seekToFrame(Math.min(frame, totalFrames - 1));
    },
    [fps, seekToFrame, totalFrames],
  );

  const onPointerDownRuler = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      setIsDraggingPlayhead(true);
      handleTimelineClick(event.clientX, event.currentTarget);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [handleTimelineClick],
  );

  const onPointerMoveRuler = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingPlayhead) return;
      handleTimelineClick(event.clientX, event.currentTarget);
    },
    [handleTimelineClick, isDraggingPlayhead],
  );

  const onPointerUpRuler = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingPlayhead(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  useEffect(() => {
    if (!scrollRef.current || !isFocused) return;
    const playheadX = playheadLeft;
    const container = scrollRef.current;
    const { scrollLeft, clientWidth } = container;
    const margin = 80;
    if (playheadX < scrollLeft + margin) {
      container.scrollLeft = Math.max(0, playheadX - margin);
    } else if (playheadX > scrollLeft + clientWidth - margin) {
      container.scrollLeft = playheadX - clientWidth + margin;
    }
  }, [currentFrame, playheadLeft, isFocused]);

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col border-t border-border bg-card",
        compact ? "min-h-[112px]" : "h-[168px] min-h-[152px] max-h-[180px]",
        className,
      )}
    >
      <div className="flex shrink-0 flex-col gap-2 border-b border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
            Timeline
          </h2>
          <span
            className="font-mono text-[10px] tabular-nums text-muted-foreground sm:text-xs"
            aria-live="polite"
            aria-label={`Current time ${formatTimelineTime(currentTime)} of ${formatTimelineTime(totalTime)}`}
          >
            {formatTimelineTime(currentTime)} / {formatTimelineTime(totalTime)}
          </span>
          <span className="hidden truncate text-[10px] text-muted-foreground sm:inline sm:text-xs">
            · {sequence.blocks.length} blocks
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          {selectedBlock && selectedBlockDef ? (
            <>
              <span
                className={cn(
                  "truncate text-xs font-medium",
                  compact ? "max-w-[72px]" : "max-w-[140px] sm:max-w-none",
                )}
              >
                {selectedBlockDef.name}
              </span>
              <DurationControl
                label="Duration"
                seconds={framesToSeconds(selectedBlock.duration, fps)}
                frames={selectedBlock.duration}
                minFrames={30}
                maxFrames={300}
                onChange={(duration) => updateBlockDuration(selectedBlock.id, duration)}
                compact={compact}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={!canDeleteBlock}
                onClick={deleteSelectedBlock}
                aria-label="Delete selected block"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : selectedTransition && selectedTransitionDef ? (
            <>
              <span
                className={cn(
                  "truncate text-xs font-medium",
                  compact ? "max-w-[72px]" : "max-w-[140px] sm:max-w-none",
                )}
              >
                {selectedTransitionDef.name}
              </span>
              <DurationControl
                label="Transition"
                seconds={framesToSeconds(selectedTransition.duration, fps)}
                frames={selectedTransition.duration}
                minFrames={1}
                maxFrames={60}
                onChange={(duration) =>
                  updateTransitionDuration(selectedTransition.id, duration)
                }
                compact={compact}
              />
            </>
          ) : (
            <p className="text-[10px] text-muted-foreground sm:text-xs">
              {sequence.blocks.length === 0
                ? "Add a motion block to start"
                : "Click timeline to select · scrub ruler to seek"}
            </p>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain"
        tabIndex={0}
        role="group"
        aria-label="Timeline tracks"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            clearSelection();
          }
        }}
      >
        <div
          className="relative"
          style={{ width: timelineWidth, minHeight: compact ? 88 : 108 }}
        >
          {/* Time ruler */}
          <div
            className="relative h-6 cursor-pointer border-b border-border/60 bg-background/40 select-none"
            role="slider"
            aria-label="Timeline playhead"
            aria-valuemin={0}
            aria-valuemax={totalFrames}
            aria-valuenow={currentFrame}
            onPointerDown={onPointerDownRuler}
            onPointerMove={onPointerMoveRuler}
            onPointerUp={onPointerUpRuler}
            onPointerCancel={onPointerUpRuler}
          >
            {markers.map((marker) => (
              <div
                key={marker.frame}
                className="absolute top-0 flex h-full flex-col"
                style={{ left: marker.leftPx }}
              >
                <span className="mt-0.5 -translate-x-1/2 font-mono text-[9px] tabular-nums text-muted-foreground">
                  {marker.label}
                </span>
                <div className="mt-auto h-2 w-px bg-border" />
              </div>
            ))}

            {/* Playhead on ruler */}
            <div
              className="pointer-events-none absolute top-0 z-20 h-full w-0.5 -translate-x-1/2 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]"
              style={{ left: playheadLeft }}
              aria-hidden
            >
              <div className="absolute -top-0.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-red-500" />
            </div>
          </div>

          {/* Tracks */}
          <div
            className={cn("relative", compact ? "h-[56px]" : "h-[64px]")}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                clearSelection();
              }
            }}
          >
            {layoutItems.length === 0 ? (
              <div
                className="flex h-12 items-center justify-center rounded-md border border-dashed border-border px-4 text-xs text-muted-foreground"
                style={{ marginLeft: TIMELINE_PADDING_START, marginRight: TIMELINE_PADDING_END }}
              >
                Add a motion block to start
              </div>
            ) : (
              layoutItems.map((item) => {
                if (item.kind === "block") {
                  const definition = motionBlockMap[item.block.blockId];
                  const isSelected = selectedBlockId === item.block.id;
                  const colorClass =
                    BLOCK_COLORS[item.block.blockId] ??
                    "bg-secondary border-border text-foreground";
                  const category = definition?.category;
                  const categoryLabel = blockCategories.find(
                    (entry) => entry.id === category,
                  )?.label;
                  const blockName = definition?.name ?? item.block.blockId;
                  const durationLabel = formatDurationLabel(item.block.duration, fps);
                  const showLabel = item.widthPx >= 56;

                  return (
                    <button
                      key={item.block.id}
                      type="button"
                      onClick={() => selectBlock(isSelected ? null : item.block.id)}
                      style={{
                        position: "absolute",
                        left: item.leftPx,
                        width: item.widthPx,
                        top: 6,
                        bottom: 6,
                        zIndex: 10 + item.index,
                      }}
                      className={cn(
                        "overflow-hidden rounded-md border text-left transition-all",
                        colorClass,
                        isSelected
                          ? "border-foreground/50 ring-2 ring-foreground ring-offset-1 ring-offset-card shadow-sm"
                          : "hover:brightness-[0.97] dark:hover:brightness-110",
                      )}
                      aria-pressed={isSelected}
                      aria-label={`${blockName}, ${durationLabel}`}
                    >
                      <TimelineTooltip
                        label={
                          <div className="space-y-0.5">
                            <p className="font-medium">{blockName}</p>
                            <p className="text-muted-foreground">
                              {durationLabel}
                              {categoryLabel ? ` · ${categoryLabel}` : ""}
                            </p>
                          </div>
                        }
                      >
                        <div className="flex h-full min-w-0 items-center px-2 sm:px-2.5">
                          {showLabel ? (
                            <div className="flex min-w-0 items-center gap-1.5">
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
                        </div>
                      </TimelineTooltip>
                    </button>
                  );
                }

                const transitionDef = transitionDefinitionMap[item.transition.type];
                const isSelected = selectedTransitionId === item.transition.id;
                const transitionName = transitionDef?.name ?? item.transition.type;
                const durationLabel = formatDurationLabel(item.transition.duration, fps);
                const overlapLabel = `${Math.round(item.transition.overlap * 100)}% overlap`;
                const centerPx = item.leftPx + item.widthPx / 2;
                const hitWidth = 14;

                return (
                  <button
                    key={item.transition.id}
                    type="button"
                    onClick={() =>
                      selectTransition(isSelected ? null : item.transition.id)
                    }
                    style={{
                      position: "absolute",
                      left: centerPx - hitWidth / 2,
                      width: hitWidth,
                      top: 4,
                      bottom: 4,
                      zIndex: 30,
                    }}
                    className={cn(
                      "group/junction flex items-center justify-center transition-all",
                      isSelected && "z-40",
                    )}
                    aria-pressed={isSelected}
                    aria-label={`${transitionName} transition, ${durationLabel}`}
                  >
                    <TimelineTooltip
                      label={
                        <div className="space-y-0.5">
                          <p className="font-medium">{transitionName}</p>
                          <p className="text-muted-foreground">
                            {durationLabel} · {overlapLabel}
                          </p>
                        </div>
                      }
                    >
                      <div
                        className={cn(
                          "h-full w-0.5 rounded-full transition-all",
                          isSelected
                            ? "bg-foreground shadow-[0_0_0_2px_var(--color-card),0_0_0_3px_var(--color-foreground)]"
                            : "bg-foreground/25 group-hover/junction:bg-foreground/60 group-hover/junction:w-1",
                        )}
                      />
                    </TimelineTooltip>
                  </button>
                );
              })
            )}

            {/* Playhead line through tracks */}
            <div
              className="pointer-events-none absolute top-0 z-50 w-0.5 -translate-x-1/2 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]"
              style={{
                left: playheadLeft,
                height: "100%",
              }}
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  );
}
