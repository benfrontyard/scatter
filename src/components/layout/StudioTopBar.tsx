import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOTION_ASPECT_RATIO_LABELS } from "@/config/motion/aspect-ratios";
import { useEditor } from "@/context/editor-context";
import { useStudioWorkbench } from "@/context/studio-workbench-context";
import { studioBrandPresets } from "@/lib/brand-motion-kit-adapter";
import {
  MOTION_BLOCK_STATUS_LABELS,
  statusBadgeClass,
} from "@/lib/motion-block-library";
import { cn } from "@/lib/utils";
import type { StudioTab } from "@/types/editor";
import type { MotionBlockStatus } from "@/types/motion-block-library";
import {
  ArrowLeft,
  Copy,
  Download,
  MoreHorizontal,
  Settings2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SECONDARY_TABS: { id: StudioTab; label: string }[] = [
  { id: "brand-lab", label: "Brand Lab" },
  { id: "diagnostics", label: "Diagnostics" },
];

function ScatterLogoMark() {
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-foreground sm:h-7 sm:w-7">
      <div className="flex gap-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-background" />
        <span className="h-1 w-1 rounded-full bg-background/60" />
      </div>
    </div>
  );
}

type StudioTopBarProps = {
  compact?: boolean;
};

export function StudioTopBar({ compact }: StudioTopBarProps) {
  const { setShowStudio, studioTab, setStudioTab } = useEditor();
  const { controls } = useStudioWorkbench();
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isBlocksTab = studioTab === "blocks";
  const isSecondary = studioTab === "brand-lab" || studioTab === "diagnostics";

  useEffect(() => {
    if (!showMore) return;
    const onPointerDown = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [showMore]);

  const blockStatus = controls?.blockStatus as MotionBlockStatus | null;

  return (
    <header
      className="flex h-[var(--editor-topbar-height)] shrink-0 items-center gap-1.5 border-b border-border bg-background px-2 sm:gap-2 sm:px-4"
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-8 shrink-0 gap-1.5 px-2"
        onClick={() => setShowStudio(false)}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {!compact && <span className="hidden sm:inline">Canvas</span>}
      </Button>

      <div className="flex min-w-0 items-center gap-2">
        <ScatterLogoMark />
        <div className="min-w-0 text-left">
          <div className="flex min-w-0 items-center gap-1">
            <span className="shrink-0 text-sm font-semibold tracking-tight">Scatter</span>
            {!compact && (
              <>
                <span className="text-muted-foreground/40">/</span>
                <span className="shrink-0 text-sm text-muted-foreground">Studio</span>
                {isBlocksTab && controls?.blockName ? (
                  <>
                    <span className="text-muted-foreground/40">/</span>
                    <span className="truncate text-sm text-muted-foreground">{controls.blockName}</span>
                    {blockStatus ? (
                      <span
                        className={cn(
                          "ml-1 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
                          statusBadgeClass(blockStatus),
                        )}
                      >
                        {MOTION_BLOCK_STATUS_LABELS[blockStatus]}
                      </span>
                    ) : null}
                  </>
                ) : isSecondary ? (
                  <>
                    <span className="text-muted-foreground/40">/</span>
                    <span className="truncate text-sm text-muted-foreground">
                      {SECONDARY_TABS.find((t) => t.id === studioTab)?.label}
                    </span>
                  </>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      {isBlocksTab && controls ? (
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Select value={controls.brandId} onValueChange={controls.setBrandId}>
            <SelectTrigger className="h-8 min-w-[88px] text-xs sm:min-w-[100px]" aria-label="Brand">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              {studioBrandPresets.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={controls.aspectRatio}
            onValueChange={(v) => controls.setAspectRatio(v as typeof controls.aspectRatio)}
          >
            <SelectTrigger className="h-8 w-[88px] text-xs sm:w-[100px]" aria-label="Aspect ratio">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(MOTION_ASPECT_RATIO_LABELS) as typeof controls.aspectRatio[]).map(
                (ar) => (
                  <SelectItem key={ar} value={ar}>
                    {ar}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant={controls.showPreviewSettings ? "secondary" : "outline"}
            size="sm"
            className="hidden h-8 gap-1 px-2 text-xs sm:inline-flex"
            onClick={() => controls.setShowPreviewSettings(!controls.showPreviewSettings)}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Preview
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden h-8 gap-1 px-2 text-xs md:inline-flex"
            onClick={controls.onCopyPatch}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Patch
          </Button>

          <Button
            type="button"
            size="sm"
            className="h-8 gap-1 px-2 text-xs"
            onClick={controls.onExportJson}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <div className="relative hidden sm:block" ref={moreRef}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2 text-xs"
              onClick={() => setShowMore((v) => !v)}
            >
              More
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
            {showMore ? (
              <div className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-md border border-border bg-popover p-1 shadow-md">
                {SECONDARY_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setStudioTab(tab.id);
                      setShowMore(false);
                    }}
                    className="flex w-full rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-secondary"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <nav className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setStudioTab("blocks")}
              className={cn(
                "shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                studioTab === "blocks"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
              )}
            >
              Blocks
            </button>

            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  isSecondary
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                {isSecondary
                  ? SECONDARY_TABS.find((t) => t.id === studioTab)?.label
                  : "More"}
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
              {showMore ? (
                <div className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-md border border-border bg-popover p-1 shadow-md">
                  {SECONDARY_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setStudioTab(tab.id);
                        setShowMore(false);
                      }}
                      className={cn(
                        "flex w-full rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-secondary",
                        studioTab === tab.id && "bg-secondary font-medium",
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </nav>
        </div>
      )}

      <ThemeToggle />
    </header>
  );
}
