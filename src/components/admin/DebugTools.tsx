import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEditor } from "@/context/editor-context";
import { cn } from "@/lib/utils";
import type { PlaygroundDebugLayer } from "@/types/motion-block-library";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

const DEBUG_TOOLS: { id: PlaygroundDebugLayer; label: string }[] = [
  { id: "canvas-bounds", label: "Show canvas bounds" },
  { id: "hard-safe", label: "Show hard safe area" },
  { id: "soft-safe", label: "Show soft safe area" },
  { id: "vertical-danger", label: "Show vertical video danger zones" },
  { id: "slot-labels", label: "Show slot boxes" },
  { id: "motion-paths", label: "Show motion paths" },
  { id: "anchor-points", label: "Show anchor points" },
  { id: "media-crops", label: "Show media crop boxes" },
  { id: "responsive-bounds", label: "Show responsive bounds" },
  { id: "text-overflow", label: "Show text overflow warnings" },
];

export function DebugTools({ embedded = false }: { embedded?: boolean }) {
  const { showDebugTools, setShowDebugTools, isInternal } = useEditor();
  const [enabled, setEnabled] = useState<PlaygroundDebugLayer[]>(["hard-safe", "slot-labels"]);

  if (!isInternal) return null;
  if (!embedded && !showDebugTools) return null;

  const toggle = (id: PlaygroundDebugLayer) => {
    setEnabled((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]));
  };

  const content = (
    <div className="flex-1 overflow-y-auto p-4">
      <p className="mb-4 text-sm text-muted-foreground">
        Toggle debug overlays for preview and playground sessions. Use Studio Playground for live
        preview with these layers.
      </p>
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">Overlay toggles</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {DEBUG_TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => toggle(tool.id)}
              className={cn(
                "rounded-md border px-3 py-2 text-left text-xs transition-colors",
                enabled.includes(tool.id)
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-secondary",
              )}
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-[10px] text-muted-foreground">
        Active: {enabled.length ? enabled.join(", ") : "none"}
      </p>
    </div>
  );

  if (embedded) {
    return <div className="h-full min-h-0 overflow-hidden">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setShowDebugTools(false)}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <span className="text-sm font-semibold">Debug Tools</span>
      </header>
      {content}
    </div>
  );
}
