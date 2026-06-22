import type { CSSProperties } from "react";
import type { BrandMotionKit } from "@/data/fakeBrands/types";

export type BrandSlug = "nimbo" | "ledgerly" | "draftly";

export function getBrandSlug(kit: BrandMotionKit): BrandSlug {
  const slug = kit.name.toLowerCase();
  if (slug === "ledgerly" || slug === "draftly") return slug;
  return "nimbo";
}

export function colorFromKit(kit: BrandMotionKit, key: string, fallback: string): string {
  const entry = kit.identity.colors[key as keyof typeof kit.identity.colors];
  return entry?.hex ?? fallback;
}

export type BrandThemeTokens = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  muted: string;
  displayFont: string;
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  easingDefault: string;
  easingExit: string;
  easingEmphasis: string;
  timingMicro: number;
  timingStandard: number;
  timingEmphasis: number;
  timingHero: number;
  cameraZoom: number;
  cameraRotation: number;
  grainIntensity: number;
  glowIntensity: number;
  vignetteIntensity: number;
  motionBlurIntensity: number;
  parallaxDepth: number;
  perspective: number;
  focusBlur: number;
  slug: BrandSlug;
  pop?: string;
  warm?: string;
  positive?: string;
};

export function getBrandTheme(kit: BrandMotionKit): BrandThemeTokens {
  const { colors, typography } = kit.identity;
  const { easing, timingScale, camera, effects } = kit.motionKit;

  return {
    primary: colors.primary?.hex ?? "#101418",
    secondary: colors.secondary?.hex ?? "#E8ECF0",
    accent: colors.accent?.hex ?? "#4B7DFF",
    background: colors.background?.hex ?? "#F7F8FA",
    surface: colors.surface?.hex ?? "#FFFFFF",
    muted: colors.muted?.hex ?? "#6B7280",
    displayFont: `"${typography.display.family}", ${typography.display.fallback}`,
    headingFont: `"${typography.heading.family}", ${typography.heading.fallback}`,
    bodyFont: `"${typography.body.family}", ${typography.body.fallback}`,
    monoFont: `"${typography.mono.family}", ${typography.mono.fallback}`,
    easingDefault: easing.default,
    easingExit: easing.exit,
    easingEmphasis: easing.emphasis,
    timingMicro: timingScale.micro,
    timingStandard: timingScale.standard,
    timingEmphasis: timingScale.emphasis,
    timingHero: timingScale.hero,
    cameraZoom: camera.zoomAmount,
    cameraRotation: camera.rotation,
    grainIntensity: effects.grain?.intensity ?? 0,
    glowIntensity: effects.glow?.intensity ?? 0,
    vignetteIntensity: effects.vignette?.intensity ?? 0,
    motionBlurIntensity: effects.motionBlur?.intensity ?? 0,
    parallaxDepth: camera.parallaxDepth,
    perspective: camera.perspective,
    focusBlur: camera.focusBlur,
    slug: getBrandSlug(kit),
    pop: colors.pop?.hex,
    warm: colors.warm?.hex,
    positive: colors.positive?.hex,
  };
}

export function brandThemeStyle(kit: BrandMotionKit): CSSProperties {
  const t = getBrandTheme(kit);
  const isDarkStage = t.slug === "ledgerly";
  return {
    "--brand-primary": t.primary,
    "--brand-secondary": t.secondary,
    "--brand-accent": t.accent,
    "--brand-background": t.background,
    "--brand-surface": t.surface,
    "--brand-muted": t.muted,
    "--brand-display-font": t.displayFont,
    "--brand-heading-font": t.headingFont,
    "--brand-body-font": t.bodyFont,
    "--brand-mono-font": t.monoFont,
    "--brand-easing": t.easingDefault,
    "--brand-easing-exit": t.easingExit,
    "--brand-easing-emphasis": t.easingEmphasis,
    "--brand-timing-micro": `${t.timingMicro}ms`,
    "--brand-timing-standard": `${t.timingStandard}ms`,
    "--brand-timing-emphasis": `${t.timingEmphasis}ms`,
    "--brand-timing-hero": `${t.timingHero}ms`,
    "--brand-camera-zoom": String(t.cameraZoom),
    "--brand-camera-rotation": `${t.cameraRotation}deg`,
    "--brand-grain": String(t.grainIntensity),
    "--brand-glow": String(t.glowIntensity),
    "--brand-vignette": String(t.vignetteIntensity),
    "--brand-parallax": String(t.parallaxDepth),
    "--brand-perspective": String(t.perspective),
    "--brand-focus-blur": String(t.focusBlur),
    "--brand-pop": t.pop ?? t.accent,
    "--brand-warm": t.warm ?? t.accent,
    "--brand-positive": t.positive ?? t.accent,
    "--preview-stage-bg": isDarkStage ? t.surface : t.background,
    "--preview-stage-fg": isDarkStage ? t.secondary : t.primary,
  } as CSSProperties;
}

export type MotionPreviewVariant =
  | "logoReveal"
  | "websiteHero"
  | "productUiReveal"
  | "featureCallout"
  | "statCard"
  | "quoteCard"
  | "socialAd"
  | "ctaEndCard";

export function previewVariantFromTemplate(templateId: string, templateName: string): MotionPreviewVariant {
  const key = templateId.replace(/^[^-]+-/, "").toLowerCase();
  const nameKey = templateName.replace(/\s+/g, "").toLowerCase();

  const map: Record<string, MotionPreviewVariant> = {
    logoreveal: "logoReveal",
    websitehero: "websiteHero",
    productuireveal: "productUiReveal",
    featurecallout: "featureCallout",
    statcard: "statCard",
    quotecard: "quoteCard",
    socialad: "socialAd",
    ctaendcard: "ctaEndCard",
  };

  return map[key] ?? map[nameKey] ?? "logoReveal";
}
