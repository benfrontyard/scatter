import { resolveFontStack } from "@/lib/typography";
import type { BrandPreset } from "@/types";
import type { CSSProperties, ReactNode } from "react";
import { GrainOverlay } from "../../effect-styles";

type VoidStageProps = {
  brand: BrandPreset;
  formatWidth: number;
  formatHeight: number;
  /** 0–1 glow strength at center */
  glowStrength?: number;
  children: ReactNode;
  style?: CSSProperties;
};

/** Minimal void background — styleframe study reference for editorial beats. */
export function VoidStage({
  brand,
  formatWidth,
  formatHeight,
  glowStrength = 0.08,
  children,
  style,
}: VoidStageProps) {
  const bg =
    brand.colors.background && brand.colors.background !== "transparent"
      ? brand.colors.background
      : "#000000";

  return (
    <div
      style={{
        width: formatWidth,
        height: formatHeight,
        position: "relative",
        overflow: "hidden",
        fontFamily: resolveFontStack(brand.typography, "body"),
        color: brand.colors.foreground,
        backgroundColor: bg,
        ...style,
      }}
    >
      {glowStrength > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 55% 40% at 50% 50%, ${brand.colors.accent}${Math.round(glowStrength * 100)
              .toString(16)
              .padStart(2, "0")} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      ) : null}
      <GrainOverlay grain={brand.effects.defaultGrain} />
      {children}
    </div>
  );
}

type AccentHeadlineProps = {
  text: string;
  accentWord?: string;
  baseStyle: CSSProperties;
  accentStyle: CSSProperties;
  glowAccent?: boolean;
  accentOpacity?: number;
};

/** Renders headline with one inline accent word (color + optional glow). */
export function AccentHeadline({
  text,
  accentWord,
  baseStyle,
  accentStyle,
  glowAccent = true,
  accentOpacity = 1,
}: AccentHeadlineProps) {
  const trimmedAccent = accentWord?.trim();
  if (!trimmedAccent) {
    return <span style={{ ...baseStyle, display: "block", width: "100%" }}>{text}</span>;
  }

  const lowerText = text.toLowerCase();
  const lowerAccent = trimmedAccent.toLowerCase();
  const index = lowerText.indexOf(lowerAccent);

  if (index === -1) {
    return <span style={{ ...baseStyle, display: "block", width: "100%" }}>{text}</span>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + trimmedAccent.length);
  const after = text.slice(index + trimmedAccent.length);

  return (
    <span style={{ ...baseStyle, display: "block", width: "100%" }}>
      {before}
      <span
        style={{
          ...accentStyle,
          opacity: accentOpacity,
          ...(glowAccent
            ? {
                textShadow: `0 0 24px ${accentStyle.color ?? "currentColor"}66, 0 0 48px ${accentStyle.color ?? "currentColor"}33`,
              }
            : {}),
        }}
      >
        {match}
      </span>
      {after}
    </span>
  );
}

type StepRailProps = {
  label: string;
  style: CSSProperties;
  opacity: number;
  formatWidth: number;
};

export function StepRail({ label, style, opacity, formatWidth }: StepRailProps) {
  if (!label.trim()) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        padding: `${formatWidth * 0.04}px ${formatWidth * 0.06}px`,
        opacity,
        pointerEvents: "none",
      }}
    >
      <span style={style}>{label}</span>
    </div>
  );
}

type CardChromeProps = {
  children: ReactNode;
  brand: BrandPreset;
  formatWidth: number;
  opacity?: number;
  scale?: number;
  width?: number | string;
  style?: CSSProperties;
};

