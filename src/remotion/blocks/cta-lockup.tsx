import {
  clampHeadlineText,
  resolveBlockSlotStyle,
  resolveFontStack,
  resolvedTypeStyleToCss,
} from "@/lib/typography";
import type { BrandPreset, MotionBlockInstance, MotionFormat } from "@/types";
import { useCurrentFrame } from "remotion";
import {
  getEnterProgress,
  getFadeOpacity,
  getIntroTiming,
  getOutroOpacity,
  getScale,
  getTranslate,
  resolveBlockMotionParams,
} from "../shared-motion";
import { GrainOverlay, getTargetEffectStyle, mergeMotionAndEffectStyle } from "../effect-styles";

type CtaLockupBlockProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  format: MotionFormat;
};

export function CtaLockupBlock({ brand, block, format }: CtaLockupBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;
  const { width: formatWidth, height: formatHeight } = format;

  const { direction, intensity, speed, stagger, entranceEasing, exitEasing } =
    resolveBlockMotionParams(brand, block);

  const message = block.content.message ?? "";
  const cta = block.content.cta ?? "Get started";
  const url = block.content.url ?? "";
  const logoText = block.content.logoText || "SCATTER";

  const timing = getIntroTiming(duration, stagger, speed);
  const outroOpacity = getOutroOpacity(frame, duration, 0.08, exitEasing);

  const messageProgress = getEnterProgress(
    frame,
    timing.primaryStart,
    Math.round(timing.enterFrames * 0.9),
    speed,
    entranceEasing,
  );
  const ctaProgress = getEnterProgress(
    frame,
    timing.secondaryStart,
    timing.enterFrames,
    speed,
    entranceEasing,
  );
  const logoProgress = getEnterProgress(
    frame,
    timing.tertiaryStart,
    Math.round(timing.enterFrames * 0.8),
    speed,
    entranceEasing,
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

  const messageType = resolveBlockSlotStyle(
    brand.typography,
    format,
    "title",
    block.typographyOverride,
    "headline",
  );
  const ctaType = resolveBlockSlotStyle(
    brand.typography,
    format,
    "label",
    block.typographyOverride,
    "title",
  );
  const logoType = resolveBlockSlotStyle(
    brand.typography,
    format,
    brand.typography.defaults.labelStyle,
    block.typographyOverride,
    "label",
  );
  const urlType = resolveBlockSlotStyle(
    brand.typography,
    format,
    "caption",
    block.typographyOverride,
    "caption",
  );

  const logoSize = logoType.fontSize;

  const backgroundStyle = getTargetEffectStyle(brand, block, "background");
  const cardStyle = getTargetEffectStyle(brand, block, "card");
  const ctaEffectStyle = getTargetEffectStyle(brand, block, "cta");
  const logoEffectStyle = getTargetEffectStyle(brand, block, "logo");

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
          background: `radial-gradient(ellipse 75% 55% at 50% 60%, ${brand.colors.accent}16 0%, transparent 70%)`,
        }}
      />
      <GrainOverlay grain={brand.effects.defaultGrain} />

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
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: formatHeight * 0.035,
            textAlign: "center",
            padding: `${formatHeight * 0.04}px ${formatWidth * 0.06}px`,
            maxWidth: formatWidth * 0.82,
            backgroundColor: `${brand.colors.foreground}04`,
            ...cardStyle,
          }}
        >
          {message ? (
            <div
              style={{
                opacity: messageOpacity,
                transform: `translate(${messageTranslate.x}px, ${messageTranslate.y}px)`,
              }}
            >
              <span
                style={{
                  ...resolvedTypeStyleToCss(messageType),
                  maxWidth: messageType.maxWidth ?? formatWidth * 0.75,
                }}
              >
                {clampHeadlineText(message, 100)}
              </span>
            </div>
          ) : null}

          <div
            style={mergeMotionAndEffectStyle(
              {
                opacity: ctaOpacity,
                transform: `translateY(${ctaTranslate.y}px) scale(${ctaScale})`,
                padding: `${formatHeight * 0.018 * buttonScale}px ${formatWidth * 0.055 * buttonScale}px`,
                backgroundColor: brand.colors.accent,
                color: brand.colors.background,
              },
              ctaEffectStyle,
            )}
          >
            <span
              style={{
                ...resolvedTypeStyleToCss({
                  ...ctaType,
                  fontSize: ctaType.fontSize * buttonScale,
                }),
              }}
            >
              {cta}
            </span>
          </div>
        </div>

        <div
          style={mergeMotionAndEffectStyle(
            {
              opacity: logoOpacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: formatHeight * 0.008,
              marginTop: formatHeight * 0.04,
            },
            logoEffectStyle,
          )}
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
                ...resolvedTypeStyleToCss(logoType),
                color: brand.colors.foreground,
              }}
            >
              {logoText}
            </span>
          </div>
          {url ? (
            <span style={{ ...resolvedTypeStyleToCss(urlType), color: brand.colors.muted }}>{url}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
