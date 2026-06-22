import type { TimelineLayoutItem } from "@/lib/timeline-layout";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";
import type { ReactNode } from "react";

function TimelineTooltip({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="group/tip relative">
      {children}
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-max max-w-[240px] -translate-x-1/2 rounded-md border border-border bg-popover px-2.5 py-1.5 text-[11px] leading-snug text-popover-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-visible/tip:opacity-100"
      >
        {label}
      </div>
    </div>
  );
}

type TimelineTransitionMarkerProps = {
  item: TimelineLayoutItem & { kind: "transition" };
  fps: number;
  isSelected: boolean;
  transitionName: string;
  durationLabel: string;
  overlapLabel: string;
  fromBlockName?: string;
  toBlockName?: string;
  compact?: boolean;
  onSelect: () => void;
  onSeek: () => void;
};

export function TimelineTransitionMarker({
  item,
  isSelected,
  transitionName,
  durationLabel,
  overlapLabel,
  fromBlockName,
  toBlockName,
  compact,
  onSelect,
  onSeek,
}: TimelineTransitionMarkerProps) {
  const centerPx = item.leftPx + item.widthPx / 2;
  const shortName = transitionName.split(" ")[0] ?? transitionName;

  return (
    <div
      className="absolute top-0 bottom-0"
      style={{
        left: centerPx,
        zIndex: isSelected ? 55 : 50,
        transform: "translateX(-50%)",
      }}
    >
      {/* Junction guide line */}
      <div
        className={cn(
          "pointer-events-none absolute inset-y-1 left-1/2 w-px -translate-x-1/2",
          isSelected ? "bg-primary/70" : "bg-foreground/15",
        )}
        aria-hidden
      />

      <TimelineTooltip
        label={
          <div className="space-y-0.5">
            <p className="font-medium">{transitionName}</p>
            {fromBlockName && toBlockName ? (
              <p className="text-muted-foreground">
                {fromBlockName} → {toBlockName}
              </p>
            ) : null}
            <p className="text-muted-foreground">
              {durationLabel} · {overlapLabel}
            </p>
            <p className="text-muted-foreground">Click to edit · double-click to preview</p>
          </div>
        }
      >
        <button
          type="button"
          className={cn(
            "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 touch-none",
            "rounded-md border shadow-sm transition-all",
            compact ? "h-7 px-1" : "h-8 px-1.5",
            isSelected
              ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-1 ring-offset-card"
              : "border-border/80 bg-card/95 text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
          )}
          aria-pressed={isSelected}
          aria-label={`${transitionName} transition between ${fromBlockName ?? "blocks"}, ${durationLabel}`}
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          onDoubleClick={(event) => {
            event.stopPropagation();
            onSeek();
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Layers className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} aria-hidden />
          {(isSelected || item.widthPx >= 24) && !compact ? (
            <span className="max-w-[72px] truncate px-1 text-[9px] font-medium leading-none">
              {shortName}
            </span>
          ) : null}
        </button>
      </TimelineTooltip>
    </div>
  );
}
