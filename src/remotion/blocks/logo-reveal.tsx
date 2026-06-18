import { clampHeadlineText, resolveFontStack } from "@/lib/typography";
import { resolvedRoleToCss } from "@/lib/layout/typography-css";
import { resolveBlockLayoutFromInstance } from "@/lib/layout";
import type { BrandPreset, MotionBlockInstance, MotionFormat, ProjectAsset } from "@/types";
import { useCurrentFrame } from "remotion";
import { BrandLogoMark } from "../BrandLogoMark";
import { BlockLayoutZone } from "../BlockLayoutZone";
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
  assets?: ProjectAsset[];
};

export function LogoRevealBlock({ brand, block, format, assets = [] }: LogoRevealBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;
  const { width: formatWidth, height: formatHeight } = format;

  const layout = resolveBlockLayoutFromInstance({ brand, block, format, includeLogo: true });

  const { direction, intensity, speed, stagger, entranceEasing, exitEasing } =
    resolveBlockMotionParams(brand, block);

  const logoText = block.content.logoText || brand.logos.textFallback || brand.name || "SCATTER";
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

  const taglineType = layout.slots.tagline ?? layout.slots.body;
  const logoPlacement = layout.logo;

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
        {logoPlacement ? (
          <div
            style={mergeMotionAndEffectStyle(
              {
                opacity: logoOpacity,
                transform: `translate(${logoTranslate.x}px, ${logoTranslate.y}px) scale(${logoScale})`,
                clipPath: getMaskReveal(logoProgress),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              },
              logoEffectStyle,
            )}
          >
            <BrandLogoMark
              brand={brand}
              placement={{
                ...logoPlacement,
                width: logoPlacement.width,
                height: logoPlacement.height,
              }}
              assets={assets}
              textFallback={logoText}
              textStyle={layout.slots.label}
            />
          </div>
        ) : null}

        {tagline && taglineType ? (
          <div
            style={{
              opacity: taglineOpacity,
              transform: `translateY(${taglineTranslate.y}px)`,
              ...resolvedRoleToCss(taglineType),
              color: brand.colors.muted,
            }}
          >
            {clampHeadlineText(tagline, 120)}
          </div>
        ) : null}
        </div>
      </BlockLayoutZone>
    </div>
  );
}
