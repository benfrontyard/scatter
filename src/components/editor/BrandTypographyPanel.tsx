import { FontSelector } from "@/components/editor/FontSelector";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { motionFormatMap } from "@/config/formats";
import { defaultFormatId } from "@/config/formats";
import { TYPE_STYLE_LABELS, TYPE_STYLE_SAMPLES } from "@/config/typography/defaults";
import { useGoogleFont } from "@/hooks/use-google-font";
import {
  getTypeStyle,
  hasPoorContrast,
  isLowLineHeight,
  normalizeBrandTypography,
  resolveFontStack,
  resolvedTypeStyleToCss,
} from "@/lib/typography";
import type { BrandPreset, BrandTypography, TextTransform, TypeStyle, TypeStyleName } from "@/types";
import { useMemo } from "react";

const STYLE_NAMES: TypeStyleName[] = [
  "display",
  "headline",
  "title",
  "body",
  "caption",
  "label",
];

const TEXT_TRANSFORMS: TextTransform[] = ["none", "uppercase", "lowercase", "capitalize"];

type BrandTypographyPanelProps = {
  brand: BrandPreset;
  onChange: (typography: BrandTypography) => void;
};

export function BrandTypographyPanel({ brand, onChange }: BrandTypographyPanelProps) {
  const typography = brand.typography;
  const previewFormat = motionFormatMap[defaultFormatId];

  useGoogleFont(typography.fontFamilies.heading);
  useGoogleFont(typography.fontFamilies.body);
  useGoogleFont(typography.fontFamilies.accent);

  const contrastWarning = hasPoorContrast(brand.colors.foreground, brand.colors.background);

  const updateTypography = (updater: (current: BrandTypography) => BrandTypography) => {
    onChange(normalizeBrandTypography(updater(typography)));
  };

  const updateFontFamily = (role: "heading" | "body" | "accent", family: string) => {
    updateTypography((current) => ({
      ...current,
      fontFamilies: { ...current.fontFamilies, [role]: family },
    }));
  };

  const updateStyle = (styleName: TypeStyleName, patch: Partial<TypeStyle>) => {
    updateTypography((current) => ({
      ...current,
      scale: {
        ...current.scale,
        [styleName]: { ...current.scale[styleName], ...patch },
      },
    }));
  };

  const updateDefault = <K extends keyof BrandTypography["defaults"]>(
    key: K,
    value: BrandTypography["defaults"][K],
  ) => {
    updateTypography((current) => ({
      ...current,
      defaults: { ...current.defaults, [key]: value },
    }));
  };

  const previews = useMemo(
    () =>
      Object.fromEntries(
        STYLE_NAMES.map((name) => [
          name,
          resolvedTypeStyleToCss(
            resolvePreviewStyle(typography, previewFormat, name),
          ),
        ]),
      ) as Record<TypeStyleName, ReturnType<typeof resolvedTypeStyleToCss>>,
    [typography, previewFormat],
  );

  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-medium text-muted-foreground">Typography system</legend>

      {contrastWarning ? (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-[11px] leading-relaxed text-amber-200">
          Foreground and background may have low contrast. Check readability on the canvas.
        </p>
      ) : null}

      <div className="space-y-3 rounded-md border border-border bg-background/40 p-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Font families
        </p>
        <div className="space-y-2">
          <Label className="text-xs">Heading</Label>
          <FontSelector
            value={typography.fontFamilies.heading}
            onChange={(family) => family && updateFontFamily("heading", family)}
            label=""
            id="brand-font-heading"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Body</Label>
          <FontSelector
            value={typography.fontFamilies.body}
            onChange={(family) => family && updateFontFamily("body", family)}
            label=""
            id="brand-font-body"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Accent (optional)</Label>
          <FontSelector
            value={typography.fontFamilies.accent ?? typography.fontFamilies.heading}
            onChange={(family) => family && updateFontFamily("accent", family)}
            label=""
            id="brand-font-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Heading style</Label>
          <Select
            value={typography.defaults.headingStyle}
            onValueChange={(value) =>
              updateDefault("headingStyle", value as BrandTypography["defaults"]["headingStyle"])
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="display">Display</SelectItem>
              <SelectItem value="headline">Headline</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Body style</Label>
          <Select
            value={typography.defaults.bodyStyle}
            onValueChange={(value) =>
              updateDefault("bodyStyle", value as BrandTypography["defaults"]["bodyStyle"])
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="body">Body</SelectItem>
              <SelectItem value="caption">Caption</SelectItem>
              <SelectItem value="label">Label</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Label style</Label>
          <Select
            value={typography.defaults.labelStyle}
            onValueChange={(value) =>
              updateDefault("labelStyle", value as BrandTypography["defaults"]["labelStyle"])
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="label">Label</SelectItem>
              <SelectItem value="caption">Caption</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Accordion type="multiple" className="rounded-md border border-border px-2">
        {STYLE_NAMES.map((styleName) => {
          const style = typography.scale[styleName];
          const preview = previews[styleName];
          const lowLineHeight = isLowLineHeight(style.lineHeight);

          return (
            <AccordionItem key={styleName} value={styleName} className="border-border">
              <AccordionTrigger className="py-2 text-xs hover:no-underline">
                <span>{TYPE_STYLE_LABELS[styleName]}</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-3">
                <div
                  className="rounded-md border border-border bg-card px-3 py-2"
                  style={{
                    ...preview,
                    color: brand.colors.foreground,
                    backgroundColor: brand.colors.background,
                  }}
                >
                  {TYPE_STYLE_SAMPLES[styleName]}
                </div>

                {lowLineHeight ? (
                  <p className="text-[10px] text-amber-400">Line height may be too tight for readability.</p>
                ) : null}

                <StyleNumberField
                  label="Size"
                  value={style.fontSize}
                  min={12}
                  max={220}
                  step={1}
                  suffix="px"
                  onChange={(fontSize) => updateStyle(styleName, { fontSize })}
                />
                <StyleNumberField
                  label="Line height"
                  value={style.lineHeight}
                  min={1}
                  max={2}
                  step={0.05}
                  onChange={(lineHeight) => updateStyle(styleName, { lineHeight })}
                />
                <StyleNumberField
                  label="Weight"
                  value={style.fontWeight}
                  min={300}
                  max={800}
                  step={100}
                  onChange={(fontWeight) => updateStyle(styleName, { fontWeight })}
                />
                <StyleNumberField
                  label="Tracking"
                  value={style.letterSpacing}
                  min={-0.05}
                  max={0.2}
                  step={0.01}
                  suffix="em"
                  onChange={(letterSpacing) => updateStyle(styleName, { letterSpacing })}
                />

                <div className="space-y-1.5">
                  <Label className="text-xs">Transform</Label>
                  <Select
                    value={style.textTransform ?? "none"}
                    onValueChange={(value) =>
                      updateStyle(styleName, { textTransform: value as TextTransform })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs capitalize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXT_TRANSFORMS.map((transform) => (
                        <SelectItem key={transform} value={transform} className="capitalize">
                          {transform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Font role</Label>
                  <Select
                    value={style.fontFamily}
                    onValueChange={(value) =>
                      updateStyle(styleName, { fontFamily: value as TypeStyle["fontFamily"] })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs capitalize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heading">Heading</SelectItem>
                      <SelectItem value="body">Body</SelectItem>
                      <SelectItem value="accent">Accent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </fieldset>
  );
}

function StyleNumberField({
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
          {suffix ? suffix : ""}
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
      <Input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        className="h-7 font-mono text-xs"
        onChange={(event) => {
          const next = Number.parseFloat(event.target.value);
          if (!Number.isNaN(next)) onChange(next);
        }}
      />
    </div>
  );
}

function resolvePreviewStyle(
  typography: BrandTypography,
  format: (typeof motionFormatMap)[string],
  styleName: TypeStyleName,
) {
  const scaled = getTypeStyle(styleName, typography, format);
  return {
    fontFamily: resolveFontStack(typography, scaled.fontFamily),
    fontSize: scaled.fontSize,
    lineHeight: scaled.lineHeight,
    fontWeight: scaled.fontWeight,
    letterSpacing: `${scaled.letterSpacing}em`,
    textTransform: scaled.textTransform ?? "none",
  };
}
