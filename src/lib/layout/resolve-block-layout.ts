import {
  resolveBlockContentSlotRoles,
  resolveBlockLayoutIntent,
} from "@/config/blocks/layout-intents";
import {
  DENSITY_FACTORS,
  GRID_STRENGTH_FACTORS,
  INTENT_LAYOUT_RULES,
  SAFE_AREA_INSETS,
  ZONE_ANCHORS,
  alignmentForComposition,
  resolveIntentZone,
} from "@/config/composition/defaults";
import { mergeWave1LayoutOverrides } from "@/config/composition/wave1-overrides";
import { getFormatLayoutScale } from "@/lib/layout/format-scale";
import { resolveLogoPlacement } from "@/lib/logo/resolve-logo";
import { buildFontStack } from "@/lib/google-fonts";
import { clampFontSize, formatLetterSpacing, resolveFontFamilyName } from "@/lib/typography";
import type { BrandComposition, LayoutZone, ResolvedLayoutZone, ResolvedSafeArea } from "@/types/brand-composition";
import type {
  BlockFormatLayoutOverrides,
  BlockLayoutOverride,
  LayoutSource,
  ResolvedBlockLayout,
  ResolveBlockLayoutInput,
} from "@/types/block-layout";
import type { BrandTypography } from "@/types/brand";
import type { MotionFormat } from "@/types/format";
import type { TextAlign } from "@/types/typography";
import type {
  AspectRatioId,
  ResolvedTypographyRole,
  TypographyRoleDefinition,
  TypographyRoleName,
} from "@/types/typography-role";

const OVERRIDE_KEYS: (keyof BlockLayoutOverride)[] = [
  "useBrandLayout",
  "textRole",
  "textScale",
  "titleSize",
  "bodySize",
  "maxTextWidth",
  "alignment",
  "contentZone",
  "position",
  "padding",
  "gap",
  "mediaScale",
  "mediaPosition",
  "safeAreaOverride",
  "breakGrid",
  "autoFitText",
  "stackDirection",
];

const LOGO_BLOCK_IDS = new Set([
  "logo-reveal",
  "feature-announcement",
  "cta-lockup",
  "brand-payoff",
]);

function blockShouldIncludeLogo(blockId: string, intent: import("@/types/block-layout").BlockLayoutIntent): boolean {
  if (LOGO_BLOCK_IDS.has(blockId)) return true;
  return intent === "logo-lockup" || intent === "hero" || intent === "outro";
}

function isAspectRatioId(value: string): value is AspectRatioId {
  return value === "16:9" || value === "9:16" || value === "1:1" || value === "4:5";
}

export function hasFormatOverride(override?: BlockLayoutOverride): boolean {
  if (!override) return false;
  return OVERRIDE_KEYS.some((key) => override[key] !== undefined);
}

export function getFormatOverride(
  overrides: BlockFormatLayoutOverrides | undefined,
  formatId: string,
): BlockLayoutOverride | undefined {
  return overrides?.formats?.[formatId];
}

export function resolveLayoutSource(
  overrides: BlockFormatLayoutOverrides | undefined,
  formatId: string,
): LayoutSource {
  return hasFormatOverride(getFormatOverride(overrides, formatId)) ? "custom" : "auto";
}

export function resolveLayoutSourcesForBlock(
  overrides: BlockFormatLayoutOverrides | undefined,
  formatIds: string[],
): Record<string, LayoutSource> {
  return Object.fromEntries(
    formatIds.map((id) => [id, resolveLayoutSource(overrides, id)]),
  );
}

function resolveSafeArea(
  composition: BrandComposition,
  format: MotionFormat,
  override?: BlockLayoutOverride,
): ResolvedSafeArea {
  const preset = override?.safeAreaOverride ?? composition.safeArea;
  const insets = SAFE_AREA_INSETS[preset];
  const gridFactor = GRID_STRENGTH_FACTORS[composition.gridStrength];

  return {
    top: Math.round(format.height * insets.y * gridFactor),
    right: Math.round(format.width * insets.x * gridFactor),
    bottom: Math.round(format.height * insets.y * gridFactor),
    left: Math.round(format.width * insets.x * gridFactor),
  };
}

function resolveLayoutZoneGeometry(
  zone: LayoutZone,
  safeArea: ResolvedSafeArea,
  format: MotionFormat,
  positionOffset?: { x: number; y: number },
): ResolvedLayoutZone {
  const anchor = ZONE_ANCHORS[zone];
  const contentWidth = format.width - safeArea.left - safeArea.right;
  const contentHeight = format.height - safeArea.top - safeArea.bottom;

  const zoneWidth = contentWidth * anchor.width;
  const zoneHeight = contentHeight * anchor.height;
  const baseX = safeArea.left + contentWidth * anchor.x;
  const baseY = safeArea.top + contentHeight * anchor.y;

  const offsetX = (positionOffset?.x ?? 0) * contentWidth * 0.08;
  const offsetY = (positionOffset?.y ?? 0) * contentHeight * 0.08;

  return {
    zone,
    x: Math.round(baseX + offsetX),
    y: Math.round(baseY + offsetY),
    width: Math.round(zoneWidth),
    height: Math.round(zoneHeight),
    alignItems: anchor.alignItems,
    justifyContent: anchor.justifyContent,
    textAlign: anchor.textAlign,
  };
}

