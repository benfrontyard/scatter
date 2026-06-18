import { useEditor } from "@/context/editor-context";
import { cn } from "@/lib/utils";
import {
  Beaker,
  Bug,
  Hammer,
  Layers,
  Library,
} from "lucide-react";

type AdminNavigationProps = {
  compact?: boolean;
};

export function AdminNavigation({ compact }: AdminNavigationProps) {
  const {
    isAdminMode,
    setShowMotionPlayground,
    setShowBlockBuilder,
    setShowBlockLibraryManager,
    setShowBrandTestLab,
    setShowDebugTools,
  } = useEditor();

  if (!isAdminMode) return null;

  const items = [
    {
      label: "Motion Block Playground",
      icon: Layers,
      onClick: () => setShowMotionPlayground(true),
    },
    {
      label: "Block Builder",
      icon: Hammer,
      onClick: () => setShowBlockBuilder(true),
    },
    {
      label: "Block Library Manager",
      icon: Library,
      onClick: () => setShowBlockLibraryManager(true),
    },
    {
      label: "Brand Test Lab",
      icon: Beaker,
      onClick: () => setShowBrandTestLab(true),
    },
    {
      label: "Debug Tools",
      icon: Bug,
      onClick: () => setShowDebugTools(true),
    },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 border-l border-border pl-2",
        compact && "overflow-x-auto",
      )}
    >
      <span className="mr-1 hidden text-[10px] font-semibold uppercase tracking-wider text-amber-600 xl:inline">
        Admin
      </span>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            title={item.label}
            className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400"
          >
            <Icon className="h-3.5 w-3.5" />
            {!compact ? <span className="hidden xl:inline">{item.label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
