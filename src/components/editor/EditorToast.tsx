import { useEditor } from "@/context/editor-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EditorToast() {
  const { toast, dismissToast } = useEditor();

  if (!toast) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3",
        "rounded-lg border border-border bg-card px-3 py-2 shadow-lg",
      )}
      role="status"
      aria-live="polite"
    >
      <span className="text-sm text-foreground">{toast.message}</span>
      {toast.action ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="pointer-events-auto h-7 text-xs"
          onClick={() => {
            toast.action?.onClick();
            dismissToast();
          }}
        >
          {toast.action.label}
        </Button>
      ) : null}
    </div>
  );
}
