import type { CSSProperties } from "react";
import {
  createBrandTypography,
  defaultBrandTypography,
  FORMAT_TYPE_PROFILES,
} from "@/config/typography/defaults";
import { getFormatLayoutScale } from "@/lib/layout/format-scale";
import {
  createDefaultTypographyRoles,
  rolesFromLegacyScale,
} from "@/config/typography/roles";
import { defaultProjectFont } from "@/config/fonts";
import { buildFontStack } from "@/lib/google-fonts";
import type { BrandTypography } from "@/types/brand";
import type { MotionFormat } from "@/types/format";
import type {
  BlockTypographyOverride,
  FontRole,
  ResolvedTypeStyle,
  TextSlotOverride,
  TextTransform,
  TypeStyle,
  TypeStyleName,
} from "@/types/typography";

export {
  createBrandTypography,
  createDefaultTypeScale,
  defaultBrandTypography,
  editorialBrandTypography,
  FORMAT_TYPE_PROFILES,
  REFERENCE_FORMAT_HEIGHT,
  saasBrandTypography,
  TYPE_STYLE_LABELS,
  TYPE_STYLE_SAMPLES,
} from "@/config/typography/defaults";

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 280;
const MIN_LINE_HEIGHT = 1;
const LOW_LINE_HEIGHT_WARNING = 1.1;

export function parseFontFamilyFromStack(stack?: string): string | undefined {
  if (!stack) return undefined;
  const match = stack.match(/^"([^"]+)"|^([^,]+)/);
  return (match?.[1] ?? match?.[2])?.trim();
}

function isStructuredTypography(value: unknown): value is BrandTypography {
  return (
    typeof value === "object" &&
    value !== null &&
    "fontFamilies" in value &&
    "scale" in value &&
    "defaults" in value
  );
}

export function normalizeBrandTypography(typography: unknown): BrandTypography {
  if (isStructuredTypography(typography)) {
    const mergedScale = { ...defaultBrandTypography.scale, ...typography.scale };
    return {
      fontFamilies: {
        heading: typography.fontFamilies.heading,
        body: typography.fontFamilies.body,
        accent: typography.fontFamilies.accent ?? typography.fontFamilies.heading,
      },
      scale: mergedScale,
      roles: typography.roles
        ? { ...createDefaultTypographyRoles(), ...typography.roles }
        : rolesFromLegacyScale(mergedScale),
      density: typography.density ?? "balanced",
      defaults: { ...defaultBrandTypography.defaults, ...typography.defaults },
    };
  }

  const legacy = typography as {
    fontFamily?: string;
    headingFont?: string;
    bodyFont?: string;
  };

  const heading =
    legacy.fontFamily ??
    parseFontFamilyFromStack(legacy.headingFont) ??
    defaultProjectFont;
  const body = parseFontFamilyFromStack(legacy.bodyFont) ?? heading;

  return createBrandTypography({ heading, body });
}

export function clampFontSize(value: number, min = MIN_FONT_SIZE, max = MAX_FONT_SIZE): number {
  return Math.round(Math.min(max, Math.max(min, value)));
}

export function resolveFontFamilyName(
  typography: BrandTypography,
  role: FontRole,
  explicitFamily?: string,
): string {
  if (explicitFamily) return explicitFamily;
  if (role === "accent") {
    return typography.fontFamilies.accent ?? typography.fontFamilies.heading;
  }
  return typography.fontFamilies[role];
}

export function resolveFontStack(
  typography: BrandTypography,
  role: FontRole,
  explicitFamily?: string,
): string {
  const family = resolveFontFamilyName(typography, role, explicitFamily);
  return buildFontStack(family);
}

export function scaleTypeForFormat(typeStyle: TypeStyle, format: MotionFormat): TypeStyle {
  const profile = FORMAT_TYPE_PROFILES[format.aspectRatio] ?? FORMAT_TYPE_PROFILES["16:9"];
  const layoutScale = getFormatLayoutScale(format);

  return {
    ...typeStyle,
    fontSize: clampFontSize(typeStyle.fontSize * layoutScale * profile.sizeScale),
  };
}

