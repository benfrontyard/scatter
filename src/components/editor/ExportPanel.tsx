import { motionBlockMap } from "@/config/blocks";
import { useEditor } from "@/context/editor-context";
import { exportSequenceToMp4 } from "@/lib/export-video";
import { framesToSeconds, getSequenceDurationInFrames } from "@/lib/sequence-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, Film } from "lucide-react";
import { useMemo } from "react";

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
  const { sequence, format, fps } = useEditor();

  const durationInFrames = useMemo(
    () => getSequenceDurationInFrames(sequence),
    [sequence],
  );

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
    // TODO(phase-8): Enable once exportSequenceToMp4 is wired to Remotion renderer.
    await exportSequenceToMp4({
      sequence,
      format,
      fps,
      durationInFrames,
    });
  };

  if (compact) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <MetaRow label="Format" value={`${format.label} (${format.aspectRatio})`} />
          <MetaRow label="Size" value={`${format.width}×${format.height}`} />
          <MetaRow label="FPS" value={`${fps}`} />
          <MetaRow
            label="Duration"
            value={`${framesToSeconds(durationInFrames, fps)}s`}
          />
        </div>

        {blockSummaries.length > 0 ? (
          <div className="rounded-md border border-border bg-background/50 px-2.5 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Blocks ({blockSummaries.length})
            </p>
            <ul className="mt-1.5 space-y-1">
              {blockSummaries.map((block) => (
                <li
                  key={block.id}
                  className="flex items-center justify-between gap-2 text-xs"
                >
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
        ) : null}

        <Button
          className="h-9 w-full"
          disabled
          title="MP4 export coming in a later phase"
          onClick={() => void handleExport()}
        >
          <Download className="h-3.5 w-3.5" />
          Export MP4
        </Button>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "flex w-full shrink-[2] flex-col border-l border-border bg-card md:w-[320px] md:min-w-[240px] md:max-w-[320px]",
        className,
      )}
    >
      <div className="flex shrink-0 items-start gap-2 border-b border-border px-3 py-2.5">
        <Film className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <h2 className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Export
          </h2>
          <p className="mt-0.5 truncate text-sm font-medium text-foreground">{sequence.name}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          <div className="space-y-2 rounded-md border border-border bg-background/50 p-2.5">
            <MetaRow label="Format" value={format.label} />
            <MetaRow label="Aspect ratio" value={format.aspectRatio} />
            <MetaRow label="Dimensions" value={`${format.width} × ${format.height}`} />
            <MetaRow label="Frame rate" value={`${fps} fps`} />
            <MetaRow
              label="Total duration"
              value={`${framesToSeconds(durationInFrames, fps)}s (${durationInFrames}f)`}
            />
          </div>

          <div className="rounded-md border border-border bg-background/50 p-2.5">
            <p className="text-xs font-medium text-muted-foreground">
              Sequence blocks ({blockSummaries.length})
            </p>
            {blockSummaries.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">No blocks in sequence.</p>
            ) : (
              <ol className="mt-2 space-y-1.5">
                {blockSummaries.map((block) => (
                  <li
                    key={block.id}
                    className="flex items-center justify-between gap-2 rounded-sm px-1 py-0.5 text-xs"
                  >
                    <span className="min-w-0 truncate">
                      <span className="mr-1.5 font-mono text-[10px] text-muted-foreground">
                        {block.index}
                      </span>
                      {block.name}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                      {block.duration}s
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <Button
            className="h-9 w-full"
            disabled
            title="MP4 export coming in a later phase"
            onClick={() => void handleExport()}
          >
            <Download className="h-3.5 w-3.5" />
            Export MP4
          </Button>

          <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
            Local Remotion rendering is not wired up yet. Preview matches the final output
            dimensions and timing.
          </p>
        </div>
      </div>
    </aside>
  );
}
