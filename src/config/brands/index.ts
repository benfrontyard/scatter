import {
  defaultBrandTypography,
  editorialBrandTypography,
  saasBrandTypography,
} from "@/config/typography/defaults";
import {
  defaultBrandEffects,
  editorialBrandEffects,
  saasBrandEffects,
} from "@/config/effects/defaults";
import type { BrandPreset } from "@/types";
import {
  DEFAULT_EASING_ID,
  DEFAULT_ENTRANCE_EASING_ID,
  DEFAULT_EXIT_EASING_ID,
  DEFAULT_TRANSITION_EASING_ID,
} from "@/config/easing-presets";

export const brandPresets: BrandPreset[] = [
  {
    id: "default-dark",
    name: "Default Dark",
    colors: {
      background: "#0a0a0a",
      foreground: "#fafafa",
      accent: "#60a5fa",
      muted: "#737373",
    },
    typography: defaultBrandTypography,
    effects: defaultBrandEffects,
    motion: {
      defaultEasingId: DEFAULT_EASING_ID,
      entranceEasingId: DEFAULT_ENTRANCE_EASING_ID,
      exitEasingId: DEFAULT_EXIT_EASING_ID,
      transitionEasingId: DEFAULT_TRANSITION_EASING_ID,
      speed: 1,
      intensity: 1,
      stagger: 8,
      directionBias: "up",
    },
  },
  {
    id: "warm-editorial",
    name: "Warm Editorial",
    colors: {
      background: "#faf9f7",
      foreground: "#1a1a1a",
      accent: "#8b7355",
      muted: "#9ca3af",
    },
    typography: editorialBrandTypography,
    effects: editorialBrandEffects,
    motion: {
      defaultEasingId: "soft-reveal",
      entranceEasingId: "soft-reveal",
      exitEasingId: "calm",
      transitionEasingId: "ease-in-out",
      speed: 0.85,
      intensity: 0.75,
      stagger: 12,
      directionBias: "up",
    },
  },
  {
    id: "bright-saas",
    name: "Bright SaaS",
    colors: {
      background: "#ffffff",
      foreground: "#0f172a",
      accent: "#6366f1",
      muted: "#64748b",
    },
    typography: saasBrandTypography,
    effects: saasBrandEffects,
    motion: {
      defaultEasingId: "snappy",
      entranceEasingId: "snappy",
      exitEasingId: "ease-out",
      transitionEasingId: "snappy",
      speed: 1.15,
      intensity: 1.2,
      stagger: 6,
      directionBias: "left",
    },
  },
];

export const defaultBrandPresetId = "default-dark";

export const brandPresetMap = Object.fromEntries(
  brandPresets.map((preset) => [preset.id, preset]),
) as Record<string, BrandPreset>;
