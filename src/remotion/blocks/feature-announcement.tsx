import { resolveFontStack } from "@/lib/typography";
import { resolvedRoleToCss } from "@/lib/layout/typography-css";
import { resolveBlockLayoutFromInstance } from "@/lib/layout";
import type { BrandPreset, MotionBlockInstance, MotionFormat, ProjectAsset } from "@/types";
import { useCurrentFrame } from "remotion";
import { AnimatedText } from "../AnimatedText";
import { BrandLogoMark } from "../BrandLogoMark";
import { BlockLayoutZone, LogoPlacementLayer } from "../BlockLayoutZone";
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
  assets?: ProjectAsset[];
};

export function FeatureAnnouncementBlock({
  brand,
  block,
  format,
  assets = [],
}: FeatureAnnouncementBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;
  const { width: formatWidth, height: formatHeight } = format;

  const backgroundColor = block.content.backgroundColor || brand.colors.background;
  const accentColor = block.content.accentColor || brand.colors.accent;

  const layout = resolveBlockLayoutFromInstance({
    brand,
    block,
    format,
    backgroundColor,
    includeLogo: true,
  });

  const { intensity, speed, stagger, entranceEasing, exitEasing } =
    resolveBlockMotionParams(brand, block);

  const headline = block.content.headline ?? "Ship faster";
  const subhead = block.content.subhead ?? block.content.body ?? "";
  const logoText = block.content.logoText || brand.logos.textFallback || "SCATTER";

  const timing = getFeatureAnnouncementTiming(duration, stagger, speed);
  const outroOpacity = getOutroOpacity(frame, duration, 0.12, exitEasing);

  const bgProgress = getEnterProgress(
    frame,
    timing.backgroundStart,
    Math.round(timing.enterFrames * 0.35),
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

  const imageOpacity = getFadeOpacity(imageProgress) * outroOpacity;
  const logoOpacity = getFadeOpacity(logoProgress) * outroOpacity;

  const imageScale = getScale(imageProgress, intensity) * layout.media.scale;
  const logoTranslate = getTranslate(
    logoProgress,
    "up",
    formatWidth,
    formatHeight,
    intensity === "hero" ? "standard" : intensity,
  );

  const isPortrait = formatHeight > formatWidth;
  const imageWidth =
    layout.media.zone?.width ?? formatWidth * (isPortrait ? 0.82 : 0.58);
  const imageHeight =
    layout.media.zone?.height ?? formatHeight * (isPortrait ? 0.32 : 0.38);

  const placeholderType = layout.slots.caption;
  const logoType = layout.slots.label;
  const logoPlacement = layout.logo;

  const backgroundStyle = getTargetEffectStyle(brand, block, "background");
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

      <BlockLayoutZone layout={layout}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: layout.maxTextWidth,
            gap: layout.gap,
            textAlign: layout.alignment,
          }}
        >
          <AnimatedText
            text={headline}
            brand={brand}
            block={block}
            format={format}
            slot="headline"
            frame={frame}
            startFrame={timing.headlineStart}
            outroOpacity={outroOpacity}
            maxLength={90}
            typographySlot="headline"
            layoutSlot={layout.slots.headline}
          />

          {subhead ? (
            <AnimatedText
              text={subhead}
              brand={brand}
              block={block}
              format={format}
              slot="subhead"
              frame={frame}
              startFrame={timing.subheadStart}
              outroOpacity={outroOpacity}
              maxLength={160}
              typographySlot="body"
              color={brand.colors.muted}
              layoutSlot={layout.slots.subhead ?? layout.slots.body}
            />
          ) : null}

          <div
            style={mergeMotionAndEffectStyle(
              {
                marginTop: layout.gap * 0.5,
                width: imageWidth,
                height: imageHeight,
                opacity: imageOpacity,
                transform: `scale(${imageScale})`,
                clipPath: getMaskReveal(imageProgress),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: layout.gap * 0.4,
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
            {placeholderType ? (
              <span
                style={{
                  ...resolvedRoleToCss(placeholderType),
                  color: brand.colors.muted,
                }}
              >
                Screenshot
              </span>
            ) : null}
          </div>
        </div>
      </BlockLayoutZone>

      {logoPlacement ? (
        <LogoPlacementLayer layout={layout}>
          <div
            style={mergeMotionAndEffectStyle(
              {
                opacity: logoOpacity,
                transform: `translateY(${logoTranslate.y}px)`,
              },
              logoEffectStyle,
            )}
          >
            <BrandLogoMark
              brand={brand}
              placement={logoPlacement}
              assets={assets}
              textFallback={logoText}
              textStyle={logoType}
            />
          </div>
        </LogoPlacementLayer>
      ) : null}
    </div>
  );
}
