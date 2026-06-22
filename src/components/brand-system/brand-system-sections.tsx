import { BrandEffectsPanel } from "@/components/editor/BrandEffectsPanel";
import { BrandLogosPanel } from "@/components/editor/BrandLogosPanel";
import { BrandTextAnimationDefaultsPanel } from "@/components/editor/BrandTextAnimationDefaultsPanel";
import { BrandTypographyPanel } from "@/components/editor/BrandTypographyPanel";
import { EasingPicker } from "@/components/editor/EasingPicker";
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
import { defaultBrandEffects } from "@/config/effects/defaults";
import { studioBrandPresets } from "@/lib/brand-motion-kit-adapter";
import {
  applyPersonalityToBrand,
  BRAND_PERSONALITIES,
  BRAND_PERSONALITY_LABELS,
  exportBrandJson,
  importBrandJson,
} from "@/lib/brand-personality";
import { normalizeBrandColors } from "@/lib/brand-colors";
import { normalizeBrandMotion } from "@/lib/easing";
import { TYPE_STYLE_LABELS } from "@/config/typography/defaults";
import { hasPoorContrast } from "@/lib/typography";
import type { BrandPreset, BrandPersonality, ProjectAsset } from "@/types";
import { useRef } from "react";

export type BrandSystemSection =
  | "overview"
  | "logos"
  | "colors"
  | "typography"
  | "motion"
  | "effects"
  | "advanced";

