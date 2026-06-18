import type {
  AspectRatioId,
  BrandTypographyRoles,
  FormatTypographyScale,
  TypographyRoleDefinition,
  TypographyRoleName,
} from "@/types/typography-role";
import type { TypeStyle, TypeStyleName } from "@/types/typography";

export const REFERENCE_FORMAT_HEIGHT = 1080;

export const DEFAULT_FORMAT_SCALES: Record<AspectRatioId, FormatTypographyScale> = {
  "16:9": { sizeScale: 1, maxWidthFactor: 0.85 },
  "9:16": { sizeScale: 1.08, maxWidthFactor: 0.88 },
  "1:1": { sizeScale: 0.9, maxWidthFactor: 0.82 },
  "4:5": { sizeScale: 0.96, maxWidthFactor: 0.84 },
};

const ROLE_FROM_LEGACY: Record<TypeStyleName, TypographyRoleName> = {
  display: "display",
  headline: "heading",
  title: "subheading",
  body: "body",
  caption: "caption",
  label: "label",
};

const ROLE_DEFAULTS: Record<
  TypographyRoleName,
  Omit<TypographyRoleDefinition, "formatScales"> & { formatScales?: Partial<Record<AspectRatioId, FormatTypographyScale>> }
> = {
  display: {
    fontFamily: "heading",
    fontSize: 140,
    minFontSize: 48,
    maxFontSize: 220,
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: 0.02,
    textTransform: "none",
    textAlign: "center",
    preferredMaxLineLength: 12,
  },
  heading: {
    fontFamily: "heading",
    fontSize: 70,
    minFontSize: 28,
    maxFontSize: 120,
    lineHeight: 1.08,
    fontWeight: 700,
    letterSpacing: 0,
    textTransform: "none",
    textAlign: "center",
    preferredMaxLineLength: 24,
  },
  subheading: {
    fontFamily: "heading",
    fontSize: 45,
    minFontSize: 22,
    maxFontSize: 72,
    lineHeight: 1.15,
    fontWeight: 600,
    letterSpacing: 0,
    textTransform: "none",
    textAlign: "center",
    preferredMaxLineLength: 36,
  },
  body: {
    fontFamily: "body",
    fontSize: 30,
    minFontSize: 16,
    maxFontSize: 48,
    lineHeight: 1.45,
    fontWeight: 400,
    letterSpacing: 0,
    textTransform: "none",
    textAlign: "center",
    preferredMaxLineLength: 48,
  },
  caption: {
    fontFamily: "body",
    fontSize: 24,
    minFontSize: 14,
    maxFontSize: 36,
    lineHeight: 1.4,
    fontWeight: 400,
    letterSpacing: 0.04,
    textTransform: "none",
    textAlign: "center",
    preferredMaxLineLength: 56,
  },
  label: {
    fontFamily: "body",
    fontSize: 18,
    minFontSize: 12,
    maxFontSize: 28,
    lineHeight: 1.2,
    fontWeight: 600,
    letterSpacing: 0.1,
    textTransform: "uppercase",
    textAlign: "center",
    preferredMaxLineLength: 32,
  },
  stat: {
    fontFamily: "heading",
    fontSize: 160,
    minFontSize: 56,
    maxFontSize: 280,
    lineHeight: 0.95,
    fontWeight: 700,
    letterSpacing: -0.02,
    textTransform: "none",
    textAlign: "center",
    preferredMaxLineLength: 8,
  },
};

export function createDefaultTypographyRoles(): BrandTypographyRoles {
  const roles = {} as BrandTypographyRoles;
  for (const name of Object.keys(ROLE_DEFAULTS) as TypographyRoleName[]) {
    const base = ROLE_DEFAULTS[name];
    roles[name] = {
      ...base,
      formatScales: { ...DEFAULT_FORMAT_SCALES, ...base.formatScales },
    };
  }
  return roles;
}

export function legacyTypeStyleToRole(
  styleName: TypeStyleName,
  style: TypeStyle,
): TypographyRoleDefinition {
  const roleName = ROLE_FROM_LEGACY[styleName];
  const defaults = ROLE_DEFAULTS[roleName];
  return {
    fontFamily: style.fontFamily ?? defaults.fontFamily,
    fontSize: style.fontSize,
    minFontSize: defaults.minFontSize,
    maxFontSize: defaults.maxFontSize,
    lineHeight: style.lineHeight ?? defaults.lineHeight,
    fontWeight: style.fontWeight ?? defaults.fontWeight,
    letterSpacing: style.letterSpacing ?? defaults.letterSpacing,
    textTransform: style.textTransform ?? defaults.textTransform,
    textAlign: defaults.textAlign,
    preferredMaxLineLength: defaults.preferredMaxLineLength,
    formatScales: { ...DEFAULT_FORMAT_SCALES },
  };
}

export function rolesFromLegacyScale(
  scale: Record<TypeStyleName, TypeStyle>,
): BrandTypographyRoles {
  const roles = createDefaultTypographyRoles();
  for (const [legacyName, style] of Object.entries(scale) as Array<[TypeStyleName, TypeStyle]>) {
    const roleName = ROLE_FROM_LEGACY[legacyName];
    roles[roleName] = legacyTypeStyleToRole(legacyName, style);
  }
  return roles;
}

export const TYPOGRAPHY_ROLE_LABELS: Record<TypographyRoleName, string> = {
  display: "Display",
  heading: "Heading",
  subheading: "Subheading",
  body: "Body",
  caption: "Caption",
  label: "Label",
  stat: "Stat / Number",
};
