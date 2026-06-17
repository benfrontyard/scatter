import {
  clampHeadlineText,
  resolveBlockSlotStyle,
  resolveFontStack,
  resolvedTypeStyleToCss,
} from "@/lib/typography";
import type { BrandPreset, MotionBlockInstance, MotionFormat } from "@/types";
import { useCurrentFrame } from "remotion";
import {
  getEnterProgress,
  getFadeOpacity,
  getIntroTiming,
  getMaskReveal,
  getOutroOpacity,
  getScale,
  getTranslate,
  resolveBlockMotionParams,
} from "../shared-motion";
import { GrainOverlay, getTargetEffectStyle, mergeMotionAndEffectStyle } from "../effect-styles";

type LogoRevealBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  format: MotionFormat;
};

export function LogoRevealBlock({ brand, block, format }: LogoRevealBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;
  const { width: formatWidth, height: formatHeight } = format;

  const { direction, intensity, speed, stagger, entranceEasing, exitEasing } =
    resolveBlockMotionParams(brand, block);

  const logoText = block.content.logoText || brand.name || "SCATTER";
  const tagline = block.content.tagline ?? "";

  const timing = getIntroTiming(duration, stagger, speed);
  const outroOpacity = getOutroOpacity(frame, duration, 0.12, exitEasing);

  const logoProgress = getEnterProgress(
    frame,
    timing.primaryStart,
    timing.enterFrames,
    speed,
    entranceEasing,
  );
  const taglineProgress = getEnterProgress(
    frame,
    timing.secondaryStart,
    Math.round(timing.enterFrames * 0.85),
    speed,
    entranceEasing,
  );

  const logoOpacity = getFadeOpacity(logoProgress) * outroOpacity;
  const taglineOpacity = getFadeOpacity(taglineProgress) * outroOpacity;
  const logoScale = getScale(logoProgress, intensity);
  const logoTranslate = getTranslate(
    logoProgress,
    direction,
    formatWidth,
    formatHeight,
    intensity,
  );
  const taglineTranslate = getTranslate(
    taglineProgress,
    "up",
    formatWidth,
    formatHeight,
    intensity === "hero" ? "standard" : intensity,
  );

  const headingStyle = brand.typography.defaults.headingStyle;
  const bodyStyle = brand.typography.defaults.bodyStyle;

  const logoType = resolveBlockSlotStyle(
    brand.typography,
    format,
    headingStyle,
    block.typographyOverride,
    "headline",
  );
  const taglineType = resolveBlockSlotStyle(
    brand.typography,
    format,
    bodyStyle,
    block.typographyOverride,
    "body",
  );

  const logoSize = logoType.fontSize;
  const padding = formatHeight * 0.08;

  const backgroundStyle = getTargetEffectStyle(brand, block, "background");
  const logoEffectStyle = getTargetEffectStyle(brand, block, "logo");

  return (
    <div
      style={{
        width: formatWidth,
        height: formatHeight,
        position: "relative",
        overflow: "hidden",
        fontFamily: resolveFontStack(brand.typography, "body"),
        color: brand.colors.foreground,
        backgroundColor: brand.colors.background,
        ...backgroundStyle,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 50% at 50% 40%, ${brand.colors.accent}18 0%, transparent 70%)`,
        }}
      />
      <GrainOverlay grain={brand.effects.defaultGrain} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: `${padding}px`,
          gap: formatHeight * 0.022,
          textAlign: "center",
        }}
      >
        <div
          style={mergeMotionAndEffectStyle(
            {
              opacity: logoOpacity,
              transform: `translate(${logoTranslate.x}px, ${logoTranslate.y}px) scale(${logoScale})`,
              clipPath: getMaskReveal(logoProgress),
            },
            logoEffectStyle,
          )}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: formatWidth * 0.014,
            }}
          >
            <div
              style={{
                width: logoSize * 0.55,
                height: logoSize * 0.55,
                borderRadius: logoSize * 0.12,
                backgroundColor: brand.colors.accent,
              }}
            />
            <span
              style={{
                ...resolvedTypeStyleToCss({
                  ...logoType,
                  fontFamily: resolveFontStack(brand.typography, "accent"),
                }),
                color: brand.colors.accent,
                lineHeight: 1,
              }}
            >
              {logoText}
            </span>
          </div>
        </div>

        {tagline ? (
          <div
            style={{
              opacity: taglineOpacity,
              transform: `translateY(${taglineTranslate.y}px)`,
              ...resolvedTypeStyleToCss(taglineType),
              color: brand.colors.muted,
              maxWidth: taglineType.maxWidth ?? formatWidth * 0.7,
            }}
          >
            {clampHeadlineText(tagline, 120)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
