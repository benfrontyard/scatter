import { getBlockEffectTargets } from "@/config/blocks/effect-targets";
import { getTextAnimationPreset } from "@/config/text-animations/presets";
import { EasingPicker } from "@/components/editor/EasingPicker";
import {
  getAllowedPresets,
  getBrandDefaultTextPresetId,
  getBrandTextAnimationSummary,
  getTextAnimationForTarget,
  getTextAnimationMode,
  resetTextAnimationToBrandDefault,
  setTextAnimationForTarget,
  setTextAnimationMode,
  updateTextAnimationInstance,
} from "@/lib/text-animation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type {
  BrandPreset,
  EffectTarget,
  MotionBlockInstance,
  SelectorDirection,
  TextAnimationInstance,
  TextAnimationMode,
} from "@/types";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const MODE_OPTIONS: { value: TextAnimationMode; label: string }[] = [
  { value: "brand-default", label: "Brand default" },
  { value: "none", label: "None" },
  { value: "custom", label: "Custom" },
];

const DIRECTION_OPTIONS: { value: SelectorDirection; label: string }[] = [
  { value: "ltr", label: "Left to right" },
  { value: "rtl", label: "Right to left" },
  { value: "centerOut", label: "Center out" },
  { value: "edgesIn", label: "Edges in" },
  { value: "random", label: "Random" },
];

type TextAnimationPanelProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  onChange: (animations: TextAnimationInstance[] | undefined) => void;
  forceAdvanced?: boolean;
};

function getTextTargets(blockId: string): { key: EffectTarget; label: string }[] {
  return getBlockEffectTargets(blockId)
    .filter((target) => target.inherits.includes("text"))
    .map((target) => ({ key: target.key, label: target.label }));
}

