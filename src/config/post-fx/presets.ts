import type { PostFXPreset, PostFXSettings } from "@/types/post-fx";

function createEffect(
  type: PostFXSettings["effects"][number]["type"],
  settings: Record<string, number | string | boolean>,
  overrides?: Partial<PostFXSettings["effects"][number]>,
): PostFXSettings["effects"][number] {
  return {
    id: `${type}-${crypto.randomUUID().slice(0, 8)}`,
    type,
    enabled: true,
    settings,
    ...overrides,
  };
}

export const defaultPostFXSettings: PostFXSettings = {
  enabled: false,
  previewQuality: "auto",
  exportQuality: "high",
  effects: [],
};

export const postFxPresets: PostFXPreset[] = [
  {
    id: "clean-premium",
    name: "Clean Premium",
    description: "Subtle vignette, light grain, slight sharpen.",
    settings: {
      enabled: true,
      previewQuality: "medium",
      exportQuality: "high",
      effects: [
        createEffect("vignette", { amount: 22, size: 58, feather: 70, roundness: 50, color: "#000000" }),
        createEffect("grain", { amount: 8, size: 45, speed: 20, monochrome: true, blendMode: "overlay" }),
        createEffect("sharpen", { amount: 12 }),
      ],
    },
  },
  {
    id: "soft-glow",
    name: "Soft Glow",
    description: "Low bloom, soft vignette, light grain.",
    settings: {
      enabled: true,
      previewQuality: "medium",
      exportQuality: "high",
      effects: [
        createEffect("bloom", { intensity: 28, radius: 42, threshold: 55 }),
        createEffect("glow", { intensity: 22, radius: 35, threshold: 50, colorInfluence: 25, blendMode: "screen", quality: "preview" }),
        createEffect("vignette", { amount: 28, size: 52, feather: 68, roundness: 48, color: "#000000" }),
        createEffect("grain", { amount: 10, size: 40, speed: 18, monochrome: true, blendMode: "overlay" }),
      ],
    },
  },
  {
    id: "filmic",
    name: "Filmic",
    description: "Medium grain, soft tint, vignette, slight chromatic aberration.",
    settings: {
      enabled: true,
      previewQuality: "medium",
      exportQuality: "high",
      effects: [
        createEffect("grain", { amount: 32, size: 55, speed: 25, monochrome: true, blendMode: "overlay" }),
        createEffect("colorOverlay", { color: "#c4a882", opacity: 12, blendMode: "soft-light" }),
        createEffect("filmFade", { fade: 30, matte: 28, warmth: 22 }),
        createEffect("vignette", { amount: 35, size: 50, feather: 62, roundness: 45, color: "#1a1008" }),
        createEffect("chromaticAberration", { amount: 12, edgeFalloff: 65, direction: 0, rgbSplit: 35 }),
      ],
    },
  },
  {
    id: "punchy-social",
    name: "Punchy Social",
    description: "Glow, sharpen, grain, slight motion blur.",
    settings: {
      enabled: true,
      previewQuality: "low",
      exportQuality: "max",
      effects: [
        createEffect("glow", { intensity: 38, radius: 45, threshold: 48, colorInfluence: 35, blendMode: "screen", quality: "export" }, { exportOnly: false }),
        createEffect("sharpen", { amount: 28 }),
        createEffect("grain", { amount: 18, size: 48, speed: 30, monochrome: true, blendMode: "overlay" }),
        createEffect("motionBlur", { amount: 18, samples: 10, shutterAngle: 180, previewEnabled: false, exportOnly: true }, { exportOnly: true }),
      ],
    },
  },
  {
    id: "dreamy",
    name: "Dreamy",
    description: "Blur, bloom, glow, soft color overlay.",
    settings: {
      enabled: true,
      previewQuality: "low",
      exportQuality: "high",
      effects: [
        createEffect("blur", { amount: 12 }, { exportOnly: false }),
        createEffect("bloom", { intensity: 45, radius: 55, threshold: 40 }),
        createEffect("glow", { intensity: 30, radius: 50, threshold: 42, colorInfluence: 40, blendMode: "screen", quality: "preview" }),
        createEffect("colorOverlay", { color: "#a78bfa", opacity: 15, blendMode: "soft-light" }),
        createEffect("filmFade", { fade: 40, matte: 20, warmth: 10 }),
      ],
    },
  },
  {
    id: "none",
    name: "No Post FX",
    description: "Disable all post-processing.",
    settings: {
      enabled: false,
      previewQuality: "medium",
      exportQuality: "high",
      effects: [],
    },
  },
];

export const postFxPresetMap = Object.fromEntries(
  postFxPresets.map((preset) => [preset.id, preset]),
) as Record<string, PostFXPreset>;
