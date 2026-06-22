import { motionFormats } from "@/config/formats";
import { useEditor } from "@/context/editor-context";
import { getEasingPreset, normalizeBrandMotion } from "@/lib/easing";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export function PresetPanel() {
  const { brand, format, setBrand, setFormat, allBrands } = useEditor();
  const motion = normalizeBrandMotion(brand.motion);
  const entrancePreset = getEasingPreset(motion.entranceEasingId);

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Brand DNA
        </h2>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-4">
        <div className="space-y-2">
          <Label htmlFor="brand-select">Brand preset</Label>
          <Select value={brand.id} onValueChange={setBrand}>
            <SelectTrigger id="brand-select">
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="format-select">Output format</Label>
          <Select value={format.id} onValueChange={setFormat}>
            <SelectTrigger id="format-select">
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

        <Separator />

        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Preview swatches</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(brand.colors).map(([key, color]) => (
              <div key={key} className="space-y-1">
                <div
                  className="h-8 rounded-md border border-border"
                  style={{ backgroundColor: color }}
                />
                <p className="truncate text-[10px] capitalize text-muted-foreground">{key}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Motion personality</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <p className="text-muted-foreground">Easing</p>
              <p className="font-medium">{entrancePreset.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Speed</p>
              <p className="font-medium">{brand.motion.speed.toFixed(2)}×</p>
            </div>
            <div>
              <p className="text-muted-foreground">Intensity</p>
              <p className="font-medium">{brand.motion.intensity.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Stagger</p>
              <p className="font-medium">{brand.motion.stagger}f</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Accent</p>
          <p className="text-sm font-semibold tracking-widest" style={{ color: brand.colors.accent }}>
            {brand.name}
          </p>
        </div>
      </div>
    </aside>
  );
}
