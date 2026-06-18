import { BlockLibraryPanel } from "@/components/editor/BlockLibraryPanel";
import { SettingsPanel } from "@/components/editor/SettingsPanel";
import { PreviewPanel } from "@/components/editor/PreviewPanel";
import { AppHeader } from "@/components/layout/AppHeader";
import { WorkspaceTabs } from "@/components/layout/WorkspaceTabs";
import { PanelResizeHandle } from "@/components/layout/PanelResizeHandle";
import { BlockTimeline } from "@/components/timeline/BlockTimeline";
import { motionFormats } from "@/config/formats";
import { useEditor } from "@/context/editor-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useResizablePanels } from "@/hooks/use-resizable-panels";
import { mediaQueries } from "@/lib/breakpoints";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Blocks } from "lucide-react";
import { useState } from "react";

type MobileControlsBarProps = {
  onOpenBlocks: () => void;
};

function MobileControlsBar({ onOpenBlocks }: MobileControlsBarProps) {
  const { brand, allBrands, format, setBrand, setFormat, setShowBrandSystem } = useEditor();

  return (
    <div className="grid shrink-0 grid-cols-[1fr_1fr_auto] items-end gap-2 border-b border-border bg-card px-3 py-2">
      <div className="min-w-0 space-y-1">
        <Label className="text-[10px] text-muted-foreground">Brand</Label>
        <div className="flex gap-1">
          <Select value={brand.id} onValueChange={setBrand}>
            <SelectTrigger className="h-8 w-full text-xs" aria-label="Brand preset">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allBrands.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0 px-2 text-[10px]"
            onClick={() => setShowBrandSystem(true)}
          >
            Edit
          </Button>
        </div>
      </div>
      <div className="min-w-0 space-y-1">
        <Label className="text-[10px] text-muted-foreground">Aspect</Label>
        <Select value={format.id} onValueChange={setFormat}>
          <SelectTrigger className="h-8 w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {motionFormats.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.aspectRatio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 shrink-0 px-2.5 text-xs"
        onClick={onOpenBlocks}
        aria-label="Open motion block library"
      >
        <Blocks className="h-3.5 w-3.5" />
        Blocks
      </Button>
    </div>
  );
}

function ScriptPanel() {
  const { sequence } = useEditor();
  const scriptText =
    sequence.audio?.voiceover?.transcript ??
    sequence.blocks
      .map((block) =>
        Object.entries(block.content)
          .filter(([, value]) => typeof value === "string" && value.trim())
          .map(([, value]) => value)
          .join(" "),
      )
      .filter(Boolean)
      .join("\n\n");

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="border-b border-border px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Script
        </h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {scriptText ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{scriptText}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Add voiceover or text blocks to build your script.
          </p>
        )}
      </div>
    </div>
  );
}

export function EditorLayout() {
  const isMobile = useMediaQuery(mediaQueries.mobile);
  const [mobileBlocksOpen, setMobileBlocksOpen] = useState(false);
  const { workspaceTab } = useEditor();
  const { leftWidth, rightWidth, resizing, beginResize } = useResizablePanels({
    left: { defaultWidth: 240, minWidth: 180, maxWidth: 400 },
    right: { defaultWidth: 280, minWidth: 220, maxWidth: 480 },
  });

  const showLeftPanel = workspaceTab === "blocks" || workspaceTab === "timeline";
  const showRightPanel =
    workspaceTab !== "preview" && workspaceTab !== "script" && workspaceTab !== "export";
  const showTimeline = workspaceTab === "timeline" || workspaceTab === "blocks";

  return (
    <div className="flex h-dvh max-w-[100vw] flex-col overflow-hidden bg-background text-foreground">
      <AppHeader compact={isMobile} />
      <WorkspaceTabs />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {isMobile ? <MobileControlsBar onOpenBlocks={() => setMobileBlocksOpen(true)} /> : null}

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-row flex-nowrap overflow-hidden">
          {showLeftPanel ? (
            <div
              className="hidden h-full min-h-0 shrink-0 flex-col sm:flex"
              style={{ width: leftWidth }}
            >
              <BlockLibraryPanel className="h-full w-full" />
            </div>
          ) : null}

          {showLeftPanel && !isMobile ? (
            <PanelResizeHandle
              active={resizing === "left"}
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                beginResize("left", event.clientX);
              }}
              className="max-sm:hidden"
            />
          ) : null}

          {isMobile && mobileBlocksOpen ? (
            <>
              <button
                type="button"
                className="absolute inset-0 z-30 bg-black/50 sm:hidden"
                aria-label="Close motion block library"
                onClick={() => setMobileBlocksOpen(false)}
              />
              <BlockLibraryPanel
                className={cn(
                  "absolute inset-y-0 left-0 z-40 max-h-full shadow-xl sm:hidden",
                  "w-[min(85vw,260px)] min-w-[220px] max-w-[260px]",
                )}
              />
            </>
          ) : null}

          {workspaceTab === "script" ? (
            <ScriptPanel />
          ) : (
            <PreviewPanel showMeta={!isMobile} className="min-w-0 flex-1" />
          )}

          {showRightPanel && !isMobile ? (
            <PanelResizeHandle
              active={resizing === "right"}
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                beginResize("right", event.clientX);
              }}
            />
          ) : null}

          {showRightPanel ? (
            <div
              className={cn(
                "h-full min-h-0 shrink-0",
                isMobile && "w-[clamp(200px,42vw,280px)]",
              )}
              style={isMobile ? undefined : { width: rightWidth }}
            >
              <SettingsPanel className="h-full w-full" />
            </div>
          ) : null}
        </div>

        {showTimeline ? <BlockTimeline compact={isMobile} /> : null}
      </div>
    </div>
  );
}
