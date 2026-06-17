import type { TransitionDefinition } from "@/types";

export const transitionDefinitions: TransitionDefinition[] = [
  {
    id: "cut",
    name: "Cut",
    type: "cut",
    defaultDuration: 1,
    defaultDirection: "left",
    defaultOverlap: 0,
    defaultEasing: "linear",
  },
  {
    id: "crossfade",
    name: "Crossfade",
    type: "crossfade",
    defaultDuration: 15,
    defaultDirection: "left",
    defaultOverlap: 0.5,
    defaultEasing: "ease-in-out",
  },
  {
    id: "push",
    name: "Push",
    type: "push",
    defaultDuration: 20,
    defaultDirection: "left",
    defaultOverlap: 0.3,
    defaultEasing: "ease-out",
  },
  {
    id: "wipe",
    name: "Wipe",
    type: "wipe",
    defaultDuration: 18,
    defaultDirection: "right",
    defaultOverlap: 0,
    defaultEasing: "ease-in-out",
  },
  {
    id: "mask-reveal",
    name: "Mask Reveal",
    type: "mask-reveal",
    defaultDuration: 22,
    defaultDirection: "up",
    defaultOverlap: 0.2,
    defaultEasing: "ease-out",
  },
  {
    id: "scale-through",
    name: "Scale Through",
    type: "scale-through",
    defaultDuration: 20,
    defaultDirection: "left",
    defaultOverlap: 0.4,
    defaultEasing: "ease-in-out",
  },
  {
    id: "frame-split",
    name: "Frame Split",
    type: "frame-split",
    defaultDuration: 24,
    defaultDirection: "left",
    defaultOverlap: 0.15,
    defaultEasing: "ease-out",
  },
];

export const transitionDefinitionMap = Object.fromEntries(
  transitionDefinitions.map((transition) => [transition.id, transition]),
) as Record<string, TransitionDefinition>;
