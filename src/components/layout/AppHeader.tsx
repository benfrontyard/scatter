import { useEditor } from "@/context/editor-context";
import { AppChrome, ScatterLogo } from "@/components/layout/AppChrome";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
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
    openStudio,
    setShowShortcuts,
    goHome,
  } = useEditor();

  return (
    <AppChrome
      className="h-11 px-2 sm:px-4"
      leading={
        <>
          <button
            type="button"
            className="flex min-w-0 items-center gap-2 rounded-md px-1 py-0.5 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={goHome}
            aria-label="Back to home"
          >
            <ScatterLogo size="sm" variant="lockup" />
          </button>
          <button
            type="button"
            className="min-w-0 truncate text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setShowProjectMenu(true)}
          >
            {sequence.name}
            {isDirty ? " *" : ""}
          </button>
        </>
      }
      trailing={
        <>
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
              onClick={openStudio}
            >
              Studio
            </Button>
          ) : null}

          <Select value={user.role} onValueChange={(v) => setUserRole(v as UserRole)}>
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
        </>
      }
    />
  );
}
