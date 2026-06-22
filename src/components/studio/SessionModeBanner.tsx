import { AlertTriangle, Copy, Download, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "studio-session-banner-dismissed";

type SessionModeBannerProps = {
  onCopyPatch?: () => void;
  onExportPatch?: () => void;
  /** Compact inline pill under top bar (default). Set false for full-width alert. */
  compact?: boolean;
};

export function SessionModeBanner({
  onCopyPatch,
  onExportPatch,
  compact = true,
}: SessionModeBannerProps) {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === "1",
  );

  if (dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  if (compact) {
    return (
      <div className="flex shrink-0 items-center justify-center border-b border-border bg-background px-3 py-1.5">
        <div className="flex max-w-full flex-wrap items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span className="font-medium">Session-only edits</span>
          {onCopyPatch ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-[11px] text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
              onClick={onCopyPatch}
            >
              <Copy className="h-3 w-3" />
              Copy patch
            </Button>
          ) : null}
          {onExportPatch ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-[11px] text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
              onClick={onExportPatch}
            >
              <Download className="h-3 w-3" />
              Export patch
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
            onClick={dismiss}
            aria-label="Dismiss session notice"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-800 dark:text-amber-300">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 flex-1">
        <strong className="font-medium">Session-only edits.</strong> Export or copy patches to
        update{" "}
        <code className="rounded bg-background/60 px-1 font-mono text-[11px]">blocks.ts</code>.
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
        onClick={dismiss}
        aria-label="Dismiss session notice"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
