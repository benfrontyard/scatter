import type { CSSProperties } from "react";
import {
  applyEffectsToCss,
  resolveEnabledTargetEffects,
} from "@/lib/effects";
import type { BrandPreset, MotionBlockInstance } from "@/types";
import type { EffectTarget, GrainStyle } from "@/types/effects";
import type { EffectApplyOptions } from "@/motion/effects/types";

const GRAIN_TEXTURE = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/></filter><rect width="128" height="128" filter="url(%23n)" opacity="0.55"/></svg>',
)}")`;

export function getTargetEffectStyle(
  brand: BrandPreset,
  block: MotionBlockInstance,
  target: EffectTarget,
  options?: EffectApplyOptions,
): CSSProperties {
  return applyEffectsToCss(
    resolveEnabledTargetEffects(brand, block, target),
    options,
  );
}

export function mergeMotionAndEffectStyle(
  motionStyle: CSSProperties,
  effectStyle: CSSProperties,
): CSSProperties {
  const merged: CSSProperties = { ...effectStyle, ...motionStyle };

  const motionOpacity = motionStyle.opacity;
  const effectOpacity = effectStyle.opacity;
  if (typeof motionOpacity === "number" && typeof effectOpacity === "number") {
    merged.opacity = motionOpacity * effectOpacity;
  }

  const motionTransform = motionStyle.transform;
  const effectTransform = effectStyle.transform;
  if (motionTransform && effectTransform) {
    merged.transform = `${motionTransform} ${effectTransform}`;
  }

  return merged;
}

export function getGrainOverlayStyle(grain: GrainStyle): CSSProperties | null {
  if (grain.amount <= 0 || grain.opacity <= 0) return null;

  const tileSize = Math.round(96 + grain.amount * 6);

  return {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    opacity: grain.opacity / 100,
    mixBlendMode: "overlay",
    backgroundImage: GRAIN_TEXTURE,
    backgroundSize: `${tileSize}px ${tileSize}px`,
  };
}

export function GrainOverlay({ grain }: { grain: GrainStyle }) {
  const style = getGrainOverlayStyle(grain);
  if (!style) return null;
  return <div aria-hidden style={style} />;
}
