import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { BrandEffects, BrandPreset } from "@/types";
import { defaultBrandEffects } from "@/config/effects/defaults";
import type { ReactNode } from "react";

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-10 shrink-0 cursor-pointer rounded border border-input bg-background p-0.5"
          aria-label={`${label} color picker`}
        />
        <Input
          value={value}
          className="h-8 font-mono text-xs"
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {value}
          {suffix}
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

type BrandEffectsPanelProps = {
  brand: BrandPreset;
  onChange: (effects: BrandEffects) => void;
  embedded?: boolean;
};

function EffectGroup({
  title,
  embedded,
  children,
}: {
  title: string;
  embedded?: boolean;
  children: ReactNode;
}) {
  if (embedded) {
    return (
      <section className="border-b border-border py-4 last:border-0">
        <h3 className="mb-3 text-sm font-medium">{title}</h3>
        <div className="space-y-3">{children}</div>
      </section>
    );
  }
  return (
    <div className="space-y-3 rounded-md border border-border bg-background/40 p-3">
      <p className="text-xs font-medium">{title}</p>
      {children}
    </div>
  );
}

export function BrandEffectsPanel({ brand, onChange, embedded = false }: BrandEffectsPanelProps) {
  const effects = brand.effects;

  const patch = (partial: Partial<BrandEffects>) => {
    onChange({ ...effects, ...partial });
  };

  const panelBody = (
    <>
      {!embedded ? (
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Global visual treatment inherited by all blocks. Block instances can override per target.
        </p>
      ) : null}

      <EffectGroup title="Corner radius" embedded={embedded}>
        <NumberField
          label="Card radius"
          value={effects.defaultRadius.card}
          min={0}
          max={80}
          step={1}
          suffix="px"
          onChange={(card) =>
            patch({ defaultRadius: { ...effects.defaultRadius, card } })
          }
        />
        <NumberField
          label="Image radius"
          value={effects.defaultRadius.image}
          min={0}
          max={80}
          step={1}
          suffix="px"
          onChange={(image) =>
            patch({ defaultRadius: { ...effects.defaultRadius, image } })
          }
        />
      </EffectGroup>

      <EffectGroup title="Soft shadow" embedded={embedded}>
        <NumberField
          label="Y offset"
          value={effects.defaultShadow.y}
          min={-40}
          max={40}
          step={1}
          suffix="px"
          onChange={(y) =>
            patch({ defaultShadow: { ...effects.defaultShadow, y } })
          }
        />
        <NumberField
          label="Blur"
          value={effects.defaultShadow.blur}
          min={0}
          max={80}
          step={1}
          suffix="px"
          onChange={(blur) =>
            patch({ defaultShadow: { ...effects.defaultShadow, blur } })
          }
        />
        <NumberField
          label="Shadow opacity"
          value={effects.defaultShadow.opacity}
          min={0}
          max={100}
          step={1}
          suffix="%"
          onChange={(opacity) =>
            patch({ defaultShadow: { ...effects.defaultShadow, opacity } })
          }
        />
        <ColorField
          id="brand-shadow-color"
          label="Shadow color"
          value={effects.defaultShadow.color}
          onChange={(color) =>
            patch({ defaultShadow: { ...effects.defaultShadow, color } })
          }
        />
      </EffectGroup>

      <EffectGroup title="Product UI stroke" embedded={embedded}>
        <NumberField
          label="Width"
          value={effects.defaultStroke.width}
          min={0}
          max={8}
          step={0.5}
          suffix="px"
          onChange={(width) =>
            patch({ defaultStroke: { ...effects.defaultStroke, width } })
          }
        />
        <NumberField
          label="Stroke opacity"
          value={effects.defaultStroke.opacity}
          min={0}
          max={100}
          step={1}
          suffix="%"
          onChange={(opacity) =>
            patch({ defaultStroke: { ...effects.defaultStroke, opacity } })
          }
        />
        <ColorField
          id="brand-stroke-color"
          label="Stroke color"
          value={effects.defaultStroke.color}
          onChange={(color) =>
            patch({ defaultStroke: { ...effects.defaultStroke, color } })
          }
        />
      </EffectGroup>

      <EffectGroup title="Subtle blur" embedded={embedded}>
        <NumberField
          label="Blur amount"
          value={effects.defaultBlur.amount}
          min={0}
          max={64}
          step={1}
          suffix="px"
          onChange={(amount) =>
            patch({ defaultBlur: { ...effects.defaultBlur, amount } })
          }
        />
      </EffectGroup>

      <EffectGroup title="Glass card" embedded={embedded}>
        <NumberField
          label="Blur"
          value={effects.defaultGlass.blur}
          min={0}
          max={48}
          step={1}
          suffix="px"
          onChange={(blur) =>
            patch({ defaultGlass: { ...effects.defaultGlass, blur } })
          }
        />
        <NumberField
          label="Tint opacity"
          value={effects.defaultGlass.opacity}
          min={0}
          max={60}
          step={1}
          suffix="%"
          onChange={(opacity) =>
            patch({ defaultGlass: { ...effects.defaultGlass, opacity } })
          }
        />
        <NumberField
          label="Border opacity"
          value={effects.defaultGlass.borderOpacity}
          min={0}
          max={100}
          step={1}
          suffix="%"
          onChange={(borderOpacity) =>
            patch({ defaultGlass: { ...effects.defaultGlass, borderOpacity } })
          }
        />
        <ColorField
          id="brand-glass-tint"
          label="Tint color"
          value={effects.defaultGlass.tintColor}
          onChange={(tintColor) =>
            patch({ defaultGlass: { ...effects.defaultGlass, tintColor } })
          }
        />
      </EffectGroup>

      <EffectGroup title="Texture / grain" embedded={embedded}>
        <NumberField
          label="Grain amount"
          value={effects.defaultGrain.amount}
          min={0}
          max={40}
          step={1}
          onChange={(amount) =>
            patch({ defaultGrain: { ...effects.defaultGrain, amount } })
          }
        />
        <NumberField
          label="Grain opacity"
          value={effects.defaultGrain.opacity}
          min={0}
          max={30}
          step={1}
          suffix="%"
          onChange={(opacity) =>
            patch({ defaultGrain: { ...effects.defaultGrain, opacity } })
          }
        />
      </EffectGroup>

      <EffectGroup title="Image treatment" embedded={embedded}>
        <NumberField
          label="Image opacity"
          value={effects.defaultImageTreatment.opacity}
          min={0}
          max={100}
          step={1}
          suffix="%"
          onChange={(opacity) =>
            patch({
              defaultImageTreatment: { ...effects.defaultImageTreatment, opacity },
            })
          }
        />
        <NumberField
          label="Image radius"
          value={effects.defaultImageTreatment.radius}
          min={0}
          max={80}
          step={1}
          suffix="px"
          onChange={(radius) =>
            patch({
              defaultImageTreatment: { ...effects.defaultImageTreatment, radius },
            })
          }
        />
      </EffectGroup>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => onChange(structuredClone(defaultBrandEffects))}
      >
        Reset to default effects
      </Button>
    </>
  );

  if (embedded) {
    return <div className="divide-y divide-border rounded-lg border border-border px-4">{panelBody}</div>;
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-xs font-medium text-muted-foreground">Brand effects</legend>
      {panelBody}
    </fieldset>
  );
}