function clampResponsiveSize(
  role: TypographyRoleDefinition,
  format: MotionFormat,
  densityMult: number,
  textScale: number,
  explicitSize?: number,
): number {
  const aspectRatio = isAspectRatioId(format.aspectRatio) ? format.aspectRatio : "16:9";
  const layoutScale = getFormatLayoutScale(format);
  const formatScale = role.formatScales[aspectRatio]?.sizeScale ?? 1;

  const minSize = role.minFontSize * layoutScale;
  const maxSize = role.maxFontSize * layoutScale;

  const baseSize = explicitSize ?? role.fontSize;
  const responsiveSize = baseSize * layoutScale * formatScale * densityMult * textScale;

  return clampFontSize(responsiveSize, Math.round(minSize), Math.round(maxSize));
}

function resolveMaxTextWidth(
  format: MotionFormat,
  role: TypographyRoleDefinition,
  composition: BrandComposition,
  intentMaxWidthFactor: number,
  overrideMaxWidth?: number,
): number {
  const aspectRatio = isAspectRatioId(format.aspectRatio) ? format.aspectRatio : "16:9";
  const formatFactor = role.formatScales[aspectRatio]?.maxWidthFactor;
  const density = DENSITY_FACTORS[composition.density];
  const safeWidth = format.width - SAFE_AREA_INSETS[composition.safeArea].x * format.width * 2;

  const factor = overrideMaxWidth ?? formatFactor ?? intentMaxWidthFactor;
  const layoutScale = getFormatLayoutScale(format);
  const charBasedWidth = role.preferredMaxLineLength * role.fontSize * 0.55 * density.lineLengthMult;

  return Math.min(safeWidth * factor, charBasedWidth * layoutScale);
}

function resolveTypographyRole(
  typography: BrandTypography,
  roleName: TypographyRoleName,
  format: MotionFormat,
  composition: BrandComposition,
  textScale: number,
  intentMaxWidthFactor: number,
  override?: BlockLayoutOverride,
  explicitSize?: number,
): ResolvedTypographyRole {
  const role = typography.roles[roleName];
  const density = DENSITY_FACTORS[composition.density];
  const fontFamily = buildFontStack(
    resolveFontFamilyName(typography, role.fontFamily),
  );

  const fontSize = clampResponsiveSize(
    role,
    format,
    density.spacingMult,
    textScale * (override?.textScale ?? 1),
    explicitSize,
  );

  const lineHeight = Math.max(0.9, role.lineHeight * density.lineHeightMult);
  const maxWidth = resolveMaxTextWidth(
    format,
    role,
    composition,
    intentMaxWidthFactor,
    override?.maxTextWidth,
  );

  const textAlign = override?.alignment ?? role.textAlign;

  return {
    role: roleName,
    fontFamily,
    fontSize,
    lineHeight,
    fontWeight: role.fontWeight,
    letterSpacing: formatLetterSpacing(role.letterSpacing),
    textTransform: role.textTransform ?? "none",
    textAlign,
    maxWidth,
    preferredMaxLineLength: Math.round(role.preferredMaxLineLength * density.lineLengthMult),
    autoFit: override?.autoFitText ?? true,
  };
}

