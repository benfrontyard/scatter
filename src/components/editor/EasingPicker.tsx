import { EasingCurvePreview } from "@/components/editor/EasingCurvePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EASING_CATEGORIES,
  getAllEasingPresets,
  getEasingPreset,
  getOrCreateCustomPreset,
  groupPresetsByCategory,
  saveCustomEasingPreset,
  validateBezier,
} from "@/lib/easing";
import { cn } from "@/lib/utils";
import type { EasingBezier, EasingPreset } from "@/types";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useId, useState } from "react";

const CUSTOM_BEZIER_DEFAULT: EasingBezier = { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 };

type EasingPickerProps = {
  label: string;
  value: string | undefined;
  onChange: (easingId: string | undefined) => void;
  allowInherit?: boolean;
  inheritLabel?: string;
  inheritEasingId?: string;
  compact?: boolean;
  showLargePreview?: boolean;
};

function BezierInput({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-[10px] text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        step={step ?? 0.01}
        min={min}
        max={max}
        value={value}
        className="h-7 font-mono text-xs"
        onChange={(event) => {
          const next = Number.parseFloat(event.target.value);
          if (!Number.isNaN(next)) onChange(next);
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} className="text-[10px] text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PresetOption({
  preset,
  selected,
  onSelect,
}: {
  preset: EasingPreset;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-2 rounded-md border px-2 py-2 text-left transition-colors",
        "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary bg-primary/5" : "border-border bg-background/50",
      )}
      aria-pressed={selected}
    >
      <EasingCurvePreview preset={preset} size="sm" className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium">{preset.name}</span>
          {selected ? <Check className="h-3 w-3 shrink-0 text-primary" aria-hidden /> : null}
        </div>
        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{preset.cssValue}</p>
        <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">
          {preset.recommendedUse}
        </p>
      </div>
    </button>
  );
}

