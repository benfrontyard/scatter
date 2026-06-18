import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, Bug } from "lucide-react";

import type { PreviewDiagnostic } from "@/lib/motion-block-library/preview-diagnostics";

type PreviewDiagnosticsProps = {
  diagnostics: PreviewDiagnostic[];
  rendererLabel: string;
  onUseFallback: () => void;
  onViewDiagnostics: () => void;
  showDetails: boolean;
};

export function PreviewDiagnosticsPanel({
  diagnostics,
  rendererLabel,
  onUseFallback,
  onViewDiagnostics,
  showDetails,
}: PreviewDiagnosticsProps) {
  const errors = diagnostics.filter((d) => d.severity === "error");
  const warnings = diagnostics.filter((d) => d.severity === "warning");

  return (
    <div className="flex max-w-md flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card/80 p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-amber-500" />
      <div>
        <p className="text-sm font-semibold">Preview did not render</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Renderer: {rendererLabel}
        </p>
      </div>

      {(errors.length > 0 || warnings.length > 0) && showDetails ? (
        <ul className="w-full space-y-1 text-left">
          {[...errors, ...warnings].map((d) => (
            <li
              key={d.id}
              className={cn(
                "rounded border px-2 py-1 text-[10px]",
                d.severity === "error"
                  ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
              )}
            >
              {d.label}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          {errors[0]?.label ?? "Check block config, aspect ratio, and renderer path."}
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onUseFallback}>
          Use fallback renderer
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={onViewDiagnostics}>
          <Bug className="h-3 w-3" />
          View diagnostics
        </Button>
      </div>
    </div>
  );
}
