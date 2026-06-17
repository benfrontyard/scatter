import type { BrandPreset, MotionBlockInstance, ProjectTypography } from "@/types";
import {
  bodyWeight,
  headingWeight,
  scaleFontSize,
  trackingEm,
} from "@/lib/typography";
import { interpolate, useCurrentFrame } from "remotion";
import { getEasingFunction } from "@/lib/easing";
import {
  getEnterProgress,
  getFadeOpacity,
  getIntroTiming,
  getOutroOpacity,
  getTranslate,
  resolveBlockMotionParams,
} from "../shared-motion";
import { formatStatValue, parseStatValue } from "./stat-card-motion";

type StatCardBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  formatWidth: number;
  formatHeight: number;
  projectTypography?: ProjectTypography;
};

export function StatCardBlock({
  brand,
  block,
  formatWidth,
  formatHeight,
  projectTypography,
}: StatCardBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;

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
  const valueSize = scaleFontSize(Math.round(formatHeight * 0.13 * emphasis), projectTypography);
  const labelSize = scaleFontSize(Math.round(formatHeight * 0.032), projectTypography);
  const supportSize = scaleFontSize(Math.round(formatHeight * 0.024), projectTypography);

  return (
    <div
      style={{
        width: formatWidth,
        height: formatHeight,
        position: "relative",
        overflow: "hidden",
        fontFamily: brand.typography.bodyFont,
        color: brand.colors.foreground,
        backgroundColor: brand.colors.background,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 45% at 50% 50%, ${brand.colors.accent}14 0%, transparent 65%)`,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: formatHeight * 0.08,
          gap: formatHeight * 0.018,
          textAlign: "center",
        }}
      >
        <div
          style={{
            opacity: valueOpacity,
            transform: `translate(${valueTranslate.x}px, ${valueTranslate.y}px)`,
            fontFamily: brand.typography.headingFont,
            fontSize: valueSize,
            fontWeight: headingWeight(projectTypography),
            color: brand.colors.accent,
            lineHeight: 1,
            letterSpacing: trackingEm("-0.02em", projectTypography),
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {displayValue}
        </div>

        {label ? (
          <div
            style={{
              opacity: labelOpacity,
              transform: `translateY(${labelTranslate.y}px)`,
              fontSize: labelSize,
              fontWeight: bodyWeight(projectTypography),
              textTransform: "uppercase",
              letterSpacing: trackingEm("0.1em", projectTypography),
              color: brand.colors.foreground,
            }}
          >
            {label}
          </div>
        ) : null}

        {supportingText ? (
          <div
            style={{
              opacity: supportOpacity,
              fontSize: supportSize,
              color: brand.colors.muted,
              maxWidth: formatWidth * 0.65,
              lineHeight: 1.45,
            }}
          >
            {supportingText}
          </div>
        ) : null}
      </div>
    </div>
  );
}
