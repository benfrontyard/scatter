import type { BrandMotionKit, TemplatePreset } from "@/data/fakeBrands/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Star, Zap } from "lucide-react";

type TemplatePresetCardProps = {
  kit: BrandMotionKit;
  preset: TemplatePreset;
  className?: string;
};

export function TemplatePresetCard({ preset, className }: TemplatePresetCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card p-3",
        className,
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold">{preset.name}</h4>
          <p className="text-[10px] text-muted-foreground">{preset.category}</p>
        </div>
        {preset.settings.brandDefault ? (
          <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Default
          </span>
        ) : null}
      </div>

      <dl className="mb-3 space-y-1 text-[10px] text-muted-foreground">
        <div className="flex gap-1">
          <dt className="shrink-0">Ratios:</dt>
          <dd>{preset.aspectRatios.join(", ")}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="shrink-0">Inherits:</dt>
          <dd className="truncate">{preset.inherits.join(", ")}</dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-[10px]"
          disabled
          title="Coming soon"
        >
          <Zap className="h-3 w-3" />
          Apply
        </Button>
        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[10px]" disabled title="Coming soon">
          <Edit className="h-3 w-3" />
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[10px]" disabled title="Coming soon">
          <Copy className="h-3 w-3" />
          Duplicate
        </Button>
        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[10px]" disabled title="Coming soon">
          <Star className="h-3 w-3" />
          Save default
        </Button>
      </div>
    </article>
  );
}

export function ApplyKitToProjectButton({ kit: _kit }: { kit: BrandMotionKit }) {
  return (
    <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled title="Coming soon">
      <Zap className="h-3.5 w-3.5" />
      Apply kit to project
    </Button>
  );
}
