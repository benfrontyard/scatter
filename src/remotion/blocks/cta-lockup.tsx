import type { BrandPreset, MotionBlockInstance } from "@/types";
import { useCurrentFrame } from "remotion";
import {
  getEnterProgress,
  getFadeOpacity,
  getIntroTiming,
  getOutroOpacity,
  getScale,
  getTranslate,
  parseMotionDirection,
  parseMotionIntensity,
  parseMotionSpeed,
} from "../shared-motion";

type CtaLockupBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  formatWidth: number;
  formatHeight: number;
};

export function CtaLockupBlock({
  brand,
  block,
  formatWidth,
  formatHeight,
}: CtaLockupBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;

  const direction = parseMotionDirection(block.motion.controls.direction);
  const intensity = parseMotionIntensity(block.motion.controls.intensity);
  const speed = parseMotionSpeed(block.motion.controls.speed);
  const stagger = Math.round(Number(block.motion.controls.stagger ?? 7));

  const message = block.content.message ?? "";
  const cta = block.content.cta ?? "Get started";
  const url = block.content.url ?? "";
  const logoText = block.content.logoText || "SCATTER";

  const timing = getIntroTiming(duration, stagger, speed);
  const outroOpacity = getOutroOpacity(frame, duration, 0.08);

  const messageProgress = getEnterProgress(
    frame,
    timing.primaryStart,
    Math.round(timing.enterFrames * 0.9),
    speed,
  );
  const ctaProgress = getEnterProgress(frame, timing.secondaryStart, timing.enterFrames, speed);
  const logoProgress = getEnterProgress(
    frame,
    timing.tertiaryStart,
    Math.round(timing.enterFrames * 0.8),
    speed,
  );

  const messageOpacity = getFadeOpacity(messageProgress) * outroOpacity;
  const ctaOpacity = getFadeOpacity(ctaProgress) * outroOpacity;
  const logoOpacity = getFadeOpacity(logoProgress) * outroOpacity;

  const messageTranslate = getTranslate(
    messageProgress,
    direction,
    formatWidth,
    formatHeight,
    intensity,
  );
  const ctaTranslate = getTranslate(ctaProgress, "up", formatWidth, formatHeight, intensity);
  const ctaScale = getScale(ctaProgress, intensity);

  const buttonScale = Number(block.motion.controls.buttonScale ?? 1);
  const messageSize = Math.round(formatHeight * 0.042);
  const ctaSize = Math.round(formatHeight * 0.03 * buttonScale);
  const logoSize = Math.round(formatHeight * 0.034);
  const urlSize = Math.round(formatHeight * 0.02);

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
          background: `radial-gradient(ellipse 75% 55% at 50% 60%, ${brand.colors.accent}16 0%, transparent 70%)`,
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
          gap: formatHeight * 0.035,
          textAlign: "center",
        }}
      >
        {message ? (
          <div
            style={{
              opacity: messageOpacity,
              transform: `translate(${messageTranslate.x}px, ${messageTranslate.y}px)`,
              fontFamily: brand.typography.headingFont,
              fontSize: messageSize,
              fontWeight: 600,
              lineHeight: 1.2,
              maxWidth: formatWidth * 0.75,
              letterSpacing: "-0.01em",
            }}
          >
            {message}
          </div>
        ) : null}

        <div
          style={{
            opacity: ctaOpacity,
            transform: `translateY(${ctaTranslate.y}px) scale(${ctaScale})`,
            padding: `${formatHeight * 0.018 * buttonScale}px ${formatWidth * 0.055 * buttonScale}px`,
            borderRadius: formatHeight * 0.012,
            backgroundColor: brand.colors.accent,
            color: brand.colors.background,
            fontSize: ctaSize,
            fontFamily: brand.typography.headingFont,
            fontWeight: 700,
            boxShadow: `0 ${formatHeight * 0.012}px ${formatHeight * 0.03}px ${brand.colors.accent}44`,
          }}
        >
          {cta}
        </div>

        <div
          style={{
            opacity: logoOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: formatHeight * 0.008,
            marginTop: formatHeight * 0.01,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: formatWidth * 0.012 }}>
            <div
              style={{
                width: logoSize * 0.5,
                height: logoSize * 0.5,
                borderRadius: logoSize * 0.1,
                backgroundColor: brand.colors.accent,
              }}
            />
            <span
              style={{
                fontFamily: brand.typography.headingFont,
                fontSize: logoSize,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: brand.colors.foreground,
              }}
            >
              {logoText}
            </span>
          </div>
          {url ? (
            <span style={{ fontSize: urlSize, color: brand.colors.muted }}>{url}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
