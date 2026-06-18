import { useEditor } from "@/context/editor-context";
import { cn } from "@/lib/utils";
import type { MainNavId } from "@/types/editor";
import {
  Blocks,
  Download,
  Home,
  FolderOpen,
  Palette,
} from "lucide-react";

const MAIN_NAV_ITEMS: {
  id: MainNavId;
  label: string;
  icon: typeof Home;
}[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "brand-kits", label: "Brand Kits", icon: Palette },
  { id: "templates", label: "Templates / Blocks", icon: Blocks },
  { id: "exports", label: "Exports", icon: Download },
];

type MainNavigationProps = {
  compact?: boolean;
};

export function MainNavigation({ compact }: MainNavigationProps) {
  const {
    mainNav,
    setMainNav,
    setShowProjectMenu,
    setShowBrandSystem,
    setWorkspaceTab,
    setStep,
    clearSelection,
  } = useEditor();

  const handleNav = (id: MainNavId) => {
    setMainNav(id);
    switch (id) {
      case "home":
        setWorkspaceTab("timeline");
        setStep("motion");
        break;
      case "projects":
        setShowProjectMenu(true);
        break;
      case "brand-kits":
        setShowBrandSystem(true);
        break;
      case "templates":
        setWorkspaceTab("blocks");
        setStep("motion");
        break;
      case "exports":
        clearSelection();
        setStep("export");
        break;
    }
  };

  return (
    <nav
      className={cn(
        "flex items-center gap-0.5",
        compact ? "overflow-x-auto" : "hidden lg:flex",
      )}
      aria-label="Main navigation"
    >
      {MAIN_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNav(item.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
              mainNav === item.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {!compact ? <span>{item.label}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
