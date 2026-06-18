import {
  createDefaultLogoAssetMetadata,
  DEFAULT_BRAND_LOGO_SYSTEM,
  migrateVariantKindToRole,
  normalizeLogoAssetType,
} from "@/config/logo/defaults";
import { LOGO_TYPE_TRAITS } from "@/config/logo/type-traits";
import { classifyLogo } from "@/lib/logo/classify-logo";
import type {
  BrandLogoSystem,
  LogoAsset,
  LogoAssetType,
  LogoPreferredUse,
  LogoVariantRole,
} from "@/types/brand-logo";

type LegacyLogoVariant = {
  id: string;
  kind?: string;
  variantRole?: LogoVariantRole;
  logoType?: string;
  type?: LogoAssetType;
  assetId?: string;
  textFallback?: string;
  intrinsicAspectRatio?: number;
  aspectRatio?: number;
  classificationLocked?: boolean;
  name?: string;
};

function migrateLegacyVariant(variant: LegacyLogoVariant, brandName?: string): LogoAsset {
  const type = normalizeLogoAssetType(variant.type ?? variant.logoType ?? "wordmark");
  const traits = LOGO_TYPE_TRAITS[type];
  const aspectRatio =
    variant.aspectRatio ?? variant.intrinsicAspectRatio ?? traits.typicalAspectRatio;
  const variantRole = variant.variantRole ?? migrateVariantKindToRole(variant.kind ?? "primary");

  return {
    id: variant.id,
    name: variant.name ?? variant.textFallback ?? brandName ?? "Logo",
    type,
    variantRole,
    aspectRatio,
    preferredUse: traits.defaultPreferredUse,
    minWidth: traits.minWidth,
    maxWidth: traits.maxWidth,
    minHeight: traits.minHeight,
    clearSpace: traits.clearSpace,
    opticalWeight: traits.opticalWeight,
    canUseSmall: traits.canUseSmall,
    canCrop: traits.canCrop,
    canAnimateParts: traits.canAnimateParts,
    backgroundCompatibility: [...traits.defaultBackgroundCompatibility],
    assetId: variant.assetId,
    textFallback: variant.textFallback,
    classificationLocked: variant.classificationLocked ?? false,
  };
}

function normalizeLogoAsset(asset: LogoAsset, brandName?: string): LogoAsset {
  const type = normalizeLogoAssetType(asset.type);
  const traits = LOGO_TYPE_TRAITS[type];

  return {
    id: asset.id,
    name: asset.name || brandName || "Logo",
    type,
    variantRole: asset.variantRole ?? "primary",
    aspectRatio: asset.aspectRatio ?? traits.typicalAspectRatio,
    preferredUse: asset.preferredUse?.length ? asset.preferredUse : traits.defaultPreferredUse,
    minWidth: asset.minWidth ?? traits.minWidth,
    maxWidth: asset.maxWidth ?? traits.maxWidth,
    minHeight: asset.minHeight ?? traits.minHeight,
    clearSpace: asset.clearSpace ?? traits.clearSpace,
    opticalWeight: asset.opticalWeight ?? traits.opticalWeight,
    canUseSmall: asset.canUseSmall ?? traits.canUseSmall,
    canCrop: asset.canCrop ?? traits.canCrop,
    canAnimateParts: asset.canAnimateParts ?? traits.canAnimateParts,
    backgroundCompatibility:
      asset.backgroundCompatibility?.length
        ? asset.backgroundCompatibility
        : [...traits.defaultBackgroundCompatibility],
    assetId: asset.assetId,
    textFallback: asset.textFallback,
    classificationLocked: asset.classificationLocked ?? false,
  };
}

