import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudio } from "@/context/studio-context";
import {
  MOTION_BLOCK_FAMILIES,
  MOTION_BLOCK_STATUS_LABELS,
  STUDIO_STATUS_ORDER,
  buildBlockQueueRow,
  sortQueueRows,
  statusBadgeClass,
} from "@/lib/motion-block-library";
import { studioBrandPresets } from "@/lib/brand-motion-kit-adapter";
import { cn } from "@/lib/utils";
import type { MotionBlockStatus } from "@/types/motion-block-library";
import { AlertTriangle, Check, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

type BlockReviewQueueProps = {
  onSelectBlock: (blockId: string) => void;
  onNewBlock: () => void;
};

const familyLabelMap = Object.fromEntries(
  MOTION_BLOCK_FAMILIES.map((f) => [f.id, f.label]),
) as Record<string, string>;

export function BlockReviewQueue({ onSelectBlock, onNewBlock }: BlockReviewQueueProps) {
  const { blocks } = useStudio();
  const [family, setFamily] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<MotionBlockStatus | "all" | "needs-attention">(
    "needs-attention",
  );
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const all = blocks.map((block) =>
      buildBlockQueueRow(block, studioBrandPresets, familyLabelMap[block.family] ?? block.family),
    );
    return sortQueueRows(all);
  }, [blocks]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (family !== "all" && row.block.family !== family) return false;
      if (statusFilter === "needs-attention" && !row.needsAttention) return false;
      if (
        statusFilter !== "all" &&
        statusFilter !== "needs-attention" &&
        row.status !== statusFilter
      )
        return false;
      if (search && !row.block.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rows, family, statusFilter, search]);

  const attentionCount = rows.filter((r) => r.needsAttention).length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-border px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Block review queue</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              What needs attention, what is broken, and what is ready for Canvas.
            </p>
          </div>
          <Button size="sm" className="gap-1.5 text-xs" onClick={onNewBlock}>
            <Plus className="h-3.5 w-3.5" />
            New Block
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blocks…"
              className="h-8 pl-8 text-xs"
            />
          </div>

          <Tabs value={family} onValueChange={setFamily}>
            <TabsList className="h-8 flex-wrap">
              <TabsTrigger value="all" className="h-6 px-2 text-[10px]">
                All families
              </TabsTrigger>
              {MOTION_BLOCK_FAMILIES.map((f) => (
                <TabsTrigger key={f.id} value={f.id} className="h-6 px-2 text-[10px]">
                  {f.label.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
          >
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="needs-attention">
                Needs attention ({attentionCount})
              </SelectItem>
              <SelectItem value="all">All statuses</SelectItem>
              {STUDIO_STATUS_ORDER.filter((s) => s !== "approved").map((s) => (
                <SelectItem key={s} value={s}>
                  {MOTION_BLOCK_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No blocks match these filters.
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((row) => (
              <button
                key={row.block.id}
                type="button"
                onClick={() => onSelectBlock(row.block.id)}
                className={cn(
                  "flex w-full flex-col gap-2 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-secondary/40",
                  row.needsAttention && "border-amber-500/30",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">{row.block.name}</span>
                      {row.needsAttention ? (
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{row.familyLabel}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase",
                      statusBadgeClass(row.block.status),
                    )}
                  >
                    {MOTION_BLOCK_STATUS_LABELS[row.block.status]}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                  <span>
                    Renderer:{" "}
                    <span
                      className={cn(
                        row.rendererHealth === "production"
                          ? "text-emerald-600"
                          : row.rendererHealth === "fallback"
                            ? "text-amber-600"
                            : "text-red-500",
                      )}
                    >
                      {row.rendererHealth}
                    </span>
                  </span>
                  <span>
                    Formats:{" "}
                    {row.supportedAspectRatios.length > 0
                      ? row.supportedAspectRatios.join(", ")
                      : "—"}
                  </span>
                  <span>
                    Canvas:{" "}
                    {row.canvasVisible ? (
                      <span className="text-emerald-600">visible</span>
                    ) : (
                      <span>hidden</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    Validation:
                    {row.validationState === "pass" ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : row.validationState === "warn" ? (
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-400" />
                    )}
                  </span>
                  {row.lastEdited ? <span>v{row.lastEdited}</span> : null}
                </div>

                {row.mainBlocker ? (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">{row.mainBlocker}</p>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