export function resolveBlockLayout(input: ResolveBlockLayoutInput): ResolvedBlockLayout {
  const {
    brandTypography,
    brandComposition,
    brandLogos,
    backgroundColor,
    blockId,
    layoutIntent: explicitIntent,
    layoutOverrides,
    format,
    contentSlotRoles,
    includeLogo,
  } = input;

  const intent = resolveBlockLayoutIntent(blockId, explicitIntent);
  const formatOverride = getFormatOverride(layoutOverrides, format.id);
  const useBrandLayout = formatOverride?.useBrandLayout ?? true;
  const source = resolveLayoutSource(layoutOverrides, format.id);
  const intentRule = INTENT_LAYOUT_RULES[intent];

  const composition = useBrandLayout
    ? brandComposition
    : { ...brandComposition, safeArea: "standard" as const };

  const safeArea = resolveSafeArea(composition, format, formatOverride);

  const zoneName = useBrandLayout
    ? formatOverride?.contentZone ??
      resolveIntentZone(intent, format.aspectRatio, brandComposition)
    : formatOverride?.contentZone ?? "center";

  const contentZone = resolveLayoutZoneGeometry(
    zoneName,
    safeArea,
    format,
    formatOverride?.position,
  );

  const alignment: TextAlign = formatOverride?.alignment
    ?? (useBrandLayout
      ? alignmentForComposition(brandComposition, intentRule.alignment)
      : intentRule.alignment);

  const density = DENSITY_FACTORS[brandComposition.density];
  const padding =
    formatOverride?.padding ??
    (format.height * 0.07 * density.spacingMult) / Math.min(format.width, format.height);

  const gap =
    formatOverride?.gap ?? format.height * intentRule.gapFactor * density.spacingMult;

  const textScale = formatOverride?.textScale ?? intentRule.textScale;
  const maxTextWidthFactor =
    formatOverride?.maxTextWidth ?? intentRule.maxTextWidthFactor;

  const typography: Partial<Record<TypographyRoleName, ResolvedTypographyRole>> = {};
  for (const roleName of Object.keys(brandTypography.roles) as TypographyRoleName[]) {
    const explicitSize =
      roleName === "heading" || roleName === "subheading"
        ? formatOverride?.titleSize
        : roleName === "body"
          ? formatOverride?.bodySize
          : undefined;

    typography[roleName] = resolveTypographyRole(
      brandTypography,
      roleName,
      format,
      brandComposition,
      textScale,
      maxTextWidthFactor,
      formatOverride,
      explicitSize,
    );
  }

  if (formatOverride?.textRole && typography[formatOverride.textRole]) {
    const primary = typography[formatOverride.textRole]!;
    typography.heading = { ...primary, role: "heading" };
  }

  const slotRoles = contentSlotRoles ?? resolveBlockContentSlotRoles(blockId);

  const slots: Record<string, ResolvedTypographyRole> = {};
  for (const [slot, roleName] of Object.entries(slotRoles)) {
    const resolved = typography[roleName];
    if (resolved) {
      slots[slot] = {
        ...resolved,
        textAlign: formatOverride?.alignment ?? resolved.textAlign,
      };
    }
  }

  const roleForWidth = brandTypography.roles.heading;
  const maxTextWidth = resolveMaxTextWidth(
    format,
    roleForWidth,
    brandComposition,
    maxTextWidthFactor,
    formatOverride?.maxTextWidth,
  );

  const aspectRatio = isAspectRatioId(format.aspectRatio) ? format.aspectRatio : "16:9";

  const shouldIncludeLogo =
    includeLogo ?? blockShouldIncludeLogo(blockId, intent);

  const logo = shouldIncludeLogo
    ? resolveLogoPlacement({
        logos: brandLogos,
        format,
        composition: brandComposition,
        intent,
        contentZone: { ...contentZone, textAlign: alignment },
        safeArea,
        backgroundColor,
        availableWidth: contentZone.width,
        availableHeight: contentZone.height,
      })
    : undefined;

  return {
    formatId: format.id,
    aspectRatio: format.aspectRatio,
    source,
    intent,
    useBrandLayout,
    safeArea,
    contentZone: { ...contentZone, textAlign: alignment },
    padding,
    gap,
    stackDirection: formatOverride?.stackDirection ?? intentRule.stackDirection,
    alignment,
    alignmentMode: brandComposition.defaultAlignment,
    maxTextWidth,
    textScale,
    breakGrid:
      formatOverride?.breakGrid ??
      (useBrandLayout ? brandComposition.allowGridBreaks : false),
    autoFitText: formatOverride?.autoFitText ?? true,
    media: {
      scale: formatOverride?.mediaScale ?? intentRule.mediaScale,
      position: formatOverride?.mediaPosition ?? intentRule.mediaPosition,
      zone:
        intentRule.mediaPosition === "background"
          ? undefined
          : resolveLayoutZoneGeometry(
              aspectRatio === "9:16" ? "lower-third" : "split-right",
              safeArea,
              format,
            ),
    },
    typography,
    slots,
    logo,
  };
}

/** Convenience wrapper resolving from a full brand preset + block instance. */
export function resolveBlockLayoutFromInstance(options: {
  brand: import("@/types/brand").BrandPreset;
  block: import("@/types/motion-block").MotionBlockInstance;
  format: MotionFormat;
  backgroundColor?: string;
  includeLogo?: boolean;
}): ResolvedBlockLayout {
  const { brand, block, format, backgroundColor, includeLogo } = options;
  return resolveBlockLayout({
    brandTypography: brand.typography,
    brandComposition: brand.composition,
    brandLogos: brand.logos,
    backgroundColor: backgroundColor ?? brand.colors.background,
    blockId: block.blockId,
    layoutIntent: block.layoutIntent,
    layoutOverrides: mergeWave1LayoutOverrides(block.blockId, block.layoutOverrides),
    format,
    contentSlotRoles: resolveBlockContentSlotRoles(block.blockId),
    includeLogo,
  });
}

export function resetFormatOverride(
  overrides: BlockFormatLayoutOverrides | undefined,
  formatId: string,
): BlockFormatLayoutOverrides {
  const formats = { ...overrides?.formats };
  delete formats[formatId];
  return { formats };
}

export function resetAllLayoutOverrides(): BlockFormatLayoutOverrides {
  return { formats: {} };
}
