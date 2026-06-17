import {
  clampFontSize,
  clampHeadlineText,
  resolveBlockSlotStyle,
  resolveFontStack,
  resolvedTypeStyleToCss,
} from "@/lib/typography";
import type { BrandPreset, MotionBlockInstance, MotionFormat } from "@/types";
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
  format: MotionFormat;
};

export function StatCardBlock({ brand, block, format }: StatCardBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;
  const { width: formatWidth, height: formatHeight } = format;

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
  const labelStyleName = brand.typography.defaults.labelStyle;

  const valueType = resolveBlockSlotStyle(
    brand.typography,
    format,
    "display",
    block.typographyOverride,
    "display",
  );
  const labelType = resolveBlockSlotStyle(
    brand.typography,
    format,
    labelStyleName,
    block.typographyOverride,
    "label",
  );
  const supportType = resolveBlockSlotStyle(
    brand.typography,
    format,
    "caption",
    block.typographyOverride,
    "caption",
  );

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
            ...resolvedTypeStyleToCss({
              ...valueType,
              fontSize: clampFontSize(valueType.fontSize * emphasis),
            }),
            color: brand.colors.accent,
            lineHeight: 1,
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
              ...resolvedTypeStyleToCss(labelType),
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
              ...resolvedTypeStyleToCss(supportType),
              color: brand.colors.muted,
              maxWidth: supportType.maxWidth ?? formatWidth * 0.65,
            }}
          >
            {clampHeadlineText(supportingText, 140)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