/** Floating UI card shell — styleframe reference for centered-ui-feature. */
export function CardChrome({
  children,
  brand,
  formatWidth,
  opacity = 1,
  scale = 1,
  width = "100%",
  style,
}: CardChromeProps) {
  const radius = Math.max(formatWidth * 0.018, 8);
  const borderColor = `${brand.colors.foreground}18`;

  return (
    <div
      style={{
        width,
        opacity,
        transform: `scale(${scale})`,
        borderRadius: radius,
        border: `1px solid ${borderColor}`,
        background: `linear-gradient(165deg, ${brand.colors.foreground}0a 0%, ${brand.colors.background}ee 45%, ${brand.colors.foreground}06 100%)`,
        boxShadow: `0 ${formatWidth * 0.012}px ${formatWidth * 0.04}px ${brand.colors.background}88`,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type PromptBarProps = {
  hintText?: string;
  promptText: string;
  highlightPhrase?: string;
  brand: BrandPreset;
  formatWidth: number;
  hintStyle: CSSProperties;
  promptStyle: CSSProperties;
  accentStyle: CSSProperties;
  opacity?: number;
  scale?: number;
  /** 0–1 type-on progress for prompt text */
  typeProgress?: number;
};

function renderHighlightedPrompt(
  text: string,
  highlight: string | undefined,
  baseStyle: CSSProperties,
  accentStyle: CSSProperties,
) {
  const trimmed = highlight?.trim();
  if (!trimmed) return <span style={baseStyle}>{text}</span>;

  const index = text.toLowerCase().indexOf(trimmed.toLowerCase());
  if (index === -1) return <span style={baseStyle}>{text}</span>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + trimmed.length);
  const after = text.slice(index + trimmed.length);

  return (
    <span style={baseStyle}>
      {before}
      <span style={accentStyle}>{match}</span>
      {after}
    </span>
  );
}

/** Search / AI prompt bar — styleframe reference for hero-prompt-bar. */
export function PromptBar({
  hintText,
  promptText,
  highlightPhrase,
  brand,
  formatWidth,
  hintStyle,
  promptStyle,
  accentStyle,
  opacity = 1,
  scale = 1,
  typeProgress = 1,
}: PromptBarProps) {
  const radius = Math.max(formatWidth * 0.014, 6);
  const padding = formatWidth * 0.028;
  const visibleChars = Math.max(0, Math.round(promptText.length * typeProgress));
  const visiblePrompt = promptText.slice(0, visibleChars);

  return (
    <div
      style={{
        width: "100%",
        opacity,
        transform: `scale(${scale})`,
        borderRadius: radius,
        border: `1px solid ${brand.colors.foreground}22`,
        background: `${brand.colors.background}dd`,
        backdropFilter: "blur(12px)",
        padding: `${padding * 1.1}px ${padding * 1.4}px`,
        display: "flex",
        flexDirection: "column",
        gap: padding * 0.35,
        boxShadow: `0 ${formatWidth * 0.008}px ${formatWidth * 0.024}px ${brand.colors.background}66`,
      }}
    >
      {hintText ? <span style={hintStyle}>{hintText}</span> : null}
      <div style={{ display: "flex", alignItems: "center", gap: padding * 0.4 }}>
        {renderHighlightedPrompt(visiblePrompt, highlightPhrase, promptStyle, accentStyle)}
      </div>
    </div>
  );
}

type MediaPlaceholderProps = {
  brand: BrandPreset;
  formatWidth: number;
  formatHeight: number;
  label?: string;
  labelStyle?: CSSProperties;
  opacity?: number;
  scale?: number;
  style?: CSSProperties;
};

/** Generic screenshot / media placeholder with icon. */
export function MediaPlaceholder({
  brand,
  formatWidth,
  formatHeight,
  label = "Screenshot",
  labelStyle,
  opacity = 1,
  scale = 1,
  style,
}: MediaPlaceholderProps) {
  const accentColor = brand.colors.accent;
  const bg = brand.colors.background;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: formatHeight * 0.012,
        overflow: "hidden",
        background: `linear-gradient(145deg, ${accentColor}18 0%, ${bg} 50%, ${accentColor}0d 100%)`,
        borderRadius: Math.max(formatWidth * 0.012, 6),
        border: `1px solid ${brand.colors.foreground}12`,
        ...style,
      }}
    >
      <svg
        width={formatHeight * 0.055}
        height={formatHeight * 0.055}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
      >
        <rect x="4" y="8" width="40" height="32" rx="4" stroke={accentColor} strokeWidth="2" />
        <circle cx="16" cy="20" r="4" fill={accentColor} opacity="0.6" />
        <path
          d="M8 32 L18 24 L26 30 L34 22 L40 28"
          stroke={accentColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
      </svg>
      {labelStyle ? <span style={labelStyle}>{label}</span> : null}
    </div>
  );
}

type DofBlurLayerProps = {
  blurPx: number;
  children: ReactNode;
  style?: CSSProperties;
};

/** Applies depth-of-field blur to satellite collage cards. */
export function DofBlurLayer({ blurPx, children, style }: DofBlurLayerProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        filter: blurPx > 0.5 ? `blur(${blurPx}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type CollageCardProps = {
  brand: BrandPreset;
  formatWidth: number;
  formatHeight: number;
  title: string;
  body?: string;
  titleStyle: CSSProperties;
  bodyStyle?: CSSProperties;
  opacity?: number;
  scale?: number;
  blurPx?: number;
  isHero?: boolean;
  style?: CSSProperties;
};

/** Single collage card with optional DOF blur for non-hero satellites. */
export function CollageCard({
  brand,
  formatWidth,
  formatHeight,
  title,
  body,
  titleStyle,
  bodyStyle,
  opacity = 1,
  scale = 1,
  blurPx = 0,
  isHero = false,
  style,
}: CollageCardProps) {
  const padding = formatWidth * 0.022;
  const radius = Math.max(formatWidth * 0.014, 6);

  const card = (
    <CardChrome
      brand={brand}
      formatWidth={formatWidth}
      opacity={opacity}
      scale={scale}
      width="100%"
      style={{
        height: "100%",
        boxShadow: isHero
          ? `0 ${formatWidth * 0.016}px ${formatWidth * 0.05}px ${brand.colors.background}aa`
          : undefined,
        ...style,
      }}
    >
      <div
        style={{
          padding,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: padding * 0.5,
        }}
      >
        <MediaPlaceholder
          brand={brand}
          formatWidth={formatWidth}
          formatHeight={formatHeight}
          label=""
          style={{
            flex: 1,
            minHeight: formatHeight * 0.08,
            borderRadius: radius * 0.6,
          }}
        />
        <span style={titleStyle}>{title}</span>
        {body && bodyStyle ? <span style={bodyStyle}>{body}</span> : null}
      </div>
    </CardChrome>
  );

  if (blurPx > 0.5) {
    return <DofBlurLayer blurPx={blurPx}>{card}</DofBlurLayer>;
  }

  return card;
}

type CarouselCardProps = {
  brand: BrandPreset;
  formatWidth: number;
  formatHeight: number;
  title: string;
  meta?: string;
  titleStyle: CSSProperties;
  metaStyle?: CSSProperties;
  isActive?: boolean;
  dimOpacity?: number;
  opacity?: number;
  scale?: number;
  style?: CSSProperties;
};

/** Carousel item card with focus dimming on inactive slides. */
export function CarouselCard({
  brand,
  formatWidth,
  formatHeight,
  title,
  meta,
  titleStyle,
  metaStyle,
  isActive = false,
  dimOpacity = 0.25,
  opacity = 1,
  scale,
  style,
}: CarouselCardProps) {
  const resolvedScale = scale ?? (isActive ? 1 : 0.9);
  const resolvedOpacity = opacity * (isActive ? 1 : dimOpacity);
  const padding = formatWidth * 0.024;

  return (
    <CardChrome
      brand={brand}
      formatWidth={formatWidth}
      opacity={resolvedOpacity}
      scale={resolvedScale}
      width="100%"
      style={{
        height: "100%",
        ...style,
      }}
    >
      <div style={{ padding, display: "flex", flexDirection: "column", gap: padding * 0.45, height: "100%" }}>
        <MediaPlaceholder
          brand={brand}
          formatWidth={formatWidth}
          formatHeight={formatHeight}
          label=""
          style={{ flex: 1, minHeight: formatHeight * 0.12, borderRadius: Math.max(formatWidth * 0.01, 4) }}
        />
        <span style={titleStyle}>{title}</span>
        {meta && metaStyle ? <span style={metaStyle}>{meta}</span> : null}
      </div>
    </CardChrome>
  );
}
