import { motionBlockMap } from "@/config/blocks";
import { useEditor } from "@/context/editor-context";
import {
  ExportCancelledError,
  exportSequenceToMp4,
  isExportAvailable,
  type ExportStatus,
} from "@/lib/export-video";
import type { RenderJob } from "@/types/render-job";
import { framesToSeconds, getSequenceDurationInFrames } from "@/lib/sequence-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Download, Film, Loader2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { motionFormats } from "@/config/formats";

type ExportPanelProps = {
  className?: string;
  compact?: boolean;
};

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-right text-xs font-medium tabular-nums">{value}</span>
    </div>
  );
}

export function ExportPanel({ className, compact }: ExportPanelProps) {
  const { sequence, format, fps, customBrands, assets, setFormat, setFps, setIsPlaying } =
    useEditor();
  const [fileName, setFileName] = useState(() =>
    sequence.name.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() || "export",
  );
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [renderJob, setRenderJob] = useState<RenderJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const exportAbortRef = useRef<AbortController | null>(null);

  const durationInFrames = useMemo(
    () => getSequenceDurationInFrames(sequence),
    [sequence],
  );

  const exportReady = isExportAvailable();

  const blockSummaries = useMemo(
    () =>
      sequence.blocks.map((block, index) => {
        const definition = motionBlockMap[block.blockId];
        return {
          id: block.id,
          index: index + 1,
          name: definition?.name ?? block.blockId,
          duration: framesToSeconds(block.duration, fps),
        };
      }),
    [sequence.blocks, fps],
  );

  const handleExport = async () => {
    if (!exportReady) return;
    setIsPlaying(false);
    setStatus("rendering");
    setError(null);
    setRenderJob(null);

    const controller = new AbortController();
    exportAbortRef.current = controller;

    try {
      const blob = await exportSequenceToMp4({
        sequence,
        format,
        fps,
        durationInFrames,
        customBrands,
        assets,
        fileName,
        onProgress: setRenderJob,
        signal: controller.signal,
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${fileName}.mp4`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus("done");
    } catch (err) {
      if (err instanceof ExportCancelledError) {
        setStatus("cancelled");
        setError(null);
      } else {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Export failed.");
      }
    } finally {
      exportAbortRef.current = null;
    }
  };

  const handleCancelExport = () => {
    exportAbortRef.current?.abort();
  };

  const content = (
    <div className="space-y-3">
      {!exportReady && (
        <div
          className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5"
          role="status"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
          <div>
            <p className="text-xs font-medium text-amber-200">Export setup needed</p>
            <p className="mt-1 text-[10px] leading-relaxed text-amber-200/80">
              Browser-only MP4 export requires a Remotion render server. Preview matches final
              output dimensions and timing.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2 rounded-md border border-border bg-background/50 p-2.5">
        <div className="space-y-1.5">
          <Label htmlFor="export-format">Format / aspect ratio</Label>
          <Select value={format.id} onValueChange={setFormat}>
            <SelectTrigger id="export-format" className="h-8 w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {motionFormats.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label} ({item.aspectRatio})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <MetaRow label="Width × height" value={`${format.width} × ${format.height}`} />
        <div className="space-y-1.5">
          <Label htmlFor="export-fps">Frame rate</Label>
          <Select value={String(fps)} onValueChange={(v) => setFps(Number(v))}>
            <SelectTrigger id="export-fps" className="h-8 w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[24, 30, 60].map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} fps
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <MetaRow
          label="Duration"
          value={`${framesToSeconds(durationInFrames, fps)}s (${durationInFrames}f)`}
        />
        <div className="space-y-1.5">
          <Label htmlFor="export-filename">File name</Label>
          <Input
            id="export-filename"
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      {blockSummaries.length > 0 ? (
        <div className="rounded-md border border-border bg-background/50 px-2.5 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Blocks ({blockSummaries.length})
          </p>
          <ul className="mt-1.5 space-y-1">
            {blockSummaries.map((block) => (
              <li key={block.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate">
                  {block.index}. {block.name}
                </span>
                <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                  {block.duration}s
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          Add blocks to your sequence before exporting.
        </p>
      )}

      {status === "rendering" && renderJob ? (
        <div
          className="rounded-md border border-border bg-background/50 px-3 py-2.5"
          role="status"
        >
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="capitalize text-muted-foreground">{renderJob.status}</span>
            <span className="font-mono tabular-nums">{renderJob.progress}%</span>
          </div>
          {renderJob.message ? (
            <p className="mt-1 text-[10px] text-muted-foreground">{renderJob.message}</p>
          ) : null}
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${renderJob.progress}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-amber-400">
            Rendering in a background process. Preview is paused to free CPU — keep this tab open.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 h-7 w-full text-xs"
            onClick={handleCancelExport}
          >
            Cancel export
          </Button>
        </div>
      ) : null}

      {status === "cancelled" && (
        <p className="text-xs text-muted-foreground" role="status">
          Export cancelled.
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      <Button
        className="h-9 w-full"
        disabled={!exportReady || status === "rendering" || blockSummaries.length === 0}
        onClick={() => void handleExport()}
        aria-label={exportReady ? "Export MP4" : "Export setup needed"}
      >
        {status === "rendering" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        {exportReady ? "Export MP4" : "Export setup needed"}
      </Button>
    </div>
  );

  if (compact) {
    return <div className={cn(className)}>{content}</div>;
  }

  return (
    <aside
      className={cn("flex h-full w-full min-w-0 flex-col border-l border-border bg-card", className)}
    >
      <div className="flex shrink-0 items-start gap-2 border-b border-border px-3 py-2.5">
        <Film className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Export
          </h2>
          <p className="mt-0.5 truncate text-sm font-medium text-foreground">{sequence.name}</p>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">{content}</div>
    </aside>
  );
}
