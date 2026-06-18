import {
  getApprovedLibraryBlocks,
  getEditorBlockIdForLibraryEntry,
  getPlaygroundBlocks,
  MOTION_BLOCK_FAMILIES,
} from "@/lib/motion-block-library";
import { useEditor } from "@/context/editor-context";
import { cn } from "@/lib/utils";
import type { MotionBlockFamily } from "@/types/motion-block-library";
import { Blocks, ExternalLink, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FAMILY_ICONS: Record<MotionBlockFamily, string> = {
  "image-video": "▶",
  "ui-product": "◻",
  "data-graph": "◆",
  typography: "T",
  "illustration-icon": "◎",
  "brand-system": "★",
};

type BlockLibraryPanelProps = {
  className?: string;
};

export function BlockLibraryPanel({ className }: BlockLibraryPanelProps) {
  const {
    addBlock,
    isInternal,
    showInternalBlocks,
    setShowInternalBlocks,
    setShowStudio,
    setStudioTab,
    showToast,
  } = useEditor();
  const [activeFamily, setActiveFamily] = useState<MotionBlockFamily | "all">("all");
  const [search, setSearch] = useState("");

  const approvedBlocks = getApprovedLibraryBlocks();
  const catalogBlocks = showInternalBlocks ? getPlaygroundBlocks() : approvedBlocks;

  const filteredBlocks = useMemo(() => {
    return catalogBlocks.filter((block) => {
      if (activeFamily !== "all" && block.family !== activeFamily) return false;
      if (search && !block.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [catalogBlocks, activeFamily, search]);

  const handleAddBlock = (libraryBlockId: string) => {
    const entry = catalogBlocks.find((b) => b.id === libraryBlockId);
    if (!entry) return;

    const editorBlockId = getEditorBlockIdForLibraryEntry(entry);
    if (!editorBlockId) {
      showToast({
        message: `"${entry.name}" is approved but not yet available in the editor timeline.`,
      });
      return;
    }

    addBlock(editorBlockId);
  };

  return (
    <aside
      className={cn("flex h-full w-full min-w-0 flex-col border-r border-border bg-card", className)}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2.5">
        <Blocks className="h-3.5 w-3.5 text-muted-foreground" />
        <h2 className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Motion Blocks Library
        </h2>
      </div>

      <div className="shrink-0 border-b border-border p-2">
        {isInternal ? (
          <label className="mb-2 flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
            <input
              type="checkbox"
              checked={showInternalBlocks}
              onChange={(e) => setShowInternalBlocks(e.target.checked)}
              className="rounded border-border"
            />
            Show all block statuses (internal)
          </label>
        ) : null}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blocks…"
            className="h-8 pl-7 text-xs"
          />
        </div>
      </div>

      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border px-2 py-2">
        <button
          type="button"
          onClick={() => setActiveFamily("all")}
          className={cn(
            "shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
            activeFamily === "all"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
          )}
        >
          All
        </button>
        {MOTION_BLOCK_FAMILIES.map((family) => (
          <button
            key={family.id}
            type="button"
            onClick={() => setActiveFamily(family.id)}
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
              activeFamily === family.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            )}
          >
            {family.label.split(" ")[0]}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {catalogBlocks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-3 py-8 text-center">
            <p className="text-xs leading-relaxed text-muted-foreground">
              No approved motion blocks yet. Internal users can approve blocks in Studio → Review.
            </p>
            {isInternal ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={() => {
                  setStudioTab("review");
                  setShowStudio(true);
                }}
              >
                <ExternalLink className="h-3 w-3" />
                Open Studio Review
              </Button>
            ) : null}
          </div>
        ) : filteredBlocks.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            No blocks match your filters.
          </p>
        ) : (
          <ul className="space-y-1">
            {filteredBlocks.map((block) => (
              <li key={block.id}>
                <button
                  type="button"
                  onClick={() => handleAddBlock(block.id)}
                  className="group flex w-full items-start gap-2 rounded-md border border-transparent px-2 py-2 text-left transition-colors hover:border-border hover:bg-background"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-secondary text-[10px] font-semibold text-muted-foreground">
                    {FAMILY_ICONS[block.family]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">{block.name}</span>
                    <span className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                      {block.description}
                    </span>
                  </span>
                  <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
