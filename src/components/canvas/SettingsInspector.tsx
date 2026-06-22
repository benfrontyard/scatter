import { SettingsPanel } from "@/components/editor/SettingsPanel";
import { useEditor } from "@/context/editor-context";
import { cn } from "@/lib/utils";
import { Pin, PinOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SettingsInspector() {
  const {
    showSettingsInspector,
    settingsInspectorPinned,
    settingsPanelView,
    selectedBlockId,
    selectedTransitionId,
    setSettingsInspectorPinned,
    setShowSettingsInspector,
    closeSettingsInspector,
  } = useEditor();

  if (!showSettingsInspector) return null;

  const inspectorTitle =
    selectedTransitionId
      ? "Transition settings"
      : selectedBlockId
        ? "Scene settings"
        : settingsPanelView === "audio"
          ? "Audio settings"
          : settingsPanelView === "camera"
            ? "Camera settings"
            : settingsPanelView === "postFx"
              ? "Post FX settings"
              : "Project settings";

  return (
    <>
      <button
        type="button"
        className="absolute inset-0 z-30 bg-black/20 sm:bg-transparent"
        aria-label="Close settings"
        onClick={closeSettingsInspector}
      />
      <aside
        className={cn(
          "absolute inset-y-0 right-0 z-40 flex w-[min(360px,92vw)] min-w-[280px] flex-col border-l border-border bg-card shadow-xl",
          "animate-in slide-in-from-right duration-200",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {inspectorTitle}
          </h2>
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSettingsInspectorPinned(!settingsInspectorPinned)}
              aria-label={settingsInspectorPinned ? "Unpin settings" : "Pin settings"}
              title={settingsInspectorPinned ? "Unpin" : "Pin open"}
            >
              {settingsInspectorPinned ? (
                <PinOff className="h-3.5 w-3.5" />
              ) : (
                <Pin className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setSettingsInspectorPinned(false);
                setShowSettingsInspector(false);
              }}
              aria-label="Close settings"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <SettingsPanel className="min-h-0 flex-1 border-l-0" />
      </aside>
    </>
  );
}
