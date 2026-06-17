import type { BrandPreset, MotionBlockInstance } from "@/types";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import {
  getEnterProgress,
  getFadeOpacity,
  getIntroTiming,
  getOutroOpacity,
  getTranslate,
  parseMotionDirection,
  parseMotionIntensity,
  parseMotionSpeed,
} from "../shared-motion";
import { formatStatValue, parseStatValue } from "./stat-card-motion";

type StatCardBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  formatWidth: number;
  formatHeight: number;
};

export function StatCardBlock({ brand, block, formatWidth, formatHeight }: StatCardBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;

  const direction = parseMotionDirection(block.motion.controls.direction);
  const intensity = parseMotionIntensity(block.motion.controls.intensity);
  const speed = parseMotionSpeed(block.motion.controls.speed);
  const stagger = Math.round(Number(block.motion.controls.stagger ?? 8));

  const rawValue = block.content.value ?? "10x";
  const label = block.content.label ?? "";
  const supportingText = block.content.supportingText ?? "";

  const parsed = parseStatValue(rawValue);
  const timing = getIntroTiming(duration, stagger, speed);
  const outroOpacity = getOutroOpacity(frame, duration, 0.1);

  const countStart = timing.primaryStart;
  const countFrames = Math.round(timing.enterFrames * 1.1);
  const countProgress = getEnterProgress(frame, countStart, countFrames, speed);

  const labelProgress = getEnterProgress(
    frame,
    timing.secondaryStart,
    Math.round(timing.enterFrames * 0.8),
    speed,
  );
  const supportProgress = getEnterProgress(
    frame,
    timing.tertiaryStart,
    Math.round(timing.enterFrames * 0.75),
    speed,
  );

  const displayValue = parsed.isNumeric
    ? formatStatValue(
        parsed,
        interpolate(countProgress, [0, 1], [0, parsed.numericPart], {
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
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
  const valueSize = Math.round(formatHeight * 0.13 * emphasis);
  const labelSize = Math.round(formatHeight * 0.032);
  const supportSize = Math.round(formatHeight * 0.024);

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
            fontWeight: 700,
            color: brand.colors.accent,
            lineHeight: 1,
            letterSpacing: "-0.02em",
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
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
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
