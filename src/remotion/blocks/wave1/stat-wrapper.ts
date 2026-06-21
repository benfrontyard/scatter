import { getEasingFunction } from "@/lib/easing";
import type { EasingPreset } from "@/types/easing";
import { interpolate } from "remotion";
import { formatStatValue, parseStatValue } from "../stat-card-motion";

export function applyStatWrapper(template: string, statDisplay: string): string {
  return template.replace(/\{stat\}/gi, statDisplay);
}

export function resolveStatDisplay(
  rawValue: string,
  countProgress: number,
  entranceEasing?: EasingPreset,
): string {
  const parsed = parseStatValue(rawValue);
  if (!parsed.isNumeric) return rawValue;

  const current = interpolate(countProgress, [0, 1], [0, parsed.numericPart], {
    extrapolateRight: "clamp",
    ...(entranceEasing ? { easing: getEasingFunction(entranceEasing) } : {}),
  });

  return formatStatValue(parsed, current);
}
