import type { EffectTarget } from "./effects";

export type TextAnimationCategory =
  | "subtle"
  | "editorial"
  | "kinetic"
  | "flick"
  | "premium"
  | "utility";

export type TextAnimationTarget = "block" | "line" | "word" | "character";

export type SelectorDirection = "ltr" | "rtl" | "centerOut" | "edgesIn" | "random";

export type TextAnimationRenderer =
  | "standard"
  | "mask-reveal"
  | "highlight-sweep"
  | "color-pulse";

export type AnimatableProperty =
  | "opacity"
  | "x"
  | "y"
  | "scale"
  | "rotate"
  | "blur"
  | "tracking"
  | "skewX"
  | "color";

export type ColorToken = "brandAccent" | "brandPrimary" | "inherit";

export type PropertyValue = [number, number] | ColorToken;

export type TextAnimationProperties = Partial<Record<AnimatableProperty, PropertyValue>> & {
  clipReveal?: "up" | "down" | "left" | "right";
};

export type TextAnimationSelector = {
  direction: SelectorDirection;
  stagger: number;
  duration: number;
  delay: number;
  easing: "inherit" | string;
  randomSeed?: number;
  smoothness?: number;
};

export type TextAnimationBrandBehavior = {
  intensity: "subtle" | "balanced" | "expressive";
  useBrandTypography: boolean;
  useBrandColors: boolean;
  respectReducedMotion: boolean;
};

export type TextAnimationPreset = {
  id: string;
  name: string;
  category: TextAnimationCategory;
  target: TextAnimationTarget;
  properties: TextAnimationProperties;
  selector: TextAnimationSelector;
  brandBehavior: TextAnimationBrandBehavior;
  renderer?: TextAnimationRenderer;
};

export type TextAnimationMode = "brand-default" | "none" | "custom";

export type MotionEnergy = "calm" | "balanced" | "expressive";

export type RevealStyle = "fade" | "slide" | "mask" | "flick" | "type" | "highlight";

export type ReducedMotionBehavior = "simple-fade" | "disable";

export type TextAnimationAdvancedControls = {
  targetUnit?: TextAnimationTarget;
  duration?: number;
  delay?: number;
  stagger?: number;
  easingId?: string;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  blur?: number;
  tracking?: number;
  accentColor?: ColorToken | string;
  highlightColor?: string;
  useBrandColors?: boolean;
  randomizeOrder?: boolean;
  randomSeed?: number;
  respectReducedMotion?: boolean;
};

export type TextAnimationSettings = {
  mode: TextAnimationMode;
  presetId?: string;
  speed?: number;
  intensity?: number;
  direction?: SelectorDirection;
  advanced?: TextAnimationAdvancedControls;
};

/** @deprecated Use fields on TextAnimationInstance directly */
export type TextAnimationUserControls = {
  intensity?: number;
  speed?: number;
  direction?: SelectorDirection;
  target?: TextAnimationTarget;
  stagger?: number;
  duration?: number;
  delay?: number;
  easingId?: string;
  randomSeed?: number;
  accentColor?: ColorToken | string;
  wordIndices?: number[];
};

export type TextAnimationInstance = {
  id: string;
  target: EffectTarget;
  mode: TextAnimationMode;
  presetId?: string;
  speed?: number;
  intensity?: number;
  direction?: SelectorDirection;
  advanced?: TextAnimationAdvancedControls;
  /** @deprecated Migrated to mode */
  enabled?: boolean;
  /** @deprecated Migrated to instance fields */
  controls?: TextAnimationUserControls;
};

export type BrandTextAnimationDefaults = {
  defaultPresetId?: string;
  motionEnergy?: MotionEnergy;
  defaultEasing?: string;
  speedMultiplier?: number;
  staggerMultiplier?: number;
  defaultRevealStyle?: RevealStyle;
  reducedMotionBehavior?: ReducedMotionBehavior;
  allowedPresetFamilies?: TextAnimationCategory[];
  slotDefaults?: Partial<Record<EffectTarget, string>>;
  /** @deprecated Use speedMultiplier */
  durationMultiplier?: number;
};

export type ResolvedUnitTiming = {
  index: number;
  startFrame: number;
  duration: number;
};

export type ResolvedTextAnimation = {
  presetId: string;
  presetName: string;
  target: TextAnimationTarget;
  properties: TextAnimationProperties;
  unitTimings: ResolvedUnitTiming[];
  easingId: string;
  renderer: TextAnimationRenderer;
  colors: {
    accent: string;
    primary: string;
    foreground: string;
  };
  reducedMotion: boolean;
  startFrame: number;
  wordIndices?: number[];
};
