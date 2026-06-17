import { brandPresets } from "@/config/brands";
import { motionFormats } from "@/config/formats";
import { useEditor } from "@/context/editor-context";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

type AppHeaderProps = {
  compact?: boolean;
};

export function AppHeader({ compact }: AppHeaderProps) {
  const { sequence, brand, format, step, setBrand, setFormat, setStep, clearSelection } =
    useEditor();

  const openExport = () => {
    clearSelection();
    setStep("export");
  };

  return (
    <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border bg-background px-3 sm:gap-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-foreground sm:h-7 sm:w-7">
          <div className="flex gap-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-background" />
            <span className="h-1 w-1 rounded-full bg-background/60" />
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="shrink-0 text-sm font-semibold tracking-tight">Scatter</span>
            {!compact && (
              <>
                <span className="text-muted-foreground/40">/</span>
                <span className="truncate text-sm text-muted-foreground">{sequence.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 md:flex">
          <Select value={brand.id} onValueChange={setBrand}>
            <SelectTrigger className="h-8 w-[130px] text-xs" aria-label="Brand preset">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {brandPresets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={format.id} onValueChange={setFormat}>
            <SelectTrigger className="h-8 w-[120px] text-xs" aria-label="Aspect ratio">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {motionFormats.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.aspectRatio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className={cn("ml-auto flex shrink-0 items-center gap-1.5", compact && "w-full justify-end")}>
        <Button
          size="sm"
          className="h-8 px-2.5 text-xs"
          variant={step === "export" ? "secondary" : "default"}
          onClick={openExport}
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </header>
  );
}
