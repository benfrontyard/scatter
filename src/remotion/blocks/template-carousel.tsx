import { clampHeadlineText } from "@/lib/typography";
import { resolvedRoleToCss } from "@/lib/layout/typography-css";
import { resolveBlockLayoutFromInstance } from "@/lib/layout";
import type { BrandPreset, MotionBlockInstance, MotionFormat } from "@/types";
import { useCurrentFrame } from "remotion";
import { CarouselCard, StepRail, VoidStage } from "./wave1/primitives";
import {
  maxCarouselItemsForFormat,
  parseCarouselItems,
  resolveActiveCarouselIndex,
  showCarouselFlanks,
} from "./wave1/card-content";
import {
  getEnterProgress,
  getFadeOpacity,
  getIntroTiming,
  getOutroOpacity,
  getScale,
  getTranslate,
  resolveBlockMotionParams,
} from "../shared-motion";
import { getTargetEffectStyle, mergeMotionAndEffectStyle } from "../effect-styles";

type TemplateCarouselBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  format: MotionFormat;
};

export function TemplateCarouselBlock({
  brand,
  block,
  format,
}: TemplateCarouselBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;
  const { width: formatWidth, height: formatHeight } = format;

  const layout = resolveBlockLayoutFromInstance({ brand, block, format, includeLogo: false });

  const { direction, intensity, speed, stagger, entranceEasing, exitEasing } =
    resolveBlockMotionParams(brand, block);

  const maxItems = maxCarouselItemsForFormat(format.aspectRatio);
  const items = parseCarouselItems(block.content, maxItems);
  const activeIndex = resolveActiveCarouselIndex(
    block.content,
    block.motion.controls,
    items.length,
  );
  const dimOpacity = Number(block.motion.controls.dimOpacity ?? 0.25);
  const categoryLabel = block.content.categoryLabel ?? "1 Premium Templates";
  const showFlanks = showCarouselFlanks(format.aspectRatio);

  const timing = getIntroTiming(duration, stagger, speed);
  const outroOpacity = getOutroOpacity(frame, duration, 0.1, exitEasing);

  const labelProgress = getEnterProgress(
    frame,
    0,
    Math.round(timing.enterFrames * 0.7),
    speed,
    entranceEasing,
  );
  const trackProgress = getEnterProgress(
    frame,
    timing.primaryStart,
    timing.enterFrames,
    speed,
    entranceEasing,
  );

  const labelOpacity = getFadeOpacity(labelProgress) * outroOpacity;
  const trackOpacity = getFadeOpacity(trackProgress) * outroOpacity;
  const trackTranslate = getTranslate(
    trackProgress,
    direction,
    formatWidth,
    formatHeight,
    intensity,
  );

  const labelType = layout.slots.categoryLabel ?? layout.typography.caption;
  const titleType = layout.slots.headline ?? layout.typography.subheading;
  const metaType = layout.slots.meta ?? layout.typography.caption;
  const labelEffect = getTargetEffectStyle(brand, block, "headline");

  const cardWidthRatio = showFlanks ? 0.28 : 0.84;
  const cardWidth = formatWidth * cardWidthRatio;
  const cardHeight = formatHeight * (showFlanks ? 0.52 : 0.42);
  const gap = formatWidth * 0.02;
  const trackLeft = showFlanks
    ? formatWidth * 0.5 - (activeIndex * (cardWidth + gap) + cardWidth / 2)
    : formatWidth * 0.08;
  const trackTop = formatHeight * (showFlanks ? 0.28 : 0.34);

  const visibleIndices = showFlanks
    ? items.map((_, i) => i)
    : [activeIndex];

  return (
    <VoidStage
      brand={brand}
      formatWidth={formatWidth}
      formatHeight={formatHeight}
      glowStrength={0.04}
    >
      <StepRail
        label={categoryLabel}
        style={mergeMotionAndEffectStyle(
          {
            ...(labelType ? resolvedRoleToCss(labelType) : {}),
            color: brand.colors.muted,
          },
          labelEffect,
        )}
        opacity={labelOpacity}
        formatWidth={formatWidth}
      />

      <div
        style={{
          position: "absolute",
          left: trackLeft,
          top: trackTop,
          height: cardHeight,
          opacity: trackOpacity,
          transform: `translate(${trackTranslate.x}px, ${trackTranslate.y}px)`,
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap,
        }}
      >
        {items.map((item, index) => {
          if (!visibleIndices.includes(index)) return null;

          const cardStart = timing.primaryStart + index * Math.round(stagger * 0.75);
          const cardProgress = getEnterProgress(
            frame,
            cardStart,
            Math.round(timing.enterFrames * 0.9),
            speed,
            entranceEasing,
          );
          const cardOpacity = getFadeOpacity(cardProgress) * outroOpacity;
          const isActive = index === activeIndex;
          const cardScale = getScale(cardProgress, isActive ? intensity : "subtle");

          return (
            <div
              key={item.index}
              style={{
                width: cardWidth,
                height: cardHeight,
                flexShrink: 0,
                opacity: cardOpacity,
              }}
            >
              <CarouselCard
                brand={brand}
                formatWidth={formatWidth}
                formatHeight={formatHeight}
                title={clampHeadlineText(item.title, 40)}
                meta={item.meta ? clampHeadlineText(item.meta, 24) : undefined}
                titleStyle={{
                  ...(titleType ? resolvedRoleToCss(titleType) : {}),
                  color: brand.colors.foreground,
                }}
                metaStyle={
                  metaType
                    ? { ...resolvedRoleToCss(metaType), color: brand.colors.accent }
                    : undefined
                }
                isActive={isActive}
                dimOpacity={dimOpacity}
                scale={cardScale}
              />
            </div>
          );
        })}
      </div>
    </VoidStage>
  );
}
