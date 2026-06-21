import { clampHeadlineText } from "@/lib/typography";
import { resolvedRoleToCss } from "@/lib/layout/typography-css";
import { resolveBlockLayoutFromInstance } from "@/lib/layout";
import type { BrandPreset, MotionBlockInstance, MotionFormat } from "@/types";
import { useCurrentFrame } from "remotion";
import { AnimatedText } from "../AnimatedText";
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
import { MediaPlaceholder } from "./wave1/primitives";

type HeroSplitTextMediaBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  format: MotionFormat;
};

export function HeroSplitTextMediaBlock({
  brand,
  block,
  format,
}: HeroSplitTextMediaBlockProps) {
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
    includeLogo: false,
  });

  const { intensity, speed, stagger, entranceEasing, exitEasing } =
    resolveBlockMotionParams(brand, block);

  const headline = block.content.headline ?? "Easy scheduling ahead";
  const subhead = block.content.subhead ?? "";
  const body = block.content.body ?? "";
  const cta = block.content.cta ?? "";

  const timing = getIntroTiming(duration, stagger, speed);
  const outroOpacity = getOutroOpacity(frame, duration, 0.1, exitEasing);

  const mediaProgress = getEnterProgress(
    frame,
    timing.secondaryStart,
    Math.round(timing.enterFrames * 0.95),
    speed,
    entranceEasing,
  );
  const ctaProgress = getEnterProgress(
    frame,
    timing.tertiaryStart,
    Math.round(timing.enterFrames * 0.85),
    speed,
    entranceEasing,
  );

  const mediaOpacity = getFadeOpacity(mediaProgress) * outroOpacity;
  const ctaOpacity = getFadeOpacity(ctaProgress) * outroOpacity;
  const mediaScale = getScale(mediaProgress, intensity) * layout.media.scale;
  const ctaTranslate = getTranslate(
    ctaProgress,
    "up",
    formatWidth,
    formatHeight,
    intensity === "hero" ? "standard" : intensity,
  );

  const isLandscape = formatWidth >= formatHeight;
  const mediaOnRight =
    block.layoutOverrides?.formats?.[format.id]?.mediaPosition !== "left";

  const headlineType = layout.slots.headline ?? layout.typography.heading;
  const subheadType = layout.slots.subhead ?? layout.typography.body;
  const bodyType = layout.slots.body ?? layout.typography.body;
  const ctaType = layout.slots.cta ?? layout.typography.label;
  const captionType = layout.slots.caption ?? layout.typography.caption;

  const headlineEffect = getTargetEffectStyle(brand, block, "headline");
  const imageEffect = getTargetEffectStyle(brand, block, "image");

  const mediaWidth = isLandscape ? "46%" : "88%";
  const mediaHeight = isLandscape ? "72%" : formatHeight * 0.34;
  const textFlex = isLandscape ? "1 1 44%" : "0 0 auto";

  const textColumn = (
    <div
      style={mergeMotionAndEffectStyle(
        {
          flex: textFlex,
          display: "flex",
          flexDirection: "column",
          alignItems: isLandscape ? "flex-start" : "center",
          justifyContent: "center",
          gap: layout.gap,
          textAlign: isLandscape ? "left" : layout.alignment,
          maxWidth: isLandscape ? undefined : layout.maxTextWidth,
        },
        headlineEffect,
      )}
    >
      {headlineType ? (
        <AnimatedText
          text={headline}
          brand={brand}
          block={block}
          format={format}
          slot="headline"
          frame={frame}
          startFrame={timing.primaryStart}
          outroOpacity={outroOpacity}
          maxLength={56}
          typographySlot="headline"
          layoutSlot={headlineType}
        />
      ) : null}

      {subhead && subheadType ? (
        <AnimatedText
          text={subhead}
          brand={brand}
          block={block}
          format={format}
          slot="subhead"
          frame={frame}
          startFrame={timing.secondaryStart}
          outroOpacity={outroOpacity}
          maxLength={120}
          typographySlot="body"
          color={brand.colors.muted}
          layoutSlot={subheadType}
        />
      ) : null}

      {body && bodyType ? (
        <div style={{ ...resolvedRoleToCss(bodyType), color: brand.colors.muted }}>
          {clampHeadlineText(body, 160)}
        </div>
      ) : null}

      {cta && ctaType ? (
        <div
          style={{
            opacity: ctaOpacity,
            transform: `translateY(${ctaTranslate.y}px)`,
            marginTop: layout.gap * 0.25,
            padding: `${layout.gap * 0.35}px ${layout.gap * 0.9}px`,
            borderRadius: layout.gap * 0.25,
            backgroundColor: accentColor,
            color: backgroundColor,
            ...resolvedRoleToCss(ctaType),
          }}
        >
          {clampHeadlineText(cta, 40)}
        </div>
      ) : null}
    </div>
  );

  const mediaColumn = (
    <MediaPlaceholder
      brand={brand}
      formatWidth={formatWidth}
      formatHeight={formatHeight}
      label="Screenshot"
      labelStyle={
        captionType
          ? { ...resolvedRoleToCss(captionType), color: brand.colors.muted }
          : undefined
      }
      opacity={mediaOpacity}
      scale={mediaScale}
      style={mergeMotionAndEffectStyle(
        {
          flex: isLandscape ? "1 1 46%" : "0 0 auto",
          width: mediaWidth,
          height: mediaHeight,
          clipPath: getMaskReveal(mediaProgress),
        },
        imageEffect,
      )}
    />
  );

  return (
    <div
      style={{
        width: formatWidth,
        height: formatHeight,
        position: "relative",
        overflow: "hidden",
        backgroundColor,
        color: brand.colors.foreground,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 55% at ${mediaOnRight ? "75%" : "25%"} 40%, ${accentColor}14 0%, transparent 70%)`,
        }}
      />
      <GrainOverlay grain={brand.effects.defaultGrain} />

      <BlockLayoutZone
        layout={{
          ...layout,
          stackDirection: isLandscape ? "row" : "column",
          alignment: isLandscape ? "left" : layout.alignment,
        }}
      >
        {isLandscape && !mediaOnRight ? (
          <>
            {mediaColumn}
            {textColumn}
          </>
        ) : (
          <>
            {textColumn}
            {mediaColumn}
          </>
        )}
      </BlockLayoutZone>
    </div>
  );
}
