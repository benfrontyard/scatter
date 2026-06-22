import { useEditor } from "@/context/editor-context";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type CanvasActionsProps = {
  className?: string;
};

export function CanvasActions({ className }: CanvasActionsProps) {
  const { setShowBlockLibraryDrawer } = useEditor();

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-4 right-4 z-20",
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
        Add Scene
      </Button>
    </div>
  );
}
