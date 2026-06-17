import { BlockLibraryPanel } from "@/components/editor/BlockLibraryPanel";
import { ExportPanel } from "@/components/editor/ExportPanel";
import { SettingsPanel } from "@/components/editor/SettingsPanel";
import { PreviewPanel } from "@/components/editor/PreviewPanel";
import { AppHeader } from "@/components/layout/AppHeader";
import { BlockTimeline } from "@/components/timeline/BlockTimeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { brandPresets } from "@/config/brands";
import { motionFormats } from "@/config/formats";
import { useEditor } from "@/context/editor-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { mediaQueries } from "@/lib/breakpoints";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

function MobileControlsBar() {
  const { brand, format, setBrand, setFormat } = useEditor();

  return (
    <div className="grid shrink-0 grid-cols-2 gap-2 border-b border-border bg-card px-3 py-2">
      <div className="min-w-0 space-y-1">
        <Label className="text-[10px] text-muted-foreground">Brand</Label>
        <Select value={brand.id} onValueChange={setBrand}>
          <SelectTrigger className="h-8 w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {brandPresets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
    </div>
  );
}

type SidePanelTabsProps = {
  className?: string;
};

function SidePanelTabs({ className }: SidePanelTabsProps) {
  const { step, setStep, clearSelection, selectedBlockId, selectedTransitionId } = useEditor();
  const [panelTab, setPanelTab] = useState<"blocks" | "settings">("blocks");
  const activeTab = step === "export" ? "export" : panelTab;

  useEffect(() => {
    if (selectedBlockId || selectedTransitionId) {
      setPanelTab("settings");
      if (step === "export") {
        setStep("motion");
      }
    }
  }, [selectedBlockId, selectedTransitionId, setStep, step]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        if (value === "export") {
          clearSelection();
          setStep("export");
          return;
        }

        setStep("motion");
        setPanelTab(value === "settings" ? "settings" : "blocks");
      }}
      className={className}
    >
      <TabsList className="mx-3 mt-2 h-8 w-auto shrink-0 justify-start rounded-md bg-secondary/50 p-0.5">
        <TabsTrigger value="blocks" className="h-7 px-3 text-xs">
          Blocks
        </TabsTrigger>
        <TabsTrigger value="settings" className="h-7 px-3 text-xs">
          Settings
        </TabsTrigger>
        <TabsTrigger value="export" className="h-7 px-3 text-xs">
          Export
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value="blocks"
        className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
      >
        <BlockLibraryPanel className="h-full w-full min-w-0 max-w-none border-r-0" />
      </TabsContent>
      <TabsContent
        value="settings"
        className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
      >
        <SettingsPanel className="h-full w-full min-w-0 max-w-none border-l-0" />
      </TabsContent>
      <TabsContent
        value="export"
        className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
      >
        <ExportPanel className="h-full w-full min-w-0 max-w-none border-l-0" />
      </TabsContent>
    </Tabs>
  );
}

function DesktopShell() {
  return (
    <>
      <div className="flex min-h-0 min-w-0 flex-1">
        <BlockLibraryPanel />
        <PreviewPanel />
        <SettingsPanel />
      </div>
      <BlockTimeline />
    </>
  );
}

function TabletShell() {
  return (
    <>
      <PreviewPanel className="min-h-[240px]" />
      <SidePanelTabs className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-border" />
      <BlockTimeline />
    </>
  );
}

function MobileShell() {
  return (
    <>
      <MobileControlsBar />
      <PreviewPanel showMeta={false} className="min-h-[160px] flex-[1.5]" />
      <BlockTimeline compact />
      <SidePanelTabs className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-border" />
    </>
  );
}

export function EditorLayout() {
  const isMobile = useMediaQuery(mediaQueries.mobile);
  const isTablet = useMediaQuery(mediaQueries.tablet);

  return (
    <div className="flex h-dvh max-w-[100vw] flex-col overflow-hidden bg-background text-foreground">
      <AppHeader compact={isMobile} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {isMobile ? <MobileShell /> : isTablet ? <TabletShell /> : <DesktopShell />}
      </div>
    </div>
  );
}
