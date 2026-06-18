import type { BlockLayoutIntent } from "@/types/block-layout";
import type {
  BrandLogoSystem,
  LogoAsset,
  LogoAssetType,
  LogoPlacementRole,
  LogoPreferredUse,
  LogoUsageContext,
  LogoVariantRole,
} from "@/types/brand-logo";
import type { AspectRatioId } from "@/types/typography-role";
import { LOGO_TYPE_TRAITS } from "./type-traits";

export const DEFAULT_BRAND_LOGO_SYSTEM: BrandLogoSystem = {
  primaryType: "wordmark",
  assets: [],
  preferSymbolInVertical: true,
};

export const INTENT_LOGO_USAGE: Partial<Record<BlockLayoutIntent, LogoUsageContext>> = {
  hero: "informational",
  "logo-lockup": "informational",
  outro: "informational",
  "product-feature": "informational",
  testimonial: "decorative",
  stat: "decorative",
  statement: "decorative",
  quote: "decorative",
  comparison: "decorative",
  list: "decorative",
  "before-after": "decorative",
};

export const INTENT_LOGO_PLACEMENT: Partial<Record<BlockLayoutIntent, LogoPlacementRole>> = {
  hero: "hero",
  "logo-lockup": "lockup",
  outro: "end-card",
  "product-feature": "corner-mark",
  testimonial: "watermark",
  stat: "watermark",
  statement: "watermark",
};

export const PLACEMENT_TO_PREFERRED_USE: Partial<Record<LogoPlacementRole, LogoPreferredUse>> = {
  hero: "hero",
  lockup: "intro",
  "end-card": "outro",
  "corner-mark": "cornerBug",
  watermark: "watermark",
  background: "backgroundGraphic",
};

export const VARIANT_FALLBACK_ORDER: LogoVariantRole[] = [
  "fullColor",
  "primary",
  "wordmarkOnly",
  "stacked",
  "symbolOnly",
  "smallSize",
  "light",
  "dark",
  "secondary",
];

const VERTICAL_FORMATS: AspectRatioId[] = ["9:16", "4:5"];
const TIGHT_FORMATS: AspectRatioId[] = ["9:16", "1:1"];

export function isVerticalFormat(aspectRatio: string): boolean {
  return VERTICAL_FORMATS.includes(aspectRatio as AspectRatioId);
}

export function isTightFormat(aspectRatio: string): boolean {
  return TIGHT_FORMATS.includes(aspectRatio as AspectRatioId);
}

export function preferredVariantRoleForContext(
  logoType: LogoAssetType,
  aspectRatio: string,
  preferSymbolInVertical: boolean,
): LogoVariantRole {
  const traits = LOGO_TYPE_TRAITS[logoType];
  const formatPref = traits.formatVariantPreference[aspectRatio as AspectRatioId];

  if (formatPref) return formatPref;

  if (isTightFormat(aspectRatio) && preferSymbolInVertical) {
    return traits.tightFormatVariant;
  }

  if (isVerticalFormat(aspectRatio) && logoType === "stacked") {
    return "stacked";
  }

  return "primary";
}

export function createDefaultLogoAssetMetadata(
  type: LogoAssetType,
  options: {
    name: string;
    aspectRatio?: number;
    variantRole?: LogoVariantRole;
    assetId?: string;
    textFallback?: string;
    preferredUse?: LogoPreferredUse[];
  },
): LogoAsset {
  const traits = LOGO_TYPE_TRAITS[type];
  const aspectRatio = options.aspectRatio ?? traits.typicalAspectRatio;

  return {
    id: crypto.randomUUID(),
    name: options.name,
    type,
    variantRole: options.variantRole ?? "primary",
    aspectRatio,
    preferredUse: options.preferredUse ?? traits.defaultPreferredUse,
    minWidth: traits.minWidth,
    maxWidth: traits.maxWidth,
    minHeight: traits.minHeight,
    clearSpace: traits.clearSpace,
    opticalWeight: traits.opticalWeight,
    canUseSmall: traits.canUseSmall,
    canCrop: traits.canCrop,
    canAnimateParts: traits.canAnimateParts,
    backgroundCompatibility: [...traits.defaultBackgroundCompatibility],
    assetId: options.assetId,
    textFallback: options.textFallback,
    classificationLocked: false,
  };
}

export function createTextOnlyLogoAsset(
  textFallback: string,
  type: LogoAssetType = "wordmark",
): LogoAsset {
  return createDefaultLogoAssetMetadata(type, {
    name: textFallback,
    textFallback,
    variantRole: type === "stacked" ? "stacked" : "wordmarkOnly",
  });
}

/** Migrate legacy logo type string */
export function normalizeLogoAssetType(type: string): LogoAssetType {
  if (type === "combination-mark") return "combination";
  if (type in LOGO_TYPE_TRAITS) return type as LogoAssetType;
  return "wordmark";
}

/** Migrate legacy variant kind to variant role */
export function migrateVariantKindToRole(kind: string): LogoVariantRole {
  const map: Record<string, LogoVariantRole> = {
    "primary-horizontal": "primary",
    "primary": "primary",
    "stacked": "stacked",
    "symbol-only": "symbolOnly",
    "symbolOnly": "symbolOnly",
    "wordmark-only": "wordmarkOnly",
    "wordmarkOnly": "wordmarkOnly",
    "one-color-light": "light",
    "light": "light",
    "one-color-dark": "dark",
    "dark": "dark",
    "full-color": "fullColor",
    "fullColor": "fullColor",
    "small-simplified": "smallSize",
    "smallSize": "smallSize",
    "secondary": "secondary",
  };
  return map[kind] ?? "primary";
}
