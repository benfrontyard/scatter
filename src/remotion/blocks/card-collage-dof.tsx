import { clampHeadlineText } from "@/lib/typography";
import { resolvedRoleToCss } from "@/lib/layout/typography-css";
import { resolveBlockLayoutFromInstance } from "@/lib/layout";
import type { BrandPreset, MotionBlockInstance, MotionFormat } from "@/types";
import { useCurrentFrame } from "remotion";
import { StepRail, VoidStage, CollageCard } from "./wave1/primitives";
import {
  COLLAGE_LAYOUT_16_9,
  COLLAGE_LAYOUT_PORTRAIT,
  maxCollageCardsForFormat,
  parseCollageCards,
  resolveHeroCardIndex,
} from "./wave1/card-content";
import {
  getEnterProgress,
  getFadeOpacity,
  getIntroTiming,
  getScale,
  getTranslate,
  resolveBlockMotionParams,
} from "../shared-motion";
import { useBlockEnterProgress, useBlockOutroOpacity, useHandoffExitOffset, useHandoffHeroTransform } from "../block-sequence-context";
import { getTargetEffectStyle, mergeMotionAndEffectStyle } from "../effect-styles";

type CardCollageDofBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  format: MotionFormat;
};

export function CardCollageDofBlock({ brand, block, format }: CardCollageDofBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;
  const { width: formatWidth, height: formatHeight } = format;
  const isPortrait = formatHeight > formatWidth;

  const layout = resolveBlockLayoutFromInstance({ brand, block, format, includeLogo: false });

  const { direction, intensity, speed, stagger, entranceEasing, exitEasing } =
    resolveBlockMotionParams(brand, block);

  const maxCards = maxCollageCardsForFormat(format.aspectRatio);
  const cards = parseCollageCards(block.content, maxCards).slice(0, maxCards);
  const heroCardIndex = resolveHeroCardIndex(block.content, block.motion.controls);
  const blurAmount = Number(block.motion.controls.blurAmount ?? 12);
  const headline = block.content.headline?.trim() ?? "";
  const stepLabel = block.content.stepLabel ?? block.content.categoryLabel ?? "";

  const timing = getIntroTiming(duration, stagger, speed);
  const outroOpacity = useBlockOutroOpacity(frame, duration, 0.1, exitEasing);
  const handoffExit = useHandoffExitOffset(
    frame,
    duration,
    direction,
    formatWidth,
    formatHeight,
    intensity,
  );

  const railProgress = getEnterProgress(
    frame,
    0,
    Math.round(timing.enterFrames * 0.65),
    speed,
    entranceEasing,
  );
  const railOpacity = getFadeOpacity(railProgress) * outroOpacity;

  const layoutMap = isPortrait ? COLLAGE_LAYOUT_PORTRAIT : COLLAGE_LAYOUT_16_9;
  const titleType = layout.slots.headline ?? layout.typography.subheading;
  const bodyType = layout.slots.body ?? layout.typography.caption;
  const stepType = layout.slots.stepLabel ?? layout.typography.caption;
  const headlineEffect = getTargetEffectStyle(brand, block, "headline");

  const headlineProgress = getEnterProgress(
    frame,
    timing.primaryStart,
    Math.round(timing.enterFrames * 0.85),
    speed,
    entranceEasing,
  );
  const headlineOpacity = getFadeOpacity(headlineProgress) * outroOpacity;

  const heroOrder = Math.max(
    0,
    cards.findIndex((card) => card.index === heroCardIndex),
  );
  const heroCardStart = timing.primaryStart + heroOrder * Math.round(stagger * 0.85);
  const heroCardProgress = useBlockEnterProgress(
    heroCardStart,
    Math.round(timing.enterFrames * 1),
    speed,
    entranceEasing,
  );
  const heroTransform = useHandoffHeroTransform(
    "carousel-card",
    heroCardProgress,
    formatWidth,
    formatHeight,
  );

  return (
    <VoidStage
      brand={brand}
      formatWidth={formatWidth}
      formatHeight={formatHeight}
      glowStrength={0.05}
    >
      {stepLabel ? (
        <StepRail
          label={stepLabel}
          style={{
            ...(stepType ? resolvedRoleToCss(stepType) : {}),
            color: brand.colors.muted,
          }}
          opacity={railOpacity}
          formatWidth={formatWidth}
        />
      ) : null}

      {headline && titleType ? (
        <div
          style={mergeMotionAndEffectStyle(
            {
              position: "absolute",
              left: formatWidth * 0.08,
              bottom: formatHeight * 0.08,
              maxWidth: formatWidth * 0.84,
              opacity: headlineOpacity,
              ...resolvedRoleToCss(titleType),
              color: brand.colors.foreground,
            },
            headlineEffect,
          )}
        >
          {clampHeadlineText(headline, 48)}
        </div>
      ) : null}

      {cards.map((card, order) => {
        const slot = layoutMap[card.index] ?? layoutMap[1];
        const isHero = card.index === heroCardIndex;
        const cardStart = timing.primaryStart + order * Math.round(stagger * 0.85);
        const cardProgress = isHero
          ? heroCardProgress
          : getEnterProgress(
              frame,
              cardStart,
              Math.round(timing.enterFrames * 0.85),
              speed,
              entranceEasing,
            );

        const cardOpacity = getFadeOpacity(cardProgress) * outroOpacity;
        const heroBlur = isHero
          ? blurAmount * (1 - getFadeOpacity(cardProgress))
          : blurAmount;
        const cardBlur = isHero ? heroBlur : blurAmount;
        const cardScale = getScale(cardProgress, isHero ? intensity : "subtle");
        const cardTranslate = getTranslate(
          cardProgress,
          direction,
          formatWidth,
          formatHeight,
          isHero ? intensity : "subtle",
        );
        const exitX = isHero ? handoffExit.x + heroTransform.x : 0;
        const exitY = isHero ? handoffExit.y + heroTransform.y : 0;
        const heroScale = isHero ? heroTransform.scale : 1;
        const travelScale = isHero ? heroTransform.travelScale : 1;

        return (
          <div
            key={card.index}
            style={{
              position: "absolute",
              left: slot.x * formatWidth,
              top: slot.y * formatHeight,
              width: slot.w * formatWidth,
              height: slot.h * formatHeight,
              zIndex: isHero ? 10 : slot.z,
              opacity: cardOpacity,
              transform: `translate(${cardTranslate.x * travelScale + exitX}px, ${cardTranslate.y * travelScale + exitY}px) scale(${isHero ? cardScale * heroScale : cardScale})`,
            }}
          >
            <CollageCard
              brand={brand}
              formatWidth={formatWidth}
              formatHeight={formatHeight}
              title={card.title}
              body={card.body}
              titleStyle={{
                ...(titleType ? resolvedRoleToCss(titleType) : {}),
                color: brand.colors.foreground,
                fontSize: (titleType?.fontSize ?? 16) * (isHero ? 1 : 0.82),
              }}
              bodyStyle={
                bodyType
                  ? { ...resolvedRoleToCss(bodyType), color: brand.colors.muted }
                  : undefined
              }
              scale={cardScale}
              blurPx={cardBlur}
              isHero={isHero}
            />
          </div>
        );
      })}
    </VoidStage>
  );
}
