import { useEditor } from "@/context/editor-context";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export function BrandPanel() {
  const {
    showBrandPanel,
    setShowBrandPanel,
    brand,
    allBrands,
    setBrand,
    setShowBrandSystem,
  } = useEditor();

  if (!showBrandPanel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-14 sm:justify-end sm:pt-16 sm:pr-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label="Close brand panel"
        onClick={() => setShowBrandPanel(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-panel-title"
        className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-card p-4 shadow-xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 id="brand-panel-title" className="text-sm font-semibold">
            Brand kit
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowBrandPanel(false)}
            aria-label="Close brand panel"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="space-y-3">
          <Select value={brand.id} onValueChange={setBrand}>
            <SelectTrigger className="h-9 w-full text-sm" aria-label="Brand preset">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allBrands.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            className="h-9 w-full text-sm"
            onClick={() => {
              setShowBrandPanel(false);
              setShowBrandSystem(true);
            }}
          >
            Edit brand kit
          </Button>
        </div>
      </div>
    </div>
  );
}
