import type { EasingName } from "./easing";

export type { EasingName } from "./easing";

export type TransitionType =
  | "cut"
  | "crossfade"
  | "push"
  | "wipe"
  | "mask-reveal"
  | "scale-through"
  | "frame-split";

export type TransitionDirection = "left" | "right" | "up" | "down";

export type TransitionDefinition = {
  id: string;
  name: string;
  type: TransitionType;
  defaultDuration: number;
  defaultDirection: TransitionDirection;
  defaultOverlap: number;
  defaultEasing: EasingName;
};

export type BlockTransition = {
  id: string;
  fromBlockId: string;
  toBlockId: string;
  type: TransitionType;
  duration: number;
  direction: TransitionDirection;
  easing: EasingName;
  overlap: number;
};
