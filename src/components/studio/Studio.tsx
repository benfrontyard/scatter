import { BlockBuilder } from "@/components/admin/BlockBuilder";
import { BlockLibraryManager } from "@/components/admin/BlockLibraryManager";
import { BrandTestLab } from "@/components/admin/BrandTestLab";
import { DebugTools } from "@/components/admin/DebugTools";
import { MotionBlockPlayground } from "@/components/motion-playground/MotionBlockPlayground";
import { useEditor } from "@/context/editor-context";
import { cn } from "@/lib/utils";
import type { StudioTab } from "@/types/editor";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const STUDIO_TABS: { id: StudioTab; label: string }[] = [
  { id: "playground", label: "Playground" },
  { id: "library", label: "Library" },
  { id: "builder", label: "Builder" },
  { id: "brand-test", label: "Brand Test" },
  { id: "debug", label: "Debug" },
];

export function Studio() {
  const { isInternal, showStudio, setShowStudio, studioTab, setStudioTab } = useEditor();

  if (!isInternal || !showStudio) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setShowStudio(false)}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Canvas
        </Button>
        <span className="text-sm font-semibold">Studio</span>
        <nav className="ml-2 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {STUDIO_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStudioTab(tab.id)}
              className={cn(
                "shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                studioTab === tab.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {studioTab === "playground" && <MotionBlockPlayground embedded />}
        {studioTab === "library" && <BlockLibraryManager embedded />}
        {studioTab === "builder" && <BlockBuilder embedded />}
        {studioTab === "brand-test" && <BrandTestLab embedded />}
        {studioTab === "debug" && <DebugTools embedded />}
      </div>
    </div>
  );
}
