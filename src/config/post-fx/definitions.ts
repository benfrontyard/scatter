import type { PostFXEffectType, PostFXBlendMode } from "@/types/post-fx";

export type PostFXControlType = "slider" | "color" | "toggle" | "select";

export type PostFXControlDefinition = {
  id: string;
  label: string;
  type: PostFXControlType;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { value: string; label: string }[];
  advanced?: boolean;
};

export type PostFXEffectDefinition = {
  type: PostFXEffectType;
  name: string;
  description: string;
  defaultSettings: Record<string, number | string | boolean>;
  controls: PostFXControlDefinition[];
  supportsExportOnly?: boolean;
};

const BLEND_MODE_OPTIONS: { value: PostFXBlendMode; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "multiply", label: "Multiply" },
  { value: "screen", label: "Screen" },
  { value: "overlay", label: "Overlay" },
  { value: "soft-light", label: "Soft light" },
  { value: "hard-light", label: "Hard light" },
];

export const postFxEffectDefinitions: PostFXEffectDefinition[] = [
  {
    type: "vignette",
    name: "Vignette",
    description: "Darken edges for cinematic focus.",
    defaultSettings: {
      amount: 40,
      size: 55,
      feather: 65,
      roundness: 50,
      color: "#000000",
    },
    controls: [
      { id: "amount", label: "Amount", type: "slider", min: 0, max: 100, step: 1 },
      { id: "size", label: "Size", type: "slider", min: 0, max: 100, step: 1 },
      { id: "feather", label: "Feather", type: "slider", min: 0, max: 100, step: 1 },
      { id: "roundness", label: "Roundness", type: "slider", min: 0, max: 100, step: 1, advanced: true },
      { id: "color", label: "Color", type: "color" },
    ],
  },
  {
    type: "grain",
    name: "Grain",
    description: "Film grain texture overlay.",
    defaultSettings: {
      amount: 25,
      size: 50,
      speed: 30,
      monochrome: true,
      blendMode: "overlay",
    },
    controls: [
      { id: "amount", label: "Amount", type: "slider", min: 0, max: 100, step: 1 },
      { id: "size", label: "Size", type: "slider", min: 0, max: 100, step: 1 },
      { id: "speed", label: "Speed", type: "slider", min: 0, max: 100, step: 1 },
      { id: "monochrome", label: "Monochrome", type: "toggle" },
      {
        id: "blendMode",
        label: "Blend mode",
        type: "select",
        options: BLEND_MODE_OPTIONS,
        advanced: true,
      },
    ],
  },
  {
    type: "glow",
    name: "Glow",
    description: "Soft luminous bloom on bright areas.",
    defaultSettings: {
      intensity: 35,
      radius: 40,
      threshold: 50,
      colorInfluence: 30,
      blendMode: "screen",
      quality: "preview",
    },
    controls: [
      { id: "intensity", label: "Intensity", type: "slider", min: 0, max: 100, step: 1 },
      { id: "radius", label: "Radius", type: "slider", min: 0, max: 100, step: 1 },
      { id: "threshold", label: "Threshold", type: "slider", min: 0, max: 100, step: 1 },
      { id: "colorInfluence", label: "Color influence", type: "slider", min: 0, max: 100, step: 1, advanced: true },
      {
        id: "blendMode",
        label: "Blend mode",
        type: "select",
        options: BLEND_MODE_OPTIONS,
        advanced: true,
      },
      {
        id: "quality",
        label: "Quality",
        type: "select",
        options: [
          { value: "preview", label: "Preview" },
          { value: "export", label: "Export" },
        ],
        advanced: true,
      },
    ],
    supportsExportOnly: true,
  },
  {
    type: "motionBlur",
    name: "Motion Blur",
    description: "Directional blur for cinematic motion.",
    defaultSettings: {
      amount: 30,
      samples: 8,
      shutterAngle: 180,
      previewEnabled: false,
      exportOnly: true,
    },
    controls: [
      { id: "amount", label: "Amount", type: "slider", min: 0, max: 100, step: 1 },
      { id: "samples", label: "Samples", type: "slider", min: 2, max: 24, step: 1, advanced: true },
      { id: "shutterAngle", label: "Shutter angle", type: "slider", min: 45, max: 360, step: 5, advanced: true },
      { id: "previewEnabled", label: "Preview in editor", type: "toggle" },
      { id: "exportOnly", label: "Export only", type: "toggle", advanced: true },
    ],
    supportsExportOnly: true,
  },
  {
    type: "chromaticAberration",
    name: "Chromatic Aberration",
    description: "RGB channel split at edges.",
    defaultSettings: {
      amount: 25,
      edgeFalloff: 60,
      direction: 0,
      rgbSplit: 50,
    },
    controls: [
      { id: "amount", label: "Amount", type: "slider", min: 0, max: 100, step: 1 },
      { id: "edgeFalloff", label: "Edge falloff", type: "slider", min: 0, max: 100, step: 1 },
      { id: "direction", label: "Direction", type: "slider", min: 0, max: 360, step: 1, advanced: true },
      { id: "rgbSplit", label: "RGB split", type: "slider", min: 0, max: 100, step: 1, advanced: true },
    ],
  },
  {
    type: "sharpen",
    name: "Sharpen",
    description: "Crisp detail enhancement.",
    defaultSettings: { amount: 25 },
    controls: [{ id: "amount", label: "Amount", type: "slider", min: 0, max: 100, step: 1 }],
  },
  {
    type: "blur",
    name: "Blur",
    description: "Gaussian blur across the composition.",
    defaultSettings: { amount: 20 },
    controls: [{ id: "amount", label: "Amount", type: "slider", min: 0, max: 100, step: 1 }],
    supportsExportOnly: true,
  },
  {
    type: "colorOverlay",
    name: "Color Overlay",
    description: "Tint the full frame with a color.",
    defaultSettings: {
      color: "#6366f1",
      opacity: 20,
      blendMode: "soft-light",
    },
    controls: [
      { id: "color", label: "Color", type: "color" },
      { id: "opacity", label: "Opacity", type: "slider", min: 0, max: 100, step: 1 },
      {
        id: "blendMode",
        label: "Blend mode",
        type: "select",
        options: BLEND_MODE_OPTIONS,
        advanced: true,
      },
    ],
  },
  {
    type: "noise",
    name: "Noise",
    description: "Animated noise overlay.",
    defaultSettings: {
      amount: 15,
      speed: 40,
      monochrome: true,
    },
    controls: [
      { id: "amount", label: "Amount", type: "slider", min: 0, max: 100, step: 1 },
      { id: "speed", label: "Speed", type: "slider", min: 0, max: 100, step: 1 },
      { id: "monochrome", label: "Monochrome", type: "toggle", advanced: true },
    ],
  },
  {
    type: "bloom",
    name: "Bloom",
    description: "Bright-area glow and halation.",
    defaultSettings: {
      intensity: 40,
      radius: 50,
      threshold: 45,
    },
    controls: [
      { id: "intensity", label: "Intensity", type: "slider", min: 0, max: 100, step: 1 },
      { id: "radius", label: "Radius", type: "slider", min: 0, max: 100, step: 1 },
      { id: "threshold", label: "Threshold", type: "slider", min: 0, max: 100, step: 1, advanced: true },
    ],
    supportsExportOnly: true,
  },
  {
    type: "filmFade",
    name: "Film Fade",
    description: "Lifted blacks and soft matte contrast.",
    defaultSettings: {
      fade: 35,
      matte: 25,
      warmth: 15,
    },
    controls: [
      { id: "fade", label: "Fade", type: "slider", min: 0, max: 100, step: 1 },
      { id: "matte", label: "Matte", type: "slider", min: 0, max: 100, step: 1 },
      { id: "warmth", label: "Warmth", type: "slider", min: 0, max: 100, step: 1, advanced: true },
    ],
  },
];

export const postFxEffectDefinitionMap = Object.fromEntries(
  postFxEffectDefinitions.map((definition) => [definition.type, definition]),
) as Record<PostFXEffectType, PostFXEffectDefinition>;

export const postFxEffectTypeLabels: Record<PostFXEffectType, string> = Object.fromEntries(
  postFxEffectDefinitions.map((definition) => [definition.type, definition.name]),
) as Record<PostFXEffectType, string>;
