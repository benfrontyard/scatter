import type { CSSProperties } from "react";
import {
  filterUnitsByWordIndices,
  splitText,
} from "@/lib/text-split";
import {
  applyTextAnimationAtFrame,
  resolveTextAnimation,
} from "@/motion/text-animation";
import { getTargetEffectStyle, mergeMotionAndEffectStyle } from "@/remotion/effect-styles";
import {
  clampHeadlineText,
  resolveBlockSlotStyle,
  resolvedTypeStyleToCss,
} from "@/lib/typography";
import type { BrandPreset, MotionBlockInstance, MotionFormat } from "@/types";
import type { EffectTarget } from "@/types/effects";
import type { HeadingStyleName, BodyStyleName } from "@/types/typography";

type AnimatedTextProps = {
  text: string;
  brand: BrandPreset;
  block: MotionBlockInstance;
  format: MotionFormat;
  slot: EffectTarget;
  frame: number;
  startFrame?: number;
  outroOpacity?: number;
  maxLength?: number;
  typographyRole?: HeadingStyleName | BodyStyleName | "label" | "caption";
  typographySlot?: "headline" | "body" | "title" | "label" | "caption";
  color?: string;
  reducedMotion?: boolean;
  wrapperStyle?: CSSProperties;
};

export function AnimatedText({
  text,
  brand,
  block,
  format,
  slot,
  frame,
  startFrame = 0,
  outroOpacity = 1,
  maxLength = 200,
  typographyRole,
  typographySlot = "headline",
  color,
  reducedMotion = false,
  wrapperStyle,
}: AnimatedTextProps) {
  const displayText = clampHeadlineText(text, maxLength);
  const resolved = resolveTextAnimation(brand, block, slot, displayText, {
    reducedMotion,
    startFrame,
  });

  const headingStyle = brand.typography.defaults.headingStyle;
  const bodyStyle = brand.typography.defaults.bodyStyle;
  const role =
    typographyRole ??
    (typographySlot === "body" || typographySlot === "caption" ? bodyStyle : headingStyle);

  const typeStyle = resolveBlockSlotStyle(
    brand.typography,
    format,
    role,
    block.typographyOverride,
    typographySlot,
  );

  const effectStyle = getTargetEffectStyle(brand, block, slot, { reducedMotion });

  if (!resolved || !displayText) {
    return (
      <div style={mergeMotionAndEffectStyle(wrapperStyle ?? {}, effectStyle)}>
        <span
          style={{
            ...resolvedTypeStyleToCss(typeStyle),
            color: color ?? brand.colors.foreground,
            maxWidth: typeStyle.maxWidth ?? format.width * 0.85,
          }}
        >
          {displayText}
        </span>
      </div>
    );
  }

  const units = filterUnitsByWordIndices(
    splitText(displayText, resolved.target, { respectNewlines: true }),
    resolved.wordIndices,
  );
  const styleByIndex = applyTextAnimationAtFrame(frame, resolved, units);

  return (
    <div
      style={mergeMotionAndEffectStyle(
        {
          ...wrapperStyle,
          opacity: outroOpacity,
        },
        effectStyle,
      )}
    >
      <span className="sr-only">{displayText}</span>
      <span
        aria-hidden
        style={{
          ...resolvedTypeStyleToCss(typeStyle),
          color: color ?? brand.colors.foreground,
          maxWidth: typeStyle.maxWidth ?? format.width * 0.85,
        }}
      >
        {units.map((unit) => (
          <span key={`${unit.index}-${unit.text}`} style={styleByIndex.get(unit.index)}>
            {unit.text}
          </span>
        ))}
      </span>
    </div>
  );
}
