import { clampHeadlineText } from "@/lib/typography";
import { fitResolvedRoleToCss } from "@/lib/layout/fit-text";
import { resolvedRoleToCss } from "@/lib/layout/typography-css";
import { resolveBlockLayoutFromInstance } from "@/lib/layout";
import type { BrandPreset, MotionBlockInstance, MotionFormat } from "@/types";
import { useCurrentFrame } from "remotion";
import {
  getEnterProgress,
  getFadeOpacity,
  getIntroTiming,
  getScaleWithSettle,
  getTranslate,
  resolveBlockMotionParams,
} from "../shared-motion";
import { useBlockEnterProgress, useBlockOutroOpacity, useHandoffExitOffset, useHandoffHeroTransform } from "../block-sequence-context";
import { getTargetEffectStyle } from "../effect-styles";
import { CardChrome, StepRail, VoidStage } from "./wave1/primitives";

type CenteredUiFeatureBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  format: MotionFormat;
};

export function CenteredUiFeatureBlock({
  brand,
  block,
  format,
}: CenteredUiFeatureBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;
  const { width: formatWidth, height: formatHeight } = format;

  const layout = resolveBlockLayoutFromInstance({ brand, block, format, includeLogo: false });

  const { intensity, speed, stagger, entranceEasing, exitEasing, direction } =
    resolveBlockMotionParams(brand, block);

  const headline = block.content.headline ?? "Create Image";
  const body = block.content.body ?? "Describe what you want to generate.";
  const inputText = block.content.inputText ?? "A website for my brand";
  const cta = block.content.cta ?? "Create";
  const stepLabel = block.content.stepLabel ?? "";
  const showStepRail = block.content.showStepRail !== "false";
  const typeOnEnabled = block.motion.controls.typeOn !== "false";

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

  const headlineProgress = getEnterProgress(
    frame,
    timing.primaryStart,
    Math.round(timing.enterFrames * 0.75),
    speed,
    entranceEasing,
  );
  const bodyProgress = getEnterProgress(
    frame,
    timing.secondaryStart,
    Math.round(timing.enterFrames * 0.85),
    speed,
    entranceEasing,
  );
  const cardProgress = useBlockEnterProgress(
    timing.primaryStart + Math.round(stagger * 0.75),
    timing.enterFrames,
    speed,
    entranceEasing,
  );
  const heroTransform = useHandoffHeroTransform(
    "ui-card",
    cardProgress,
    formatWidth,
    formatHeight,
  );
  const inputProgress = getEnterProgress(
    frame,
    timing.secondaryStart + Math.round(stagger * 0.5),
    Math.round(timing.enterFrames * 1.1),
    speed,
    entranceEasing,
  );
  const ctaProgress = getEnterProgress(
    frame,
    timing.tertiaryStart,
    Math.round(timing.enterFrames * 0.8),
    speed,
    entranceEasing,
  );
  const railProgress = getEnterProgress(
    frame,
    0,
    Math.round(timing.enterFrames * 0.65),
    speed,
    entranceEasing,
  );

  const cardOpacity = getFadeOpacity(cardProgress) * outroOpacity;
  const cardScale = getScaleWithSettle(cardProgress, intensity) * heroTransform.scale;
  const headlineOpacity = getFadeOpacity(headlineProgress) * outroOpacity;
  const headlineTranslate = getTranslate(
    headlineProgress,
    "up",
    formatWidth,
    formatHeight,
    intensity,
  );
  const bodyOpacity = getFadeOpacity(bodyProgress) * outroOpacity;
  const bodyTranslate = getTranslate(
    bodyProgress,
    "up",
    formatWidth,
    formatHeight,
    "subtle",
  );
  const ctaOpacity = getFadeOpacity(ctaProgress) * outroOpacity;
  const railOpacity = getFadeOpacity(railProgress) * outroOpacity;
  const ctaTranslate = getTranslate(
    ctaProgress,
    "up",
    formatWidth,
    formatHeight,
    intensity === "hero" ? "standard" : intensity,
  );

  const typeProgress = typeOnEnabled ? getFadeOpacity(inputProgress) : 1;
  const visibleInput = typeOnEnabled
    ? inputText.slice(0, Math.max(0, Math.round(inputText.length * typeProgress)))
    : inputText;

  const headlineType = layout.slots.headline ?? layout.typography.heading;
  const bodyType = layout.slots.body ?? layout.typography.body;
  const inputType = layout.slots.inputText ?? layout.typography.body;
  const ctaType = layout.slots.cta ?? layout.typography.label;
  const stepType = layout.slots.stepLabel ?? layout.typography.caption;
  const cardEffect = getTargetEffectStyle(brand, block, "card");

  const cardPadding = formatWidth * 0.036;
  const cardWidth = formatWidth >= formatHeight ? "68%" : "88%";
  const fittedHeadlineCss =
    headlineType
      ? fitResolvedRoleToCss(headlineType, clampHeadlineText(headline, 48), {
          containerWidth: layout.maxTextWidth * 0.92,
          maxLines: formatHeight > formatWidth ? 3 : 2,
        })
      : null;
  const fittedBodyCss =
    body && bodyType
      ? fitResolvedRoleToCss(bodyType, clampHeadlineText(body, 120), {
          containerWidth: layout.maxTextWidth * 0.92,
          maxLines: 4,
        })
      : null;

  return (
    <VoidStage
      brand={brand}
      formatWidth={formatWidth}
      formatHeight={formatHeight}
      glowStrength={0.07}
    >
      {showStepRail && stepLabel ? (
        <StepRail
          label={stepLabel}
          style={{
            ...resolvedRoleToCss(stepType!),
            color: brand.colors.muted,
          }}
          opacity={railOpacity}
          formatWidth={formatWidth}
        />
      ) : null}

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: layout.padding,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: layout.maxTextWidth,
            transform: `translate(${handoffExit.x + heroTransform.x}px, ${handoffExit.y + heroTransform.y}px)`,
          }}
        >
          <CardChrome
            brand={brand}
            formatWidth={formatWidth}
            opacity={cardOpacity}
            scale={cardScale}
            width={cardWidth}
            style={cardEffect}
          >
            <div
              style={{
                padding: cardPadding,
                display: "flex",
                flexDirection: "column",
                gap: layout.gap * 0.85,
                textAlign: layout.alignment,
              }}
            >
              {headlineType && fittedHeadlineCss ? (
                <div
                  style={{
                    opacity: headlineOpacity,
                    transform: `translateY(${headlineTranslate.y}px)`,
                    ...fittedHeadlineCss,
                    color: brand.colors.foreground,
                  }}
                >
                  {clampHeadlineText(headline, 48)}
                </div>
              ) : null}

              {body && fittedBodyCss ? (
                <div
                  style={{
                    opacity: bodyOpacity,
                    transform: `translateY(${bodyTranslate.y}px)`,
                    ...fittedBodyCss,
                    color: brand.colors.muted,
                  }}
                >
                  {clampHeadlineText(body, 120)}
                </div>
              ) : null}

              {inputType ? (
                <div
                  style={{
                    padding: `${layout.gap * 0.35}px ${layout.gap * 0.5}px`,
                    borderRadius: layout.gap * 0.2,
                    border: `1px solid ${brand.colors.foreground}18`,
                    background: `${brand.colors.foreground}06`,
                    ...resolvedRoleToCss(inputType),
                    color: brand.colors.foreground,
                    minHeight: layout.gap * 1.4,
                  }}
                >
                  {visibleInput}
                  {typeOnEnabled && typeProgress < 1 ? (
                    <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>|</span>
                  ) : null}
                </div>
              ) : null}

              {cta && ctaType ? (
                <div
                  style={{
                    opacity: ctaOpacity,
                    transform: `translateY(${ctaTranslate.y}px)`,
                    alignSelf: layout.alignment === "center" ? "center" : "flex-start",
                    padding: `${layout.gap * 0.32}px ${layout.gap * 0.85}px`,
                    borderRadius: layout.gap * 0.22,
                    backgroundColor: brand.colors.accent,
                    color: brand.colors.background,
                    ...resolvedRoleToCss(ctaType),
                  }}
                >
                  {clampHeadlineText(cta, 24)}
                </div>
              ) : null}
            </div>
          </CardChrome>
        </div>
      </div>
    </VoidStage>
  );
}
