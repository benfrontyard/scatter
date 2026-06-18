export type PostFXQuality = "off" | "low" | "medium" | "high" | "auto";

export type ExportFXQuality = "standard" | "high" | "max";

export type PostFXEffectType =
  | "vignette"
  | "grain"
  | "glow"
  | "motionBlur"
  | "chromaticAberration"
  | "sharpen"
  | "blur"
  | "colorOverlay"
  | "noise"
  | "bloom"
  | "filmFade";

export type PostFXBlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "soft-light"
  | "hard-light"
  | "color-dodge"
  | "color-burn";

export type PostFXEffect = {
  id: string;
  type: PostFXEffectType;
  name?: string;
  enabled: boolean;
  solo?: boolean;
  exportOnly?: boolean;
  blendMode?: PostFXBlendMode;
  opacity?: number;
  settings: Record<string, number | string | boolean>;
};

export type PostFXSettings = {
  enabled: boolean;
  previewQuality: PostFXQuality;
  exportQuality: ExportFXQuality;
  effects: PostFXEffect[];
};

export type PostFXRenderMode = "preview" | "export";

export type PostFXPreset = {
  id: string;
  name: string;
  description: string;
  settings: PostFXSettings;
};
