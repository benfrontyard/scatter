import {
  INTENT_LOGO_PLACEMENT,
  INTENT_LOGO_USAGE,
  PLACEMENT_TO_PREFERRED_USE,
  VARIANT_FALLBACK_ORDER,
  isTightFormat,
  isVerticalFormat,
  preferredVariantRoleForContext,
} from "@/config/logo/defaults";
import { LOGO_TYPE_TRAITS } from "@/config/logo/type-traits";
import type { BlockLayoutIntent } from "@/types/block-layout";
import type { BrandComposition } from "@/types/brand-composition";
import type {
  BrandLogoSystem,
  ContrastVariant,
  LogoAsset,
  LogoAssetType,
  LogoBackgroundCompatibility,
  LogoPlacementRole,
  LogoPreferredUse,
  LogoUsageContext,
  LogoVariantRole,
  ResolveLogoInput,
  ResolvedLogoPlacement,
} from "@/types/brand-logo";
import type { MotionFormat } from "@/types/format";
import { getContrastRatio } from "@/lib/typography";

function parseLuminance(hex: string): number | null {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return null;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const channel = (value: number) => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function resolveBackgroundContext(
  backgroundColor: string,
): LogoBackgroundCompatibility {
  const luminance = parseLuminance(backgroundColor);
  if (luminance === null) return "color";
  if (luminance < 0.35) return "dark";
  if (luminance > 0.65) return "light";
  return "color";
}

export function resolveContrastVariant(
  backgroundColor: string,
  assets: LogoAsset[],
): ContrastVariant {
  const luminance = parseLuminance(backgroundColor);
  const hasLight = assets.some((a) => a.variantRole === "light");
  const hasDark = assets.some((a) => a.variantRole === "dark");
  const hasFull = assets.some((a) => a.variantRole === "fullColor");

  if (luminance === null) {
    return hasFull ? "full-color" : hasDark ? "dark" : "light";
  }

  const isDarkBg = luminance < 0.35;
  if (isDarkBg && hasLight) return "light";
  if (!isDarkBg && hasDark) return "dark";
  if (hasFull) return "full-color";
  return isDarkBg ? "light" : "dark";
}

function contrastRoleForVariant(contrast: ContrastVariant): LogoVariantRole | undefined {
  if (contrast === "light") return "light";
  if (contrast === "dark") return "dark";
  return "fullColor";
}

function scoreLogoAsset(
  asset: LogoAsset,
  context: {
    preferredRole: LogoVariantRole;
    contrastRole?: LogoVariantRole;
    preferredUse?: LogoPreferredUse;
    backgroundContext: LogoBackgroundCompatibility;
    primaryType: LogoAssetType;
    aspectRatio: string;
  },
): number {
  let score = 0;

  if (asset.variantRole === context.preferredRole) score += 40;
  if (context.contrastRole && asset.variantRole === context.contrastRole) score += 28;

  if (
    context.preferredUse &&
    (asset.preferredUse.includes(context.preferredUse) ||
      asset.preferredUse.includes("default"))
  ) {
    score += 22;
  }

  if (asset.backgroundCompatibility.includes(context.backgroundContext)) score += 12;
  if (asset.type === context.primaryType) score += 8;

  if (isTightFormat(context.aspectRatio) && asset.variantRole === "symbolOnly") score += 14;
  if (isVerticalFormat(context.aspectRatio) && asset.variantRole === "stacked") score += 10;
  if (isTightFormat(context.aspectRatio) && asset.canUseSmall && asset.variantRole === "smallSize") {
    score += 12;
  }

  return score;
}

function pickLogoAsset(
  logos: BrandLogoSystem,
  preferredRole: LogoVariantRole,
  contrastVariant: ContrastVariant,
  preferredUse: LogoPreferredUse | undefined,
  backgroundContext: LogoBackgroundCompatibility,
  formatAspectRatio: string,
): LogoAsset | undefined {
  const { assets } = logos;
  if (assets.length === 0) return undefined;

  const contrastRole = contrastRoleForVariant(contrastVariant);

  const scored = assets
    .map((asset) => ({
      asset,
      score: scoreLogoAsset(asset, {
        preferredRole,
        contrastRole,
        preferredUse,
        backgroundContext,
        primaryType: logos.primaryType,
        aspectRatio: formatAspectRatio,
      }),
    }))
    .sort((a, b) => b.score - a.score);

  if (scored[0]?.score > 0) return scored[0].asset;

  const fallbackRoles = [preferredRole, contrastRole, ...VARIANT_FALLBACK_ORDER].filter(
    Boolean,
  ) as LogoVariantRole[];

  const seen = new Set<LogoVariantRole>();
  for (const role of fallbackRoles) {
    if (seen.has(role)) continue;
    seen.add(role);
    const match = assets.find((a) => a.variantRole === role && a.type === logos.primaryType);
    if (match) return match;
    const roleMatch = assets.find((a) => a.variantRole === role);
    if (roleMatch) return roleMatch;
  }

  return assets.find((a) => a.type === logos.primaryType) ?? assets[0];
}

function resolveLogoZone(
  logoType: LogoAssetType,
  asset: LogoAsset | undefined,
  usage: LogoUsageContext,
  placement: LogoPlacementRole,
  aspectRatio: string,
  composition: BrandComposition,
): import("@/types/brand-composition").LayoutZone {
  const traits = LOGO_TYPE_TRAITS[logoType];

  if (logoType === "mascot" && placement === "corner-mark" && !asset?.canUseSmall) {
    return traits.preferredZones[0] ?? "center";
  }

  if (usage === "decorative") {
    return placement === "watermark" ? "bottom-left" : "center-safe";
  }

  if (placement === "corner-mark") {
    return composition.defaultAlignment === "left" ? "bottom-left" : "bottom-center";
  }

  if (placement === "end-card") {
    return isVerticalFormat(aspectRatio) ? "lower-third" : "bottom-center";
  }

  if (placement === "hero" || placement === "lockup") {
    if (isVerticalFormat(aspectRatio) && (logoType === "stacked" || asset?.variantRole === "stacked")) {
      return "upper-third";
    }
    if (isTightFormat(aspectRatio) && traits.needsHorizontalSpace) {
      return traits.verticalZones[0] ?? "top-center";
    }
    return traits.preferredZones[0] ?? "center";
  }

  return "center";
}

function resolveOpticalLogoSize(
  asset: LogoAsset,
  logoType: LogoAssetType,
  usage: LogoUsageContext,
  placement: LogoPlacementRole,
  format: MotionFormat,
  availableWidth: number,
  availableHeight: number,
): { width: number; height: number; scale: number } {
  const traits = LOGO_TYPE_TRAITS[logoType];
  const shortSide = Math.min(format.width, format.height);

  let baseHeightFraction: number;
  switch (placement) {
    case "hero":
    case "lockup":
      baseHeightFraction = usage === "informational" ? 0.12 : 0.08;
      break;
    case "end-card":
      baseHeightFraction = 0.08;
      break;
    case "corner-mark":
      baseHeightFraction = logoType === "mascot" && !asset.canUseSmall ? 0.065 : 0.045;
      break;
    case "watermark":
      baseHeightFraction = 0.035;
      break;
    case "background":
      baseHeightFraction = 0.35;
      break;
    default:
      baseHeightFraction = 0.07;
  }

  baseHeightFraction *= asset.opticalWeight;

  if (isTightFormat(format.aspectRatio) && traits.needsHorizontalSpace) {
    baseHeightFraction *= 0.82;
  }

  const minHeightPx = format.height * asset.minHeight;
  const maxWidthPx = format.width * asset.maxWidth;
  const minWidthPx = format.width * asset.minWidth;

  let height = Math.max(shortSide * baseHeightFraction, minHeightPx);
  let width = height * asset.aspectRatio;

  const maxAvailWidth = availableWidth * (usage === "informational" ? 0.92 : 0.5);
  const widthCap = Math.min(maxWidthPx, maxAvailWidth);
  if (width > widthCap) {
    width = widthCap;
    height = width / asset.aspectRatio;
  }

  if (width < minWidthPx && logoType !== "symbol") {
    width = Math.min(minWidthPx, widthCap);
    height = width / asset.aspectRatio;
  }

  const maxHeight = availableHeight * 0.85;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * asset.aspectRatio;
  }

  const scale = height / (shortSide * 0.12);
  const clampedScale = Math.min(traits.maxScale, Math.max(traits.minScale, scale));

  const finalHeight = Math.round(height * (clampedScale / scale));
  const finalWidth = Math.round(finalHeight * asset.aspectRatio);

  return {
    width: finalWidth,
    height: finalHeight,
    scale: clampedScale,
  };
}

