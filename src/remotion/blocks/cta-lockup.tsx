import { clampHeadlineText, resolveFontStack } from "@/lib/typography";
import { resolvedRoleToCss } from "@/lib/layout/typography-css";
import { resolveBlockLayoutFromInstance } from "@/lib/layout";
import type { BrandPreset, MotionBlockInstance, MotionFormat, ProjectAsset } from "@/types";
import { useCurrentFrame } from "remotion";
import { BrandLogoMark } from "../BrandLogoMark";
import { BlockLayoutZone } from "../BlockLayoutZone";
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
  assets?: ProjectAsset[];
};

export function CtaLockupBlock({ brand, block, format, assets = [] }: CtaLockupBlockProps) {
  const frame = useCurrentFrame();
  const duration = block.duration;
  const { width: formatWidth, height: formatHeight } = format;

  const layout = resolveBlockLayoutFromInstance({ brand, block, format, includeLogo: true });

  const { direction, intensity, speed, stagger, entranceEasing, exitEasing } =
    resolveBlockMotionParams(brand, block);

  const message = block.content.message ?? "";
  const cta = block.content.cta ?? "Get started";
  const url = block.content.url ?? "";
  const logoText = block.content.logoText || brand.logos.textFallback || "SCATTER";

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

  const messageType = layout.slots.message ?? layout.slots.headline;
  const ctaType = layout.slots.cta ?? layout.slots.title;
  const logoType = layout.slots.logoText ?? layout.slots.label;
  const urlType = layout.slots.url ?? layout.slots.caption;
  const logoPlacement = layout.logo;

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

      <BlockLayoutZone layout={layout}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: layout.gap,
            textAlign: layout.alignment,
            width: "100%",
            maxWidth: layout.maxTextWidth,
            padding: `${formatHeight * layout.padding * 0.5}px ${formatWidth * layout.padding * 0.4}px`,
            backgroundColor: `${brand.colors.foreground}04`,
            ...cardStyle,
          }}
        >
          {message && messageType ? (
            <div
              style={{
                opacity: messageOpacity,
                transform: `translate(${messageTranslate.x}px, ${messageTranslate.y}px)`,
              }}
            >
              <span style={resolvedRoleToCss(messageType)}>
                {clampHeadlineText(message, 100)}
              </span>
            </div>
          ) : null}

          {cta && ctaType ? (
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
                  ...resolvedRoleToCss({
                    ...ctaType,
                    fontSize: ctaType.fontSize * buttonScale,
                  }),
                }}
              >
                {cta}
              </span>
            </div>
          ) : null}
        </div>

        {logoPlacement ? (
          <div
            style={mergeMotionAndEffectStyle(
              {
                opacity: logoOpacity,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: formatHeight * 0.008,
                marginTop: layout.gap,
              },
              logoEffectStyle,
            )}
          >
            <BrandLogoMark
              brand={brand}
              placement={logoPlacement}
              assets={assets}
              textFallback={logoText}
              textStyle={logoType}
            />
            {url && urlType ? (
              <span style={{ ...resolvedRoleToCss(urlType), color: brand.colors.muted }}>
                {url}
              </span>
            ) : null}
          </div>
        ) : null}
      </BlockLayoutZone>
    </div>
  );
}
