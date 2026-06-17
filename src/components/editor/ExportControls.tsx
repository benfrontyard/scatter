import { ExportPanel } from "@/components/editor/ExportPanel";

type ExportControlsProps = {
  className?: string;
  compact?: boolean;
};

export function ExportControls({ className, compact = true }: ExportControlsProps) {
  return (
    <div className={className}>
      {!compact && (
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Export
        </p>
      )}
      <ExportPanel compact={compact} />
    </div>
  );
}
