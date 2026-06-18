import { useEditor } from "@/context/editor-context";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Download,
  HelpCircle,
  Palette,
  Redo2,
  Save,
  Undo2,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { motionFormats } from "@/config/formats";
import type { UserRole } from "@/types/user";

type AppHeaderProps = {
  compact?: boolean;
};

export function AppHeader({ compact }: AppHeaderProps) {
  const {
    sequence,
    brand,
    format,
    isDirty,
    canUndo,
    canRedo,
    user,
    isInternal,
    setUserRole,
    setFormat,
    undo,
    redo,
    saveProject,
    setShowProjectMenu,
    setShowBrandPanel,
    setShowExportModal,
    setShowStudio,
    setShowShortcuts,
  } = useEditor();

  return (
    <header className="flex h-11 shrink-0 items-center gap-1.5 border-b border-border bg-background px-2 sm:gap-2 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="flex min-w-0 items-center gap-2 rounded-md px-1 py-0.5 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setShowProjectMenu(true)}
          aria-label="Open project menu"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-foreground sm:h-7 sm:w-7">
            <div className="flex gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-background" />
              <span className="h-1 w-1 rounded-full bg-background/60" />
            </div>
          </div>
          <div className="min-w-0 text-left">
            <div className="flex items-center gap-1">
              <span className="shrink-0 text-sm font-semibold tracking-tight">Scatter</span>
              {!compact && (
                <>
                  <span className="text-muted-foreground/40">/</span>
                  <span className="truncate text-sm text-muted-foreground">
                    {sequence.name}
                    {isDirty ? " *" : ""}
                  </span>
                </>
              )}
            </div>
          </div>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={undo}
          disabled={!canUndo}
          aria-label="Undo"
          title="Undo (⌘Z)"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={redo}
          disabled={!canRedo}
          aria-label="Redo"
          title="Redo (⌘⇧Z)"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </Button>
        {!compact && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 sm:inline-flex"
            onClick={saveProject}
            aria-label="Save project"
            title="Save (⌘S)"
          >
            <Save className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs"
          onClick={() => setShowBrandPanel(true)}
          aria-label="Brand kit"
        >
          <Palette className="h-3.5 w-3.5" />
          <span className="hidden max-w-[100px] truncate sm:inline">{brand.name}</span>
          <span className="sm:hidden">Brand</span>
        </Button>

        <Select value={format.id} onValueChange={setFormat}>
          <SelectTrigger className="h-8 w-[88px] text-xs sm:w-[100px]" aria-label="Aspect ratio">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {motionFormats.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.aspectRatio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isInternal ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden h-8 px-2.5 text-xs md:inline-flex"
            onClick={() => setShowStudio(true)}
          >
            Studio
          </Button>
        ) : null}

        <Select
          value={user.role}
          onValueChange={(v) => setUserRole(v as UserRole)}
        >
          <SelectTrigger className="hidden h-8 w-[90px] text-[10px] xl:flex" aria-label="User role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="internal">Internal</SelectItem>
          </SelectContent>
        </Select>

        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowShortcuts(true)}
          aria-label="Keyboard shortcuts"
          title="Shortcuts (?)"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          className={cn("h-8 px-2.5 text-xs", compact && "px-2")}
          onClick={() => setShowExportModal(true)}
          title="Export video"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </header>
  );
}
