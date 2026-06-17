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
  getFeatureAnnouncementTiming,
  getMaskReveal,
  getOutroOpacity,
  getScale,
  getTranslate,
  resolveBlockMotionParams,
} from "./feature-announcement-motion";
import { GrainOverlay, getTargetEffectStyle, mergeMotionAndEffectStyle } from "../effect-styles";

type FeatureAnnouncementBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  format: MotionFormat;
};

export function FeatureAnnouncementBlock({ brand, block, format }: FeatureAnnouncementBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;
  const { width: formatWidth, height: formatHeight } = format;

  const { direction, intensity, speed, stagger, entranceEasing, exitEasing } =
    resolveBlockMotionParams(brand, block);

  const headline = block.content.headline ?? "Ship faster";
  const subhead = block.content.subhead ?? block.content.body ?? "";
  const logoText = block.content.logoText || "SCATTER";
  const backgroundColor = block.content.backgroundColor || brand.colors.background;
  const accentColor = block.content.accentColor || brand.colors.accent;

  const timing = getFeatureAnnouncementTiming(duration, stagger, speed);
  const outroOpacity = getOutroOpacity(frame, duration, 0.12, exitEasing);

  const bgProgress = getEnterProgress(
    frame,
    timing.backgroundStart,
    Math.round(timing.enterFrames * 0.35),
    speed,
    entranceEasing,
  );
  const headlineProgress = getEnterProgress(
    frame,
    timing.headlineStart,
    timing.enterFrames,
    speed,
    entranceEasing,
  );
  const subheadProgress = getEnterProgress(
    frame,
    timing.subheadStart,
    timing.enterFrames,
    speed,
    entranceEasing,
  );
  const imageProgress = getEnterProgress(
    frame,
    timing.imageStart,
    timing.enterFrames,
    speed,
    entranceEasing,
  );
  const logoProgress = getEnterProgress(
    frame,
    timing.logoStart,
    Math.round(timing.enterFrames * 0.85),
    speed,
    entranceEasing,
  );

  const headlineOpacity = getFadeOpacity(headlineProgress) * outroOpacity;
  const subheadOpacity = getFadeOpacity(subheadProgress) * outroOpacity;
  const imageOpacity = getFadeOpacity(imageProgress) * outroOpacity;
  const logoOpacity = getFadeOpacity(logoProgress) * outroOpacity;

  const headlineTranslate = getTranslate(
    headlineProgress,
    direction,
    formatWidth,
    formatHeight,
    intensity,
  );
  const subheadTranslate = getTranslate(
    subheadProgress,
    direction,
    formatWidth,
    formatHeight,
    intensity,
  );
  const imageScale = getScale(imageProgress, intensity);
  const logoTranslate = getTranslate(
    logoProgress,
    "up",
    formatWidth,
    formatHeight,
    intensity === "hero" ? "standard" : intensity,
  );

  const isPortrait = formatHeight > formatWidth;
  const paddingX = formatWidth * 0.08;
  const paddingY = formatHeight * 0.07;

  const headingStyle = brand.typography.defaults.headingStyle;
  const bodyStyle = brand.typography.defaults.bodyStyle;
  const labelStyle = brand.typography.defaults.labelStyle;

  const headlineType = resolveBlockSlotStyle(
    brand.typography,
    format,
    headingStyle,
    block.typographyOverride,
    "headline",
  );
  const subheadType = resolveBlockSlotStyle(
    brand.typography,
    format,
    bodyStyle,
    block.typographyOverride,
    "body",
  );
  const logoType = resolveBlockSlotStyle(
    brand.typography,
    format,
    labelStyle,
    block.typographyOverride,
    "label",
  );
  const placeholderType = resolveBlockSlotStyle(
    brand.typography,
    format,
    "caption",
    block.typographyOverride,
    "caption",
  );

  const imageWidth = formatWidth * (isPortrait ? 0.82 : 0.58);
  const imageHeight = formatHeight * (isPortrait ? 0.32 : 0.38);

  const backgroundStyle = getTargetEffectStyle(brand, block, "background");
  const headlineEffectStyle = getTargetEffectStyle(brand, block, "headline");
  const subheadEffectStyle = getTargetEffectStyle(brand, block, "subhead");
  const imageEffectStyle = getTargetEffectStyle(brand, block, "image");
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
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor,
          opacity: getFadeOpacity(bgProgress),
          ...backgroundStyle,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${accentColor}22 0%, transparent 70%)`,
          opacity: getFadeOpacity(bgProgress) * 0.9,
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
          padding: `${paddingY}px ${paddingX}px`,
          gap: formatHeight * 0.028,
          textAlign: "center",
        }}
      >
        <div
          style={mergeMotionAndEffectStyle(
            {
              opacity: headlineOpacity,
              transform: `translate(${headlineTranslate.x}px, ${headlineTranslate.y}px)`,
            },
            headlineEffectStyle,
          )}
        >
          <span
            style={{
              ...resolvedTypeStyleToCss(headlineType),
              maxWidth: headlineType.maxWidth ?? formatWidth * 0.85,
            }}
          >
            {clampHeadlineText(headline, 90)}
          </span>
        </div>

        {subhead ? (
          <div
            style={mergeMotionAndEffectStyle(
              {
                opacity: subheadOpacity,
                transform: `translate(${subheadTranslate.x}px, ${subheadTranslate.y}px)`,
              },
              subheadEffectStyle,
            )}
          >
            <span
              style={{
                ...resolvedTypeStyleToCss(subheadType),
                color: brand.colors.muted,
                maxWidth: subheadType.maxWidth ?? formatWidth * 0.72,
              }}
            >
              {clampHeadlineText(subhead, 160)}
            </span>
          </div>
        ) : null}

        <div
          style={mergeMotionAndEffectStyle(
            {
              marginTop: formatHeight * 0.02,
              width: imageWidth,
              height: imageHeight,
              opacity: imageOpacity,
              transform: `scale(${imageScale})`,
              clipPath: getMaskReveal(imageProgress),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: formatHeight * 0.012,
              overflow: "hidden",
              background: `linear-gradient(145deg, ${accentColor}18 0%, ${backgroundColor} 50%, ${accentColor}0d 100%)`,
            },
            imageEffectStyle,
          )}
        >
          <svg
            width={formatHeight * 0.06}
            height={formatHeight * 0.06}
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden
          >
            <rect x="4" y="8" width="40" height="32" rx="4" stroke={accentColor} strokeWidth="2" />
            <circle cx="16" cy="20" r="4" fill={accentColor} opacity="0.6" />
            <path
              d="M8 32 L18 24 L26 30 L34 22 L40 28"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
            />
          </svg>
          <span
            style={{
              ...resolvedTypeStyleToCss(placeholderType),
              color: brand.colors.muted,
            }}
          >
            Screenshot
          </span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: paddingY,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          transform: `translateY(${logoTranslate.y}px)`,
        }}
      >
        <div
          style={mergeMotionAndEffectStyle(
            { opacity: logoOpacity },
            logoEffectStyle,
          )}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: formatWidth * 0.012,
              padding: `${formatHeight * 0.01}px ${formatWidth * 0.025}px`,
            }}
          >
            <div
              style={{
                width: formatHeight * 0.022,
                height: formatHeight * 0.022,
                borderRadius: formatHeight * 0.005,
                backgroundColor: accentColor,
              }}
            />
            <span
              style={{
                ...resolvedTypeStyleToCss({
                  ...logoType,
                  fontFamily: resolveFontStack(brand.typography, "accent"),
                }),
                color: accentColor,
              }}
            >
              {logoText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
