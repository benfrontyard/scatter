import { StudioBuilder } from "@/components/studio/StudioBuilder";
import { StudioProvider } from "@/context/studio-context";
import { StudioReview } from "@/components/studio/StudioReview";
import { StudioSystem } from "@/components/studio/StudioSystem";
import { useEditor } from "@/context/editor-context";
import { cn } from "@/lib/utils";
import type { StudioTab } from "@/types/editor";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const STUDIO_MODES: { id: StudioTab; label: string }[] = [
  { id: "review", label: "Review" },
  { id: "builder", label: "Builder" },
  { id: "system", label: "System" },
];

export function Studio() {
  const { isInternal, showStudio, setShowStudio, studioTab, setStudioTab } = useEditor();

  if (!isInternal || !showStudio) return null;

  return (
    <StudioProvider>
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
            {STUDIO_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setStudioTab(mode.id)}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  studioTab === mode.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                {mode.label}
              </button>
            ))}
          </nav>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden">
          {studioTab === "review" && <StudioReview />}
          {studioTab === "builder" && <StudioBuilder />}
          {studioTab === "system" && <StudioSystem />}
        </div>
      </div>
    </StudioProvider>
  );
}
