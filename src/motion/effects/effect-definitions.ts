import type { EffectDefinition, EffectTarget, StarterEffectId } from "@/types/effects";

export const EFFECT_DEFINITIONS: EffectDefinition[] = [
  {
    id: "opacity",
    name: "Opacity",
    category: "style",
    description: "Adjust layer transparency for subtle fades and emphasis.",
    controls: [
      {
        id: "opacity",
        label: "Opacity",
        type: "slider",
        defaultValue: 100,
        min: 0,
        max: 100,
        step: 1,
      },
    ],
    compatibleTargets: [
      "block",
      "text",
      "headline",
      "subhead",
      "number",
      "label",
      "cta",
      "image",
      "logo",
      "background",
      "shape",
      "card",
      "group",
    ],
  },
  {
    id: "shadow",
    name: "Soft shadow",
    category: "style",
    description: "Product UI shadow for cards, panels, and floating elements.",
    controls: [
      { id: "x", label: "X offset", type: "slider", defaultValue: 0, min: -80, max: 80, step: 1 },
      { id: "y", label: "Y offset", type: "slider", defaultValue: 12, min: -80, max: 80, step: 1 },
      { id: "blur", label: "Blur", type: "slider", defaultValue: 24, min: 0, max: 80, step: 1 },
      { id: "spread", label: "Spread", type: "slider", defaultValue: 0, min: -40, max: 40, step: 1 },
      { id: "color", label: "Color", type: "color", defaultValue: "#000000" },
      {
        id: "opacity",
        label: "Shadow opacity",
        type: "slider",
        defaultValue: 18,
        min: 0,
        max: 100,
        step: 1,
      },
    ],
    compatibleTargets: ["block", "card", "shape", "group", "background", "cta"],
  },
  {
    id: "corner-radius",
    name: "Corner radius",
    category: "shape",
    description: "Editorial rounding for cards, images, and UI surfaces.",
    controls: [
      {
        id: "radius",
        label: "Radius",
        type: "slider",
        defaultValue: 16,
        min: 0,
        max: 120,
        step: 1,
      },
    ],
    compatibleTargets: ["card", "image", "shape", "background", "cta", "group", "block"],
  },
  {
    id: "stroke",
    name: "Product UI stroke",
    category: "shape",
    description: "Crisp border treatment for cards and UI elements.",
    controls: [
      { id: "width", label: "Width", type: "slider", defaultValue: 1, min: 0, max: 8, step: 0.5 },
      { id: "color", label: "Color", type: "color", defaultValue: "#ffffff" },
      {
        id: "opacity",
        label: "Stroke opacity",
        type: "slider",
        defaultValue: 12,
        min: 0,
        max: 100,
        step: 1,
      },
    ],
    compatibleTargets: ["card", "shape", "background", "cta", "group", "block"],
  },
  {
    id: "layer-blur",
    name: "Subtle blur",
    category: "visual",
    description: "Layer blur for depth, focus, and reveal motion.",
    controls: [
      {
        id: "amount",
        label: "Blur amount",
        type: "slider",
        defaultValue: 8,
        min: 0,
        max: 64,
        step: 1,
      },
    ],
    compatibleTargets: ["image", "logo", "block", "card", "shape", "group", "background"],
  },
  {
    id: "glass",
    name: "Glass card",
    category: "visual",
    description: "Frosted glass panel with tint and border for hero surfaces.",
    controls: [
      { id: "blur", label: "Blur", type: "slider", defaultValue: 12, min: 0, max: 48, step: 1 },
      {
        id: "opacity",
        label: "Tint opacity",
        type: "slider",
        defaultValue: 12,
        min: 0,
        max: 60,
        step: 1,
      },
      { id: "tintColor", label: "Tint color", type: "color", defaultValue: "#ffffff" },
      {
        id: "borderOpacity",
        label: "Border opacity",
        type: "slider",
        defaultValue: 18,
        min: 0,
        max: 100,
        step: 1,
      },
    ],
    compatibleTargets: ["background", "card", "shape", "group", "block"],
  },
  {
    id: "move",
    name: "Move",
    category: "transform",
    description: "Offset position for entrance motion or layout nudges.",
    controls: [
      { id: "x", label: "X", type: "slider", defaultValue: 0, min: -400, max: 400, step: 1 },
      { id: "y", label: "Y", type: "slider", defaultValue: 0, min: -400, max: 400, step: 1 },
    ],
    compatibleTargets: [
      "block",
      "text",
      "headline",
      "subhead",
      "number",
      "label",
      "cta",
      "image",
      "logo",
      "card",
      "shape",
      "group",
    ],
  },
  {
    id: "scale",
    name: "Hero scale",
    category: "transform",
    description: "Scale transform for emphasis and entrance motion.",
    controls: [
      {
        id: "scale",
        label: "Scale",
        type: "slider",
        defaultValue: 1,
        min: 0,
        max: 2,
        step: 0.01,
      },
    ],
    compatibleTargets: [
      "block",
      "text",
      "headline",
      "subhead",
      "number",
      "label",
      "cta",
      "image",
      "logo",
      "card",
      "shape",
      "group",
    ],
  },
  {
    id: "rotate",
    name: "Rotate",
    category: "transform",
    description: "Rotation in degrees for playful or editorial motion.",
    controls: [
      {
        id: "degrees",
        label: "Degrees",
        type: "slider",
        defaultValue: 0,
        min: -180,
        max: 180,
        step: 1,
      },
    ],
    compatibleTargets: [
      "block",
      "image",
      "logo",
      "card",
      "shape",
      "group",
      "headline",
      "cta",
    ],
  },
  {
    id: "hide-show",
    name: "Hide / Show",
    category: "visibility",
    description: "Toggle element visibility without removing content.",
    controls: [
      {
        id: "visible",
        label: "Visible",
        type: "toggle",
        defaultValue: true,
      },
    ],
    compatibleTargets: [
      "block",
      "text",
      "headline",
      "subhead",
      "number",
      "label",
      "cta",
      "image",
      "logo",
      "background",
      "shape",
      "card",
      "group",
    ],
  },
];

export const effectDefinitionMap = Object.fromEntries(
  EFFECT_DEFINITIONS.map((definition) => [definition.id, definition]),
) as Record<StarterEffectId, EffectDefinition>;

export function getEffectDefinition(effectId: string): EffectDefinition | undefined {
  return effectDefinitionMap[effectId as StarterEffectId];
}

export function getDefaultEffectValues(effectId: StarterEffectId): Record<string, unknown> {
  const definition = effectDefinitionMap[effectId];
  if (!definition) return {};
  return Object.fromEntries(definition.controls.map((control) => [control.id, control.defaultValue]));
}

export function isEffectCompatibleWithTarget(
  effectId: StarterEffectId,
  target: EffectTarget,
): boolean {
  const definition = effectDefinitionMap[effectId];
  return definition?.compatibleTargets.includes(target) ?? false;
}
