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
  FolderOpen,
  HelpCircle,
  Palette,
  Redo2,
  Save,
  Undo2,
} from "lucide-react";
import { motionFormats } from "@/config/formats";

type AppHeaderProps = {
  compact?: boolean;
};

export function AppHeader({ compact }: AppHeaderProps) {
  const {
    sequence,
    brand,
    allBrands,
    format,
    step,
    isDirty,
    canUndo,
    canRedo,
    setBrand,
    setFormat,
    setStep,
    clearSelection,
    undo,
    redo,
    saveProject,
    setShowProjectMenu,
    setShowBrandSettings,
    setShowShortcuts,
  } = useEditor();

  const openExport = () => {
    clearSelection();
    setStep("export");
  };

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

      {!compact && (
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 md:flex">
          <Select value={brand.id} onValueChange={setBrand}>
            <SelectTrigger className="h-8 w-[130px] text-xs" aria-label="Brand preset">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allBrands.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowBrandSettings(true)}
            aria-label="Customize brand"
            title="Brand settings"
          >
            <Palette className="h-3.5 w-3.5" />
          </Button>

          <Select value={format.id} onValueChange={setFormat}>
            <SelectTrigger className="h-8 w-[120px] text-xs" aria-label="Aspect ratio">
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
        </div>
      )}

      <div className={cn("ml-auto flex shrink-0 items-center gap-1", compact && "gap-0.5")}>
        {!compact && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowProjectMenu(true)}
            aria-label="Projects"
            title="Projects"
          >
            <FolderOpen className="h-3.5 w-3.5" />
          </Button>
        )}
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
          className="h-8 px-2.5 text-xs"
          variant={step === "export" ? "secondary" : "default"}
          onClick={openExport}
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </header>
  );
}
