import { useEditor } from "@/context/editor-context";
import { cn } from "@/lib/utils";
import type { WorkspaceTab } from "@/types/editor";

const WORKSPACE_TABS: { id: WorkspaceTab; label: string }[] = [
  { id: "script", label: "Script" },
  { id: "timeline", label: "Timeline" },
  { id: "blocks", label: "Blocks" },
  { id: "brand", label: "Brand" },
  { id: "preview", label: "Preview" },
  { id: "export", label: "Export" },
];

type WorkspaceTabsProps = {
  className?: string;
};

export function WorkspaceTabs({ className }: WorkspaceTabsProps) {
  const {
    workspaceTab,
    setWorkspaceTab,
    setStep,
    setSettingsPanelView,
    setShowBrandSystem,
    clearSelection,
  } = useEditor();

  const handleTab = (tab: WorkspaceTab) => {
    setWorkspaceTab(tab);
    switch (tab) {
      case "script":
      case "timeline":
      case "blocks":
      case "preview":
        setStep("motion");
        break;
      case "brand":
        setStep("motion");
        setSettingsPanelView("project");
        setShowBrandSystem(true);
        break;
      case "export":
        clearSelection();
        setStep("export");
        break;
    }
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-border bg-card px-2 py-1",
        className,
      )}
      role="tablist"
      aria-label="Project workspace"
    >
      {WORKSPACE_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={workspaceTab === tab.id}
          onClick={() => handleTab(tab.id)}
          className={cn(
            "shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
            workspaceTab === tab.id
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
