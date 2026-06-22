import { clampHeadlineText, resolveFontStack } from "@/lib/typography";
import { fitResolvedRoleToCss } from "@/lib/layout/fit-text";
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
  getScaleWithSettle,
  getTranslate,
  resolveBlockMotionParams,
} from "../shared-motion";
import { useBlockEnterProgress, useBlockOutroOpacity, useHandoffExitOffset, useHandoffHeroTransform } from "../block-sequence-context";
import { getTargetEffectStyle, mergeMotionAndEffectStyle } from "../effect-styles";
import { VoidStage } from "./wave1/primitives";

type BrandPayoffBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  format: MotionFormat;
  assets?: ProjectAsset[];
};

export function BrandPayoffBlock({
  brand,
  block,
  format,
  assets = [],
}: BrandPayoffBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;
  const { width: formatWidth, height: formatHeight } = format;

  const layout = resolveBlockLayoutFromInstance({ brand, block, format, includeLogo: true });

  const { direction, intensity, speed, stagger, entranceEasing, exitEasing } =
    resolveBlockMotionParams(brand, block);

  const cta = block.content.cta ?? "Get started today";
  const url = block.content.url ?? "";
  const showUrl = block.content.showUrl !== "false";
  const logoText = block.content.logoText || brand.logos.textFallback || brand.name || "SCATTER";

  const timing = getIntroTiming(duration, stagger, speed);
  const outroOpacity = useBlockOutroOpacity(frame, duration, 0.08, exitEasing);
  const handoffExit = useHandoffExitOffset(
    frame,
    duration,
    direction,
    formatWidth,
    formatHeight,
    intensity,
  );

  const logoProgress = useBlockEnterProgress(
    timing.primaryStart,
    timing.enterFrames,
    speed,
    entranceEasing,
  );
  const heroTransform = useHandoffHeroTransform(
    "logo-cta",
    logoProgress,
    formatWidth,
    formatHeight,
  );
  const ctaProgress = getEnterProgress(
    frame,
    timing.secondaryStart + Math.round(stagger * 0.5),
    Math.round(timing.enterFrames * 0.85),
    speed,
    entranceEasing,
  );
  const urlProgress = getEnterProgress(
    frame,
    timing.tertiaryStart,
    Math.round(timing.enterFrames * 0.75),
    speed,
    entranceEasing,
  );

  const logoOpacity = getFadeOpacity(logoProgress) * outroOpacity;
  const ctaOpacity = getFadeOpacity(ctaProgress) * outroOpacity;
  const urlOpacity = getFadeOpacity(urlProgress) * outroOpacity;

  const logoScale = getScaleWithSettle(logoProgress, intensity);
  const logoTranslate = getTranslate(
    logoProgress,
    direction,
    formatWidth,
    formatHeight,
    intensity,
  );
  const scaledLogoX = logoTranslate.x * heroTransform.travelScale;
  const scaledLogoY = logoTranslate.y * heroTransform.travelScale;
  const ctaTranslate = getTranslate(
    ctaProgress,
    "up",
    formatWidth,
    formatHeight,
    intensity === "hero" ? "standard" : intensity,
  );

  const ctaType = layout.slots.cta ?? layout.typography.subheading;
  const urlType = layout.slots.url ?? layout.typography.caption;
  const logoType = layout.slots.logoText ?? layout.typography.label;
  const logoPlacement = layout.logo;
  const logoEffect = getTargetEffectStyle(brand, block, "logo");
  const fittedCtaCss =
    cta && ctaType
      ? fitResolvedRoleToCss(ctaType, clampHeadlineText(cta, 48), {
          containerWidth: layout.maxTextWidth,
          maxLines: 2,
        })
      : null;

  return (
    <VoidStage brand={brand} formatWidth={formatWidth} formatHeight={formatHeight} glowStrength={0.03}>
      <BlockLayoutZone layout={layout}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: layout.gap * 1.2,
            width: "100%",
            maxWidth: layout.maxTextWidth,
            textAlign: layout.alignment,
            fontFamily: resolveFontStack(brand.typography, "body"),
          }}
        >
          {logoPlacement ? (
            <div
              style={mergeMotionAndEffectStyle(
                {
                  opacity: logoOpacity,
                  transform: `translate(${scaledLogoX + handoffExit.x + heroTransform.x}px, ${scaledLogoY + handoffExit.y + heroTransform.y}px) scale(${logoScale * heroTransform.scale})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
                logoEffect,
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
          ) : null}

          {cta && fittedCtaCss ? (
            <div
              style={{
                opacity: ctaOpacity,
                transform: `translateY(${ctaTranslate.y}px)`,
                ...fittedCtaCss,
                color: brand.colors.foreground,
              }}
            >
              {clampHeadlineText(cta, 48)}
            </div>
          ) : null}

          {showUrl && url && urlType ? (
            <div
              style={{
                opacity: urlOpacity,
                ...resolvedRoleToCss(urlType),
                color: brand.colors.muted,
              }}
            >
              {url}
            </div>
          ) : null}
        </div>
      </BlockLayoutZone>
    </VoidStage>
  );
}
