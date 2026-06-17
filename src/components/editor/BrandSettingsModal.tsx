import { useEditor } from "@/context/editor-context";
import { FontSelector } from "@/components/editor/FontSelector";
import { EasingPicker } from "@/components/editor/EasingPicker";
import { CUSTOM_BRAND_ID } from "@/lib/brand-utils";
import { normalizeBrandMotion } from "@/lib/easing";
import { normalizeBrandTypography } from "@/lib/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

const DIRECTION_OPTIONS = ["left", "right", "up", "down"] as const;

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

export function BrandSettingsModal() {
  const {
    brand,
    allBrands,
    showBrandSettings,
    setShowBrandSettings,
    updateCustomBrand,
    duplicateBrandToCustom,
    saveCustomBrand,
    setLogoText,
    setBrand,
    sequence,
  } = useEditor();

  const dialogRef = useRef<HTMLDivElement>(null);
  const isCustom = brand.id === CUSTOM_BRAND_ID;

  useEffect(() => {
    if (!showBrandSettings) return;
    const onClick = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setShowBrandSettings(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showBrandSettings, setShowBrandSettings]);

  if (!showBrandSettings) return null;

  const updateColor = (key: keyof typeof brand.colors, value: string) => {
    updateCustomBrand((b) => ({
      ...b,
      colors: { ...b.colors, [key]: value },
    }));
  };

  const updateFontFamily = (fontFamily: string) => {
    updateCustomBrand((b) => ({
      ...b,
      typography: normalizeBrandTypography({ ...b.typography, fontFamily }),
    }));
  };

  const updateMotion = <K extends keyof typeof brand.motion>(
    key: K,
    value: (typeof brand.motion)[K],
  ) => {
    updateCustomBrand((b) => ({
      ...b,
      motion: { ...b.motion, [key]: value },
    }));
  };

  const motion = normalizeBrandMotion(brand.motion);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-12"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-settings-title"
        className="mb-8 w-full max-w-lg rounded-lg border border-border bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id="brand-settings-title" className="text-sm font-semibold">
            Brand settings
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowBrandSettings(false)}
            aria-label="Close brand settings"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
          <div className="flex flex-wrap gap-2">
            <Select
              value={brand.id}
              onValueChange={(id) => {
                if (id === CUSTOM_BRAND_ID && !isCustom) {
                  duplicateBrandToCustom(brand.id);
                } else {
                  setBrand(id);
                }
              }}
            >
              <SelectTrigger className="h-8 w-full text-sm" aria-label="Base preset to duplicate">
                <SelectValue placeholder="Duplicate from preset" />
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
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => duplicateBrandToCustom(brand.id)}
            >
              Duplicate to custom
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brand-name">Brand name</Label>
            <Input
              id="brand-name"
              value={brand.name}
              className="h-8"
              onChange={(event) =>
                updateCustomBrand((b) => ({ ...b, name: event.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="logo-text">Logo text</Label>
            <Input
              id="logo-text"
              value={sequence.logoText ?? ""}
              placeholder="Brand logo text"
              className="h-8"
              onChange={(event) => setLogoText(event.target.value)}
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium text-muted-foreground">Colors</legend>
            <ColorField
              id="brand-bg"
              label="Background"
              value={brand.colors.background}
              onChange={(v) => updateColor("background", v)}
            />
            <ColorField
              id="brand-fg"
              label="Foreground"
              value={brand.colors.foreground}
              onChange={(v) => updateColor("foreground", v)}
            />
            <ColorField
              id="brand-accent"
              label="Accent"
              value={brand.colors.accent}
              onChange={(v) => updateColor("accent", v)}
            />
            <ColorField
              id="brand-muted"
              label="Muted"
              value={brand.colors.muted}
              onChange={(v) => updateColor("muted", v)}
            />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium text-muted-foreground">Typography</legend>
            <FontSelector value={brand.typography.fontFamily} onChange={updateFontFamily} />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium text-muted-foreground">Motion DNA</legend>

            <EasingPicker
              label="Default easing"
              value={motion.defaultEasingId}
              onChange={(id) => {
                if (id) updateMotion("defaultEasingId", id);
              }}
              showLargePreview
            />

            <EasingPicker
              label="Entrance easing"
              value={motion.entranceEasingId}
              onChange={(id) => {
                if (id) updateMotion("entranceEasingId", id);
              }}
            />

            <EasingPicker
              label="Exit easing"
              value={motion.exitEasingId}
              onChange={(id) => {
                if (id) updateMotion("exitEasingId", id);
              }}
            />

            <EasingPicker
              label="Transition easing"
              value={motion.transitionEasingId}
              onChange={(id) => {
                if (id) updateMotion("transitionEasingId", id);
              }}
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Speed</Label>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {brand.motion.speed.toFixed(2)}×
                </span>
              </div>
              <Slider
                value={[brand.motion.speed]}
                min={0.5}
                max={2}
                step={0.05}
                onValueChange={([v]) => updateMotion("speed", v)}
                aria-label="Motion speed"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Intensity</Label>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {brand.motion.intensity.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[brand.motion.intensity]}
                min={0.25}
                max={2}
                step={0.05}
                onValueChange={([v]) => updateMotion("intensity", v)}
                aria-label="Motion intensity"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Stagger</Label>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {brand.motion.stagger}f
                </span>
              </div>
              <Slider
                value={[brand.motion.stagger]}
                min={0}
                max={24}
                step={1}
                onValueChange={([v]) => updateMotion("stagger", v)}
                aria-label="Motion stagger"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Direction bias</Label>
              <Select
                value={brand.motion.directionBias}
                onValueChange={(v) =>
                  updateMotion("directionBias", v as typeof brand.motion.directionBias)
                }
              >
                <SelectTrigger className="h-8 w-full text-sm capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTION_OPTIONS.map((dir) => (
                    <SelectItem key={dir} value={dir} className="capitalize">
                      {dir}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </fieldset>

          {isCustom && (
            <Button size="sm" variant="outline" className="w-full" onClick={saveCustomBrand}>
              Save as named preset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
