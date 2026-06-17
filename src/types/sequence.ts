import type { MotionBlockInstance } from "./motion-block";
import type { BlockTransition } from "./transition";

export type MotionSequence = {
  id: string;
  name: string;
  format: string;
  brandPresetId: string;
  canvasBackground?: string;
  fps?: number;
  logoText?: string;
  blocks: MotionBlockInstance[];
  transitions: BlockTransition[];
};

export type SequenceTimelineItem =
  | { kind: "block"; block: MotionBlockInstance; index: number }
  | { kind: "transition"; transition: BlockTransition; afterBlockIndex: number };
