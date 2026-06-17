export type EffectCategory =
  | "transform"
  | "style"
  | "visual"
  | "shape"
  | "visibility";

export type EffectTarget =
  | "block"
  | "text"
  | "image"
  | "logo"
  | "background"
  | "shape"
  | "group"
  | "headline"
  | "subhead"
  | "cta"
  | "number"
  | "label"
  | "card";

export type EffectControlType = "number" | "slider" | "color" | "select" | "toggle";

export type EffectControlDefinition = {
  id: string;
  label: string;
  type: EffectControlType;
  defaultValue: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
};

export type EffectDefinition = {
  id: string;
  name: string;
  category: EffectCategory;
  description: string;
  controls: EffectControlDefinition[];
  compatibleTargets: EffectTarget[];
};

export type EffectInstance = {
  id: string;
  effectId: string;
  target: EffectTarget;
  enabled: boolean;
  values: Record<string, unknown>;
};

export type StarterEffectId =
  | "opacity"
  | "shadow"
  | "corner-radius"
  | "stroke"
  | "layer-blur"
  | "glass"
  | "move"
  | "scale"
  | "rotate"
  | "hide-show";

export type ShadowStyle = {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
};

export type RadiusStyle = {
  card: number;
  image: number;
};

export type StrokeStyle = {
  width: number;
  color: string;
  opacity: number;
};

export type BlurStyle = {
  amount: number;
};

export type GlassStyle = {
  blur: number;
  opacity: number;
  tintColor: string;
  borderOpacity: number;
};

export type ImageTreatmentStyle = {
  opacity: number;
  radius: number;
};

export type GrainStyle = {
  amount: number;
  opacity: number;
};

export type BrandEffects = {
  defaultShadow: ShadowStyle;
  defaultRadius: RadiusStyle;
  defaultStroke: StrokeStyle;
  defaultBlur: BlurStyle;
  defaultGlass: GlassStyle;
  defaultGrain: GrainStyle;
  defaultImageTreatment: ImageTreatmentStyle;
};

export type EffectValuesMap = {
  opacity: { opacity: number };
  shadow: ShadowStyle;
  "corner-radius": { radius: number };
  stroke: StrokeStyle;
  "layer-blur": { amount: number };
  glass: GlassStyle;
  move: { x: number; y: number };
  scale: { scale: number };
  rotate: { degrees: number };
  "hide-show": { visible: boolean };
};

export type EffectInheritanceCategory = "card" | "image" | "text" | "background" | "logo";
