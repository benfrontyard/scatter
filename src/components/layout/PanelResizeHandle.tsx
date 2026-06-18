import { cn } from "@/lib/utils";
import type { PointerEvent } from "react";

type PanelResizeHandleProps = {
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  active?: boolean;
  className?: string;
};

export function PanelResizeHandle({ onPointerDown, active, className }: PanelResizeHandleProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panel"
      onPointerDown={onPointerDown}
      className={cn(
        "group relative z-10 w-1 shrink-0 cursor-col-resize touch-none",
        "before:absolute before:inset-y-0 before:-left-1 before:w-3",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-px bg-border transition-colors",
          "group-hover:bg-muted-foreground/50 group-active:bg-primary",
          active && "bg-primary",
        )}
      />
    </div>
  );
}
