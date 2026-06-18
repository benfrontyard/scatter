import type { BrandComposition } from "./brand-composition";
import type { BrandLogoSystem } from "./brand-logo";
import type { EasingName } from "./easing";
import type { BrandEffects } from "./effects";
import type { BodyStyleName, HeadingStyleName, TypeStyle, TypeStyleName } from "./typography";
import type { BrandTextAnimationDefaults } from "./text-animation";
import type { BrandTypographyRoles, TypeDensity } from "./typography-role";

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
  /** @deprecated Prefer `roles` — kept for backward compatibility */
  scale: Record<TypeStyleName, TypeStyle>;
  defaults: {
    headingStyle: HeadingStyleName;
    bodyStyle: BodyStyleName;
    labelStyle: "label" | "caption";
  };
  /** Canonical responsive typography roles */
  roles: BrandTypographyRoles;
  /** Type density affects line height, spacing, and max line length */
  density: TypeDensity;
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
  textAnimation?: BrandTextAnimationDefaults;
};

export type BrandPreset = {
  id: string;
  name: string;
  personality?: BrandPersonality;
  colors: BrandColors;
  typography: BrandTypography;
  /** Brand-level composition and grid rules for responsive block layout */
  composition: BrandComposition;
  /** Logo assets, types, and responsive variants */
  logos: BrandLogoSystem;
  motion: BrandMotion;
  effects: BrandEffects;
};
