import { clampHeadlineText } from "@/lib/typography";
import { fitResolvedRoleToCss } from "@/lib/layout/fit-text";
import { resolvedRoleToCss } from "@/lib/layout/typography-css";
import { resolveBlockLayoutFromInstance } from "@/lib/layout";
import type { BrandPreset, MotionBlockInstance, MotionFormat } from "@/types";
import { useCurrentFrame } from "remotion";
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
import { StepRail, VoidStage } from "./wave1/primitives";
import { applyStatWrapper, resolveStatDisplay } from "./wave1/stat-wrapper";

type BigStatProofBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  format: MotionFormat;
};

export function BigStatProofBlock({ brand, block, format }: BigStatProofBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;
  const { width: formatWidth, height: formatHeight } = format;

  const layout = resolveBlockLayoutFromInstance({ brand, block, format, includeLogo: false });

  const { direction, intensity, speed, stagger, entranceEasing, exitEasing } =
    resolveBlockMotionParams(brand, block);

  const statValue = block.content.statValue ?? block.content.value ?? "50%";
  const statWrapper =
    block.content.statWrapper ??
    "You get {stat} of that revenue for the first year";
  const stepLabel = block.content.stepLabel ?? "";
  const showStepRail = block.content.showStepRail === "true";
  const countUpEnabled = block.motion.controls.countUp !== "false";

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

  const countStart = timing.primaryStart;
  const countFrames = Math.round(timing.enterFrames * 1.15);
  const countProgress = countUpEnabled
    ? getEnterProgress(frame, countStart, countFrames, speed, entranceEasing)
    : 1;

  const wrapperProgress = useBlockEnterProgress(
    timing.primaryStart,
    Math.round(timing.enterFrames * 0.9),
    speed,
    entranceEasing,
  );
  const heroTransform = useHandoffHeroTransform(
    "stat-center",
    wrapperProgress,
    formatWidth,
    formatHeight,
  );
  const railProgress = getEnterProgress(
    frame,
    0,
    Math.round(timing.enterFrames * 0.7),
    speed,
    entranceEasing,
  );

  const statDisplay = resolveStatDisplay(statValue, countProgress, entranceEasing);
  const displayText = applyStatWrapper(statWrapper, statDisplay);

  const wrapperOpacity = getFadeOpacity(wrapperProgress) * outroOpacity;
  const wrapperScale = getScaleWithSettle(wrapperProgress, intensity);
  const railOpacity = getFadeOpacity(railProgress) * outroOpacity;
  const wrapperTranslate = getTranslate(
    wrapperProgress,
    direction,
    formatWidth,
    formatHeight,
    intensity,
  );
  const scaledWrapperX = wrapperTranslate.x * heroTransform.travelScale;
  const scaledWrapperY = wrapperTranslate.y * heroTransform.travelScale;

  const wrapperType = layout.slots.statWrapper ?? layout.typography.heading;
  const stepType = layout.slots.stepLabel ?? layout.typography.label;
  const headlineEffect = getTargetEffectStyle(brand, block, "headline");

  if (!wrapperType) return null;

  const isPortrait = formatHeight > formatWidth;
  const fittedWrapperCss = fitResolvedRoleToCss(
    {
      ...wrapperType,
      fontSize: wrapperType.fontSize * 1.05,
    },
    clampHeadlineText(displayText, 120),
    {
      containerWidth: layout.maxTextWidth,
      maxLines: isPortrait ? 4 : 3,
    },
  );

  return (
    <VoidStage brand={brand} formatWidth={formatWidth} formatHeight={formatHeight} glowStrength={0.05}>
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

      <BlockLayoutZone layout={layout}>
        <div
          style={mergeMotionAndEffectStyle(
            {
              opacity: wrapperOpacity,
              transform: `translate(${scaledWrapperX + handoffExit.x + heroTransform.x}px, ${scaledWrapperY + handoffExit.y + heroTransform.y}px) scale(${wrapperScale * heroTransform.scale})`,
              textAlign: layout.alignment,
              width: "100%",
              maxWidth: layout.maxTextWidth,
            },
            headlineEffect,
          )}
        >
          <span
            style={{
              ...fittedWrapperCss,
              color: brand.colors.foreground,
            }}
          >
            {clampHeadlineText(displayText, 120)}
          </span>
        </div>
      </BlockLayoutZone>
    </VoidStage>
  );
}