export function EasingPicker({
  label,
  value,
  onChange,
  allowInherit = false,
  inheritLabel = "Inherit from brand",
  inheritEasingId,
  compact = false,
  showLargePreview = false,
}: EasingPickerProps) {
  const listId = useId();
  const [expanded, setExpanded] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customBezier, setCustomBezier] = useState<EasingBezier>(CUSTOM_BEZIER_DEFAULT);
  const [saveName, setSaveName] = useState("");
  const [, setCustomVersion] = useState(0);

  const refreshCustom = useCallback(() => {
    setCustomVersion((v) => v + 1);
  }, []);

  const allPresets = getAllEasingPresets();
  const grouped = groupPresetsByCategory(allPresets);

  const isInheriting = allowInherit && value === undefined;
  const resolvedPreset = isInheriting
    ? getEasingPreset(inheritEasingId)
    : getEasingPreset(value);

  const validation = validateBezier(customBezier);

  const handleCustomApply = () => {
    if (!validation.valid) return;
    const preset = getOrCreateCustomPreset(customBezier);
    refreshCustom();
    onChange(preset.id);
    setShowCustom(false);
    setExpanded(false);
  };

  const handleSaveNamed = () => {
    if (!validation.valid || !saveName.trim()) return;
    const preset = saveCustomEasingPreset({
      ...getOrCreateCustomPreset(customBezier),
      name: saveName.trim(),
      description: `Custom curve: ${customBezier.x1}, ${customBezier.y1}, ${customBezier.x2}, ${customBezier.y2}`,
    });
    refreshCustom();
    onChange(preset.id);
    setSaveName("");
    setShowCustom(false);
    setExpanded(false);
  };

  const customDraftPreset: EasingPreset = {
    id: "__draft__",
    name: "Custom",
    description: "Draft custom curve",
    category: "Utility",
    cssValue: `cubic-bezier(${customBezier.x1}, ${customBezier.y1}, ${customBezier.x2}, ${customBezier.y2})`,
    bezier: customBezier,
    personality: "Custom",
    recommendedUse: "Custom curve",
    isCustom: true,
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label id={`${listId}-label`}>{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 gap-1 px-1.5 text-[10px] text-muted-foreground"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          aria-controls={`${listId}-panel`}
        >
          {expanded ? "Close" : "Browse"}
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md border border-border bg-background/50 px-2 py-1.5 text-left",
          "hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          compact ? "py-1" : "py-2",
        )}
        aria-labelledby={`${listId}-label`}
        aria-expanded={expanded}
        aria-controls={`${listId}-panel`}
      >
        <EasingCurvePreview preset={resolvedPreset} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">
            {isInheriting ? inheritLabel : resolvedPreset.name}
          </p>
          <p className="truncate font-mono text-[10px] text-muted-foreground">
            {resolvedPreset.cssValue}
          </p>
        </div>
      </button>

      {showLargePreview && !compact ? (
        <div className="flex items-center justify-center rounded-md border border-border bg-background/30 p-3">
          <EasingCurvePreview preset={resolvedPreset} size="md" animated showEndpoints />
        </div>
      ) : null}

      {expanded ? (
        <div
          id={`${listId}-panel`}
          role="listbox"
          aria-labelledby={`${listId}-label`}
          className="max-h-64 space-y-2 overflow-y-auto rounded-md border border-border bg-card p-2"
        >
          {allowInherit ? (
            <button
              type="button"
              role="option"
              aria-selected={isInheriting}
              onClick={() => {
                onChange(undefined);
                setExpanded(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left text-xs",
                isInheriting ? "border-primary bg-primary/5" : "border-border",
              )}
            >
              <span className="font-medium">{inheritLabel}</span>
              {inheritEasingId ? (
                <span className="font-mono text-[10px] text-muted-foreground">
                  ({getEasingPreset(inheritEasingId).name})
                </span>
              ) : null}
            </button>
          ) : null}

          {EASING_CATEGORIES.map((category) => {
            const presets = grouped[category];
            if (!presets?.length) return null;
            return (
              <div key={category}>
                <p className="mb-1 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {category}
                </p>
                <div className="space-y-1">
                  {presets.map((preset) => (
                    <div key={preset.id} role="option" aria-selected={value === preset.id}>
                      <PresetOption
                        preset={preset}
                        selected={!isInheriting && value === preset.id}
                        onSelect={() => {
                          onChange(preset.id);
                          setShowCustom(false);
                          setExpanded(false);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="border-t border-border pt-2">
            <button
              type="button"
              onClick={() => setShowCustom((open) => !open)}
              className="flex w-full items-center justify-between rounded-md px-1 py-1 text-xs font-medium hover:bg-accent/30"
              aria-expanded={showCustom}
            >
              Custom cubic-bezier
              {showCustom ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {showCustom ? (
              <div className="mt-2 space-y-3 rounded-md border border-border bg-background/50 p-2">
                <div className="flex justify-center">
                  <EasingCurvePreview
                    preset={validation.valid ? customDraftPreset : resolvedPreset}
                    size="md"
                    animated={validation.valid}
                  />
                </div>

                <p className="text-center font-mono text-[10px] text-muted-foreground">
                  {customDraftPreset.cssValue}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <BezierInput
                    id={`${listId}-x1`}
                    label="x1 (0–1)"
                    value={customBezier.x1}
                    min={0}
                    max={1}
                    onChange={(x1) => setCustomBezier((b) => ({ ...b, x1 }))}
                    error={
                      customBezier.x1 < 0 || customBezier.x1 > 1
                        ? "Must be 0–1"
                        : undefined
                    }
                  />
                  <BezierInput
                    id={`${listId}-y1`}
                    label="y1"
                    value={customBezier.y1}
                    onChange={(y1) => setCustomBezier((b) => ({ ...b, y1 }))}
                  />
                  <BezierInput
                    id={`${listId}-x2`}
                    label="x2 (0–1)"
                    value={customBezier.x2}
                    min={0}
                    max={1}
                    onChange={(x2) => setCustomBezier((b) => ({ ...b, x2 }))}
                    error={
                      customBezier.x2 < 0 || customBezier.x2 > 1
                        ? "Must be 0–1"
                        : undefined
                    }
                  />
                  <BezierInput
                    id={`${listId}-y2`}
                    label="y2"
                    value={customBezier.y2}
                    onChange={(y2) => setCustomBezier((b) => ({ ...b, y2 }))}
                  />
                </div>

                {validation.warnings.length > 0 ? (
                  <div role="status" className="space-y-0.5">
                    {validation.warnings.map((warning) => (
                      <p key={warning} className="text-[10px] text-amber-500">
                        {warning}
                      </p>
                    ))}
                  </div>
                ) : null}

                {validation.errors.length > 0 ? (
                  <div role="alert" className="space-y-0.5">
                    {validation.errors.map((error) => (
                      <p key={error} className="text-[10px] text-destructive">
                        {error}
                      </p>
                    ))}
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 flex-1 text-xs"
                    disabled={!validation.valid}
                    onClick={handleCustomApply}
                  >
                    Apply
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`${listId}-save-name`} className="text-[10px]">
                    Save as named preset
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={`${listId}-save-name`}
                      value={saveName}
                      placeholder="My curve"
                      className="h-7 text-xs"
                      onChange={(event) => setSaveName(event.target.value)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 shrink-0 text-xs"
                      disabled={!validation.valid || !saveName.trim()}
                      onClick={handleSaveNamed}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