function positionLogoInZone(
  zone: import("@/types/brand-composition").ResolvedLayoutZone,
  width: number,
  height: number,
  clearSpace: number,
): { x: number; y: number } {
  const innerX = zone.x + clearSpace;
  const innerY = zone.y + clearSpace;
  const innerWidth = zone.width - clearSpace * 2;
  const innerHeight = zone.height - clearSpace * 2;

  let x = innerX;
  let y = innerY;

  if (zone.alignItems === "center") {
    x = innerX + (innerWidth - width) / 2;
  } else if (zone.alignItems === "flex-end") {
    x = innerX + innerWidth - width;
  }

  if (zone.justifyContent === "center") {
    y = innerY + (innerHeight - height) / 2;
  } else if (zone.justifyContent === "flex-end") {
    y = innerY + innerHeight - height;
  }

  return { x: Math.round(x), y: Math.round(y) };
}

export function resolveLogoPlacement(input: ResolveLogoInput): ResolvedLogoPlacement {
  const {
    logos,
    format,
    composition,
    intent,
    contentZone,
    safeArea,
    backgroundColor,
    usage: explicitUsage,
    availableWidth,
    availableHeight,
  } = input;

  const logoType = logos.primaryType;
  const traits = LOGO_TYPE_TRAITS[logoType];
  const usage = explicitUsage ?? INTENT_LOGO_USAGE[intent] ?? "informational";
  const placement = INTENT_LOGO_PLACEMENT[intent] ?? (usage === "decorative" ? "watermark" : "lockup");
  const preferredUse = PLACEMENT_TO_PREFERRED_USE[placement];

  const preferredRole = preferredVariantRoleForContext(
    logoType,
    format.aspectRatio,
    logos.preferSymbolInVertical,
  );

  const backgroundContext = resolveBackgroundContext(backgroundColor);
  const contrastVariant = resolveContrastVariant(backgroundColor, logos.assets);
  const asset = pickLogoAsset(
    logos,
    preferredRole,
    contrastVariant,
    preferredUse,
    backgroundContext,
    format.aspectRatio,
  );

  const resolvedType = asset?.type ?? logoType;
  const resolvedTraits = LOGO_TYPE_TRAITS[resolvedType];

  const metadataAsset: LogoAsset =
    asset ??
    ({
      id: "fallback",
      name: logos.textFallback ?? "Logo",
      type: logoType,
      variantRole: preferredRole,
      aspectRatio: traits.typicalAspectRatio,
      preferredUse: ["default"],
      minWidth: traits.minWidth,
      maxWidth: traits.maxWidth,
      minHeight: traits.minHeight,
      clearSpace: traits.clearSpace,
      opticalWeight: traits.opticalWeight,
      canUseSmall: traits.canUseSmall,
      canCrop: traits.canCrop,
      canAnimateParts: traits.canAnimateParts,
      backgroundCompatibility: traits.defaultBackgroundCompatibility,
      textFallback: logos.textFallback,
    } satisfies LogoAsset);

  const zoneName = resolveLogoZone(
    resolvedType,
    asset,
    usage,
    placement,
    format.aspectRatio,
    composition,
  );

  const availW = availableWidth ?? format.width - safeArea.left - safeArea.right;
  const availH = availableHeight ?? format.height - safeArea.top - safeArea.bottom;

  const { width, height, scale } = resolveOpticalLogoSize(
    metadataAsset,
    resolvedType,
    usage,
    placement,
    format,
    availW,
    availH,
  );

  const clearSpace = Math.round(height * metadataAsset.clearSpace);
  const { x, y } = positionLogoInZone(contentZone, width, height, clearSpace);

  const useTextFallback = !metadataAsset.assetId;

  return {
    assetId: metadataAsset.assetId,
    assetName: metadataAsset.name,
    variantRole: metadataAsset.variantRole,
    type: resolvedType,
    textFallback: metadataAsset.textFallback ?? logos.textFallback,
    useTextFallback,
    contrastVariant,
    usage,
    placement,
    zone: zoneName,
    x,
    y,
    width,
    height,
    scale,
    minScale: resolvedTraits.minScale,
    maxScale: resolvedTraits.maxScale,
    clearSpace,
    opticalWeight: metadataAsset.opticalWeight,
    motionStyle: resolvedTraits.motionStyle,
    allowCrop: metadataAsset.canCrop && placement === "background",
    preserveAspectRatio: true,
  };
}

export function resolveLogoUsageForIntent(intent: BlockLayoutIntent): LogoUsageContext {
  return INTENT_LOGO_USAGE[intent] ?? "informational";
}

export function scoreLogoAssetFit(
  asset: LogoAsset,
  preferredRole: LogoVariantRole,
  contrastVariant: ContrastVariant,
  preferredUse: LogoPreferredUse | undefined,
  backgroundContext: LogoBackgroundCompatibility,
  primaryType: LogoAssetType,
  aspectRatio: string,
): number {
  return scoreLogoAsset(asset, {
    preferredRole,
    contrastRole: contrastRoleForVariant(contrastVariant),
    preferredUse,
    backgroundContext,
    primaryType,
    aspectRatio,
  });
}

export function hasSufficientLogoContrast(
  foregroundHex: string,
  backgroundHex: string,
): boolean {
  const ratio = getContrastRatio(foregroundHex, backgroundHex);
  return ratio === null || ratio >= 3;
}
