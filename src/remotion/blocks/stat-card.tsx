import { clampFontSize, clampHeadlineText, resolveFontStack } from "@/lib/typography";
import { resolvedRoleToCss } from "@/lib/layout/typography-css";
import { resolveBlockLayoutFromInstance } from "@/lib/layout";
import type { BrandPreset, MotionBlockInstance, MotionFormat } from "@/types";
import { interpolate, useCurrentFrame } from "remotion";
import { getEasingFunction } from "@/lib/easing";
import { BlockLayoutZone } from "../BlockLayoutZone";
import {
  getEnterProgress,
  getFadeOpacity,
  getIntroTiming,
  getOutroOpacity,
  getTranslate,
  resolveBlockMotionParams,
} from "../shared-motion";
import { GrainOverlay, getTargetEffectStyle, mergeMotionAndEffectStyle } from "../effect-styles";
import { formatStatValue, parseStatValue } from "./stat-card-motion";

type StatCardBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  format: MotionFormat;
};

export function StatCardBlock({ brand, block, format }: StatCardBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;
  const { width: formatWidth, height: formatHeight } = format;

  const layout = resolveBlockLayoutFromInstance({ brand, block, format, includeLogo: false });

  const { direction, intensity, speed, stagger, entranceEasing, exitEasing } =
    resolveBlockMotionParams(brand, block);

  const rawValue = block.content.value ?? "10x";
  const label = block.content.label ?? "";
  const supportingText = block.content.supportingText ?? "";

  const parsed = parseStatValue(rawValue);
  const timing = getIntroTiming(duration, stagger, speed);
  const outroOpacity = getOutroOpacity(frame, duration, 0.1, exitEasing);

  const countStart = timing.primaryStart;
  const countFrames = Math.round(timing.enterFrames * 1.1);
  const countProgress = getEnterProgress(frame, countStart, countFrames, speed, entranceEasing);

  const labelProgress = getEnterProgress(
    frame,
    timing.secondaryStart,
    Math.round(timing.enterFrames * 0.8),
    speed,
    entranceEasing,
  );
  const supportProgress = getEnterProgress(
    frame,
    timing.tertiaryStart,
    Math.round(timing.enterFrames * 0.75),
    speed,
    entranceEasing,
  );

  const displayValue = parsed.isNumeric
    ? formatStatValue(
        parsed,
        interpolate(countProgress, [0, 1], [0, parsed.numericPart], {
          extrapolateRight: "clamp",
          easing: getEasingFunction(entranceEasing),
        }),
      )
    : rawValue;

  const valueOpacity = getFadeOpacity(countProgress) * outroOpacity;
  const labelOpacity = getFadeOpacity(labelProgress) * outroOpacity;
  const supportOpacity = getFadeOpacity(supportProgress) * outroOpacity;

  const valueTranslate = getTranslate(
    countProgress,
    direction,
    formatWidth,
    formatHeight,
    intensity,
  );
  const labelTranslate = getTranslate(
    labelProgress,
    "up",
    formatWidth,
    formatHeight,
    intensity === "hero" ? "standard" : intensity,
  );

  const emphasis = Number(block.motion.controls.emphasis ?? 1);

  const valueType = layout.slots.value ?? layout.typography.stat;
  const labelType = layout.slots.label;
  const supportType = layout.slots.supportingText ?? layout.slots.caption;

  const backgroundStyle = getTargetEffectStyle(brand, block, "background");
  const cardStyle = getTargetEffectStyle(brand, block, "card");
  const numberStyle = getTargetEffectStyle(brand, block, "number");
  const labelEffectStyle = getTargetEffectStyle(brand, block, "label");

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
          background: `radial-gradient(ellipse 60% 45% at 50% 50%, ${brand.colors.accent}14 0%, transparent 65%)`,
        }}
      />
      <GrainOverlay grain={brand.effects.defaultGrain} />

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
            padding: `${formatHeight * layout.padding * 0.6}px ${formatWidth * layout.padding * 0.5}px`,
            backgroundColor: `${brand.colors.foreground}06`,
            ...cardStyle,
          }}
        >
          {valueType ? (
            <div
              style={mergeMotionAndEffectStyle(
                {
                  opacity: valueOpacity,
                  transform: `translate(${valueTranslate.x}px, ${valueTranslate.y}px)`,
                },
                numberStyle,
              )}
            >
              <span
                style={{
                  ...resolvedRoleToCss({
                    ...valueType,
                    fontSize: clampFontSize(valueType.fontSize * emphasis),
                  }),
                  color: brand.colors.accent,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {displayValue}
              </span>
            </div>
          ) : null}

          {label && labelType ? (
            <div
              style={mergeMotionAndEffectStyle(
                {
                  opacity: labelOpacity,
                  transform: `translateY(${labelTranslate.y}px)`,
                },
                labelEffectStyle,
              )}
            >
              <span
                style={{
                  ...resolvedRoleToCss(labelType),
                  color: brand.colors.foreground,
                }}
              >
                {label}
              </span>
            </div>
          ) : null}

          {supportingText && supportType ? (
            <div
              style={{
                opacity: supportOpacity,
                ...resolvedRoleToCss(supportType),
                color: brand.colors.muted,
              }}
            >
              {clampHeadlineText(supportingText, 140)}
            </div>
          ) : null}
        </div>
      </BlockLayoutZone>
    </div>
  );
}
