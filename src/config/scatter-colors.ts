export const scatterColors = {
  brand: {
    midnight: "#0D0D17",
    ink: "#151522",
    surface: "#1D1D2D",
    surfaceRaised: "#26263A",
    border: "#34344A",

    text: "#F0F0FF",
    textSoft: "#DBDBEF",
    textMuted: "#A8A8C4",
    textDim: "#6F6F8B",

    lavender: "#DBDBEF",
    periwinkle: "#AAAADB",
    violet: "#8B82FF",
  },

  accent: {
    signalBlue: "#6EEBFF",
    motionViolet: "#8B82FF",
    bloomPink: "#FF6BD6",
    energyLime: "#B8FF6A",
    warmAmber: "#FFD166",
    coral: "#FF7A59",
  },

  state: {
    selected: "#8B82FF",
    playing: "#6EEBFF",
    success: "#B8FF6A",
    warning: "#FFD166",
    error: "#FF7A59",
  },

  alpha: {
    lavender08: "rgba(219, 219, 239, 0.08)",
    lavender12: "rgba(219, 219, 239, 0.12)",
    lavender18: "rgba(219, 219, 239, 0.18)",
    lavender32: "rgba(219, 219, 239, 0.32)",

    violet16: "rgba(139, 130, 255, 0.16)",
    violet32: "rgba(139, 130, 255, 0.32)",

    cyan16: "rgba(110, 235, 255, 0.16)",
    pink16: "rgba(255, 107, 214, 0.16)",
  },

  gradients: {
    primary: "linear-gradient(135deg, #AAAADB 0%, #8B82FF 45%, #6EEBFF 100%)",
    bloom: "linear-gradient(135deg, #8B82FF 0%, #FF6BD6 55%, #FFD166 100%)",
    surface: "linear-gradient(180deg, #1D1D2D 0%, #11111B 100%)",
    glow: "radial-gradient(circle at 50% 40%, rgba(170,170,219,0.22) 0%, rgba(13,13,23,0) 48%)",
  },
} as const;

export const scatterColorsLight = {
  brand: {
    midnight: "#0D0D17",
    ink: "#151522",
    surface: "#FFFFFF",
    surfaceRaised: "#F5F5FA",
    border: "#DBDBEF",

    text: "#0D0D17",
    textSoft: "#151522",
    textMuted: "#6F6F8B",
    textDim: "#A8A8C4",

    lavender: "#DBDBEF",
    periwinkle: "#AAAADB",
    violet: "#8B82FF",
  },

  accent: scatterColors.accent,
  state: scatterColors.state,

  alpha: {
    midnight08: "rgba(13, 13, 23, 0.08)",
    midnight12: "rgba(13, 13, 23, 0.12)",
    midnight18: "rgba(13, 13, 23, 0.18)",
    midnight32: "rgba(13, 13, 23, 0.32)",

    violet16: "rgba(139, 130, 255, 0.16)",
    violet32: "rgba(139, 130, 255, 0.32)",

    cyan16: "rgba(110, 235, 255, 0.16)",
    pink16: "rgba(255, 107, 214, 0.16)",
  },

  gradients: {
    primary: "linear-gradient(135deg, #8B82FF 0%, #AAAADB 45%, #6EEBFF 100%)",
    bloom: "linear-gradient(135deg, #8B82FF 0%, #FF6BD6 55%, #FFD166 100%)",
    surface: "linear-gradient(180deg, #FFFFFF 0%, #F5F5FA 100%)",
    glow: "radial-gradient(circle at 50% 40%, rgba(139,130,255,0.14) 0%, rgba(245,245,250,0) 48%)",
  },
} as const;

export type ScatterThemeMode = "light" | "dark";

export function getScatterColors(mode: ScatterThemeMode) {
  return mode === "dark" ? scatterColors : scatterColorsLight;
}

import { publicAssetUrl } from "@/lib/public-asset-url";

export const scatterBrandAssets = {
  icon: {
    light: publicAssetUrl("/branding/scatter-icon-light.png"),
    dark: publicAssetUrl("/branding/scatter-icon-dark.png"),
  },
  logo: {
    light: publicAssetUrl("/branding/scatter-logo-light.png"),
    dark: publicAssetUrl("/branding/scatter-logo-dark.png"),
  },
} as const;
