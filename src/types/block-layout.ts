import type { BrandTypography } from "./brand";
import type { BrandLogoSystem } from "./brand-logo";
import type {
  AlignmentMode,
  BrandComposition,
  LayoutZone,
  MediaPosition,
  ResolvedLayoutZone,
  ResolvedSafeArea,
  SafeAreaPreset,
  StackDirection,
} from "./brand-composition";
import type { MotionFormat } from "./format";
import type { TextAlign } from "./typography";
import type { ResolvedTypographyRole, TypographyRoleName } from "./typography-role";
import type { ResolvedLogoPlacement } from "./brand-logo";

export type BlockLayoutIntent =
  | "hero"
  | "statement"
  | "quote"
  | "stat"
  | "product-feature"
  | "comparison"
  | "testimonial"
  | "logo-lockup"
  | "list"
  | "before-after"
  | "outro";

export type LayoutSource = "auto" | "custom";

/** Per-format advanced overrides scoped to a single block + aspect ratio. */
export type BlockLayoutOverride = {
  useBrandLayout?: boolean;
  textRole?: TypographyRoleName;
  textScale?: number;
  titleSize?: number;
  bodySize?: number;
  /** Max text width as a fraction of format width (0–1). */
  maxTextWidth?: number;
  alignment?: TextAlign;
  contentZone?: LayoutZone;
  /** Normalized position offset within the content zone (-1 to 1). */
  position?: { x: number; y: number };
  /** Padding as a fraction of the shorter format dimension. */
  padding?: number;
  /** Gap between stacked items as a fraction of format height. */
  gap?: number;
  mediaScale?: number;
  mediaPosition?: MediaPosition;
  safeAreaOverride?: SafeAreaPreset;
  breakGrid?: boolean;
  autoFitText?: boolean;
  stackDirection?: StackDirection;
};

/** Format-keyed overrides (format id, e.g. "format-9-16"). */
export type BlockFormatLayoutOverrides = {
  formats: Partial<Record<string, BlockLayoutOverride>>;
};

export type ResolvedMediaLayout = {
  scale: number;
  position: MediaPosition;
  zone?: ResolvedLayoutZone;
};

export type ResolvedBlockLayout = {
  formatId: string;
  aspectRatio: string;
  source: LayoutSource;
  intent: BlockLayoutIntent;
  useBrandLayout: boolean;
  safeArea: ResolvedSafeArea;
  contentZone: ResolvedLayoutZone;
  padding: number;
  gap: number;
  stackDirection: StackDirection;
  alignment: TextAlign;
  alignmentMode: AlignmentMode;
  maxTextWidth: number;
  textScale: number;
  breakGrid: boolean;
  autoFitText: boolean;
  media: ResolvedMediaLayout;
  /** Resolved typography per canonical role */
  typography: Partial<Record<TypographyRoleName, ResolvedTypographyRole>>;
  /** Resolved typography keyed by block content slot (headline, body, etc.) */
  slots: Record<string, ResolvedTypographyRole>;
  /** Resolved logo placement when the block uses a brand mark */
  logo?: ResolvedLogoPlacement;
};

export type ResolveBlockLayoutInput = {
  brandTypography: BrandTypography;
  brandComposition: BrandComposition;
  brandLogos: BrandLogoSystem;
  backgroundColor: string;
  blockId: string;
  layoutIntent?: BlockLayoutIntent;
  layoutOverrides?: BlockFormatLayoutOverrides;
  format: MotionFormat;
  contentSlotRoles?: Record<string, TypographyRoleName>;
  includeLogo?: boolean;
};
