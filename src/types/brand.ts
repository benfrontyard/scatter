import type { EasingName } from "./easing";

export type BrandColors = {
  background: string;
  foreground: string;
  accent: string;
  muted: string;
};

export type BrandTypography = {
  /** Curated Google Font family name */
  fontFamily: string;
  /** CSS font stack for headings — derived from fontFamily */
  headingFont: string;
  /** CSS font stack for body — derived from fontFamily */
  bodyFont: string;
};

export type BrandMotion = {
  /** @deprecated Use defaultEasingId — kept for backward compatibility */
  easing?: EasingName;
  defaultEasingId?: string;
  entranceEasingId?: string;
  exitEasingId?: string;
  transitionEasingId?: string;
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
