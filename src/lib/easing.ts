import {
  BUILTIN_EASING_PRESETS,
  DEFAULT_EASING_ID,
  DEFAULT_ENTRANCE_EASING_ID,
  DEFAULT_EXIT_EASING_ID,
  DEFAULT_TRANSITION_EASING_ID,
  builtinEasingPresetMap,
} from "@/config/easing-presets";
import type { BrandMotion, BrandPreset, MotionBlockInstance } from "@/types";
import type { BlockTransition, EasingName } from "@/types/transition";
import type { EasingBezier, EasingCategory, EasingPreset } from "@/types/easing";
import { Easing } from "remotion";

const CUSTOM_EASING_STORAGE_KEY = "scatter:custom-easing-presets";

const LEGACY_EASING_MAP: Record<EasingName, string> = {
  linear: "linear",
  "ease-in": "ease",
  "ease-out": "ease-out",
  "ease-in-out": "ease-in-out",
  spring: "expressive-out",
};

export type EasingValidation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export function legacyEasingToId(easing: EasingName | undefined): string {
  if (!easing) return DEFAULT_EASING_ID;
  return LEGACY_EASING_MAP[easing] ?? DEFAULT_EASING_ID;
}

export function readCustomEasingPresets(): EasingPreset[] {
  try {
    const raw = localStorage.getItem(CUSTOM_EASING_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EasingPreset[];
    return Array.isArray(parsed) ? parsed.filter((p) => p.isCustom) : [];
  } catch {
    return [];
  }
}

export function writeCustomEasingPresets(presets: EasingPreset[]): void {
  localStorage.setItem(CUSTOM_EASING_STORAGE_KEY, JSON.stringify(presets));
}

export function saveCustomEasingPreset(preset: EasingPreset): EasingPreset {
  const custom = readCustomEasingPresets().filter((p) => p.id !== preset.id);
  const saved = { ...preset, isCustom: true };
  writeCustomEasingPresets([...custom, saved]);
  return saved;
}

export function deleteCustomEasingPreset(id: string): void {
  writeCustomEasingPresets(readCustomEasingPresets().filter((p) => p.id !== id));
}

export function getAllEasingPresets(): EasingPreset[] {
  const custom = readCustomEasingPresets();
  const customIds = new Set(custom.map((p) => p.id));
  const builtins = BUILTIN_EASING_PRESETS.filter((p) => !customIds.has(p.id));
  return [...builtins, ...custom];
}

export function getEasingPresetMap(): Record<string, EasingPreset> {
  return Object.fromEntries(getAllEasingPresets().map((p) => [p.id, p]));
}

export function getEasingPreset(id: string | undefined): EasingPreset {
  const map = getEasingPresetMap();
  if (id && map[id]) return map[id];
  return builtinEasingPresetMap[DEFAULT_EASING_ID];
}

export function formatBezierCss(bezier: EasingBezier): string {
  return `cubic-bezier(${bezier.x1}, ${bezier.y1}, ${bezier.x2}, ${bezier.y2})`;
}

export function createCustomEasingPreset(
  name: string,
  bezier: EasingBezier,
  description = "Custom easing curve",
): EasingPreset {
  const category: EasingCategory = isOvershootBezier(bezier) ? "Overshoot" : "Utility";
  return {
    id: `custom-${crypto.randomUUID().slice(0, 8)}`,
    name,
    description,
    category,
    cssValue: formatBezierCss(bezier),
    bezier,
    personality: "Custom",
    recommendedUse: "User-defined curve",
    isCustom: true,
  };
}

export function findMatchingCustomPreset(bezier: EasingBezier): EasingPreset | undefined {
  return readCustomEasingPresets().find(
    (p) =>
      p.bezier &&
      Math.abs(p.bezier.x1 - bezier.x1) < 0.001 &&
      Math.abs(p.bezier.y1 - bezier.y1) < 0.001 &&
      Math.abs(p.bezier.x2 - bezier.x2) < 0.001 &&
      Math.abs(p.bezier.y2 - bezier.y2) < 0.001,
  );
}

export function getOrCreateCustomPreset(bezier: EasingBezier): EasingPreset {
  const existing = findMatchingCustomPreset(bezier);
  if (existing) return existing;

  const count = readCustomEasingPresets().length;
  const preset = createCustomEasingPreset(`Custom ${count + 1}`, bezier);
  return saveCustomEasingPreset(preset);
}

export function validateBezier(bezier: EasingBezier): EasingValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (bezier.x1 < 0 || bezier.x1 > 1) {
    errors.push("x1 must be between 0 and 1");
  }
  if (bezier.x2 < 0 || bezier.x2 > 1) {
    errors.push("x2 must be between 0 and 1");
  }

  if (bezier.y1 < -0.5 || bezier.y1 > 2) {
    warnings.push("y1 is outside typical range — curve may feel extreme");
  }
  if (bezier.y2 < -0.5 || bezier.y2 > 2) {
    warnings.push("y2 is outside typical range — curve may feel extreme");
  }

  if (Math.abs(bezier.y1) > 1.5 || Math.abs(bezier.y2) > 1.5) {
    warnings.push("Large overshoot — best for occasional emphasis, not frequent UI");
  }

  return { valid: errors.length === 0, errors, warnings };
}

