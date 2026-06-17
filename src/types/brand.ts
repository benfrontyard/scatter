import type { EasingName } from "./easing";
import type { BrandEffects } from "./effects";
import type { BodyStyleName, HeadingStyleName, TypeStyle, TypeStyleName } from "./typography";

export type BrandPersonality =
  | "calm"
  | "precise"
  | "editorial"
  | "playful"
  | "premium";

export type BrandColors = {
  background: string;
  foreground: string;
  accent: string;
  muted: string;
  surface?: string;
  border?: string;
};

export type BrandTypography = {
  fontFamilies: {
    heading: string;
    body: string;
    accent?: string;
  };
  scale: Record<TypeStyleName, TypeStyle>;
  defaults: {
    headingStyle: HeadingStyleName;
    bodyStyle: BodyStyleName;
    labelStyle: "label" | "caption";
  };
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
  personality?: BrandPersonality;
  colors: BrandColors;
  typography: BrandTypography;
  motion: BrandMotion;
  effects: BrandEffects;
};
