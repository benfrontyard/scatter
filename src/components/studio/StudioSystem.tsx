import { getPlaygroundBlocks, getBlocksByStatus, MOTION_BLOCK_STATUS_LABELS } from "@/lib/motion-block-library";
import { motionBlockLibrary } from "@/config/blocks/library";
import { useEditor } from "@/context/editor-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  getApprovedBlockVisibilityIssues,
  isApprovedBlockUserLibraryReady,
  LIBRARY_VISIBILITY_WARNING,
} from "@/lib/motion-block-library";
import { Download, Upload, Activity, Database, Blocks, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { statusBadgeClass } from "@/components/motion-playground/PlaygroundRightPanel";

export function StudioSystem() {
  const { showToast } = useEditor();
  const [importText, setImportText] = useState("");

  const registryHealth = useMemo(() => {
    const blocks = getPlaygroundBlocks();
    const approved = getBlocksByStatus("approved");
    const visibilityIssues = approved.flatMap((b) => getApprovedBlockVisibilityIssues(b));
    const notInLibrary = approved.filter((b) => !isApprovedBlockUserLibraryReady(b));
    return { total: blocks.length, approved: approved.length, visibilityIssues, notInLibrary };
  }, []);

  const handleExportAll = () => {
    const blob = new Blob([JSON.stringify(motionBlockLibrary, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "motion-block-library.json";
    anchor.click();
    URL.revokeObjectURL(url);
    showToast({ message: "Exported full block library JSON." });
  };

  const handleImport = () => {
    try {
      JSON.parse(importText);
      showToast({
        message: "JSON parsed successfully. Import is not persisted — use Export to save configs.",
      });
    } catch {
      showToast({ message: "Invalid JSON." });
    }
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold">System</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Global diagnostics, persistence status, and registry tools for the block factory.
          </p>
        </div>

        <section className="rounded-lg border border-border p-4">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Renderer diagnostics</h3>
          </div>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>Production renderer: ScatterComposition (Canvas path)</li>
            <li>Fallback renderer: PlaygroundComposition → LibraryBlockRenderer</li>
            <li>Review mode prefers production renderer when editorBlockId is bridged</li>
          </ul>
        </section>

        <section className="rounded-lg border border-border p-4">
          <div className="mb-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Persistence status</h3>
          </div>
          <div className="flex items-center gap-2 rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Block status changes are session-only. Source of truth is{" "}
            <code className="rounded bg-background/50 px-1">config/blocks/library/blocks.ts</code>
          </div>
        </section>

        <section className="rounded-lg border border-border p-4">
          <div className="mb-3 flex items-center gap-2">
            <Blocks className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Block registry health</h3>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Total blocks</dt>
              <dd className="text-lg font-semibold">{registryHealth.total}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Approved</dt>
              <dd className="text-lg font-semibold">{registryHealth.approved}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Visibility issues</dt>
              <dd className="text-lg font-semibold text-amber-600">
                {registryHealth.visibilityIssues.length}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Not in Canvas</dt>
              <dd className="text-lg font-semibold text-red-500">
                {registryHealth.notInLibrary.length}
              </dd>
            </div>
          </dl>
          {registryHealth.notInLibrary.length > 0 ? (
            <ul className="mt-3 space-y-1">
              {registryHealth.notInLibrary.map((block) => (
                <li
                  key={block.id}
                  className="flex items-center justify-between rounded border border-border px-2 py-1.5 text-xs"
                >
                  <span>{block.name}</span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[9px] font-medium uppercase",
                      statusBadgeClass(block.status),
                    )}
                  >
                    {MOTION_BLOCK_STATUS_LABELS[block.status]}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="rounded-lg border border-border p-4">
          <h3 className="mb-3 text-sm font-semibold">Canvas library visibility checks</h3>
          <p className="mb-2 text-xs text-muted-foreground">{LIBRARY_VISIBILITY_WARNING}</p>
          <ul className="space-y-1 text-[10px] text-muted-foreground">
            <li>• editorBlockId must map to a registered renderer</li>
            <li>• supportedFormats must be defined</li>
            <li>• family and thumbnail/renderer metadata required</li>
          </ul>
        </section>

        <section className="rounded-lg border border-border p-4">
          <h3 className="mb-3 text-sm font-semibold">Raw JSON import / export</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExportAll}>
              <Download className="h-3.5 w-3.5" />
              Export full library
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            <Label className="text-xs text-muted-foreground">Import JSON (validate only)</Label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='Paste block JSON…'
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
            />
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleImport}>
              <Upload className="h-3.5 w-3.5" />
              Validate JSON
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
