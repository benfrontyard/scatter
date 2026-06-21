import { resolveFontStack } from "@/lib/typography";
import { fitResolvedRoleToCss } from "@/lib/layout/fit-text";
import { resolvedRoleToCss } from "@/lib/layout/typography-css";
import { resolveBlockLayoutFromInstance } from "@/lib/layout";
import type { BrandPreset, MotionBlockInstance, MotionFormat } from "@/types";
import { interpolate, useCurrentFrame } from "remotion";
import { BlockLayoutZone } from "../BlockLayoutZone";
import {
  getEnterProgress,
  getFadeOpacity,
  getIntroTiming,
  getOutroOpacity,
  getScale,
  getTranslate,
  resolveBlockMotionParams,
} from "../shared-motion";
import { GrainOverlay, getTargetEffectStyle } from "../effect-styles";
import { MediaPlaceholder, PromptBar } from "./wave1/primitives";

type HeroPromptBarBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  format: MotionFormat;
};

export function HeroPromptBarBlock({ brand, block, format }: HeroPromptBarBlockProps) {
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

  const { direction, intensity, speed, stagger, entranceEasing, exitEasing } =
    resolveBlockMotionParams(brand, block);

  const hintText = block.content.hintText ?? "First, what are you building?";
  const promptText =
    block.content.promptText ?? "I want to create a website for my fashion brand";
  const highlightPhrase = block.content.highlightPhrase ?? "fashion brand";
  const typeOnEnabled = block.motion.controls.typeOn !== "false";

  const isPortrait = formatHeight > formatWidth;
  const barZoneLayout = {
    ...layout,
    contentZone: layout.contentZone,
    alignment: "center" as const,
  };

  const timing = getIntroTiming(duration, stagger, speed);
  const outroOpacity = getOutroOpacity(frame, duration, 0.1, exitEasing);

  const bgProgress = getEnterProgress(
    frame,
    0,
    Math.round(timing.enterFrames * 0.5),
    speed,
    entranceEasing,
  );
  const barProgress = getEnterProgress(
    frame,
    timing.primaryStart + Math.round(stagger * 0.3),
    timing.enterFrames,
    speed,
    entranceEasing,
  );
  const typeProgress = getEnterProgress(
    frame,
    timing.secondaryStart,
    Math.round(timing.enterFrames * 1.25),
    speed,
    entranceEasing,
  );

  const bgOpacity = getFadeOpacity(bgProgress) * outroOpacity;
  const barOpacity = getFadeOpacity(barProgress) * outroOpacity;
  const barScale = getScale(barProgress, intensity);
  const barTranslate = getTranslate(
    barProgress,
    direction,
    formatWidth,
    formatHeight,
    intensity,
  );

  const parallaxScale = interpolate(frame, [0, duration], [1.04, 1], {
    extrapolateRight: "clamp",
  });

  const hintType = layout.slots.hintText ?? layout.typography.caption;
  const promptType = layout.slots.promptText ?? layout.typography.body;
  const barEffect = getTargetEffectStyle(brand, block, "card");

  const barWidthFactor = isPortrait ? 0.88 : 0.7;
  const barContainerWidth = Math.min(layout.maxTextWidth, formatWidth * barWidthFactor);
  const fittedHintCss = hintType
    ? fitResolvedRoleToCss(hintType, hintText, { containerWidth: barContainerWidth, maxLines: 2 })
    : null;
  const fittedPromptCss = promptType
    ? fitResolvedRoleToCss(promptType, promptText, {
        containerWidth: barContainerWidth,
        maxLines: isPortrait ? 3 : 2,
      })
    : null;

  return (
    <div
      style={{
        width: formatWidth,
        height: formatHeight,
        position: "relative",
        overflow: "hidden",
        fontFamily: resolveFontStack(brand.typography, "body"),
        color: brand.colors.foreground,
        backgroundColor,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: bgOpacity,
          transform: `scale(${parallaxScale})`,
        }}
      >
        <MediaPlaceholder
          brand={brand}
          formatWidth={formatWidth}
          formatHeight={formatHeight}
          label=""
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 0,
            border: "none",
            background: `linear-gradient(165deg, ${accentColor}22 0%, ${backgroundColor} 40%, ${accentColor}12 100%)`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, transparent 40%, ${backgroundColor}cc 100%)`,
          opacity: bgOpacity,
        }}
      />
      <GrainOverlay grain={brand.effects.defaultGrain} />

      <BlockLayoutZone
        layout={{
          ...barZoneLayout,
          stackDirection: "column",
          contentZone: {
            ...layout.contentZone,
            justifyContent: isPortrait ? "flex-end" : "center",
            alignItems: "center",
            y: isPortrait ? layout.contentZone.y + layout.contentZone.height * 0.12 : layout.contentZone.y,
            height: isPortrait ? layout.contentZone.height * 0.38 : layout.contentZone.height,
          },
        }}
      >
        <div
          style={{
            width: `${barWidthFactor * 100}%`,
            maxWidth: layout.maxTextWidth,
            opacity: barOpacity,
            transform: `translate(${barTranslate.x}px, ${barTranslate.y}px) scale(${barScale})`,
            ...barEffect,
          }}
        >
          <PromptBar
            hintText={hintText}
            promptText={promptText}
            highlightPhrase={highlightPhrase}
            brand={brand}
            formatWidth={formatWidth}
            hintStyle={{
              ...(fittedHintCss ?? (hintType ? resolvedRoleToCss(hintType) : {})),
              color: brand.colors.muted,
            }}
            promptStyle={{
              ...(fittedPromptCss ?? (promptType ? resolvedRoleToCss(promptType) : {})),
              color: brand.colors.foreground,
            }}
            accentStyle={{
              ...(fittedPromptCss ?? (promptType ? resolvedRoleToCss(promptType) : {})),
              color: accentColor,
            }}
            typeProgress={typeOnEnabled ? getFadeOpacity(typeProgress) : 1}
          />
        </div>
      </BlockLayoutZone>
    </div>
  );
}
