import { useEditor } from "@/context/editor-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

const SHORTCUTS = [
  { keys: ["Space"], description: "Play / pause preview" },
  { keys: ["⌘", "Z"], description: "Undo" },
  { keys: ["⌘", "⇧", "Z"], description: "Redo" },
  { keys: ["⌘", "Y"], description: "Redo" },
  { keys: ["⌘", "S"], description: "Save project" },
  { keys: ["⌘", "N"], description: "New project" },
  { keys: ["Delete"], description: "Delete selected block or transition" },
  { keys: ["Esc"], description: "Deselect / close panel" },
  { keys: ["←", "→"], description: "Nudge playhead (timeline focused)" },
  { keys: ["?"], description: "Keyboard shortcuts" },
];

export function KeyboardShortcutsModal() {
  const { showShortcuts, setShowShortcuts } = useEditor();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showShortcuts) return;
    const onClick = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setShowShortcuts(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showShortcuts, setShowShortcuts]);

  if (!showShortcuts) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="w-full max-w-md rounded-lg border border-border bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id="shortcuts-title" className="text-sm font-semibold">
            Keyboard shortcuts
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowShortcuts(false)}
            aria-label="Close shortcuts"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto p-2">
          {SHORTCUTS.map((shortcut) => (
            <li
              key={shortcut.description}
              className="flex items-center justify-between gap-4 rounded-md px-2 py-2"
            >
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <span className="flex shrink-0 items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <kbd
                    key={`${shortcut.description}-${key}-${i}`}
                    className={cn(
                      "inline-flex min-w-[1.5rem] items-center justify-center rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-foreground",
                    )}
                  >
                    {key}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
