import type { BrandPreset, MotionBlockInstance } from "@/types";
import { useCurrentFrame } from "remotion";
import {
  getEnterProgress,
  getFadeOpacity,
  getIntroTiming,
  getMaskReveal,
  getOutroOpacity,
  getScale,
  getTranslate,
  resolveBlockMotionParams,
} from "../shared-motion";

type LogoRevealBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  formatWidth: number;
  formatHeight: number;
};

export function LogoRevealBlock({
  brand,
  block,
  formatWidth,
  formatHeight,
}: LogoRevealBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;

  const { direction, intensity, speed, stagger, entranceEasing, exitEasing } =
    resolveBlockMotionParams(brand, block);

  const logoText = block.content.logoText || brand.name || "SCATTER";
  const tagline = block.content.tagline ?? "";

  const timing = getIntroTiming(duration, stagger, speed);
  const outroOpacity = getOutroOpacity(frame, duration, 0.12, exitEasing);

  const logoProgress = getEnterProgress(
    frame,
    timing.primaryStart,
    timing.enterFrames,
    speed,
    entranceEasing,
  );
  const taglineProgress = getEnterProgress(
    frame,
    timing.secondaryStart,
    Math.round(timing.enterFrames * 0.85),
    speed,
    entranceEasing,
  );

  const logoOpacity = getFadeOpacity(logoProgress) * outroOpacity;
  const taglineOpacity = getFadeOpacity(taglineProgress) * outroOpacity;
  const logoScale = getScale(logoProgress, intensity);
  const logoTranslate = getTranslate(
    logoProgress,
    direction,
    formatWidth,
    formatHeight,
    intensity,
  );
  const taglineTranslate = getTranslate(
    taglineProgress,
    "up",
    formatWidth,
    formatHeight,
    intensity === "hero" ? "standard" : intensity,
  );

  const logoSize = Math.round(formatHeight * 0.09);
  const taglineSize = Math.round(formatHeight * 0.028);
  const padding = formatHeight * 0.08;

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
          background: `radial-gradient(ellipse 70% 50% at 50% 40%, ${brand.colors.accent}18 0%, transparent 70%)`,
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
          padding: `${padding}px`,
          gap: formatHeight * 0.022,
          textAlign: "center",
        }}
      >
        <div
          style={{
            opacity: logoOpacity,
            transform: `translate(${logoTranslate.x}px, ${logoTranslate.y}px) scale(${logoScale})`,
            clipPath: getMaskReveal(logoProgress),
            display: "flex",
            alignItems: "center",
            gap: formatWidth * 0.014,
          }}
        >
          <div
            style={{
              width: logoSize * 0.55,
              height: logoSize * 0.55,
              borderRadius: logoSize * 0.12,
              backgroundColor: brand.colors.accent,
            }}
          />
          <span
            style={{
              fontFamily: brand.typography.headingFont,
              fontSize: logoSize,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: brand.colors.accent,
              lineHeight: 1,
            }}
          >
            {logoText}
          </span>
        </div>

        {tagline ? (
          <div
            style={{
              opacity: taglineOpacity,
              transform: `translateY(${taglineTranslate.y}px)`,
              fontSize: taglineSize,
              color: brand.colors.muted,
              letterSpacing: "0.04em",
              maxWidth: formatWidth * 0.7,
            }}
          >
            {tagline}
          </div>
        ) : null}
      </div>
    </div>
  );
}
