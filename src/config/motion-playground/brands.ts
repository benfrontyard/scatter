import { DEFAULT_BRAND_COMPOSITION } from "@/config/composition/defaults";
import { DEFAULT_BRAND_LOGO_SYSTEM } from "@/config/logo/defaults";
import { defaultBrandEffects } from "@/config/effects/defaults";
import {
  defaultBrandTypography,
  editorialBrandTypography,
  saasBrandTypography,
} from "@/config/typography/defaults";
import {
  DEFAULT_EASING_ID,
  DEFAULT_ENTRANCE_EASING_ID,
  DEFAULT_EXIT_EASING_ID,
  DEFAULT_TRANSITION_EASING_ID,
} from "@/config/easing-presets";
import type { BrandPreset } from "@/types";

const baseMotion = {
  defaultEasingId: DEFAULT_EASING_ID,
  entranceEasingId: DEFAULT_ENTRANCE_EASING_ID,
  exitEasingId: DEFAULT_EXIT_EASING_ID,
  transitionEasingId: DEFAULT_TRANSITION_EASING_ID,
  speed: 1,
  intensity: 1,
  stagger: 8,
  directionBias: "up" as const,
};

export const playgroundBrandKits: BrandPreset[] = [
  {
    id: "playground-wellness",
    name: "Premium Wellness Brand",
    colors: {
      background: "#f5f0eb",
      foreground: "#2c2825",
      accent: "#7d9b8a",
      muted: "#9a8f85",
      surface: "#ebe4dc",
    },
    typography: {
      ...editorialBrandTypography,
      fontFamilies: { heading: "Cormorant Garamond", body: "DM Sans", accent: "Cormorant Garamond" },
      density: "spacious",
    },
    composition: { ...DEFAULT_BRAND_COMPOSITION, style: "premium", density: "spacious" },
    logos: { ...DEFAULT_BRAND_LOGO_SYSTEM, primaryType: "wordmark", textFallback: "Aura" },
    effects: defaultBrandEffects,
    motion: { ...baseMotion, defaultEasingId: "calm", entranceEasingId: "soft-reveal", speed: 0.85 },
  },
  {
    id: "playground-saas",
    name: "B2B SaaS Brand",
    colors: {
      background: "#0f1419",
      foreground: "#e7ecf3",
      accent: "#3b82f6",
      muted: "#64748b",
      surface: "#1a2332",
    },
    typography: saasBrandTypography,
    composition: { ...DEFAULT_BRAND_COMPOSITION, style: "product" },
    logos: { ...DEFAULT_BRAND_LOGO_SYSTEM, primaryType: "combination", textFallback: "Nexus" },
    effects: defaultBrandEffects,
    motion: { ...baseMotion, defaultEasingId: "snappy", entranceEasingId: "snappy" },
  },
  {
    id: "playground-consumer",
    name: "Bold Consumer Brand",
    colors: {
      background: "#ff3366",
      foreground: "#ffffff",
      accent: "#ffe600",
      muted: "#ffb3c6",
      surface: "#ff4d7a",
    },
    typography: {
      ...defaultBrandTypography,
      fontFamilies: { heading: "Space Grotesk", body: "Inter", accent: "Space Grotesk" },
      density: "compact",
    },
    composition: { ...DEFAULT_BRAND_COMPOSITION, style: "expressive", allowGridBreaks: true },
    logos: { ...DEFAULT_BRAND_LOGO_SYSTEM, primaryType: "symbol", textFallback: "POP" },
    effects: defaultBrandEffects,
    motion: { ...baseMotion, defaultEasingId: "expressive-out", intensity: 1.2 },
  },
  {
    id: "playground-finance",
    name: "Minimal Finance Brand",
    colors: {
      background: "#ffffff",
      foreground: "#111827",
      accent: "#059669",
      muted: "#6b7280",
      surface: "#f9fafb",
      border: "#e5e7eb",
    },
    typography: {
      ...saasBrandTypography,
      fontFamilies: { heading: "IBM Plex Sans", body: "IBM Plex Sans", accent: "IBM Plex Mono" },
      density: "balanced",
    },
    composition: { ...DEFAULT_BRAND_COMPOSITION, style: "swiss", gridStrength: "strict" },
    logos: { ...DEFAULT_BRAND_LOGO_SYSTEM, primaryType: "wordmark", textFallback: "Ledger" },
    effects: defaultBrandEffects,
    motion: { ...baseMotion, defaultEasingId: "ease-out", speed: 0.9 },
  },
  {
    id: "playground-illustration",
    name: "Illustration Brand",
    colors: {
      background: "#1a1f3a",
      foreground: "#f0e6ff",
      accent: "#a78bfa",
      muted: "#8b7cb8",
      surface: "#252b4a",
    },
    typography: {
      ...defaultBrandTypography,
      fontFamilies: { heading: "Fraunces", body: "Nunito", accent: "Fraunces" },
      density: "spacious",
    },
    composition: { ...DEFAULT_BRAND_COMPOSITION, style: "expressive", motionComposition: "dynamic" },
    logos: { ...DEFAULT_BRAND_LOGO_SYSTEM, primaryType: "symbol", textFallback: "Doodle" },
    effects: defaultBrandEffects,
    motion: { ...baseMotion, defaultEasingId: "expressive-out", stagger: 6 },
  },
];

export const playgroundBrandMap = Object.fromEntries(
  playgroundBrandKits.map((b) => [b.id, b]),
) as Record<string, BrandPreset>;
