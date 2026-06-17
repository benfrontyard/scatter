import type { BrandPreset } from "@/types";

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
    typography: {
      headingFont: "Inter, system-ui, sans-serif",
      bodyFont: "Inter, system-ui, sans-serif",
    },
    motion: {
      easing: "ease-out",
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
    typography: {
      headingFont: "Georgia, serif",
      bodyFont: "Georgia, serif",
    },
    motion: {
      easing: "ease-in-out",
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
    typography: {
      headingFont: "Inter, system-ui, sans-serif",
      bodyFont: "Inter, system-ui, sans-serif",
    },
    motion: {
      easing: "spring",
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