export function normalizeBrandLogoSystem(logos: unknown, brandName?: string): BrandLogoSystem {
  if (!logos || typeof logos !== "object") {
    return {
      ...DEFAULT_BRAND_LOGO_SYSTEM,
      textFallback: brandName,
    };
  }

  const value = logos as Partial<BrandLogoSystem> & { variants?: LegacyLogoVariant[] };

  let assets: LogoAsset[] = [];
  if (Array.isArray(value.assets) && value.assets.length > 0) {
    assets = value.assets.map((a) => normalizeLogoAsset(a, brandName));
  } else if (Array.isArray(value.variants) && value.variants.length > 0) {
    assets = value.variants.map((v) => migrateLegacyVariant(v, brandName));
  }

  return {
    primaryType: normalizeLogoAssetType(value.primaryType ?? DEFAULT_BRAND_LOGO_SYSTEM.primaryType),
    assets,
    preferSymbolInVertical:
      value.preferSymbolInVertical ?? DEFAULT_BRAND_LOGO_SYSTEM.preferSymbolInVertical,
    textFallback: value.textFallback ?? brandName,
  };
}

export type RegisterLogoAssetInput = {
  assetId: string;
  name?: string;
  fileName?: string;
  width?: number;
  height?: number;
  userType?: LogoAssetType;
  variantRole?: LogoVariantRole;
  preferredUse?: LogoPreferredUse[];
  classificationLocked?: boolean;
  textFallback?: string;
};

export function registerLogoAsset(
  system: BrandLogoSystem,
  input: RegisterLogoAssetInput,
): BrandLogoSystem {
  const classification = classifyLogo({
    width: input.width,
    height: input.height,
    fileName: input.fileName ?? input.name,
    userType: input.userType,
    classificationLocked: input.classificationLocked,
  });

  const asset = createDefaultLogoAssetMetadata(classification.type, {
    name: input.name ?? input.fileName ?? "Logo",
    aspectRatio: classification.aspectRatio,
    variantRole: input.variantRole ?? classification.suggestedVariantRole,
    assetId: input.assetId,
    textFallback: input.textFallback,
    preferredUse: input.preferredUse,
  });

  if (input.classificationLocked) {
    asset.classificationLocked = true;
  }

  const existingIndex = system.assets.findIndex(
    (a) => a.variantRole === asset.variantRole && a.type === asset.type,
  );
  const duplicateAssetIndex = system.assets.findIndex((a) => a.assetId === input.assetId);

  let assets = [...system.assets];
  if (duplicateAssetIndex >= 0) {
    assets[duplicateAssetIndex] = { ...asset, id: system.assets[duplicateAssetIndex].id };
  } else if (existingIndex >= 0) {
    assets[existingIndex] = { ...asset, id: system.assets[existingIndex].id };
  } else {
    assets = [...assets, asset];
  }

  const primaryType =
    system.assets.length === 0 ? classification.type : system.primaryType;

  return {
    ...system,
    primaryType,
    assets,
  };
}

export function updateLogoAsset(
  system: BrandLogoSystem,
  assetId: string,
  patch: Partial<LogoAsset>,
): BrandLogoSystem {
  return {
    ...system,
    assets: system.assets.map((asset) =>
      asset.id === assetId ? normalizeLogoAsset({ ...asset, ...patch }, system.textFallback) : asset,
    ),
    primaryType: patch.type
      ? normalizeLogoAssetType(patch.type)
      : system.primaryType,
  };
}

export function setPrimaryLogoType(
  system: BrandLogoSystem,
  logoType: LogoAssetType,
): BrandLogoSystem {
  return { ...system, primaryType: normalizeLogoAssetType(logoType) };
}

export function removeLogoAsset(
  system: BrandLogoSystem,
  assetId: string,
): BrandLogoSystem {
  return {
    ...system,
    assets: system.assets.filter((a) => a.id !== assetId),
  };
}

/** @deprecated Use removeLogoAsset */
export function removeLogoVariant(system: BrandLogoSystem, assetId: string): BrandLogoSystem {
  return removeLogoAsset(system, assetId);
}

export function loadImageDimensions(
  dataUrl: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });
}