export function getTypeStyle(
  styleName: TypeStyleName,
  typography: BrandTypography,
  format: MotionFormat,
): TypeStyle {
  const base = typography.scale[styleName];
  return scaleTypeForFormat(base, format);
}

export function formatLetterSpacing(value: number): string {
  const formatted = value.toFixed(3).replace(/\.?0+$/, "");
  return `${formatted}em`;
}

export function resolvedTypeStyleToCss(style: ResolvedTypeStyle): CSSProperties {
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing,
    textTransform: style.textTransform,
    maxWidth: style.maxWidth,
    textAlign: style.textAlign,
    overflowWrap: "break-word",
    wordBreak: "normal",
  };
}

export function resolveTypeStyle(
  typography: BrandTypography,
  format: MotionFormat,
  styleName: TypeStyleName,
  override?: TextSlotOverride,
): ResolvedTypeStyle {
  const token = override?.styleToken ?? styleName;
  const base = getTypeStyle(token, typography, format);
  const profile = FORMAT_TYPE_PROFILES[format.aspectRatio] ?? FORMAT_TYPE_PROFILES["16:9"];

  const fontFamily = resolveFontStack(
    typography,
    base.fontFamily,
    override?.fontFamily,
  );

  const fontSize = override?.fontSize
    ? clampFontSize(scaleTypeForFormat({ ...base, fontSize: override.fontSize }, format).fontSize)
    : base.fontSize;

  const lineHeight = Math.max(
    MIN_LINE_HEIGHT,
    override?.lineHeight ?? base.lineHeight,
  );

  const fontWeight = override?.fontWeight ?? base.fontWeight;
  const letterSpacingValue = override?.letterSpacing ?? base.letterSpacing;
  const textTransform = (override?.textTransform ?? base.textTransform ?? "none") as TextTransform;

  const maxWidth =
    override?.maxWidth !== undefined
      ? format.width * override.maxWidth
      : format.width * profile.maxWidthFactor;

  return {
    fontFamily,
    fontSize,
    lineHeight,
    fontWeight,
    letterSpacing: formatLetterSpacing(letterSpacingValue),
    textTransform,
    maxWidth,
    textAlign: override?.align,
  };
}

export function resolveBlockSlotStyle(
  typography: BrandTypography,
  format: MotionFormat,
  styleName: TypeStyleName,
  override?: BlockTypographyOverride,
  slot?: keyof BlockTypographyOverride,
): ResolvedTypeStyle {
  const slotOverride =
    override?.enabled && slot && slot !== "enabled"
      ? (override[slot] as TextSlotOverride | undefined)
      : undefined;

  return resolveTypeStyle(typography, format, styleName, slotOverride);
}

export function getBrandFontFamilies(typography: BrandTypography): string[] {
  const families = new Set([
    typography.fontFamilies.heading,
    typography.fontFamilies.body,
    typography.fontFamilies.accent ?? typography.fontFamilies.heading,
  ]);
  return [...families];
}

export function isLowLineHeight(lineHeight: number): boolean {
  return lineHeight < LOW_LINE_HEIGHT_WARNING;
}

export function getContrastRatio(foreground: string, background: string): number | null {
  const parse = (hex: string) => {
    const normalized = hex.replace("#", "");
    if (normalized.length !== 6) return null;
    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);
    return [r, g, b];
  };

  const fg = parse(foreground);
  const bg = parse(background);
  if (!fg || !bg) return null;

  const luminance = ([r, g, b]: number[]) => {
    const channel = (value: number) => {
      const srgb = value / 255;
      return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };

  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function hasPoorContrast(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio !== null && ratio < 4.5;
}

export function clampHeadlineText(text: string, maxChars = 80): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars - 1).trimEnd()}…`;
}