function ColorRow({
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
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
      <Label htmlFor={id} className="shrink-0 text-sm">
        {label}
      </Label>
      <div className="flex min-w-0 max-w-[220px] flex-1 items-center justify-end gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded border border-input bg-background p-0.5"
          aria-label={`${label} color picker`}
        />
        <Input
          value={value}
          className="h-9 font-mono text-xs"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}

function SectionIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 max-w-xl">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

type SectionProps = {
  draftBrand: BrandPreset;
  logoText: string;
  assets: ProjectAsset[];
  onBrandChange: (brand: BrandPreset) => void;
  onLogoTextChange: (text: string) => void;
  onUploadAsset: (file: File) => Promise<ProjectAsset | null>;
  onDuplicate?: () => void;
};

export function BrandOverviewSection({
  draftBrand,
  logoText,
  onBrandChange,
  onLogoTextChange,
}: SectionProps) {
  const colors = normalizeBrandColors(draftBrand.colors);
  const motion = normalizeBrandMotion(draftBrand.motion);

  return (
    <div>
      <SectionIntro
        title="Overview"
        description="Identity and personality for this brand system. Changes preview instantly."
      />

      <div className="max-w-xl divide-y divide-border rounded-lg border border-border">
        <div className="space-y-1.5 p-4">
          <Label htmlFor="brand-name">Brand name</Label>
          <Input
            id="brand-name"
            value={draftBrand.name}
            className="h-9"
            onChange={(event) =>
              onBrandChange({ ...draftBrand, name: event.target.value })
            }
          />
        </div>

        <div className="space-y-1.5 p-4">
          <Label htmlFor="logo-text">Logo text</Label>
          <Input
            id="logo-text"
            value={logoText}
            placeholder="Brand logo text"
            className="h-9"
            onChange={(event) => onLogoTextChange(event.target.value)}
          />
        </div>

        <div className="space-y-1.5 p-4">
          <Label>Brand personality</Label>
          <Select
            value={draftBrand.personality ?? "precise"}
            onValueChange={(value) =>
              onBrandChange(
                applyPersonalityToBrand(draftBrand, value as BrandPersonality),
              )
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BRAND_PERSONALITIES.map((personality) => (
                <SelectItem key={personality} value={personality}>
                  {BRAND_PERSONALITY_LABELS[personality]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 p-4">
          <p className="text-xs font-medium text-muted-foreground">At a glance</p>
          <div className="flex flex-wrap gap-2">
            {[colors.background, colors.foreground, colors.accent, colors.muted].map(
              (color, index) => (
                <div
                  key={color + index}
                  className="h-8 w-8 rounded-md border border-border"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ),
            )}
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <dt className="text-muted-foreground">Heading font</dt>
              <dd className="font-medium">{draftBrand.typography.fontFamilies.heading}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Body font</dt>
              <dd className="font-medium">{draftBrand.typography.fontFamilies.body}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Motion speed</dt>
              <dd className="font-medium">{motion.speed.toFixed(2)}×</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Card radius</dt>
              <dd className="font-medium">{draftBrand.effects.defaultRadius.card}px</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

export function BrandLogosSection({
  draftBrand,
  assets,
  onBrandChange,
  onUploadAsset,
}: SectionProps) {
  return (
    <div>
      <SectionIntro
        title="Logos"
        description="Build a responsive logo kit. Upload multiple variants and tag each for type, usage, and background compatibility."
      />
      <div className="max-w-3xl">
        <BrandLogosPanel
          embedded
          brand={draftBrand}
          assets={assets}
          onBrandChange={onBrandChange}
          onUploadAsset={onUploadAsset}
        />
      </div>
    </div>
  );
}

export function BrandColorsSection({ draftBrand, onBrandChange }: SectionProps) {
  const colors = normalizeBrandColors(draftBrand.colors);
  const contrastWarning = hasPoorContrast(colors.foreground, colors.background);

  const updateColor = (key: keyof typeof colors, value: string) => {
    onBrandChange({
      ...draftBrand,
      colors: normalizeBrandColors({ ...colors, [key]: value }),
    });
  };

  return (
    <div>
      <SectionIntro
        title="Colors"
        description="Core palette used across blocks. Surface and border derive from background when unset."
      />

      {contrastWarning ? (
        <p className="mb-4 max-w-xl rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Foreground and background may have low contrast. Check readability in the preview.
        </p>
      ) : null}

      <div className="max-w-xl rounded-lg border border-border px-4">
        <ColorRow
          id="color-bg"
          label="Background"
          value={colors.background}
          onChange={(v) => updateColor("background", v)}
        />
        <ColorRow
          id="color-fg"
          label="Foreground"
          value={colors.foreground}
          onChange={(v) => updateColor("foreground", v)}
        />
        <ColorRow
          id="color-accent"
          label="Accent"
          value={colors.accent}
          onChange={(v) => updateColor("accent", v)}
        />
        <ColorRow
          id="color-muted"
          label="Muted"
          value={colors.muted}
          onChange={(v) => updateColor("muted", v)}
        />
        <ColorRow
          id="color-surface"
          label="Surface"
          value={colors.surface ?? colors.background}
          onChange={(v) => updateColor("surface", v)}
        />
        <ColorRow
          id="color-border"
          label="Border"
          value={colors.border ?? colors.foreground}
          onChange={(v) => updateColor("border", v)}
        />
      </div>
    </div>
  );
}

export function BrandTypographySection({ draftBrand, onBrandChange }: SectionProps) {
  return (
    <div>
      <SectionIntro
        title="Typography"
        description="Font families and type scale. Expand a style to fine-tune size, weight, and tracking."
      />
      <div className="max-w-2xl">
        <BrandTypographyPanel
          embedded
          brand={draftBrand}
          onChange={(typography) => onBrandChange({ ...draftBrand, typography })}
        />
      </div>
    </div>
  );
}

const DIRECTION_OPTIONS = ["left", "right", "up", "down"] as const;

export function BrandMotionSection({ draftBrand, onBrandChange }: SectionProps) {
  const motion = normalizeBrandMotion(draftBrand.motion);

  const updateMotion = <K extends keyof typeof draftBrand.motion>(
    key: K,
    value: (typeof draftBrand.motion)[K],
  ) => {
    onBrandChange({
      ...draftBrand,
      motion: { ...draftBrand.motion, [key]: value },
    });
  };

  return (
    <div>
      <SectionIntro
        title="Motion"
        description="Global motion DNA — speed, intensity, and easing inherited by blocks unless overridden."
      />

      <div className="max-w-xl space-y-4">
        <div className="rounded-lg border border-border p-4">
          <EasingPicker
            label="Default easing"
            value={motion.defaultEasingId}
            onChange={(id) => id && updateMotion("defaultEasingId", id)}
            showLargePreview
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <MotionSlider
            label="Speed"
            value={draftBrand.motion.speed}
            min={0.5}
            max={2}
            step={0.05}
            format={(v) => `${v.toFixed(2)}×`}
            onChange={(v) => updateMotion("speed", v)}
          />
          <MotionSlider
            label="Intensity"
            value={draftBrand.motion.intensity}
            min={0.25}
            max={2}
            step={0.05}
            format={(v) => v.toFixed(2)}
            onChange={(v) => updateMotion("intensity", v)}
          />
          <MotionSlider
            label="Stagger"
            value={draftBrand.motion.stagger}
            min={0}
            max={24}
            step={1}
            format={(v) => `${v}f`}
            onChange={(v) => updateMotion("stagger", v)}
          />
          <div className="space-y-1.5">
            <Label>Direction bias</Label>
            <Select
              value={draftBrand.motion.directionBias}
              onValueChange={(v) =>
                updateMotion("directionBias", v as typeof draftBrand.motion.directionBias)
              }
            >
              <SelectTrigger className="h-9 capitalize">
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
        </div>

        <BrandTextAnimationDefaultsPanel
          embedded
          brand={draftBrand}
          onChange={(textAnimation) =>
            updateMotion("textAnimation", {
              ...draftBrand.motion.textAnimation,
              ...textAnimation,
            })
          }
        />

        <div className="space-y-3 rounded-lg border border-border p-4">
          <p className="text-xs font-medium text-muted-foreground">Phase easing</p>
          <EasingPicker
            label="Entrance"
            value={motion.entranceEasingId}
            onChange={(id) => id && updateMotion("entranceEasingId", id)}
            compact
          />
          <EasingPicker
            label="Exit"
            value={motion.exitEasingId}
            onChange={(id) => id && updateMotion("exitEasingId", id)}
            compact
          />
          <EasingPicker
            label="Transition"
            value={motion.transitionEasingId}
            onChange={(id) => id && updateMotion("transitionEasingId", id)}
            compact
          />
        </div>
      </div>
    </div>
  );
}

function MotionSlider({
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

export function BrandEffectsSection({ draftBrand, onBrandChange }: SectionProps) {
  return (
    <div>
      <SectionIntro
        title="Effects"
        description="Default visual treatments inherited by block targets. Override per block in Advanced effects."
      />
      <div className="max-w-xl">
        <BrandEffectsPanel
          embedded
          brand={draftBrand}
          onChange={(effects) => onBrandChange({ ...draftBrand, effects })}
        />
      </div>
    </div>
  );
}

export function BrandAdvancedSection({
  draftBrand,
  onBrandChange,
  onDuplicate,
}: SectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async (file: File) => {
    const text = await file.text();
    const imported = importBrandJson(text);
    onBrandChange({ ...imported, id: draftBrand.id, name: imported.name || draftBrand.name });
  };

  return (
    <div>
      <SectionIntro
        title="Advanced"
        description="Import, export, duplicate, or reset this brand system."
      />

      <div className="max-w-xl space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const blob = new Blob([exportBrandJson(draftBrand)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = `${draftBrand.name.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() || "brand"}.json`;
              anchor.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export brand JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            Import brand JSON
          </Button>
          {onDuplicate ? (
            <Button type="button" variant="outline" size="sm" onClick={onDuplicate}>
              Duplicate brand
            </Button>
          ) : null}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleImport(file);
            event.target.value = "";
          }}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onBrandChange({
              ...structuredClone(studioBrandPresets[0]),
              id: draftBrand.id,
              name: draftBrand.name,
              personality: draftBrand.personality,
            })
          }
        >
          Reset to Scatter defaults
        </Button>

        <details className="rounded-lg border border-border p-4">
          <summary className="cursor-pointer text-sm font-medium">Token preview</summary>
          <pre className="mt-3 max-h-64 overflow-auto rounded bg-secondary/40 p-3 text-[10px] leading-relaxed">
            {JSON.stringify(
              {
                colors: normalizeBrandColors(draftBrand.colors),
                typography: {
                  heading: draftBrand.typography.fontFamilies.heading,
                  body: draftBrand.typography.fontFamilies.body,
                  scale: Object.fromEntries(
                    Object.entries(draftBrand.typography.scale).map(([key, style]) => [
                      TYPE_STYLE_LABELS[key as keyof typeof TYPE_STYLE_LABELS] ?? key,
                      `${style.fontSize}px / ${style.lineHeight}`,
                    ]),
                  ),
                },
                motion: normalizeBrandMotion(draftBrand.motion),
                effects: draftBrand.effects ?? defaultBrandEffects,
              },
              null,
              2,
            )}
          </pre>
        </details>
      </div>
    </div>
  );
}

export const BRAND_SYSTEM_NAV: Array<{ id: BrandSystemSection; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "logos", label: "Logos" },
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "motion", label: "Motion" },
  { id: "effects", label: "Effects" },
  { id: "advanced", label: "Advanced" },
];
