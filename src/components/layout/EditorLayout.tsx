import { PreviewPanel } from "@/components/editor/PreviewPanel";
import { AppHeader } from "@/components/layout/AppHeader";
import { BlockTimeline } from "@/components/timeline/BlockTimeline";
import { BlockLibraryDrawer } from "@/components/canvas/BlockLibraryDrawer";
import { SettingsInspector } from "@/components/canvas/SettingsInspector";
import { CanvasActions } from "@/components/canvas/CanvasActions";
import { ExportModal } from "@/components/canvas/ExportModal";
import { BrandPanel } from "@/components/canvas/BrandPanel";
import { useEditor } from "@/context/editor-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { mediaQueries } from "@/lib/breakpoints";
import { getSequenceDurationInFrames } from "@/lib/sequence-utils";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditorLayout() {
  const isMobile = useMediaQuery(mediaQueries.mobile);
  const { timelineCollapsed, setTimelineCollapsed, currentFrame, fps, sequence } = useEditor();

  const totalFrames = getSequenceDurationInFrames(sequence);
  const currentTime = (currentFrame / fps).toFixed(1);
  const totalTime = (totalFrames / fps).toFixed(1);

  return (
    <div className="flex h-dvh max-w-[100vw] flex-col overflow-hidden bg-background text-foreground">
      <AppHeader compact={isMobile} />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <PreviewPanel showMeta={!isMobile} className="h-full w-full" />
          <CanvasActions />
          <BlockLibraryDrawer />
          <SettingsInspector />
        </div>

        {timelineCollapsed ? (
          <div className="flex shrink-0 items-center justify-between border-t border-border bg-card px-3 py-1.5">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              onClick={() => setTimelineCollapsed(false)}
              aria-label="Expand timeline"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Timeline
              </span>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {currentTime}s / {totalTime}s
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                · {sequence.blocks.length} blocks
              </span>
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => setTimelineCollapsed(false)}
              aria-label="Expand timeline"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className={cn("relative shrink-0", isMobile && "min-h-0")}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1 z-10 h-6 w-6"
              onClick={() => setTimelineCollapsed(true)}
              aria-label="Collapse timeline"
              title="Collapse timeline"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
            <BlockTimeline compact={isMobile} />
          </div>
        )}
      </div>

      <ExportModal />
      <BrandPanel />
    </div>
  );
}
