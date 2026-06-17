import { EasingPicker } from "@/components/editor/EasingPicker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { TEXT_ANIMATION_PRESETS } from "@/config/text-animations/presets";
import {
  TEXT_ANIMATION_CATEGORIES,
  TEXT_ANIMATION_CATEGORY_LABELS,
} from "@/config/text-animations/categories";
import { normalizeBrandTextAnimationDefaults } from "@/lib/text-animation";
import type {
  BrandPreset,
  BrandTextAnimationDefaults,
  MotionEnergy,
  ReducedMotionBehavior,
  RevealStyle,
  TextAnimationCategory,
} from "@/types";
import { cn } from "@/lib/utils";

const MOTION_ENERGY_OPTIONS: { value: MotionEnergy; label: string }[] = [
  { value: "calm", label: "Calm" },
  { value: "balanced", label: "Balanced" },
  { value: "expressive", label: "Expressive" },
];

const REVEAL_STYLE_OPTIONS: { value: RevealStyle; label: string }[] = [
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "mask", label: "Mask" },
  { value: "flick", label: "Flick" },
  { value: "type", label: "Type" },
  { value: "highlight", label: "Highlight" },
];

const REDUCED_MOTION_OPTIONS: { value: ReducedMotionBehavior; label: string }[] = [
  { value: "simple-fade", label: "Simple fade" },
  { value: "disable", label: "Disable text animation" },
];

type BrandTextAnimationDefaultsPanelProps = {
  brand: BrandPreset;
  onChange: (defaults: BrandTextAnimationDefaults) => void;
  embedded?: boolean;
};

export function BrandTextAnimationDefaultsPanel({
  brand,
  onChange,
  embedded = false,
}: BrandTextAnimationDefaultsPanelProps) {
  const defaults = normalizeBrandTextAnimationDefaults(brand.motion.textAnimation);
  const allowedFamilies = new Set(defaults.allowedPresetFamilies);

  const updateDefaults = (patch: Partial<BrandTextAnimationDefaults>) => {
    onChange({
      ...brand.motion.textAnimation,
      ...defaults,
      ...patch,
      durationMultiplier: patch.speedMultiplier ?? defaults.speedMultiplier,
    });
  };

  const toggleFamily = (family: TextAnimationCategory) => {
    const next = new Set(allowedFamilies);
    if (next.has(family)) {
      if (next.size > 1) next.delete(family);
    } else {
      next.add(family);
    }
    updateDefaults({ allowedPresetFamilies: [...next] });
  };

  return (
    <div className={cn("space-y-4", !embedded && "rounded-lg border border-border p-4")}>
      <div>
        <p className="text-xs font-medium text-muted-foreground">Text animation defaults</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Global motion language for text reveals. Blocks using brand default inherit these settings.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Default text animation preset</Label>
        <Select
          value={defaults.defaultPresetId}
          onValueChange={(presetId) => updateDefaults({ defaultPresetId: presetId })}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TEXT_ANIMATION_PRESETS.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Motion energy</Label>
          <Select
            value={defaults.motionEnergy}
            onValueChange={(value) => updateDefaults({ motionEnergy: value as MotionEnergy })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOTION_ENERGY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Default reveal style</Label>
          <Select
            value={defaults.defaultRevealStyle}
            onValueChange={(value) => updateDefaults({ defaultRevealStyle: value as RevealStyle })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REVEAL_STYLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <EasingPicker
        label="Default easing curve"
        value={defaults.defaultEasing}
        onChange={(easingId) => updateDefaults({ defaultEasing: easingId ?? undefined })}
        compact
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <BrandSlider
          label="Speed multiplier"
          value={defaults.speedMultiplier ?? 1}
          min={0.5}
          max={2}
          step={0.05}
          format={(v) => `${v.toFixed(2)}×`}
          onChange={(speedMultiplier) => updateDefaults({ speedMultiplier })}
        />
        <BrandSlider
          label="Stagger multiplier"
          value={defaults.staggerMultiplier ?? 1}
          min={0.5}
          max={2}
          step={0.05}
          format={(v) => `${v.toFixed(2)}×`}
          onChange={(staggerMultiplier) => updateDefaults({ staggerMultiplier })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Reduced motion behavior</Label>
        <Select
          value={defaults.reducedMotionBehavior}
          onValueChange={(value) =>
            updateDefaults({ reducedMotionBehavior: value as ReducedMotionBehavior })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REDUCED_MOTION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Allowed preset families</Label>
        <div className="flex flex-wrap gap-1.5">
          {TEXT_ANIMATION_CATEGORIES.map((category) => {
            const active = allowedFamilies.has(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleFamily(category)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {TEXT_ANIMATION_CATEGORY_LABELS[category]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BrandSlider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {format(value)}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next)}
        aria-label={label}
      />
    </div>
  );
}
