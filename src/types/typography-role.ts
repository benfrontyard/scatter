import type { FontRole, TextAlign, TextTransform } from "./typography";

/** Canonical brand typography roles used by the responsive layout system. */
export type TypographyRoleName =
  | "display"
  | "heading"
  | "subheading"
  | "body"
  | "caption"
  | "label"
  | "stat";

export type TypeDensity = "spacious" | "balanced" | "compact";

export type AspectRatioId = "16:9" | "9:16" | "1:1" | "4:5";

export type FormatTypographyScale = {
  /** Multiplier applied on top of reference-height scaling for this format. */
  sizeScale: number;
  /** Optional max text width as a fraction of format width (0–1). */
  maxWidthFactor?: number;
};

export type TypographyRoleDefinition = {
  /** Font role resolved via brand fontFamilies */
  fontFamily: FontRole;
  fontWeight: number;
  /** Base size in px at 1080px reference height */
  fontSize: number;
  /** Minimum clamp size in px at reference height */
  minFontSize: number;
  /** Maximum clamp size in px at reference height */
  maxFontSize: number;
  lineHeight: number;
  /** Letter spacing in em */
  letterSpacing: number;
  textTransform?: TextTransform;
  textAlign: TextAlign;
  /** Preferred max line length in characters */
  preferredMaxLineLength: number;
  /** Per-format responsive scale behavior */
  formatScales: Partial<Record<AspectRatioId, FormatTypographyScale>>;
};

export type BrandTypographyRoles = Record<TypographyRoleName, TypographyRoleDefinition>;

export type ResolvedTypographyRole = {
  role: TypographyRoleName;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  letterSpacing: string;
  textTransform: TextTransform;
  textAlign: TextAlign;
  maxWidth: number;
  preferredMaxLineLength: number;
  autoFit: boolean;
};
