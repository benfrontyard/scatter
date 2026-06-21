import { clampHeadlineText } from "@/lib/typography";
import { fitResolvedRoleToCss } from "@/lib/layout/fit-text";
import { resolveBlockLayoutFromInstance } from "@/lib/layout";
import type { BrandPreset, MotionBlockInstance, MotionFormat } from "@/types";
import { useCurrentFrame } from "remotion";
import { BlockLayoutZone } from "../BlockLayoutZone";
import {
  getEnterProgress,
  getFadeOpacity,
  getIntroTiming,
  getOutroOpacity,
  getTranslate,
  resolveBlockMotionParams,
} from "../shared-motion";
import { getTargetEffectStyle, mergeMotionAndEffectStyle } from "../effect-styles";
import { AccentHeadline, VoidStage } from "./wave1/primitives";

type EditorialStatementBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  format: MotionFormat;
};

export function EditorialStatementBlock({
  brand,
  block,
  format,
}: EditorialStatementBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;
  const { width: formatWidth, height: formatHeight } = format;

  const layout = resolveBlockLayoutFromInstance({ brand, block, format, includeLogo: false });

  const { direction, intensity, speed, stagger, entranceEasing, exitEasing } =
    resolveBlockMotionParams(brand, block);

  const headline = block.content.headline ?? "You can make serious money.";
  const subhead = block.content.subhead ?? "";
  const accentWord = block.content.accentWord ?? "";
  const glowAccent = block.motion.controls.glowAccent !== "false";

  const timing = getIntroTiming(duration, stagger, speed);
  const outroOpacity = getOutroOpacity(frame, duration, 0.1, exitEasing);

  const headlineProgress = getEnterProgress(
    frame,
    timing.primaryStart,
    timing.enterFrames,
    speed,
    entranceEasing,
  );
  const subheadProgress = getEnterProgress(
    frame,
    timing.secondaryStart,
    Math.round(timing.enterFrames * 0.85),
    speed,
    entranceEasing,
  );
  const accentDelay = Math.round(timing.enterFrames * 0.35);
  const accentProgress = getEnterProgress(
    frame,
    timing.primaryStart + accentDelay,
    Math.round(timing.enterFrames * 0.65),
    speed,
    entranceEasing,
  );

  const headlineOpacity = getFadeOpacity(headlineProgress) * outroOpacity;
  const subheadOpacity = getFadeOpacity(subheadProgress) * outroOpacity;
  const headlineTranslate = getTranslate(
    headlineProgress,
    direction,
    formatWidth,
    formatHeight,
    intensity,
  );

  const headlineType = layout.slots.headline ?? layout.typography.display ?? layout.typography.heading;
  const subheadType = layout.slots.subhead ?? layout.typography.body;
  const headlineEffect = getTargetEffectStyle(brand, block, "headline");

  if (!headlineType) return null;

  const displayHeadline = clampHeadlineText(headline, 60);
  const isPortrait = formatHeight > formatWidth;
  const fittedHeadlineCss = fitResolvedRoleToCss(headlineType, displayHeadline, {
    containerWidth: layout.maxTextWidth,
    maxLines: isPortrait ? 3 : 2,
  });
  const fittedSubheadCss =
    subhead && subheadType
      ? fitResolvedRoleToCss(subheadType, clampHeadlineText(subhead, 90), {
          containerWidth: layout.maxTextWidth,
          maxLines: isPortrait ? 3 : 2,
        })
      : null;

  return (
    <VoidStage
      brand={brand}
      formatWidth={formatWidth}
      formatHeight={formatHeight}
      glowStrength={accentWord ? 0.06 : 0.04}
    >
      <BlockLayoutZone layout={layout}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: layout.gap,
            textAlign: layout.alignment,
            width: "100%",
            maxWidth: layout.maxTextWidth,
          }}
        >
          <div
            style={mergeMotionAndEffectStyle(
              {
                opacity: headlineOpacity,
                transform: `translate(${headlineTranslate.x}px, ${headlineTranslate.y}px)`,
              },
              headlineEffect,
            )}
          >
            <AccentHeadline
              text={displayHeadline}
              accentWord={accentWord}
              baseStyle={{
                ...fittedHeadlineCss,
                color: brand.colors.foreground,
              }}
              accentStyle={{
                ...fittedHeadlineCss,
                color: brand.colors.accent,
              }}
              glowAccent={glowAccent}
              accentOpacity={getFadeOpacity(accentProgress)}
            />
          </div>

          {subhead && fittedSubheadCss ? (
            <div
              style={{
                opacity: subheadOpacity,
                ...fittedSubheadCss,
                color: brand.colors.muted,
              }}
            >
              {clampHeadlineText(subhead, 90)}
            </div>
          ) : null}
        </div>
      </BlockLayoutZone>
    </VoidStage>
  );
}
