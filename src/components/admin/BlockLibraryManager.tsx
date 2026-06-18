import { Button } from "@/components/ui/button";
import { useEditor } from "@/context/editor-context";
import {
  getPlaygroundBlocks,
  MOTION_BLOCK_FAMILIES,
  MOTION_BLOCK_STATUS_LABELS,
  isApprovedBlockUserLibraryReady,
} from "@/lib/motion-block-library";
import { statusBadgeClass } from "@/components/motion-playground/PlaygroundRightPanel";
import { cn } from "@/lib/utils";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";

export function BlockLibraryManager({ embedded = false }: { embedded?: boolean }) {
  const { showBlockLibraryManager, setShowBlockLibraryManager, isInternal } = useEditor();
  const [familyFilter, setFamilyFilter] = useState<string>("all");

  const blocks = useMemo(() => getPlaygroundBlocks(), []);

  const filtered = useMemo(() => {
    return blocks.filter((b) => familyFilter === "all" || b.family === familyFilter);
  }, [blocks, familyFilter]);

  if (!isInternal) return null;
  if (!embedded && !showBlockLibraryManager) return null;

  const content = (
    <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="mb-3 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setFamilyFilter("all")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs",
              familyFilter === "all" ? "bg-secondary" : "text-muted-foreground",
            )}
          >
            All families
          </button>
          {MOTION_BLOCK_FAMILIES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFamilyFilter(f.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs",
                familyFilter === f.id ? "bg-secondary" : "text-muted-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {filtered.map((block) => {
            const libraryReady =
              block.status !== "approved" || isApprovedBlockUserLibraryReady(block);
            return (
              <li
                key={block.id}
                className="flex items-start justify-between gap-3 rounded-md border border-border p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{block.name}</span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-medium uppercase",
                        statusBadgeClass(block.status),
                      )}
                    >
                      {MOTION_BLOCK_STATUS_LABELS[block.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{block.description}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {block.family} · {block.supportedFormats.join(", ")}
                    {block.editorBlockId ? ` · bridge: ${block.editorBlockId}` : ""}
                  </p>
                </div>
                {!libraryReady ? (
                  <span className="flex shrink-0 items-center gap-1 text-[10px] text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    Not in user library
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
  );

  if (embedded) {
    return <div className="flex h-full min-h-0 flex-col overflow-hidden">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setShowBlockLibraryManager(false)}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <span className="text-sm font-semibold">Block Library Manager</span>
      </header>
      {content}
    </div>
  );
}
