import { defaultProjectFont } from "@/config/fonts";
import type { BrandTypography } from "@/types/brand";
import type { FontRole, TypeStyle, TypeStyleName } from "@/types/typography";

const REFERENCE_HEIGHT = 1080;

export function createDefaultTypeScale(
  headingRole: FontRole = "heading",
  bodyRole: FontRole = "body",
): Record<TypeStyleName, TypeStyle> {
  return {
    display: {
      fontFamily: headingRole,
      fontSize: 140,
      lineHeight: 1,
      fontWeight: 700,
      letterSpacing: 0.02,
      textTransform: "none",
    },
    headline: {
      fontFamily: headingRole,
      fontSize: 70,
      lineHeight: 1.08,
      fontWeight: 700,
      letterSpacing: 0,
      textTransform: "none",
    },
    title: {
      fontFamily: headingRole,
      fontSize: 45,
      lineHeight: 1.15,
      fontWeight: 600,
      letterSpacing: 0,
      textTransform: "none",
    },
    body: {
      fontFamily: bodyRole,
      fontSize: 30,
      lineHeight: 1.45,
      fontWeight: 400,
      letterSpacing: 0,
      textTransform: "none",
    },
    caption: {
      fontFamily: bodyRole,
      fontSize: 24,
      lineHeight: 1.4,
      fontWeight: 400,
      letterSpacing: 0.04,
      textTransform: "none",
    },
    label: {
      fontFamily: bodyRole,
      fontSize: 18,
      lineHeight: 1.2,
      fontWeight: 600,
      letterSpacing: 0.1,
      textTransform: "uppercase",
    },
  };
}

export function createBrandTypography(options: {
  heading: string;
  body: string;
  accent?: string;
  headingStyle?: BrandTypography["defaults"]["headingStyle"];
  bodyStyle?: BrandTypography["defaults"]["bodyStyle"];
  labelStyle?: BrandTypography["defaults"]["labelStyle"];
  scale?: Partial<Record<TypeStyleName, Partial<TypeStyle>>>;
}): BrandTypography {
  const scale = createDefaultTypeScale();
  if (options.scale) {
    for (const [key, patch] of Object.entries(options.scale) as Array<
      [TypeStyleName, Partial<TypeStyle>]
    >) {
      scale[key] = { ...scale[key], ...patch };
    }
  }

  return {
    fontFamilies: {
      heading: options.heading,
      body: options.body,
      accent: options.accent ?? options.heading,
    },
    scale,
    defaults: {
      headingStyle: options.headingStyle ?? "headline",
      bodyStyle: options.bodyStyle ?? "body",
      labelStyle: options.labelStyle ?? "label",
    },
  };
}

export const defaultBrandTypography = createBrandTypography({
  heading: defaultProjectFont,
  body: defaultProjectFont,
});

export const editorialBrandTypography = createBrandTypography({
  heading: "Fraunces",
  body: "Newsreader",
  accent: "Instrument Serif",
  headingStyle: "headline",
  bodyStyle: "body",
  scale: {
    headline: { letterSpacing: -0.01, lineHeight: 1.1 },
    body: { lineHeight: 1.5 },
    label: { letterSpacing: 0.08 },
  },
});

export const saasBrandTypography = createBrandTypography({
  heading: defaultProjectFont,
  body: defaultProjectFont,
  headingStyle: "title",
  bodyStyle: "caption",
  scale: {
    title: { fontWeight: 600 },
    label: { fontWeight: 700, letterSpacing: 0.06 },
  },
});

export const FORMAT_TYPE_PROFILES: Record<
  string,
  { sizeScale: number; maxWidthFactor: number }
> = {
  "16:9": { sizeScale: 1, maxWidthFactor: 0.85 },
  "9:16": { sizeScale: 1.08, maxWidthFactor: 0.88 },
  "1:1": { sizeScale: 0.9, maxWidthFactor: 0.82 },
  "4:5": { sizeScale: 0.96, maxWidthFactor: 0.84 },
};

export const REFERENCE_FORMAT_HEIGHT = REFERENCE_HEIGHT;

export const TYPE_STYLE_LABELS: Record<TypeStyleName, string> = {
  display: "Display",
  headline: "Headline",
  title: "Title",
  body: "Body",
  caption: "Caption",
  label: "Label",
};

export const TYPE_STYLE_SAMPLES: Record<TypeStyleName, string> = {
  display: "128",
  headline: "Ship faster",
  title: "Product update",
  body: "Motion graphics for modern teams.",
  caption: "Supporting detail text",
  label: "Get started",
};
