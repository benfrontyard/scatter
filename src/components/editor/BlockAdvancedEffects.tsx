import { getBlockEffectTargets } from "@/config/blocks/effect-targets";
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
import {
  clearTargetEffectOverrides,
  effectDefinitionMap,
  getCompatibleEffectsForTarget,
  hasTargetEffectOverrides,
  resolveTargetEffects,
  setBlockEffectOverride,
} from "@/lib/effects";
import type { BrandPreset, EffectInstance, EffectTarget, MotionBlockInstance, StarterEffectId } from "@/types";
import type { EffectControlDefinition } from "@/types/effects";
import { useMemo, useState } from "react";

type BlockAdvancedEffectsProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  onChange: (effects: EffectInstance[] | undefined) => void;
};

export function BlockAdvancedEffects({ brand, block, onChange }: BlockAdvancedEffectsProps) {
  const targets = getBlockEffectTargets(block.blockId);
  const [selectedTarget, setSelectedTarget] = useState<EffectTarget>(
    targets[0]?.key ?? "background",
  );

  const blockEffects = block.effects ?? [];
  const hasOverrides = hasTargetEffectOverrides(blockEffects, selectedTarget);

  const resolvedEffects = useMemo(
    () => resolveTargetEffects(brand, block, selectedTarget),
    [brand, block, selectedTarget],
  );

  const visibleEffects = resolvedEffects.filter(
    (effect) =>
      !(effect.effectId === "opacity" && effect.values.opacity === 100 && effect.source === "brand"),
  );

  if (targets.length === 0) return null;

  const updateEffects = (next: EffectInstance[]) => {
    onChange(next.length > 0 ? next : undefined);
  };

  const handleResetTarget = () => {
    updateEffects(clearTargetEffectOverrides(blockEffects, selectedTarget));
  };

  const handleAddEffect = (effectId: StarterEffectId) => {
    updateEffects(
      setBlockEffectOverride(blockEffects, selectedTarget, effectId, {}, brand),
    );
  };

  const compatibleToAdd = getCompatibleEffectsForTarget(selectedTarget).filter(
    (effectId) => !blockEffects.some(
      (entry) => entry.target === selectedTarget && entry.effectId === effectId,
    ),
  );

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-[10px] text-muted-foreground">Effect target</Label>
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

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        {hasOverrides
          ? "This target has block overrides. Brand defaults apply everywhere else."
          : "Inheriting brand effects for this target."}
      </p>

      <div className="space-y-2">
        {visibleEffects.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-2 py-3 text-center text-[10px] text-muted-foreground">
            No effects apply to this target yet.
          </p>
        ) : (
          visibleEffects.map((effect) => {
            const definition = effectDefinitionMap[effect.effectId];
            const isOverride = effect.source === "block";

            return (
              <div
                key={`${effect.target}-${effect.effectId}`}
                className="space-y-2 rounded-md border border-border bg-background/40 p-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium">{definition.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {isOverride ? "Block override" : "Brand default"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={effect.enabled ? "default" : "outline"}
                    className="h-7 text-[10px]"
                    onClick={() => {
                      updateEffects(
                        setBlockEffectOverride(
                          blockEffects,
                          selectedTarget,
                          effect.effectId,
                          { enabled: !effect.enabled },
                          brand,
                        ),
                      );
                    }}
                  >
                    {effect.enabled ? "On" : "Off"}
                  </Button>
                </div>

                {effect.enabled
                  ? definition.controls.slice(0, 4).map((control) => (
                      <EffectControlField
                        key={control.id}
                        control={control}
                        value={effect.values[control.id]}
                        onChange={(value) => {
                          updateEffects(
                            setBlockEffectOverride(
                              blockEffects,
                              selectedTarget,
                              effect.effectId,
                              { values: { [control.id]: value } },
                              brand,
                            ),
                          );
                        }}
                      />
                    ))
                  : null}

                {isOverride ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-full text-[10px]"
                    onClick={() => {
                      const next = blockEffects.filter(
                        (entry) =>
                          !(
                            entry.target === selectedTarget &&
                            entry.effectId === effect.effectId
                          ),
                      );
                      updateEffects(next);
                    }}
                  >
                    Remove override
                  </Button>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {compatibleToAdd.length > 0 ? (
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted-foreground">Add effect</Label>
          <Select onValueChange={(value) => handleAddEffect(value as StarterEffectId)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Choose effect…" />
            </SelectTrigger>
            <SelectContent>
              {compatibleToAdd.map((effectId) => (
                <SelectItem key={effectId} value={effectId}>
                  {effectDefinitionMap[effectId].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleResetTarget}
        disabled={!hasOverrides}
      >
        Reset to brand defaults
      </Button>
    </div>
  );
}

function EffectControlField({
  control,
  value,
  onChange,
}: {
  control: EffectControlDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (control.type === "toggle") {
    const checked = typeof value === "boolean" ? value : Boolean(control.defaultValue);
    return (
      <div className="flex items-center justify-between">
        <Label className="text-xs">{control.label}</Label>
        <Button
          type="button"
          size="sm"
          variant={checked ? "default" : "outline"}
          className="h-7 text-[10px]"
          onClick={() => onChange(!checked)}
        >
          {checked ? "On" : "Off"}
        </Button>
      </div>
    );
  }

  if (control.type === "color") {
    const color = typeof value === "string" ? value : String(control.defaultValue);
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{control.label}</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(event) => onChange(event.target.value)}
            className="h-8 w-10 shrink-0 cursor-pointer rounded border border-input bg-background p-0.5"
            aria-label={control.label}
          />
          <Input
            value={color}
            className="h-8 font-mono text-xs"
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      </div>
    );
  }

  const numeric =
    typeof value === "number"
      ? value
      : typeof control.defaultValue === "number"
        ? control.defaultValue
        : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{control.label}</Label>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {numeric}
        </span>
      </div>
      <Slider
        value={[numeric]}
        min={control.min ?? 0}
        max={control.max ?? 100}
        step={control.step ?? 1}
        onValueChange={([next]) => onChange(next)}
        aria-label={control.label}
      />
    </div>
  );
}
