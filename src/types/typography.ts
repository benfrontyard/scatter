export type TypeStyleName = "display" | "headline" | "title" | "body" | "caption" | "label";

export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";

export type FontRole = "heading" | "body" | "accent";

export type TypeStyle = {
  /** Font role resolved via brand fontFamilies */
  fontFamily: FontRole;
  /** Base size in px at 1080px reference height */
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  /** Letter spacing in em */
  letterSpacing: number;
  textTransform?: TextTransform;
};

export type HeadingStyleName = "display" | "headline" | "title";
export type BodyStyleName = "body" | "caption" | "label";

export type TextAlign = "left" | "center" | "right";

export type TextSlotOverride = Partial<Omit<TypeStyle, "fontFamily">> & {
  fontFamily?: string;
  styleToken?: TypeStyleName;
  align?: TextAlign;
  maxWidth?: number;
};

export type BlockTypographyOverride = {
  enabled: boolean;
  display?: TextSlotOverride;
  headline?: TextSlotOverride;
  title?: TextSlotOverride;
  body?: TextSlotOverride;
  caption?: TextSlotOverride;
  label?: TextSlotOverride;
};

export type ResolvedTypeStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  letterSpacing: string;
  textTransform: TextTransform;
  maxWidth?: number;
  textAlign?: TextAlign;
};
