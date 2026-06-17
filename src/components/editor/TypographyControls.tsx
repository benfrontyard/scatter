import { defaultProjectTypography, resolveProjectTypography } from "@/lib/typography";
import type { ProjectTypography } from "@/types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type TypographyControlsProps = {
  value: ProjectTypography | undefined;
  onChange: (key: keyof ProjectTypography, value: number) => void;
};

export function TypographyControls({ value, onChange }: TypographyControlsProps) {
  const typography = resolveProjectTypography(value);

  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-medium text-muted-foreground">Typography</legend>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="project-weight">Weight</Label>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
            {typography.weight}
          </span>
        </div>
        <Slider
          id="project-weight"
          value={[typography.weight]}
          min={400}
          max={800}
          step={100}
          onValueChange={([weight]) => onChange("weight", weight)}
          aria-label="Font weight"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="project-size">Size</Label>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
            {typography.size.toFixed(2)}×
          </span>
        </div>
        <Slider
          id="project-size"
          value={[typography.size]}
          min={0.75}
          max={1.35}
          step={0.05}
          onValueChange={([size]) => onChange("size", size)}
          aria-label="Font size scale"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="project-tracking">Tracking</Label>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
            {typography.tracking >= 0 ? "+" : ""}
            {typography.tracking.toFixed(2)}em
          </span>
        </div>
        <Slider
          id="project-tracking"
          value={[typography.tracking]}
          min={-0.04}
          max={0.12}
          step={0.01}
          onValueChange={([tracking]) => onChange("tracking", tracking)}
          aria-label="Letter tracking"
        />
      </div>

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Typeface is set in brand settings. Adjust weight, size, and tracking here.
      </p>
    </fieldset>
  );
}

export { defaultProjectTypography };
