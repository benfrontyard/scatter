import type { EasingName } from "./transition";

export type BrandColors = {
  background: string;
  foreground: string;
  accent: string;
  muted: string;
};

export type BrandTypography = {
  headingFont: string;
  bodyFont: string;
};

export type BrandMotion = {
  easing: EasingName;
  speed: number;
  intensity: number;
  stagger: number;
  directionBias: "left" | "right" | "up" | "down";
};

export type BrandPreset = {
  id: string;
  name: string;
  colors: BrandColors;
  typography: BrandTypography;
  motion: BrandMotion;
};
