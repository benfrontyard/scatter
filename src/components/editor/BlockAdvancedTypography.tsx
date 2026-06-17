import { FontSelector } from "@/components/editor/FontSelector";
import { blockTypographySlots } from "@/config/blocks/typography-slots";
import { TYPE_STYLE_LABELS } from "@/config/typography/defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  BlockTypographyOverride,
  MotionBlockInstance,
  TextAlign,
  TextSlotOverride,
  TextTransform,
  TypeStyleName,
} from "@/types";

const STYLE_TOKENS: TypeStyleName[] = [
  "display",
  "headline",
  "title",
  "body",
  "caption",
  "label",
];

const TEXT_TRANSFORMS: TextTransform[] = ["none", "uppercase", "lowercase", "capitalize"];
const TEXT_ALIGNS: TextAlign[] = ["left", "center", "right"];

type BlockAdvancedTypographyProps = {
  block: MotionBlockInstance;
  onChange: (override: BlockTypographyOverride | undefined) => void;
};

export function BlockAdvancedTypography({ block, onChange }: BlockAdvancedTypographyProps) {
  const slots = blockTypographySlots[block.blockId] ?? [];
  const override = block.typographyOverride;
  const enabled = override?.enabled ?? false;

  if (slots.length === 0) return null;

  const setEnabled = (next: boolean) => {
    if (!next) {
      onChange(undefined);
      return;
    }
    onChange({ enabled: true });
  };

  const updateSlot = (
    slotKey: keyof BlockTypographyOverride,
    patch: Partial<TextSlotOverride>,
  ) => {
    const current = override ?? { enabled: true };
    onChange({
      ...current,
      enabled: true,
      [slotKey]: { ...(current[slotKey] as TextSlotOverride | undefined), ...patch },
    });
  };

  const resetSlot = (slotKey: keyof BlockTypographyOverride) => {
    if (!override) return;
    const next = { ...override };
    delete next[slotKey];
    if (Object.keys(next).length <= 1) {
      onChange(undefined);
      return;
    }
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium">Advanced typography</p>
          <p className="text-[10px] text-muted-foreground">Overrides apply to this block only.</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={enabled ? "default" : "outline"}
          className="h-7 text-xs"
          onClick={() => setEnabled(!enabled)}
        >
          {enabled ? "On" : "Use brand"}
        </Button>
      </div>

      {enabled ? (
        <div className="space-y-4">
          {slots.map((slot) => {
            const slotOverride = (override?.[slot.key] ?? {}) as TextSlotOverride;
            return (
              <div
                key={String(slot.key)}
                className="space-y-2 rounded-md border border-border bg-background/40 p-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium">{slot.label}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px]"
                    onClick={() => resetSlot(slot.key)}
                  >
                    Reset
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground">Style token</Label>
                  <Select
                    value={slotOverride.styleToken ?? slot.defaultStyle}
                    onValueChange={(value) =>
                      updateSlot(slot.key, { styleToken: value as TypeStyleName })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLE_TOKENS.map((token) => (
                        <SelectItem key={token} value={token}>
                          {TYPE_STYLE_LABELS[token]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground">Font family override</Label>
                <FontSelector
                  label=""
                  id={`${String(slot.key)}-font`}
                  allowInherit
                  value={slotOverride.fontFamily}
                  onChange={(family) =>
                    updateSlot(slot.key, { fontFamily: family ?? undefined })
                  }
                />
                </div>

                <OverrideNumberField
                  label="Size"
                  value={slotOverride.fontSize}
                  min={12}
                  max={240}
                  step={1}
                  onChange={(fontSize) => updateSlot(slot.key, { fontSize })}
                />
                <OverrideNumberField
                  label="Line height"
                  value={slotOverride.lineHeight}
                  min={1}
                  max={2}
                  step={0.05}
                  onChange={(lineHeight) => updateSlot(slot.key, { lineHeight })}
                />
                <OverrideNumberField
                  label="Weight"
                  value={slotOverride.fontWeight}
                  min={300}
                  max={800}
                  step={100}
                  onChange={(fontWeight) => updateSlot(slot.key, { fontWeight })}
                />
                <OverrideNumberField
                  label="Tracking"
                  value={slotOverride.letterSpacing}
                  min={-0.05}
                  max={0.2}
                  step={0.01}
                  onChange={(letterSpacing) => updateSlot(slot.key, { letterSpacing })}
                />

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-muted-foreground">Transform</Label>
                    <Select
                      value={slotOverride.textTransform ?? "inherit"}
                      onValueChange={(value) =>
                        updateSlot(slot.key, {
                          textTransform: value === "inherit" ? undefined : (value as TextTransform),
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Inherit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inherit">Inherit</SelectItem>
                        {TEXT_TRANSFORMS.map((transform) => (
                          <SelectItem key={transform} value={transform} className="capitalize">
                            {transform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-muted-foreground">Align</Label>
                    <Select
                      value={slotOverride.align ?? "inherit"}
                      onValueChange={(value) =>
                        updateSlot(slot.key, {
                          align: value === "inherit" ? undefined : (value as TextAlign),
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Inherit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inherit">Inherit</SelectItem>
                        {TEXT_ALIGNS.map((align) => (
                          <SelectItem key={align} value={align} className="capitalize">
                            {align}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <OverrideNumberField
                  label="Max width"
                  value={
                    slotOverride.maxWidth !== undefined
                      ? Math.round(slotOverride.maxWidth * 100)
                      : undefined
                  }
                  min={40}
                  max={100}
                  step={1}
                  suffix="%"
                  onChange={(percent) => {
                    if (percent === undefined) {
                      updateSlot(slot.key, { maxWidth: undefined });
                      return;
                    }
                    updateSlot(slot.key, { maxWidth: percent / 100 });
                  }}
                />
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onChange(undefined)}
          >
            Reset to brand typography
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function OverrideNumberField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value?: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {value === undefined ? "inherit" : `${value}${suffix ?? ""}`}
        </span>
      </div>
      <Slider
        value={[value ?? min]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next)}
        aria-label={label}
      />
      <Input
        type="number"
        placeholder="Inherit"
        value={value ?? ""}
        step={step}
        min={min}
        max={max}
        className="h-7 font-mono text-xs"
        onChange={(event) => {
          if (event.target.value === "") {
            onChange(undefined);
            return;
          }
          const next = Number.parseFloat(event.target.value);
          if (!Number.isNaN(next)) onChange(next);
        }}
      />
    </div>
  );
}
