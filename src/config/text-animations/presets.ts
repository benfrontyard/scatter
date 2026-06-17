import type { TextAnimationPreset } from "@/types/text-animation";

export const TEXT_ANIMATION_PRESETS: TextAnimationPreset[] = [
  {
    id: "soft-fade-up",
    name: "Soft Fade Up",
    category: "subtle",
    target: "word",
    properties: {
      opacity: [0, 1],
      y: [14, 0],
    },
    selector: {
      direction: "ltr",
      stagger: 3,
      duration: 18,
      delay: 0,
      easing: "inherit",
    },
    brandBehavior: {
      intensity: "subtle",
      useBrandTypography: true,
      useBrandColors: true,
      respectReducedMotion: true,
    },
  },
  {
    id: "line-reveal",
    name: "Line Reveal",
    category: "editorial",
    target: "line",
    properties: {
      opacity: [0, 1],
      clipReveal: "up",
    },
    selector: {
      direction: "ltr",
      stagger: 6,
      duration: 22,
      delay: 0,
      easing: "inherit",
    },
    brandBehavior: {
      intensity: "subtle",
      useBrandTypography: true,
      useBrandColors: true,
      respectReducedMotion: true,
    },
    renderer: "mask-reveal",
  },
  {
    id: "word-cascade",
    name: "Word Cascade",
    category: "kinetic",
    target: "word",
    properties: {
      opacity: [0, 1],
      y: [18, 0],
    },
    selector: {
      direction: "ltr",
      stagger: 4,
      duration: 16,
      delay: 0,
      easing: "inherit",
    },
    brandBehavior: {
      intensity: "balanced",
      useBrandTypography: true,
      useBrandColors: true,
      respectReducedMotion: true,
    },
  },
  {
    id: "flick-in",
    name: "Flick In",
    category: "flick",
    target: "character",
    properties: {
      opacity: [0, 1],
      y: [8, 0],
      rotate: [-3, 0],
      blur: [4, 0],
    },
    selector: {
      direction: "ltr",
      stagger: 1,
      duration: 10,
      delay: 0,
      easing: "inherit",
      smoothness: 0.8,
    },
    brandBehavior: {
      intensity: "expressive",
      useBrandTypography: true,
      useBrandColors: true,
      respectReducedMotion: true,
    },
  },
  {
    id: "type-pulse",
    name: "Type Pulse",
    category: "kinetic",
    target: "word",
    properties: {
      scale: [1, 1.08],
      color: "brandAccent",
    },
    selector: {
      direction: "ltr",
      stagger: 0,
      duration: 20,
      delay: 8,
      easing: "inherit",
    },
    brandBehavior: {
      intensity: "balanced",
      useBrandTypography: true,
      useBrandColors: true,
      respectReducedMotion: true,
    },
    renderer: "color-pulse",
  },
  {
    id: "highlight-sweep",
    name: "Highlight Sweep",
    category: "editorial",
    target: "word",
    properties: {
      color: "brandAccent",
    },
    selector: {
      direction: "ltr",
      stagger: 3,
      duration: 14,
      delay: 0,
      easing: "inherit",
    },
    brandBehavior: {
      intensity: "balanced",
      useBrandTypography: true,
      useBrandColors: true,
      respectReducedMotion: true,
    },
    renderer: "highlight-sweep",
  },
  {
    id: "character-shuffle",
    name: "Character Shuffle",
    category: "flick",
    target: "character",
    properties: {
      opacity: [0, 1],
      y: [6, 0],
    },
    selector: {
      direction: "random",
      stagger: 2,
      duration: 14,
      delay: 0,
      easing: "inherit",
      randomSeed: 42,
    },
    brandBehavior: {
      intensity: "subtle",
      useBrandTypography: true,
      useBrandColors: true,
      respectReducedMotion: true,
    },
  },
  {
    id: "pop-accent",
    name: "Pop Accent",
    category: "flick",
    target: "word",
    properties: {
      opacity: [0, 1],
      scale: [0.92, 1.06],
      y: [10, 0],
    },
    selector: {
      direction: "ltr",
      stagger: 0,
      duration: 16,
      delay: 0,
      easing: "inherit",
    },
    brandBehavior: {
      intensity: "expressive",
      useBrandTypography: true,
      useBrandColors: true,
      respectReducedMotion: true,
    },
  },
  {
    id: "quiet-tracking",
    name: "Quiet Tracking",
    category: "premium",
    target: "block",
    properties: {
      opacity: [0, 1],
      tracking: [0.08, 0],
    },
    selector: {
      direction: "ltr",
      stagger: 0,
      duration: 28,
      delay: 0,
      easing: "inherit",
    },
    brandBehavior: {
      intensity: "subtle",
      useBrandTypography: true,
      useBrandColors: true,
      respectReducedMotion: true,
    },
  },
  {
    id: "split-impact",
    name: "Split Impact",
    category: "kinetic",
    target: "word",
    properties: {
      opacity: [0, 1],
      x: [24, 0],
    },
    selector: {
      direction: "centerOut",
      stagger: 4,
      duration: 16,
      delay: 0,
      easing: "inherit",
    },
    brandBehavior: {
      intensity: "expressive",
      useBrandTypography: true,
      useBrandColors: true,
      respectReducedMotion: true,
    },
  },
];

export const textAnimationPresetMap = Object.fromEntries(
  TEXT_ANIMATION_PRESETS.map((preset) => [preset.id, preset]),
) as Record<string, TextAnimationPreset>;

export const DEFAULT_TEXT_ANIMATION_PRESET_ID = "soft-fade-up";

export function getTextAnimationPreset(id: string | undefined): TextAnimationPreset {
  if (id && textAnimationPresetMap[id]) return textAnimationPresetMap[id];
  return textAnimationPresetMap[DEFAULT_TEXT_ANIMATION_PRESET_ID];
}
