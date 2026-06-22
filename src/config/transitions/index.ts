import type { TransitionDefinition } from "@/types";
import {
  LEGACY_TRANSITION_PRESET_IDS,
  TRANSITION_PRESETS,
  V2_TRANSITION_PRESET_IDS,
  presetToTransitionDefinition,
  type TransitionPresetId,
} from "@/lib/transitions/presets";

/** Primary V2 transition presets for the editor picker. */
export const transitionDefinitions: TransitionDefinition[] = V2_TRANSITION_PRESET_IDS.map((id) =>
  presetToTransitionDefinition(TRANSITION_PRESETS[id]),
);

/** Legacy presets — compatibility only, gated from auto-selection. */
export const legacyTransitionDefinitions: TransitionDefinition[] =
  LEGACY_TRANSITION_PRESET_IDS.map((id) => presetToTransitionDefinition(TRANSITION_PRESETS[id]));

/** Additional legacy definition ids still referenced by block compatibleTransitions. */
const LEGACY_TRANSITIONS: TransitionDefinition[] = [
  {
    id: "crossfade",
    name: "Crossfade (Legacy)",
    type: "crossfade",
    defaultDuration: 15,
    defaultDirection: "left",
    defaultOverlap: 0.5,
    defaultEasingId: "ease-in-out",
  },
  {
    id: "push",
    name: "Push (Legacy)",
    type: "push",
    defaultDuration: 20,
    defaultDirection: "left",
    defaultOverlap: 0.3,
    defaultEasingId: "ease-out",
  },
  {
    id: "scale-through",
    name: "Scale Through (Legacy)",
    type: "scale-through",
    defaultDuration: 20,
    defaultDirection: "left",
    defaultOverlap: 0.4,
    defaultEasingId: "ease-in-out",
  },
  {
    id: "frame-split",
    name: "Frame Split (Legacy)",
    type: "frame-split",
    defaultDuration: 24,
    defaultDirection: "left",
    defaultOverlap: 0.15,
    defaultEasingId: "ease-out",
  },
];

export const allTransitionDefinitions: TransitionDefinition[] = [
  ...transitionDefinitions,
  ...legacyTransitionDefinitions,
  ...LEGACY_TRANSITIONS.filter(
    (legacy) => !transitionDefinitions.some((t) => t.id === legacy.id),
  ),
];

export const transitionDefinitionMap = Object.fromEntries(
  allTransitionDefinitions.map((transition) => [transition.id, transition]),
) as Record<string, TransitionDefinition>;

export { V2_TRANSITION_PRESET_IDS, LEGACY_TRANSITION_PRESET_IDS, type TransitionPresetId };
