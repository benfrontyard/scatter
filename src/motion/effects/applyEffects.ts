import type { CSSProperties } from "react";
import type { StarterEffectId } from "@/types/effects";
import type { EffectApplyOptions, EffectApplyResult, ResolvedEffect } from "./types";

export const MAX_BLUR_PX = 64;
export const BLUR_WARNING_THRESHOLD = 32;

function clampBlur(value: number, warnings: string[]): number {
  if (value > BLUR_WARNING_THRESHOLD) {
    warnings.push(`Blur clamped to ${MAX_BLUR_PX}px for performance.`);
  }
  return Math.min(MAX_BLUR_PX, Math.max(0, value));
}

function hexToRgba(hex: string, opacityPercent: number): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return `rgba(0, 0, 0, ${opacityPercent / 100})`;
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacityPercent / 100})`;
}

function readNumber(values: Record<string, unknown>, key: string, fallback: number): number {
  const value = values[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readBoolean(values: Record<string, unknown>, key: string, fallback: boolean): boolean {
  const value = values[key];
  return typeof value === "boolean" ? value : fallback;
}

function readString(values: Record<string, unknown>, key: string, fallback: string): string {
  const value = values[key];
  return typeof value === "string" ? value : fallback;
}

function applyOpacity(values: Record<string, unknown>): CSSProperties {
  const opacityPercent = readNumber(values, "opacity", 100);
  return { opacity: opacityPercent / 100 };
}

function applyShadow(values: Record<string, unknown>, warnings: string[]): CSSProperties {
  const x = readNumber(values, "x", 0);
  const y = readNumber(values, "y", 12);
  const blur = clampBlur(readNumber(values, "blur", 24), warnings);
  const spread = readNumber(values, "spread", 0);
  const color = readString(values, "color", "#000000");
  const opacity = readNumber(values, "opacity", 18);

  return {
    boxShadow: `${x}px ${y}px ${blur}px ${spread}px ${hexToRgba(color, opacity)}`,
  };
}

function applyCornerRadius(values: Record<string, unknown>): CSSProperties {
  const radius = readNumber(values, "radius", 0);
  return { borderRadius: radius };
}

function applyStroke(values: Record<string, unknown>): CSSProperties {
  const width = readNumber(values, "width", 0);
  const color = readString(values, "color", "#ffffff");
  const opacity = readNumber(values, "opacity", 12);

  if (width <= 0) return {};

  return {
    borderWidth: width,
    borderStyle: "solid",
    borderColor: hexToRgba(color, opacity),
  };
}

function applyLayerBlur(values: Record<string, unknown>, warnings: string[]): CSSProperties {
  const amount = clampBlur(readNumber(values, "amount", 0), warnings);
  if (amount <= 0) return {};
  return { filter: `blur(${amount}px)` };
}

function applyGlass(values: Record<string, unknown>, warnings: string[]): CSSProperties {
  const blur = clampBlur(readNumber(values, "blur", 12), warnings);
  const opacity = readNumber(values, "opacity", 12);
  const tintColor = readString(values, "tintColor", "#ffffff");
  const borderOpacity = readNumber(values, "borderOpacity", 18);

  return {
    backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
    WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
    backgroundColor: hexToRgba(tintColor, opacity),
    border: `1px solid ${hexToRgba(tintColor, borderOpacity)}`,
  };
}

function applyTransform(
  move: { x: number; y: number } | null,
  scale: number | null,
  rotate: number | null,
): CSSProperties {
  const parts: string[] = [];

  if (move && (move.x !== 0 || move.y !== 0)) {
    parts.push(`translate(${move.x}px, ${move.y}px)`);
  }
  if (scale !== null && scale !== 1) {
    parts.push(`scale(${scale})`);
  }
  if (rotate !== null && rotate !== 0) {
    parts.push(`rotate(${rotate}deg)`);
  }

  if (parts.length === 0) return {};
  return { transform: parts.join(" ") };
}

function applyHideShow(values: Record<string, unknown>): CSSProperties {
  const visible = readBoolean(values, "visible", true);
  if (visible) return {};
  return { opacity: 0, visibility: "hidden", pointerEvents: "none" };
}

function applySingleEffect(
  effectId: StarterEffectId,
  values: Record<string, unknown>,
  warnings: string[],
): CSSProperties {
  switch (effectId) {
    case "opacity":
      return applyOpacity(values);
    case "shadow":
      return applyShadow(values, warnings);
    case "corner-radius":
      return applyCornerRadius(values);
    case "stroke":
      return applyStroke(values);
    case "layer-blur":
      return applyLayerBlur(values, warnings);
    case "glass":
      return applyGlass(values, warnings);
    case "move":
      return applyTransform({ x: readNumber(values, "x", 0), y: readNumber(values, "y", 0) }, null, null);
    case "scale":
      return applyTransform(null, readNumber(values, "scale", 1), null);
    case "rotate":
      return applyTransform(null, null, readNumber(values, "degrees", 0));
    case "hide-show":
      return applyHideShow(values);
    default:
      return {};
  }
}

function mergeStyles(base: CSSProperties, next: CSSProperties): CSSProperties {
  const merged: CSSProperties = { ...base, ...next };

  if (base.transform && next.transform) {
    merged.transform = `${base.transform} ${next.transform}`;
  }

  if (base.filter && next.filter) {
    merged.filter = `${base.filter} ${next.filter}`;
  }

  return merged;
}

export function applyEffect(
  effectId: StarterEffectId,
  values: Record<string, unknown>,
  options?: EffectApplyOptions,
): EffectApplyResult {
  const warnings: string[] = [];

  if (options?.reducedMotion && (effectId === "move" || effectId === "scale" || effectId === "rotate")) {
    return { style: {}, warnings: ["Transform effects skipped for reduced motion."] };
  }

  if (options?.reducedMotion && effectId === "layer-blur") {
    const amount = readNumber(values, "amount", 0);
    if (amount > 0) {
      return {
        style: applyOpacity({ opacity: Math.max(20, 100 - amount * 2) }),
        warnings: ["Layer blur simplified for reduced motion."],
      };
    }
  }

  return {
    style: applySingleEffect(effectId, values, warnings),
    warnings,
  };
}

export function applyEffects(
  effects: ResolvedEffect[],
  options?: EffectApplyOptions,
): EffectApplyResult {
  const warnings: string[] = [];
  const enabled = effects.filter((effect) => effect.enabled);

  const moveEffect = enabled.find((effect) => effect.effectId === "move");
  const scaleEffect = enabled.find((effect) => effect.effectId === "scale");
  const rotateEffect = enabled.find((effect) => effect.effectId === "rotate");

  let style: CSSProperties = {};

  for (const effect of enabled) {
    if (
      effect.effectId === "move" ||
      effect.effectId === "scale" ||
      effect.effectId === "rotate"
    ) {
      continue;
    }

    const result = applyEffect(effect.effectId, effect.values, options);
    warnings.push(...result.warnings);
    style = mergeStyles(style, result.style);
  }

  if (!options?.reducedMotion) {
    const move =
      moveEffect !== undefined
        ? { x: readNumber(moveEffect.values, "x", 0), y: readNumber(moveEffect.values, "y", 0) }
        : null;
    const scale =
      scaleEffect !== undefined ? readNumber(scaleEffect.values, "scale", 1) : null;
    const rotate =
      rotateEffect !== undefined ? readNumber(rotateEffect.values, "degrees", 0) : null;

    style = mergeStyles(style, applyTransform(move, scale, rotate));
  } else if (moveEffect || scaleEffect || rotateEffect) {
    warnings.push("Transform effects skipped for reduced motion.");
  }

  return { style, warnings };
}

export function applyEffectsToCss(
  effects: ResolvedEffect[],
  options?: EffectApplyOptions,
): CSSProperties {
  return applyEffects(effects, options).style;
}
