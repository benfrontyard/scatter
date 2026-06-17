import { blockCategories, motionBlockMap } from "@/config/blocks";
import { transitionDefinitionMap } from "@/config/transitions";
import { useEditor } from "@/context/editor-context";
import { buildTimelineItems, framesToSeconds } from "@/lib/sequence-utils";
import { cn } from "@/lib/utils";
import type { BlockCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowRightLeft, Trash2 } from "lucide-react";
import { useMemo } from "react";

const BLOCK_COLORS: Record<string, string> = {
  "logo-reveal": "bg-blue-500/15 border-blue-500/40 text-blue-100",
  "feature-announcement": "bg-violet-500/15 border-violet-500/40 text-violet-100",
  "product-carousel": "bg-cyan-500/15 border-cyan-500/40 text-cyan-100",
  "stat-card": "bg-emerald-500/15 border-emerald-500/40 text-emerald-100",
  "cta-lockup": "bg-amber-500/15 border-amber-500/40 text-amber-100",
};

const CATEGORY_COLORS: Record<BlockCategory, string> = {
  intro: "bg-blue-400",
  logo: "bg-sky-400",
  product: "bg-violet-400",
  proof: "bg-emerald-400",
  cta: "bg-amber-400",
};

const PX_PER_SECOND = 56;
const MIN_BLOCK_WIDTH = 88;
const MIN_TRANSITION_WIDTH = 36;
const MAX_TRANSITION_WIDTH = 72;

type BlockTimelineProps = {
  className?: string;
  compact?: boolean;
};

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
      />
    </div>
  );
}

export function BlockTimeline({ className, compact }: BlockTimelineProps) {
  const {
    sequence,
    fps,
    selectedBlockId,
    selectedTransitionId,
    selectBlock,
    selectTransition,
    clearSelection,
    deleteSelectedBlock,
    updateBlockDuration,
    updateTransitionDuration,
  } = useEditor();

  const items = useMemo(() => buildTimelineItems(sequence), [sequence]);

  const selectedBlock = sequence.blocks.find((block) => block.id === selectedBlockId);
  const selectedTransition = sequence.transitions.find(
    (transition) => transition.id === selectedTransitionId,
  );

  const selectedBlockDef = selectedBlock ? motionBlockMap[selectedBlock.blockId] : undefined;
  const selectedTransitionDef = selectedTransition
    ? transitionDefinitionMap[selectedTransition.type]
    : undefined;

  const canDeleteBlock = Boolean(selectedBlock) && sequence.blocks.length > 1;

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col border-t border-border bg-card",
        compact ? "min-h-[108px]" : "h-[168px] min-h-[148px] max-h-[188px]",
        className,
      )}
    >
      <div className="flex shrink-0 flex-col gap-2 border-b border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
            Timeline
          </h2>
          <span className="truncate text-[10px] text-muted-foreground sm:text-xs">
            {sequence.blocks.length} blocks ·{" "}
            {framesToSeconds(
              sequence.blocks.reduce((sum, block) => sum + block.duration, 0),
              fps,
            )}
            s
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
              Click timeline to select · empty area for project settings
            </p>
          )}
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            clearSelection();
          }
        }}
      >
        <div
          className={cn(
            "flex h-full min-w-max items-stretch px-3 py-2 sm:px-4 sm:py-3",
            compact ? "gap-1" : "gap-1.5",
          )}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              clearSelection();
            }
          }}
        >
          {items.length === 0 ? (
            <div className="flex h-full min-w-[200px] items-center justify-center rounded-md border border-dashed border-border px-4 text-xs text-muted-foreground">
              Add blocks from the library to build your sequence
            </div>
          ) : (
            items.map((item) => {
              if (item.kind === "block") {
                const definition = motionBlockMap[item.block.blockId];
                const isSelected = selectedBlockId === item.block.id;
                const colorClass =
                  BLOCK_COLORS[item.block.blockId] ?? "bg-secondary border-border text-foreground";
                const category = definition?.category;
                const categoryLabel = blockCategories.find((entry) => entry.id === category)?.label;
                const width = Math.max(
                  compact ? 72 : MIN_BLOCK_WIDTH,
                  (item.block.duration / fps) * PX_PER_SECOND,
                );

                return (
                  <button
                    key={item.block.id}
                    type="button"
                    onClick={() =>
                      selectBlock(isSelected ? null : item.block.id)
                    }
                    style={{ width }}
                    className={cn(
                      "flex shrink-0 flex-col justify-center rounded-md border px-2.5 py-2 text-left transition-all sm:px-3",
                      colorClass,
                      isSelected
                        ? "border-foreground/50 ring-2 ring-foreground shadow-sm"
                        : "hover:brightness-110",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-1.5">
                      {category && (
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            CATEGORY_COLORS[category],
                          )}
                          title={categoryLabel}
                        />
                      )}
                      <span className="truncate text-[11px] font-medium leading-tight sm:text-xs">
                        {definition?.name ?? item.block.blockId}
                      </span>
                    </div>
                    <span className="mt-1 truncate text-[10px] opacity-70 tabular-nums">
                      {framesToSeconds(item.block.duration, fps)}s
                    </span>
                  </button>
                );
              }

              const transitionDef = transitionDefinitionMap[item.transition.type];
              const isSelected = selectedTransitionId === item.transition.id;
              const width = Math.min(
                MAX_TRANSITION_WIDTH,
                Math.max(
                  compact ? 28 : MIN_TRANSITION_WIDTH,
                  (item.transition.duration / fps) * PX_PER_SECOND * 0.6,
                ),
              );

              return (
                <button
                  key={item.transition.id}
                  type="button"
                  onClick={() =>
                    selectTransition(isSelected ? null : item.transition.id)
                  }
                  style={{ width }}
                  className={cn(
                    "flex shrink-0 flex-col items-center justify-center self-center rounded border border-dashed px-1 py-1.5 text-center transition-all",
                    isSelected
                      ? "border-foreground/60 bg-secondary text-foreground ring-2 ring-foreground"
                      : "border-border/80 bg-background/50 text-muted-foreground hover:border-border hover:bg-secondary/40 hover:text-foreground",
                  )}
                  title={transitionDef?.name ?? item.transition.type}
                >
                  <ArrowRightLeft className="mb-0.5 h-3 w-3 shrink-0 opacity-70" />
                  <span className="line-clamp-2 text-[9px] font-medium leading-tight sm:text-[10px]">
                    {transitionDef?.name ?? item.transition.type}
                  </span>
                  <span className="mt-0.5 text-[9px] opacity-70 tabular-nums">
                    {framesToSeconds(item.transition.duration, fps)}s
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
