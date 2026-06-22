import type { CSSProperties } from "react";
import { getEasingFunction } from "@/lib/easing";
import type { TextUnit } from "@/lib/text-split";
import type {
  AnimatableProperty,
  PropertyValue,
  ResolvedTextAnimation,
  ResolvedUnitTiming,
} from "@/types/text-animation";
import { getUnitProgress } from "./selector";
import { getResolvedEasingFunction } from "./resolveTextAnimation";

function isNumericProperty(value: PropertyValue): value is [number, number] {
  return Array.isArray(value);
}

function interpolateProperty(
  progress: number,
  value: [number, number],
): number {
  return value[0] + (value[1] - value[0]) * progress;
}

function resolveColor(
  value: PropertyValue | undefined,
  resolved: ResolvedTextAnimation,
): string | undefined {
  if (!value) return undefined;
  if (isNumericProperty(value)) return undefined;

  switch (value) {
    case "brandAccent":
      return resolved.colors.accent;
    case "brandPrimary":
      return resolved.colors.primary;
    case "inherit":
    default:
      return undefined;
  }
}

function getClipPath(
  direction: "up" | "down" | "left" | "right",
  progress: number,
): string {
  const hidden = Math.round((1 - progress) * 100);
  switch (direction) {
    case "down":
      return `inset(${hidden}% 0 0 0 round 0)`;
    case "left":
      return `inset(0 ${hidden}% 0 0 round 0)`;
    case "right":
      return `inset(0 0 0 ${hidden}% round 0)`;
    case "up":
    default:
      return `inset(0 0 ${hidden}% 0 round 0)`;
  }
}

export function applyUnitStyle(
  frame: number,
  resolved: ResolvedTextAnimation,
  timing: ResolvedUnitTiming | undefined,
  unitIndex: number,
): CSSProperties {
  if (!timing) {
    return { opacity: 0, display: "inline-block", whiteSpace: "pre" };
  }

  const absoluteFrame = frame - resolved.startFrame;
  const easingPreset = getResolvedEasingFunction(resolved);
  const easingFn = getEasingFunction(easingPreset);
  const progress = getUnitProgress(absoluteFrame, timing, easingFn);

  const { properties, renderer } = resolved;
  const style: CSSProperties = {
    display: "inline-block",
    whiteSpace: "pre",
  };

  const transforms: string[] = [];

  for (const key of Object.keys(properties) as (keyof typeof properties)[]) {
    if (key === "clipReveal") continue;
    const value = properties[key as AnimatableProperty];
    if (!value) continue;

    if (key === "color") {
      const color = resolveColor(value as PropertyValue, resolved);
      if (color) style.color = color;
      continue;
    }

    if (!isNumericProperty(value)) continue;

    const current = interpolateProperty(progress, value);

    switch (key) {
      case "opacity":
        style.opacity = current;
        break;
      case "x": {
        const xValue =
          resolved.presetId === "split-impact" && unitIndex % 2 === 1
            ? ([-value[0], -value[1]] as [number, number])
            : value;
        const currentX = interpolateProperty(progress, xValue);
        transforms.push(`translateX(${currentX}px)`);
        break;
      }
      case "y":
        transforms.push(`translateY(${current}px)`);
        break;
      case "scale":
        transforms.push(`scale(${current})`);
        break;
      case "rotate":
        transforms.push(`rotate(${current}deg)`);
        break;
      case "skewX":
        transforms.push(`skewX(${current}deg)`);
        break;
      case "blur":
        style.filter = `blur(${Math.max(0, current)}px)`;
        break;
      case "tracking":
        style.letterSpacing = `${current}em`;
        break;
      default:
        break;
    }
  }

  if (renderer === "color-pulse" && properties.scale && isNumericProperty(properties.scale)) {
    const pulse = 1 + Math.sin(progress * Math.PI) * (properties.scale[1] - 1);
    transforms.push(`scale(${pulse})`);
  }

  if (renderer === "highlight-sweep") {
    const sweepProgress = Math.min(1, progress * 1.2);
    style.backgroundImage = `linear-gradient(90deg, transparent ${sweepProgress * 100}%, ${resolved.colors.accent}33 ${sweepProgress * 100}%, ${resolved.colors.accent}33 ${Math.min(100, sweepProgress * 100 + 18)}%, transparent ${Math.min(100, sweepProgress * 100 + 18)}%)`;
    style.backgroundClip = "text";
    style.WebkitBackgroundClip = "text";
    style.color = "transparent";
  }

  if (properties.clipReveal) {
    style.clipPath = getClipPath(properties.clipReveal, progress);
    style.overflow = "hidden";
  }

  if (renderer === "mask-reveal" && properties.clipReveal) {
    style.clipPath = getClipPath(properties.clipReveal, progress);
    style.overflow = "hidden";
  }

  if (transforms.length > 0) {
    style.transform = transforms.join(" ");
  }

  if (style.opacity === undefined && properties.opacity === undefined) {
    style.opacity = progress;
  }

  return style;
}

export function applyTextAnimationAtFrame(
  frame: number,
  resolved: ResolvedTextAnimation,
  units: TextUnit[],
): Map<number, CSSProperties> {
  const styleByUnitIndex = new Map<number, CSSProperties>();

  let animatableIndex = 0;
  for (const unit of units) {
    if (!unit.animate) {
      styleByUnitIndex.set(unit.index, { display: "inline", whiteSpace: "pre" });
      continue;
    }

    const timing = resolved.unitTimings[animatableIndex];
    styleByUnitIndex.set(
      unit.index,
      applyUnitStyle(frame, resolved, timing, animatableIndex),
    );
    animatableIndex += 1;
  }

  return styleByUnitIndex;
}
