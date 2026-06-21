import { motionBlockMap } from "@/config/blocks";
import { transitionDefinitionMap } from "@/config/transitions";
import { useEditor } from "@/context/editor-context";
import {
  buildTimelineLayout,
  frameToPx,
  getBlockDropIndex,
  getRulerMarkers,
  getTimelineWidthPx,
  pxToFrame,
  TIMELINE_PADDING_END,
  TIMELINE_PADDING_START,
  TIMELINE_PX_PER_SECOND,
} from "@/lib/timeline-layout";
import { framesToSeconds, getSequenceDurationInFrames } from "@/lib/sequence-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Trash2, Wand2 } from "lucide-react";
import { AudioPanelJumpButton } from "@/components/editor/AudioPanel";
import { TimelineBlockClip } from "@/components/timeline/TimelineBlockClip";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

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
  fps,
  minFrames,
  maxFrames,
  onChange,
  compact,
}: {
  label: string;
  seconds: string;
  frames: number;
  fps: number;
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
        min={minFrames / fps}
        max={maxFrames / fps}
        value={seconds}
        onChange={(event) => {
          const nextSeconds = Number.parseFloat(event.target.value);
          if (!Number.isNaN(nextSeconds)) {
            onChange(Math.round(nextSeconds * fps));
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
    deleteBlock,
    updateBlockDuration,
    updateTransitionDuration,
    reorderBlock,
    seekToFrame,
    runMagicEdit,
    isMagicEditRunning,
  } = useEditor();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [resizePreview, setResizePreview] = useState<{
    blockId: string;
    duration: number;
  } | null>(null);

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

  const phraseMarkers = useMemo(
    () => (sequence.audio?.markers ?? []).filter((m) => m.type === "phrase"),
    [sequence.audio?.markers],
  );
  const hasVoiceover = Boolean(sequence.audio?.voiceover);

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

  useEffect(() => {
    if (selectedBlockId && scrollRef.current) {
      const blockItem = layoutItems.find(
        (item) => item.kind === "block" && item.block.id === selectedBlockId,
      );
      if (blockItem && blockItem.kind === "block") {
        const blockRight = blockItem.leftPx + blockItem.widthPx;
        const container = scrollRef.current;
        const { scrollLeft, clientWidth } = container;
        const margin = 48;
        if (blockRight > scrollLeft + clientWidth - margin) {
          container.scrollLeft = blockRight - clientWidth + margin;
        } else if (blockItem.leftPx < scrollLeft + margin) {
          container.scrollLeft = Math.max(0, blockItem.leftPx - margin);
        }
      }
    }
  }, [selectedBlockId, layoutItems]);

  const handleTrackSeek = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (draggingBlockId || resizePreview) return;
      if (event.target !== event.currentTarget) return;
      handleTimelineClick(event.clientX, scrollRef.current ?? event.currentTarget);
    },
    [draggingBlockId, handleTimelineClick, resizePreview],
  );

  const getDropIndicatorLeft = useCallback(
    (index: number) => {
      const blockItems = layoutItems.filter((item) => item.kind === "block");
      if (index <= 0) {
        return TIMELINE_PADDING_START;
      }
      if (index >= blockItems.length) {
        const last = blockItems[blockItems.length - 1];
        return last ? last.leftPx + last.widthPx : TIMELINE_PADDING_START;
      }
      return blockItems[index]?.leftPx ?? TIMELINE_PADDING_START;
    },
    [layoutItems],
  );

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
          <AudioPanelJumpButton />
          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-7 shrink-0 gap-1 text-xs"
            disabled={!hasVoiceover || isMagicEditRunning || sequence.blocks.length === 0}
            onClick={() => void runMagicEdit()}
          >
            <Wand2 className="h-3 w-3" />
            {isMagicEditRunning ? "Editing…" : "Magic Edit"}
          </Button>
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
                fps={fps}
                minFrames={30}
                maxFrames={fps * 60}
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
                fps={fps}
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
                : "Drag blocks to reorder · drag handles to trim · Delete to remove"}
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

          {phraseMarkers.length > 0 ? (
            <div
              className="relative h-4 border-b border-border/40 bg-violet-500/5"
              aria-label="Voiceover phrase markers"
            >
              {phraseMarkers.map((marker) => {
                const left = frameToPx(marker.time * fps, fps);
                const endTime = marker.endTime ?? marker.time;
                const width = Math.max(
                  2,
                  frameToPx(endTime * fps, fps) - left,
                );
                return (
                  <div
                    key={marker.id}
                    className="absolute top-1 h-2 rounded-sm bg-violet-500/35"
                    style={{ left, width }}
                    title={marker.label}
                  />
                );
              })}
            </div>
          ) : null}

          {/* Tracks */}
          <div
            className={cn("relative cursor-pointer", compact ? "h-[56px]" : "h-[64px]")}
            onPointerDown={handleTrackSeek}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                clearSelection();
              }
            }}
          >
            {dropIndex !== null ? (
              <div
                className="pointer-events-none absolute top-2 bottom-2 z-50 w-0.5 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_0_2px_var(--color-card)]"
                style={{ left: getDropIndicatorLeft(dropIndex) }}
                aria-hidden
              />
            ) : null}

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
                  const isSelected = selectedBlockId === item.block.id;
                  const previewDuration =
                    resizePreview?.blockId === item.block.id
                      ? resizePreview.duration
                      : undefined;
                  const displayItem =
                    previewDuration !== undefined
                      ? {
                          ...item,
                          widthPx: Math.max(
                            compact ? 64 : 72,
                            (previewDuration / fps) * TIMELINE_PX_PER_SECOND,
                          ),
                        }
                      : item;

                  return (
                    <TimelineBlockClip
                      key={item.block.id}
                      item={displayItem}
                      fps={fps}
                      isSelected={isSelected}
                      canDelete={sequence.blocks.length > 1}
                      isDragging={draggingBlockId === item.block.id}
                      previewDuration={previewDuration}
                      onSelect={() => selectBlock(isSelected ? null : item.block.id)}
                      onDelete={() => deleteBlock(item.block.id)}
                      onResizeStart={() => {
                        selectBlock(item.block.id);
                        setResizePreview({
                          blockId: item.block.id,
                          duration: item.block.duration,
                        });
                      }}
                      onResize={(duration) => {
                        setResizePreview({ blockId: item.block.id, duration });
                      }}
                      onResizeEnd={(duration) => {
                        updateBlockDuration(item.block.id, duration);
                        setResizePreview(null);
                      }}
                      onReorderStart={() => {
                        setDraggingBlockId(item.block.id);
                        selectBlock(item.block.id);
                      }}
                      onReorderMove={(clientX) => {
                        if (!scrollRef.current) return;
                        const nextIndex = getBlockDropIndex(
                          clientX,
                          scrollRef.current,
                          layoutItems,
                          fps,
                        );
                        setDropIndex(nextIndex);

                        const container = scrollRef.current;
                        const rect = container.getBoundingClientRect();
                        const edge = 48;
                        if (clientX < rect.left + edge) {
                          container.scrollLeft = Math.max(0, container.scrollLeft - 8);
                        } else if (clientX > rect.right - edge) {
                          container.scrollLeft += 8;
                        }
                      }}
                      onReorderEnd={(clientX) => {
                        if (scrollRef.current) {
                          const nextIndex = getBlockDropIndex(
                            clientX,
                            scrollRef.current,
                            layoutItems,
                            fps,
                          );
                          const fromIndex = sequence.blocks.findIndex(
                            (block) => block.id === item.block.id,
                          );
                          if (fromIndex !== -1 && fromIndex !== nextIndex) {
                            reorderBlock(item.block.id, nextIndex);
                          }
                        }
                        setDraggingBlockId(null);
                        setDropIndex(null);
                      }}
                    />
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
