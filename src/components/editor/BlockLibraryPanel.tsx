import { blockCategories, motionBlockDefinitions } from "@/config/blocks";
import { useEditor } from "@/context/editor-context";
import { cn } from "@/lib/utils";
import type { BlockCategory } from "@/types";
import { Blocks, Plus } from "lucide-react";
import { useState } from "react";

const CATEGORY_ICONS: Record<BlockCategory, string> = {
  intro: "I",
  product: "P",
  proof: "✓",
  cta: "→",
  logo: "◆",
};

type BlockLibraryPanelProps = {
  className?: string;
};

export function BlockLibraryPanel({ className }: BlockLibraryPanelProps) {
  const { addBlock } = useEditor();
  const [activeCategory, setActiveCategory] = useState<BlockCategory>("intro");

  const blocksInCategory = motionBlockDefinitions.filter(
    (block) => block.category === activeCategory,
  );

  return (
    <aside
      className={cn("flex h-full w-full min-w-0 flex-col border-r border-border bg-card", className)}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2.5">
        <Blocks className="h-3.5 w-3.5 text-muted-foreground" />
        <h2 className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Motion Block Library
        </h2>
      </div>

      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border px-2 py-2">
        {blockCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
              activeCategory === category.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {blocksInCategory.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            No blocks in this category yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {blocksInCategory.map((block) => (
              <li key={block.id}>
                <button
                  type="button"
                  onClick={() => addBlock(block.id)}
                  className="group flex w-full items-start gap-2 rounded-md border border-transparent px-2 py-2 text-left transition-colors hover:border-border hover:bg-background"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-secondary text-[10px] font-semibold text-muted-foreground">
                    {CATEGORY_ICONS[block.category]}
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
