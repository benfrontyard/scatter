import { useEditor } from "@/context/editor-context";
import { cn } from "@/lib/utils";
import { Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

type CanvasActionsProps = {
  className?: string;
};

export function CanvasActions({ className }: CanvasActionsProps) {
  const {
    setShowBlockLibraryDrawer,
    openSettingsInspector,
    showSettingsInspector,
    selectedBlockId,
    selectedTransitionId,
  } = useEditor();

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-4 right-4 z-20 flex flex-col gap-2",
        className,
      )}
    >
      <Button
        type="button"
        size="sm"
        className="pointer-events-auto h-9 gap-1.5 px-3 text-xs shadow-md"
        onClick={() => setShowBlockLibraryDrawer(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        Add Block
      </Button>
      <Button
        type="button"
        variant={showSettingsInspector ? "secondary" : "outline"}
        size="sm"
        className="pointer-events-auto h-9 gap-1.5 bg-card/95 px-3 text-xs shadow-md backdrop-blur-sm"
        onClick={openSettingsInspector}
        aria-pressed={showSettingsInspector}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Settings
        {(selectedBlockId || selectedTransitionId) && (
          <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
        )}
      </Button>
    </div>
  );
}
