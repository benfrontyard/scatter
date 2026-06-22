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
  getScale,
  getTranslate,
  resolveBlockMotionParams,
} from "../shared-motion";
import { useBlockEnterProgress, useBlockOutroOpacity, useHandoffExitOffset, useHandoffHeroTransform } from "../block-sequence-context";
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
  const outroOpacity = useBlockOutroOpacity(frame, duration, 0.1, exitEasing);
  const handoffExit = useHandoffExitOffset(
    frame,
    duration,
    "up",
    formatWidth,
    formatHeight,
    intensity,
  );

  const mediaProgress = useBlockEnterProgress(
    timing.secondaryStart,
    Math.round(timing.enterFrames * 0.95),
    speed,
    entranceEasing,
  );
  const heroTransform = useHandoffHeroTransform(
    "split-media",
    mediaProgress,
    formatWidth,
    formatHeight,
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
  const mediaZone = layout.media.zone;

  const textColumnWidth = layout.contentZone.width;

  const headlineType = layout.slots.headline ?? layout.typography.heading;
  const subheadType = layout.slots.subhead ?? layout.typography.body;
  const bodyType = layout.slots.body ?? layout.typography.body;
  const ctaType = layout.slots.cta ?? layout.typography.label;
  const captionType = layout.slots.caption ?? layout.typography.caption;

  const withColumnWidth = (slot: typeof headlineType) =>
    slot ? { ...slot, maxWidth: textColumnWidth } : undefined;

  const headlineEffect = getTargetEffectStyle(brand, block, "headline");
  const imageEffect = getTargetEffectStyle(brand, block, "image");

  const textColumn = (
    <div
      style={mergeMotionAndEffectStyle(
        {
          width: "100%",
          maxWidth: textColumnWidth,
          display: "flex",
          flexDirection: "column",
          alignItems: isLandscape ? "flex-start" : "center",
          justifyContent: "center",
          gap: layout.gap,
          textAlign: isLandscape ? "left" : layout.alignment,
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
          layoutSlot={withColumnWidth(headlineType)}
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
          layoutSlot={withColumnWidth(subheadType)}
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
          width: "100%",
          height: isLandscape ? "100%" : formatHeight * 0.34,
          clipPath: getMaskReveal(mediaProgress),
          transform: `translate(${handoffExit.x + heroTransform.x}px, ${handoffExit.y + heroTransform.y}px) scale(${heroTransform.scale})`,
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

      <BlockLayoutZone layout={layout}>
        {isLandscape ? (
          textColumn
        ) : (
          <>
            {textColumn}
            <div style={{ width: "100%", maxWidth: formatWidth * 0.88 }}>{mediaColumn}</div>
          </>
        )}
      </BlockLayoutZone>

      {isLandscape && mediaZone ? (
        <div
          style={{
            position: "absolute",
            left: mediaZone.x,
            top: mediaZone.y,
            width: mediaZone.width,
            height: mediaZone.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          {mediaColumn}
        </div>
      ) : null}
    </div>
  );
}