export function TextAnimationPanel({
  brand,
  block,
  onChange,
  forceAdvanced = false,
}: TextAnimationPanelProps) {
  const targets = getTextTargets(block.blockId);
  const [selectedTarget, setSelectedTarget] = useState<EffectTarget>(
    targets[0]?.key ?? "headline",
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const animations = block.textAnimations ?? [];
  const current = getTextAnimationForTarget(animations, selectedTarget);
  const mode = getTextAnimationMode(animations, selectedTarget);
  const allowedPresets = useMemo(() => getAllowedPresets(brand), [brand]);

  const activePresetId =
    mode === "custom"
      ? current?.presetId ?? getBrandDefaultTextPresetId(brand, selectedTarget)
      : getBrandDefaultTextPresetId(brand, selectedTarget);
  const activePreset = getTextAnimationPreset(activePresetId);

  const advancedVisible = forceAdvanced || showAdvanced || mode === "custom";

  if (targets.length === 0) return null;

  const updateAnimations = (next: TextAnimationInstance[]) => {
    onChange(next.length > 0 ? next : undefined);
  };

  const handleModeChange = (nextMode: TextAnimationMode) => {
    updateAnimations(setTextAnimationMode(animations, selectedTarget, nextMode, brand));
  };

  const handleReset = () => {
    updateAnimations(resetTextAnimationToBrandDefault(animations, selectedTarget));
  };

  const patchInstance = (
    patch: Parameters<typeof updateTextAnimationInstance>[2],
  ) => {
    updateAnimations(updateTextAnimationInstance(animations, selectedTarget, patch));
  };

  const intensity = current?.intensity ?? 0.65;
  const speed = current?.speed ?? 1;
  const direction = current?.direction ?? activePreset.selector.direction;
  const advanced = current?.advanced ?? {};

  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Use brand default for consistency, or customize this block when the headline needs a
        different motion treatment.
      </p>

      {targets.length > 1 ? (
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted-foreground">Text target</Label>
          <Select
            value={selectedTarget}
            onValueChange={(value) => setSelectedTarget(value as EffectTarget)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {targets.map((target) => (
                <SelectItem key={target.key} value={target.key}>
                  {target.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label className="text-xs">Text animation mode</Label>
        <div className="grid grid-cols-3 gap-1">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleModeChange(option.value)}
              className={cn(
                "rounded-md border px-2 py-1.5 text-[10px] font-medium transition-colors",
                mode === option.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "brand-default" ? (
        <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">
            {getBrandTextAnimationSummary(brand, selectedTarget)}
          </p>
        </div>
      ) : null}

      {mode === "custom" ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wide text-primary">
              Custom text animation
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[10px] text-muted-foreground"
              onClick={handleReset}
            >
              Reset to brand default
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Preset</Label>
            <Select
              value={activePresetId}
              onValueChange={(presetId) =>
                updateAnimations(
                  setTextAnimationForTarget(animations, selectedTarget, presetId),
                )
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedPresets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 rounded-lg border border-border p-3">
            <SliderField
              label="Speed"
              value={speed}
              min={0.5}
              max={2}
              step={0.05}
              format={(v) => `${v.toFixed(2)}×`}
              onChange={(value) => patchInstance({ speed: value })}
            />
            <SliderField
              label="Intensity"
              value={intensity}
              min={0}
              max={1}
              step={0.05}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(value) => patchInstance({ intensity: value })}
            />
            <div className="space-y-1.5">
              <Label className="text-xs">Direction</Label>
              <Select
                value={direction}
                onValueChange={(value) =>
                  patchInstance({ direction: value as SelectorDirection })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      ) : null}

      {mode === "custom" && !forceAdvanced ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-full text-xs"
          onClick={() => setShowAdvanced((open) => !open)}
        >
          {showAdvanced ? "Hide advanced" : "Show advanced"}
        </Button>
      ) : null}

      {advancedVisible && mode === "custom" ? (
        <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Advanced
          </p>

          <div className="space-y-1.5">
            <Label className="text-xs">Target unit</Label>
            <Select
              value={advanced.targetUnit ?? activePreset.target}
              onValueChange={(value) =>
                patchInstance({
                  advanced: {
                    ...advanced,
                    targetUnit: value as typeof advanced.targetUnit,
                  },
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="block">Block</SelectItem>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="word">Word</SelectItem>
                <SelectItem value="character">Character</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <AdvancedNumberField
              label="Duration"
              value={advanced.duration}
              fallback={activePreset.selector.duration}
              min={4}
              max={60}
              onChange={(duration) => patchInstance({ advanced: { ...advanced, duration } })}
            />
            <AdvancedNumberField
              label="Delay"
              value={advanced.delay}
              fallback={activePreset.selector.delay}
              min={0}
              max={60}
              onChange={(delay) => patchInstance({ advanced: { ...advanced, delay } })}
            />
            <AdvancedNumberField
              label="Stagger"
              value={advanced.stagger}
              fallback={activePreset.selector.stagger}
              min={0}
              max={24}
              onChange={(stagger) => patchInstance({ advanced: { ...advanced, stagger } })}
            />
            <AdvancedNumberField
              label="Random seed"
              value={advanced.randomSeed}
              fallback={42}
              min={0}
              max={9999}
              onChange={(randomSeed) => patchInstance({ advanced: { ...advanced, randomSeed } })}
            />
          </div>

          <EasingPicker
            label="Easing curve"
            value={advanced.easingId}
            onChange={(easingId) =>
              patchInstance({ advanced: { ...advanced, easingId: easingId ?? undefined } })
            }
            compact
          />

          <div className="grid grid-cols-2 gap-2">
            <AdvancedNumberField
              label="X position"
              value={advanced.x}
              fallback={0}
              min={-100}
              max={100}
              onChange={(x) => patchInstance({ advanced: { ...advanced, x } })}
            />
            <AdvancedNumberField
              label="Y position"
              value={advanced.y}
              fallback={14}
              min={-100}
              max={100}
              onChange={(y) => patchInstance({ advanced: { ...advanced, y } })}
            />
            <AdvancedNumberField
              label="Scale"
              value={advanced.scale}
              fallback={1}
              min={0.5}
              max={2}
              step={0.05}
              onChange={(scale) => patchInstance({ advanced: { ...advanced, scale } })}
            />
            <AdvancedNumberField
              label="Rotation"
              value={advanced.rotation}
              fallback={0}
              min={-45}
              max={45}
              onChange={(rotation) => patchInstance({ advanced: { ...advanced, rotation } })}
            />
            <AdvancedNumberField
              label="Blur"
              value={advanced.blur}
              fallback={0}
              min={0}
              max={20}
              onChange={(blur) => patchInstance({ advanced: { ...advanced, blur } })}
            />
            <AdvancedNumberField
              label="Tracking"
              value={advanced.tracking}
              fallback={0}
              min={-10}
              max={20}
              onChange={(tracking) => patchInstance({ advanced: { ...advanced, tracking } })}
            />
          </div>

          <div className="space-y-2">
            <ColorField
              id={`accent-${selectedTarget}`}
              label="Accent color"
              value={typeof advanced.accentColor === "string" ? advanced.accentColor : ""}
              fallback={brand.colors.accent}
              onChange={(accentColor) =>
                patchInstance({ advanced: { ...advanced, accentColor } })
              }
            />
            <ColorField
              id={`highlight-${selectedTarget}`}
              label="Highlight color"
              value={advanced.highlightColor ?? ""}
              fallback={brand.colors.accent}
              onChange={(highlightColor) =>
                patchInstance({ advanced: { ...advanced, highlightColor } })
              }
            />
          </div>

          <ToggleRow
            label="Use brand colors"
            checked={advanced.useBrandColors ?? true}
            onChange={(useBrandColors) =>
              patchInstance({ advanced: { ...advanced, useBrandColors } })
            }
          />
          <ToggleRow
            label="Randomize order"
            checked={advanced.randomizeOrder ?? false}
            onChange={(randomizeOrder) =>
              patchInstance({ advanced: { ...advanced, randomizeOrder } })
            }
          />
          <ToggleRow
            label="Respect reduced motion"
            checked={advanced.respectReducedMotion ?? true}
            onChange={(respectReducedMotion) =>
              patchInstance({ advanced: { ...advanced, respectReducedMotion } })
            }
          />
        </div>
      ) : null}
    </div>
  );
}

function SliderField({
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
        <Label className="text-xs">{label}</Label>
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

function AdvancedNumberField({
  label,
  value,
  fallback,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number | undefined;
  fallback: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  const resolved = value ?? fallback;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[10px]">{label}</Label>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {resolved}
        </span>
      </div>
      <Slider
        value={[resolved]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next)}
        aria-label={label}
      />
    </div>
  );
}

function ColorField({
  id,
  label,
  value,
  fallback,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}) {
  const displayValue = value || fallback;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={displayValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-10 shrink-0 cursor-pointer rounded border border-input bg-background p-0.5"
        />
        <input
          value={value}
          placeholder={fallback}
          className="h-8 flex-1 rounded-md border border-input bg-background px-2 font-mono text-xs"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left text-xs transition-colors hover:bg-muted/30"
    >
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-medium",
          checked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        {checked ? "On" : "Off"}
      </span>
    </button>
  );
}