function isOvershootBezier(bezier: EasingBezier): boolean {
  return bezier.y1 > 1 || bezier.y1 < 0 || bezier.y2 > 1 || bezier.y2 < 0;
}

export function getEasingFunction(preset: EasingPreset): (t: number) => number {
  if (!preset.bezier || preset.cssValue === "linear") {
    return Easing.linear;
  }
  const { x1, y1, x2, y2 } = preset.bezier;
  return Easing.bezier(x1, y1, x2, y2);
}

export function getEasingFunctionById(id: string | undefined): (t: number) => number {
  return getEasingFunction(getEasingPreset(id));
}

export function sampleCubicBezier(
  bezier: EasingBezier,
  samples = 64,
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const mt = 1 - t;
    const x =
      3 * mt * mt * t * bezier.x1 + 3 * mt * t * t * bezier.x2 + t * t * t;
    const y =
      3 * mt * mt * t * bezier.y1 + 3 * mt * t * t * bezier.y2 + t * t * t;
    points.push({ x, y });
  }
  return points;
}

export function sampleLinear(samples = 64): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    points.push({ x: t, y: t });
  }
  return points;
}

export function sampleEasingPreset(preset: EasingPreset, samples = 64): Array<{ x: number; y: number }> {
  if (!preset.bezier) return sampleLinear(samples);
  return sampleCubicBezier(preset.bezier, samples);
}

export type NormalizedBrandMotion = BrandMotion & {
  defaultEasingId: string;
  entranceEasingId: string;
  exitEasingId: string;
  transitionEasingId: string;
};

export function normalizeBrandMotion(motion: BrandMotion): NormalizedBrandMotion {
  const legacyId = motion.easing ? legacyEasingToId(motion.easing) : DEFAULT_EASING_ID;

  return {
    ...motion,
    defaultEasingId: motion.defaultEasingId ?? legacyId,
    entranceEasingId: motion.entranceEasingId ?? motion.defaultEasingId ?? legacyId,
    exitEasingId: motion.exitEasingId ?? motion.defaultEasingId ?? legacyId,
    transitionEasingId: motion.transitionEasingId ?? motion.defaultEasingId ?? legacyId,
  };
}

export function normalizeBrand(brand: BrandPreset): BrandPreset {
  return {
    ...brand,
    motion: normalizeBrandMotion(brand.motion),
  };
}

export function resolveBlockEntranceEasing(
  brand: BrandPreset,
  block: MotionBlockInstance,
): EasingPreset {
  const motion = normalizeBrandMotion(brand.motion);
  const id = block.motion.easingId ?? motion.entranceEasingId;
  return getEasingPreset(id);
}

export function resolveBlockExitEasing(
  brand: BrandPreset,
  block: MotionBlockInstance,
): EasingPreset {
  const motion = normalizeBrandMotion(brand.motion);
  const id = block.motion.easingId ?? motion.exitEasingId;
  return getEasingPreset(id);
}

export function resolveTransitionEasing(
  brand: BrandPreset,
  transition: BlockTransition,
): EasingPreset {
  const motion = normalizeBrandMotion(brand.motion);
  const id =
    transition.easingId ??
    (transition.easing ? legacyEasingToId(transition.easing) : motion.transitionEasingId);
  return getEasingPreset(id);
}

export function groupPresetsByCategory(presets: EasingPreset[]): Record<EasingCategory, EasingPreset[]> {
  const groups: Record<string, EasingPreset[]> = {};
  for (const preset of presets) {
    if (!groups[preset.category]) groups[preset.category] = [];
    groups[preset.category].push(preset);
  }
  return groups as Record<EasingCategory, EasingPreset[]>;
}

export const EASING_CATEGORIES: EasingCategory[] = [
  "Standard",
  "Soft",
  "Snappy",
  "Expressive",
  "Editorial",
  "Utility",
  "Overshoot",
];

export {
  DEFAULT_EASING_ID,
  DEFAULT_ENTRANCE_EASING_ID,
  DEFAULT_EXIT_EASING_ID,
  DEFAULT_TRANSITION_EASING_ID,
};
