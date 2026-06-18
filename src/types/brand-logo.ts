import type { LayoutZone } from "./brand-composition";
import type { BlockLayoutIntent } from "./block-layout";

/** Structural logo type — how the mark is composed. */
export type LogoAssetType =
  | "wordmark"
  | "combination"
  | "symbol"
  | "monogram"
  | "mascot"
  | "badge"
  | "stacked";

/** Responsive variant role — which version of the mark to use. */
export type LogoVariantRole =
  | "primary"
  | "secondary"
  | "symbolOnly"
  | "wordmarkOnly"
  | "stacked"
  | "light"
  | "dark"
  | "fullColor"
  | "smallSize";

export type LogoPreferredUse =
  | "default"
  | "intro"
  | "outro"
  | "cornerBug"
  | "watermark"
  | "hero"
  | "lowerThird"
  | "backgroundGraphic"
  | "socialFormat";

export type LogoBackgroundCompatibility = "light" | "dark" | "color" | "image";

export type LogoUsageContext = "decorative" | "informational";

export type LogoMotionStyle =
  | "static"
  | "fade"
  | "scale"
  | "bounce"
  | "character"
  | "stamp"
  | "reveal";

export type LogoPlacementRole =
  | "hero"
  | "lockup"
  | "corner-mark"
  | "watermark"
  | "background"
  | "end-card";

export type ContrastVariant = "light" | "dark" | "full-color";

/**
 * Full metadata for a single logo asset in the brand kit.
 * Dimensions (min/max width/height) are fractions of format size (0–1).
 * clearSpace is a fraction of rendered logo height.
 */
export type LogoAsset = {
  id: string;
  name: string;
  type: LogoAssetType;
  variantRole: LogoVariantRole;
  /** Width ÷ height of the source image */
  aspectRatio: number;
  preferredUse: LogoPreferredUse[];
  /** Min width as fraction of format width */
  minWidth: number;
  /** Max width as fraction of format width */
  maxWidth: number;
  /** Min height as fraction of format height */
  minHeight: number;
  /** Clear space as fraction of rendered logo height */
  clearSpace: number;
  /** Optical size multiplier — compensates for visual weight vs bounding box */
  opticalWeight: number;
  canUseSmall: boolean;
  canCrop: boolean;
  canAnimateParts: boolean;
  backgroundCompatibility: LogoBackgroundCompatibility[];
  /** Project asset id when image-based */
  assetId?: string;
  /** Text fallback when no image */
  textFallback?: string;
  classificationLocked?: boolean;
};

export type BrandLogoSystem = {
  /** Primary structural type for the brand mark */
  primaryType: LogoAssetType;
  assets: LogoAsset[];
  preferSymbolInVertical: boolean;
  textFallback?: string;
};

export type ResolvedLogoPlacement = {
  assetId?: string;
  assetName?: string;
  variantRole: LogoVariantRole;
  type: LogoAssetType;
  textFallback?: string;
  useTextFallback: boolean;
  contrastVariant: ContrastVariant;
  usage: LogoUsageContext;
  placement: LogoPlacementRole;
  zone: LayoutZone;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  minScale: number;
  maxScale: number;
  clearSpace: number;
  opticalWeight: number;
  motionStyle: LogoMotionStyle;
  allowCrop: boolean;
  preserveAspectRatio: boolean;
};

export type ResolveLogoInput = {
  logos: BrandLogoSystem;
  format: import("./format").MotionFormat;
  composition: import("./brand-composition").BrandComposition;
  intent: BlockLayoutIntent;
  contentZone: import("./brand-composition").ResolvedLayoutZone;
  safeArea: import("./brand-composition").ResolvedSafeArea;
  backgroundColor: string;
  usage?: LogoUsageContext;
  availableWidth?: number;
  availableHeight?: number;
};

/** @deprecated Use LogoAssetType */
export type LogoType = LogoAssetType;

/** @deprecated Use LogoVariantRole */
export type LogoVariantKind = LogoVariantRole;

/** @deprecated Use LogoAsset */
export type BrandLogoVariant = LogoAsset;
