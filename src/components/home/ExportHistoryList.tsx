import { listExportHistory } from "@/lib/export-history";
import { motionFormatMap } from "@/config/formats";
import { Download } from "lucide-react";
import { useMemo } from "react";

function formatExportTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type ExportHistoryListProps = {
  /** When set, only show the most recent N exports. */
  limit?: number;
};

export function ExportHistoryList({ limit }: ExportHistoryListProps) {
  const exports = useMemo(() => {
    const all = listExportHistory();
    return limit ? all.slice(0, limit) : all;
  }, [limit]);

  if (exports.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-8 text-center">
        <Download className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Exports will appear here after you render videos.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {exports.map((entry) => {
        const format = motionFormatMap[entry.formatId];
        return (
          <li key={entry.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Download className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{entry.fileName}.mp4</p>
              <p className="text-xs text-muted-foreground">
                {entry.projectName} · {format?.aspectRatio ?? entry.aspectRatio}
              </p>
            </div>
            <time className="shrink-0 text-xs text-muted-foreground">
              {formatExportTime(entry.exportedAt)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
