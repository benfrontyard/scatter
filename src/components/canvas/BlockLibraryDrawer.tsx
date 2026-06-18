import { BlockLibraryPanel } from "@/components/editor/BlockLibraryPanel";
import { useEditor } from "@/context/editor-context";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BlockLibraryDrawer() {
  const { showBlockLibraryDrawer, setShowBlockLibraryDrawer } = useEditor();

  if (!showBlockLibraryDrawer) return null;

  return (
    <>
      <button
        type="button"
        className="absolute inset-0 z-30 bg-black/40"
        aria-label="Close block library"
        onClick={() => setShowBlockLibraryDrawer(false)}
      />
      <div
        className={cn(
          "absolute inset-y-0 left-0 z-40 flex w-[min(320px,85vw)] min-w-[260px] flex-col shadow-xl",
          "animate-in slide-in-from-left duration-200",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-3 py-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Add Block
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowBlockLibraryDrawer(false)}
            aria-label="Close block library"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <BlockLibraryPanel className="min-h-0 flex-1 border-r-0" />
      </div>
    </>
  );
}
